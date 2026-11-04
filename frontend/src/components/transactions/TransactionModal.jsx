import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { transactionService } from '../../services/transactionService';
import { useFinance } from '../../context/FinanceContext';
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  PAYMENT_METHODS,
} from '../../utils/constants';
import { ArrowDownRight, ArrowUpRight, CheckCircle2, AlertCircle } from 'lucide-react';

const TransactionModal = () => {
  const {
    isModalOpen,
    modalInitialType,
    editingTransaction,
    closeModal,
    refreshData,
  } = useFinance();

  const [type, setType] = useState('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setTitle(editingTransaction.title);
      setAmount(editingTransaction.amount.toString());
      setCategory(editingTransaction.category);
      setPaymentMethod(editingTransaction.paymentMethod || 'UPI');
      setDate(
        editingTransaction.date
          ? new Date(editingTransaction.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]
      );
      setDescription(editingTransaction.description || '');
    } else {
      const initialType = modalInitialType || 'expense';
      setType(initialType);
      setTitle('');
      setAmount('');
      setCategory(initialType === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]);
      setPaymentMethod('UPI');
      setDate(new Date().toISOString().split('T')[0]);
      setDescription('');
    }
    setError('');
    setSuccessMsg('');
  }, [editingTransaction, modalInitialType, isModalOpen]);

  // When type changes, adjust default category
  const handleTypeChange = (newType) => {
    setType(newType);
    setCategory(newType === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!title.trim()) {
      setError('Please provide a title or merchant name.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please provide a valid amount greater than 0.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        amount: numAmount,
        type,
        category,
        paymentMethod,
        date,
        description: description.trim(),
      };

      if (editingTransaction) {
        await transactionService.updateTransaction(editingTransaction._id, payload);
        setSuccessMsg('Transaction updated successfully!');
      } else {
        await transactionService.createTransaction(payload);
        setSuccessMsg('Transaction created successfully!');
      }

      refreshData();
      setTimeout(() => {
        closeModal();
      }, 700);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to save transaction. Please check inputs.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <Modal
      isOpen={isModalOpen}
      onClose={closeModal}
      title={editingTransaction ? 'Edit Transaction' : 'Record Transaction'}
      subtitle={
        editingTransaction
          ? 'Modify existing financial transaction details'
          : 'Log new income cashflow or expense outflow'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-errorBg text-expenseRed text-xs font-medium flex items-center gap-2 border border-red-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-successBg text-incomeGreen text-xs font-semibold flex items-center gap-2 border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Type Segmented Control */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => handleTypeChange('expense')}
            className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
              type === 'expense'
                ? 'bg-white text-expenseRed shadow-sm'
                : 'text-slate-600 hover:text-primaryText'
            }`}
          >
            <ArrowDownRight className="w-4 h-4" />
            Expense
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('income')}
            className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
              type === 'income'
                ? 'bg-white text-incomeGreen shadow-sm'
                : 'text-slate-600 hover:text-primaryText'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            Income
          </button>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-primaryText mb-1.5">
            Title / Payee <span className="text-expenseRed">*</span>
          </label>
          <input
            type="text"
            required
            placeholder={type === 'income' ? 'e.g. Monthly Salary, Freelance project' : 'e.g. Whole Foods, Electric bill'}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-borderColor rounded-xl text-primaryText focus:bg-white focus:outline-none focus:ring-2 focus:ring-royalBlue/30 focus:border-royalBlue transition-all"
          />
        </div>

        {/* Amount & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-primaryText mb-1.5">
              Amount <span className="text-expenseRed">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondaryText font-medium text-sm">
                ₹
              </span>
              <input
                type="number"
                step="any"
                min="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-3.5 py-2.5 text-sm bg-slate-50 border border-borderColor rounded-xl text-primaryText font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-royalBlue/30 focus:border-royalBlue transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-primaryText mb-1.5">
              Category <span className="text-expenseRed">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-borderColor rounded-xl text-primaryText focus:bg-white focus:outline-none focus:ring-2 focus:ring-royalBlue/30 focus:border-royalBlue transition-all"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date & Payment Method */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-primaryText mb-1.5">
              Date <span className="text-expenseRed">*</span>
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-borderColor rounded-xl text-primaryText focus:bg-white focus:outline-none focus:ring-2 focus:ring-royalBlue/30 focus:border-royalBlue transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-primaryText mb-1.5">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-borderColor rounded-xl text-primaryText focus:bg-white focus:outline-none focus:ring-2 focus:ring-royalBlue/30 focus:border-royalBlue transition-all"
            >
              {PAYMENT_METHODS.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description / Notes */}
        <div>
          <label className="block text-xs font-semibold text-primaryText mb-1.5">
            Description / Notes (Optional)
          </label>
          <textarea
            rows="2"
            placeholder="Add specific details or memo..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-borderColor rounded-xl text-primaryText focus:bg-white focus:outline-none focus:ring-2 focus:ring-royalBlue/30 focus:border-royalBlue transition-all resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-borderColor">
          <Button variant="outline" size="sm" onClick={closeModal} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant={type === 'income' ? 'secondary' : 'primary'}
            size="sm"
            isLoading={isSubmitting}
          >
            {editingTransaction ? 'Save Changes' : `Add ${type === 'income' ? 'Income' : 'Expense'}`}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TransactionModal;

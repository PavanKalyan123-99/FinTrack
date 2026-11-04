import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  Download,
  Trash2,
  Edit2,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { transactionService } from '../../services/transactionService';
import { reportService } from '../../services/reportService';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  PAYMENT_METHODS,
} from '../../utils/constants';
import Button from '../common/Button';
import Badge from '../common/Badge';
import EmptyState from '../common/EmptyState';
import { Skeleton } from '../common/Skeleton';

const TransactionList = ({
  forcedType = null, // 'income' | 'expense' | null
  title = 'Transactions Ledger',
  subtitle = 'View, search, filter and manage all your cashflow activity',
}) => {
  const { refreshKey, openAddTransaction, openEditTransaction, refreshData } = useFinance();
  const { user } = useAuth();
  const currency = user?.currency || 'INR';

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, pages: 1 });

  // Filters
  const [type, setType] = useState(forcedType || 'all');
  const [category, setCategory] = useState('All');
  const [paymentMethod, setPaymentMethod] = useState('All');
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  const [deletingId, setDeletingId] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy,
        sortOrder,
      };

      if (forcedType) {
        params.type = forcedType;
      } else if (type && type !== 'all') {
        params.type = type;
      }

      if (category && category !== 'All') params.category = category;
      if (paymentMethod && paymentMethod !== 'All') params.paymentMethod = paymentMethod;
      if (search.trim()) params.search = search.trim();
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await transactionService.getTransactions(params);
      if (res.success) {
        setTransactions(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  }, [
    pagination.page,
    pagination.limit,
    sortBy,
    sortOrder,
    forcedType,
    type,
    category,
    paymentMethod,
    search,
    startDate,
    endDate,
    refreshKey,
  ]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        setDeletingId(id);
        await transactionService.deleteTransaction(id);
        refreshData();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete transaction.');
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      const filters = {};
      if (forcedType) filters.type = forcedType;
      else if (type !== 'all') filters.type = type;
      if (category !== 'All') filters.category = category;
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;

      await reportService.downloadCSV(filters);
    } catch (err) {
      alert('Failed to export CSV. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const categories =
    forcedType === 'income'
      ? INCOME_CATEGORIES
      : forcedType === 'expense'
      ? EXPENSE_CATEGORIES
      : [...new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES])];

  return (
    <div className="space-y-4">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
        <div>
          <h2 className="text-xl font-bold text-primaryText tracking-tight">{title}</h2>
          <p className="text-xs text-secondaryText mt-0.5">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={handleExportCSV}
            isLoading={isExporting}
          >
            Export CSV
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => openAddTransaction(forcedType || 'expense')}
          >
            + Add {forcedType === 'income' ? 'Income' : forcedType === 'expense' ? 'Expense' : 'Transaction'}
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-borderColor shadow-card space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search title, notes..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-borderColor rounded-xl text-primaryText placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-royalBlue/30 focus:border-royalBlue transition-all"
            />
          </div>

          {/* Type Filter (if not forced) */}
          {!forcedType && (
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-borderColor rounded-xl text-primaryText focus:bg-white focus:outline-none focus:ring-2 focus:ring-royalBlue/30 focus:border-royalBlue transition-all"
            >
              <option value="all">All Types (Income & Expenses)</option>
              <option value="expense">Expenses Only</option>
              <option value="income">Income Only</option>
            </select>
          )}

          {/* Category Filter */}
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-borderColor rounded-xl text-primaryText focus:bg-white focus:outline-none focus:ring-2 focus:ring-royalBlue/30 focus:border-royalBlue transition-all"
          >
            <option value="All">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Payment Method Filter */}
          <select
            value={paymentMethod}
            onChange={(e) => {
              setPaymentMethod(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-borderColor rounded-xl text-primaryText focus:bg-white focus:outline-none focus:ring-2 focus:ring-royalBlue/30 focus:border-royalBlue transition-all"
          >
            <option value="All">All Payment Methods</option>
            {PAYMENT_METHODS.map((pm) => (
              <option key={pm} value={pm}>
                {pm}
              </option>
            ))}
          </select>
        </div>

        {/* Date Filter & Sort */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-borderColor/60 text-xs text-secondaryText">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 font-medium text-slate-700">
              <Calendar className="w-3.5 h-3.5" /> Date Range:
            </span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="px-2 py-1 text-xs bg-slate-50 border border-borderColor rounded-lg focus:outline-none"
            />
            <span>to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="px-2 py-1 text-xs bg-slate-50 border border-borderColor rounded-lg focus:outline-none"
            />
            {(startDate || endDate || search || category !== 'All' || paymentMethod !== 'All' || (!forcedType && type !== 'all')) && (
              <button
                onClick={() => {
                  setSearch('');
                  setType(forcedType || 'all');
                  setCategory('All');
                  setPaymentMethod('All');
                  setStartDate('');
                  setEndDate('');
                }}
                className="text-royalBlue hover:underline font-medium text-xs ml-2"
              >
                Reset filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <span>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2 py-1 bg-slate-50 border border-borderColor rounded-lg focus:outline-none text-xs"
            >
              <option value="date">Date</option>
              <option value="amount">Amount</option>
              <option value="title">Title</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-2 py-1 bg-slate-50 hover:bg-slate-100 border border-borderColor rounded-lg font-medium"
            >
              {sortOrder === 'desc' ? 'Newest / Highest' : 'Oldest / Lowest'}
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table / List */}
      <div className="bg-white rounded-2xl border border-borderColor shadow-card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-xl" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-5 w-24" />
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Filter}
              title="No transactions found"
              description="No financial records match your current filter criteria or date range."
              actionLabel="Add Transaction"
              onAction={() => openAddTransaction(forcedType || 'expense')}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-borderColor text-[11px] font-semibold text-secondaryText uppercase tracking-wider">
                  <th className="py-3.5 px-6">Transaction</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-6 text-right">Amount</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderColor/60 text-xs">
                {transactions.map((tx) => {
                  const isIncome = tx.type === 'income';
                  return (
                    <tr
                      key={tx._id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Title & Notes */}
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              isIncome
                                ? 'bg-emerald-50 text-incomeGreen border border-emerald-100'
                                : 'bg-rose-50 text-expenseRed border border-rose-100'
                            }`}
                          >
                            {isIncome ? (
                              <ArrowUpRight className="w-5 h-5 stroke-[2.2]" />
                            ) : (
                              <ArrowDownRight className="w-5 h-5 stroke-[2.2]" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-primaryText text-sm truncate max-w-[200px] sm:max-w-xs">
                              {tx.title}
                            </p>
                            {tx.description && (
                              <p className="text-[11px] text-secondaryText truncate max-w-[200px] sm:max-w-xs mt-0.5">
                                {tx.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={isIncome ? 'income' : 'neutral'}
                          size="xs"
                        >
                          {tx.category}
                        </Badge>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-secondaryText font-medium whitespace-nowrap">
                        {formatDate(tx.date)}
                      </td>

                      {/* Payment Method */}
                      <td className="py-3.5 px-4 text-secondaryText whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-medium text-slate-600">
                          {tx.paymentMethod || 'UPI'}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-6 text-right whitespace-nowrap">
                        <span
                          className={`font-bold text-sm tracking-tight ${
                            isIncome ? 'text-incomeGreen' : 'text-expenseRed'
                          }`}
                        >
                          {isIncome ? '+' : '-'} {formatCurrency(tx.amount, currency)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditTransaction(tx)}
                            className="p-1.5 text-secondaryText hover:text-royalBlue hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit Transaction"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(tx._id)}
                            disabled={deletingId === tx._id}
                            className="p-1.5 text-secondaryText hover:text-expenseRed hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete Transaction"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {pagination.pages > 1 && (
          <div className="px-6 py-3.5 border-t border-borderColor flex items-center justify-between text-xs text-secondaryText bg-slate-50/50">
            <span>
              Showing {transactions.length} of {pagination.total} records (Page{' '}
              {pagination.page} of {pagination.pages})
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                }
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.pages}
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                }
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionList;

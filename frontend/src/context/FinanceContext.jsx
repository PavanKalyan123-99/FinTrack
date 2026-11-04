import React, { createContext, useContext, useState, useCallback } from 'react';

const FinanceContext = createContext(null);

export const FinanceProvider = ({ children }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialType, setModalInitialType] = useState('expense');
  const [editingTransaction, setEditingTransaction] = useState(null);

  const refreshData = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  const openAddTransaction = useCallback((type = 'expense') => {
    setEditingTransaction(null);
    setModalInitialType(type);
    setIsModalOpen(true);
  }, []);

  const openEditTransaction = useCallback((transaction) => {
    setEditingTransaction(transaction);
    setModalInitialType(transaction.type);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  }, []);

  return (
    <FinanceContext.Provider
      value={{
        refreshKey,
        refreshData,
        isModalOpen,
        modalInitialType,
        editingTransaction,
        openAddTransaction,
        openEditTransaction,
        closeModal,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};

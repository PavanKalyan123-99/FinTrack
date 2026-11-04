import React from 'react';
import TransactionList from '../components/transactions/TransactionList';

const Transactions = () => {
  return (
    <div className="space-y-6">
      <TransactionList
        forcedType={null}
        title="Transactions Ledger"
        subtitle="Complete record of all income inflows and expense outflows with filters and search"
      />
    </div>
  );
};

export default Transactions;

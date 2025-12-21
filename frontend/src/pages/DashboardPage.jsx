import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/slices/authSlice';
import { fetchCategories } from '../store/slices/categorySlice';
import { fetchTransactions } from '../store/slices/transactionSlice';
import { fetchDashboardSummary, fetchSpendingTrend } from '../store/slices/dashboardSlice';
import TransactionForm from '../components/Transactions/TransactionForm';
import TransactionList from '../components/Transactions/TransactionList';
import SpendingPieChart from '../components/Dashboard/SpendingPieChart';
import SpendingTrendChart from '../components/Dashboard/SpendingTrendChart';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { items: transactions, loading: transactionsLoading } = useSelector(
    (state) => state.transactions
  );
  const { summary, spendingTrend, loading: dashboardLoading } = useSelector(
    (state) => state.dashboard
  );

  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [dateFilter, setDateFilter] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchTransactions());
    dispatch(fetchDashboardSummary(dateFilter));
    dispatch(fetchSpendingTrend({ months: 6 }));
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTransaction(null);
  };

  const handleDateFilterChange = () => {
    dispatch(fetchDashboardSummary(dateFilter));
    dispatch(fetchTransactions(dateFilter));
  };

  // Calculate totals
  const income = summary?.summary?.income || 0;
  const expenses = summary?.summary?.expenses || 0;
  const balance = summary?.summary?.balance || 0;
  const expenseChange = summary?.summary?.expenseChange || 0;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Finance Tracker</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Welcome, {user?.name}!</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Date Filter */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={dateFilter.startDate}
                onChange={(e) =>
                  setDateFilter({ ...dateFilter, startDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={dateFilter.endDate}
                onChange={(e) =>
                  setDateFilter({ ...dateFilter, endDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleDateFilterChange}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
            >
              Apply Filter
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Total Income</h3>
            <p className="text-3xl font-bold text-green-600">
              ${income.toFixed(2)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Total Expenses</h3>
            <p className="text-3xl font-bold text-red-600">
              ${expenses.toFixed(2)}
            </p>
            {expenseChange !== 0 && (
              <p
                className={`text-sm mt-1 ${
                  expenseChange > 0 ? 'text-red-500' : 'text-green-500'
                }`}
              >
                {expenseChange > 0 ? '+' : ''}
                {expenseChange}% from last month
              </p>
            )}
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Balance</h3>
            <p
              className={`text-3xl font-bold ${
                balance >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              ${balance.toFixed(2)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Transactions</h3>
            <p className="text-3xl font-bold text-blue-600">
              {summary?.summary?.transactionCount || 0}
            </p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Spending Breakdown */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Spending by Category
            </h2>
            {dashboardLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <SpendingPieChart data={summary?.categoryBreakdown || []} />
            )}
          </div>

          {/* Spending Trend */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Income vs Expenses Trend
            </h2>
            {dashboardLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <SpendingTrendChart data={spendingTrend} />
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Recent Transactions
          </h2>
          {summary?.recentTransactions && summary.recentTransactions.length > 0 ? (
            <TransactionList
              transactions={summary.recentTransactions}
              onEdit={handleEdit}
            />
          ) : (
            <p className="text-gray-500 text-center py-4">No recent transactions</p>
          )}
        </div>

        {/* All Transactions Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">All Transactions</h2>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              + Add Transaction
            </button>
          </div>

          {transactionsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            </div>
          ) : (
            <TransactionList transactions={transactions} onEdit={handleEdit} />
          )}
        </div>
      </main>

      {/* Transaction Form Modal */}
      {showForm && (
        <TransactionForm
          transaction={editingTransaction}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

export default DashboardPage;
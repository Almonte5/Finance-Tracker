import { useDispatch } from 'react-redux';
import { deleteTransaction } from '../../store/slices/transactionSlice';

const TransactionList = ({ transactions, onEdit }) => {
  const dispatch = useDispatch();

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      dispatch(deleteTransaction(id));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatAmount = (amount, type) => {
    const formatted = `$${Math.abs(amount).toFixed(2)}`;
    return type === 'INCOME' ? `+${formatted}` : `-${formatted}`;
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No transactions yet. Add your first transaction!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: transaction.category.color }}
                ></div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {transaction.description || transaction.category.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {transaction.category.name} • {formatDate(transaction.date)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span
                className={`text-lg font-bold ${
                  transaction.type === 'INCOME'
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {formatAmount(transaction.amount, transaction.type)}
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(transaction)}
                  className="text-blue-500 hover:text-blue-700 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(transaction.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TransactionList;
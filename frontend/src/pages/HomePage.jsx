import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-5xl font-bold mb-4">Finance Tracker</h1>
        <p className="text-xl mb-8">Take control of your finances</p>
        <div className="space-x-4">
          <Link
            to="/login"
            className="bg-white text-blue-500 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 inline-block"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-500 inline-block"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
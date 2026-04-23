import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import BottomNav from './components/BottomNav';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import OrderHistory from './pages/OrderHistory';
import Promotions from './pages/Promotions';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import CustomerDetail from './pages/admin/CustomerDetail';

function CustomerApp() {
  return (
    <ProtectedRoute>
      <div className="relative min-h-svh">
        <Routes>
          <Route path="/"        element={<Dashboard />} />
          <Route path="/history" element={<OrderHistory />} />
          <Route path="/promos"  element={<Promotions />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
        <BottomNav />
      </div>
    </ProtectedRoute>
  );
}

function AdminApp() {
  return (
    <div className="min-h-svh">
      <Routes>
        <Route path="/admin"               element={<AdminDashboard />} />
        <Route path="/admin/customers/:id" element={<CustomerDetail />} />
      </Routes>
    </div>
  );
}

function AppRouter() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');
  const isLogin = pathname === '/login';

  if (isLogin) return <Routes><Route path="/login" element={<Login />} /></Routes>;
  if (isAdmin)  return <AdminApp />;
  return <CustomerApp />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  );
}

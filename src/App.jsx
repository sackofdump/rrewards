import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import ProtectedRoute from './components/ProtectedRoute';
import BottomNav from './components/BottomNav';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import OrderHistory from './pages/OrderHistory';
import Restaurants from './pages/Restaurants';
import Wallet from './pages/Wallet';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import Referrals from './pages/Referrals';
import Challenges from './pages/Challenges';
import AdminDashboard from './pages/admin/AdminDashboard';
import CustomerDetail from './pages/admin/CustomerDetail';
import MenuManagement from './pages/admin/MenuManagement';
import Settings from './pages/admin/Settings';
import PromotionsAdmin from './pages/admin/PromotionsAdmin';
const Analytics = lazy(() => import('./pages/admin/Analytics'));
import DevLogin from './pages/dev/DevLogin';
import DevAdmin from './pages/dev/DevAdmin';
import StaffScanner from './pages/staff/StaffScanner';

function MobileShell({ children }) {
  return (
    <div className="flex flex-col bg-[#080a0f] w-full min-h-svh">
      {children}
    </div>
  );
}

function CustomerApp() {
  return (
    <ProtectedRoute role="customer">
      <MobileShell>
        <div className="flex-1 pb-24">
          <Routes>
            <Route path="/"              element={<Dashboard />} />
            <Route path="/history"       element={<OrderHistory />} />
            <Route path="/restaurants"   element={<Restaurants />} />
            <Route path="/wallet"        element={<Wallet />} />
            <Route path="/profile"       element={<Profile />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/referrals"     element={<Referrals />} />
            <Route path="/challenges"    element={<Challenges />} />
          </Routes>
        </div>
        <BottomNav />
      </MobileShell>
    </ProtectedRoute>
  );
}

function AdminApp() {
  return (
    <ProtectedRoute role="admin">
      <MobileShell>
        <div className="flex-1">
          <Routes>
            <Route path="/admin"               element={<AdminDashboard />} />
            <Route path="/admin/menu"          element={<MenuManagement />} />
            <Route path="/admin/settings"      element={<Settings />} />
            <Route path="/admin/promotions"    element={<PromotionsAdmin />} />
            <Route path="/admin/analytics" element={
              <Suspense fallback={<div className="p-8 text-center text-neutral-500 text-sm">Loading charts…</div>}>
                <Analytics />
              </Suspense>
            } />
            <Route path="/admin/customers/:id" element={<CustomerDetail />} />
          </Routes>
        </div>
      </MobileShell>
    </ProtectedRoute>
  );
}

function StaffApp() {
  return (
    <ProtectedRoute role="staff">
      <MobileShell>
        <div className="flex-1">
          <Routes>
            <Route path="/staff" element={<StaffScanner />} />
          </Routes>
        </div>
      </MobileShell>
    </ProtectedRoute>
  );
}

function DevAdminApp() {
  return (
    <ProtectedRoute role="devadmin">
      <MobileShell>
        <div className="flex-1">
          <Routes>
            <Route path="/dev-admin" element={<DevAdmin />} />
          </Routes>
        </div>
      </MobileShell>
    </ProtectedRoute>
  );
}

function AppRouter() {
  const { pathname } = useLocation();
  if (pathname === '/login') return (
    <MobileShell>
      <Routes><Route path="/login" element={<Login />} /></Routes>
    </MobileShell>
  );
  if (pathname === '/dev-login') return (
    <MobileShell>
      <Routes><Route path="/dev-login" element={<DevLogin />} /></Routes>
    </MobileShell>
  );
  if (pathname.startsWith('/admin'))     return <AdminApp />;
  if (pathname.startsWith('/staff'))     return <StaffApp />;
  if (pathname.startsWith('/dev-admin')) return <DevAdminApp />;
  return <CustomerApp />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SettingsProvider>
          <AppRouter />
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

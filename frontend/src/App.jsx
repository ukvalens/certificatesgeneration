import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import DashboardLayout from './components/DashboardLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Certificates from './pages/Certificates';
import CertificateTypes from './pages/CertificateTypes';
import Categories from './pages/Categories';
import Verify from './pages/Verify';
import IssuerDashboard from './pages/IssuerDashboard';
import RecipientDashboard from './pages/RecipientDashboard';

const dashboardPaths = ['/dashboard', '/certificates', '/certificate-types', '/categories'];

function DashboardRouter() {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'admin') return <Dashboard />;
  if (user.role === 'issuer') return <IssuerDashboard />;
  return <RecipientDashboard />;
}

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" />;
  return children;
}

function Layout() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const isDashboard = dashboardPaths.some(p => pathname.startsWith(p));
  const isVerifyDashboard = pathname.startsWith('/verify') && user;
  const hideGlobalLayout = isDashboard || isVerifyDashboard;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!hideGlobalLayout && <Navbar />}
      <div style={{ background: '#f8fafc', flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/verify"
            element={
              user ? (
                <DashboardLayout title="Verify Certificate">
                  <Verify />
                </DashboardLayout>
              ) : (
                <Verify />
              )
            }
          />
          <Route
            path="/verify/:code"
            element={
              user ? (
                <DashboardLayout title="Verify Certificate">
                  <Verify />
                </DashboardLayout>
              ) : (
                <Verify />
              )
            }
          />
          <Route path="/dashboard" element={<DashboardRouter />} />
          <Route path="/certificates" element={<ProtectedRoute roles={['admin']}><Certificates /></ProtectedRoute>} />
          <Route path="/certificate-types" element={<ProtectedRoute roles={['admin']}><CertificateTypes /></ProtectedRoute>} />
          <Route path="/categories" element={<ProtectedRoute roles={['admin']}><Categories /></ProtectedRoute>} />
        </Routes>
      </div>
      {!hideGlobalLayout && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout />
      </AuthProvider>
    </BrowserRouter>
  );
}

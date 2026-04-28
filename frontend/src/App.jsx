import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import Certificates from './pages/Certificates';
import CertificateTypes from './pages/CertificateTypes';
import Categories from './pages/Categories';
import Verify from './pages/Verify';

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ background: '#f8fafc', flex: 1 }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/certificates" element={<Certificates />} />
          <Route path="/certificate-types" element={<CertificateTypes />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/verify/:code" element={<Verify />} />
        </Routes>
      </div>
      <Footer />
      </div>
    </BrowserRouter>
  );
}

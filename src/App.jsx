import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, PlusCircle, Package, Settings } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Produtos from './pages/Produtos';
import NovaVenda from './pages/NovaVenda';
import Configuracoes from './pages/Configuracoes';
import { Toaster } from 'react-hot-toast';
import './index.css';
import './components.css';

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: <Home size={24} />, path: '/', label: 'Início' },
    { icon: <Users size={24} />, path: '/clientes', label: 'Clientes' },
    { icon: <PlusCircle size={28} />, path: '/nova-venda', label: 'Vender', highlight: true },
    { icon: <Package size={24} />, path: '/produtos', label: 'Produtos' },
    { icon: <Settings size={24} />, path: '/config', label: 'Ajustes' },
  ];

  return (
    <div className="bottom-nav glass">
      {navItems.map((item) => (
        <button
          key={item.path}
          className={`nav-item ${location.pathname === item.path ? 'active' : ''} ${item.highlight ? 'highlight' : ''}`}
          onClick={() => navigate(item.path)}
        >
          {item.icon}
          {!item.highlight && <span>{item.label}</span>}
        </button>
      ))}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" toastOptions={{
        style: {
          background: 'rgba(30, 20, 50, 0.8)',
          color: '#fff',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px'
        },
        success: { iconTheme: { primary: '#e81cff', secondary: '#fff' } }
      }} />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/nova-venda" element={<NovaVenda />} />
        <Route path="/produtos" element={<Produtos />} />
        <Route path="/config" element={<Configuracoes />} />
      </Routes>
      <BottomNav />
    </BrowserRouter>
  );
}

export default App;

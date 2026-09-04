import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, PlusCircle, Package, Settings } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import './index.css';

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
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/clientes" element={<div className="page-container"><h2>Clientes</h2></div>} />
        <Route path="/nova-venda" element={<div className="page-container"><h2>Nova Venda</h2></div>} />
        <Route path="/produtos" element={<div className="page-container"><h2>Produtos</h2></div>} />
        <Route path="/config" element={<div className="page-container"><h2>Configurações</h2></div>} />
      </Routes>
      <BottomNav />
    </BrowserRouter>
  );
}

export default App;

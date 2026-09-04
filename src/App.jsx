import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { Home, Users, PlusCircle, Package, Settings } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Produtos from './pages/Produtos';
import NovaVenda from './pages/NovaVenda';
import Configuracoes from './pages/Configuracoes';
import { Toaster } from 'react-hot-toast';
import './index.css';
import './components.css';

import './components.css';

function BottomNav({ pendingCount }) {
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
          {item.path === '/' && pendingCount > 0 && (
            <span style={{ position: 'absolute', top: '8px', right: '16px', background: '#ff4a5a', color: '#fff', fontSize: '0.6rem', fontWeight: 'bold', padding: '2px 6px', borderRadius: '10px' }}>
              {pendingCount}
            </span>
          )}
          {item.icon}
          {!item.highlight && <span>{item.label}</span>}
        </button>
      ))}
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/nova-venda" element={<NovaVenda />} />
        <Route path="/produtos" element={<Produtos />} />
        <Route path="/config" element={<Configuracoes />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'vendas'), (snapshot) => {
      const allVendas = snapshot.docs.map(doc => doc.data());
      const hoje = new Date();
      hoje.setHours(0,0,0,0);
      
      let count = 0;
      allVendas.forEach(venda => {
        if (venda.status !== 'pago' && venda.dataPagamento) {
          const dataPg = new Date(venda.dataPagamento);
          dataPg.setMinutes(dataPg.getMinutes() + dataPg.getTimezoneOffset());
          dataPg.setHours(0,0,0,0);
          if (dataPg <= hoje) count++; // Atrasado ou Vence Hoje
        }
      });
      setPendingCount(count);
    });
    return () => unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      <div className="bg-orbs" />
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
      <AnimatedRoutes />
      <BottomNav pendingCount={pendingCount} />
    </BrowserRouter>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { collection, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from './firebase';
import { Home, Users, PlusCircle, Package, Settings, Loader2 } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Produtos from './pages/Produtos';
import NovaVenda from './pages/NovaVenda';
import Configuracoes from './pages/Configuracoes';
import Login from './pages/Login';
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
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            {item.path === '/' && pendingCount > 0 && (
              <span style={{ position: 'absolute', top: '-6px', right: '-12px', background: '#ff4a5a', color: '#fff', fontSize: '0.65rem', fontWeight: 'bold', minWidth: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                {pendingCount}
              </span>
            )}
            {item.icon}
          </div>
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
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });
    
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;
    
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
  }, [user]);

  if (loadingAuth) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-dark)' }}>
        <Loader2 className="animate-spin text-magenta" size={48} color="var(--magenta)" />
      </div>
    );
  }

  if (!user) {
    return (
      <HashRouter>
        <Toaster position="top-center" />
        <Login />
      </HashRouter>
    );
  }

  return (
    <HashRouter>
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
    </HashRouter>
  );
}

export default App;

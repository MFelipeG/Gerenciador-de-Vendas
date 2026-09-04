import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import '../components.css';

export default function Dashboard() {
  const [vendas, setVendas] = useState([]);
  const [lucroTotal, setLucroTotal] = useState(0);

  useEffect(() => {
    const q = query(collection(db, 'vendas'), orderBy('dataCriacao', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const vendasData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVendas(vendasData);
      
      const totalLucro = vendasData.reduce((acc, curr) => acc + (curr.lucro || 0), 0);
      setLucroTotal(totalLucro);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="page-container">
      <header style={{ marginBottom: '30px' }}>
        <h1 className="header-title">Bom dia!</h1>
        <p className="subtitle">Aqui está o resumo das suas vendas.</p>
      </header>

      <section className="glass dashboard-card" style={{ padding: '24px', marginBottom: '30px' }}>
        <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Lucro Acumulado</h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
          <h2 className="text-gradient" style={{ fontSize: '2.5rem', lineHeight: '1' }}>R$ {lucroTotal.toFixed(2)}</h2>
        </div>
      </section>

      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3>Últimas Vendas</h3>
        </div>
        
        {vendas.length === 0 && <p style={{color: 'var(--text-muted)'}}>Nenhuma venda registrada.</p>}

        {vendas.map(venda => (
          <div key={venda.id} className="glass list-item">
            <div className="avatar">{venda.clienteNome?.charAt(0).toUpperCase()}</div>
            <div className="info">
              <h4>{venda.clienteNome}</h4>
              <p>{venda.produtoNome}</p>
            </div>
            <div className="value">
              <h4>R$ {venda.valor?.toFixed(2)}</h4>
              <p style={{ color: venda.status === 'pendente' ? '#ff4a5a' : '#00e676' }}>
                {venda.status === 'pendente' ? 'Pendente' : 'Pago'}
              </p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

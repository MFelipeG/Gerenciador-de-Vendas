import React from 'react';
import '../components.css';

export default function Dashboard() {
  return (
    <div className="page-container">
      <header style={{ marginBottom: '30px' }}>
        <h1 className="header-title">Bom dia, Amanda!</h1>
        <p className="subtitle">Aqui está o resumo das suas vendas.</p>
      </header>

      <section className="glass dashboard-card" style={{ padding: '24px', marginBottom: '30px' }}>
        <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Lucro do Mês</h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
          <h2 className="text-gradient" style={{ fontSize: '2.5rem', lineHeight: '1' }}>R$ 1.250,00</h2>
          <span style={{ color: '#00e676', fontWeight: '600', marginBottom: '6px' }}>+12%</span>
        </div>
      </section>

      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3>A Receber Hoje</h3>
          <span style={{ color: 'var(--magenta)', fontSize: '0.9rem' }}>Ver todas</span>
        </div>
        
        <div className="glass list-item">
          <div className="avatar">M</div>
          <div className="info">
            <h4>Maria Silva</h4>
            <p>Lily Eau de Parfum</p>
          </div>
          <div className="value">
            <h4>R$ 299,90</h4>
            <p style={{ color: '#ff4a5a' }}>Pendente</p>
          </div>
        </div>

        <div className="glass list-item">
          <div className="avatar">C</div>
          <div className="info">
            <h4>Carla Mendes</h4>
            <p>Malbec Creme</p>
          </div>
          <div className="value">
            <h4>R$ 89,90</h4>
            <p style={{ color: '#00e676' }}>Pago</p>
          </div>
        </div>
      </section>
    </div>
  );
}

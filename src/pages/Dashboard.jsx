import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Calendar } from 'lucide-react';
import '../components.css';

export default function Dashboard() {
  const [vendas, setVendas] = useState([]);
  const [lucroTotal, setLucroTotal] = useState(0);
  const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth());
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear());
  const [vendedora, setVendedora] = useState('');

  useEffect(() => {
    const nome = localStorage.getItem('vendedoraNome');
    if (nome) setVendedora(nome);
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'vendas'), orderBy('dataVenda', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allVendas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Filter by selected month and year
      const filteredVendas = allVendas.filter(venda => {
        if (!venda.dataVenda) return false;
        const data = new Date(venda.dataVenda);
        return data.getMonth() === parseInt(mesSelecionado) && data.getFullYear() === parseInt(anoSelecionado);
      });

      setVendas(filteredVendas);
      
      const totalLucro = filteredVendas.reduce((acc, curr) => acc + (curr.lucro || 0), 0);
      setLucroTotal(totalLucro);
    });
    return () => unsubscribe();
  }, [mesSelecionado, anoSelecionado]);

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const formatarData = (dataString) => {
    if (!dataString) return '';
    const data = new Date(dataString);
    // Adicionar fuso horário para evitar mostrar o dia anterior
    data.setMinutes(data.getMinutes() + data.getTimezoneOffset());
    return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div className="page-container">
      <header style={{ marginBottom: '24px' }}>
        <h1 className="header-title">Bom dia{vendedora ? `, ${vendedora}` : ''}!</h1>
        <p className="subtitle">Aqui está o resumo das suas vendas.</p>
      </header>

      {/* Seletor de Mês */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
        <Calendar size={18} color="var(--magenta)" />
        <select 
          value={mesSelecionado} 
          onChange={(e) => setMesSelecionado(e.target.value)}
          style={{ 
            background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid var(--glass-border)',
            padding: '8px 12px', borderRadius: '8px', outline: 'none', fontFamily: 'inherit'
          }}
        >
          {meses.map((mes, index) => (
            <option key={index} value={index} style={{ color: 'black' }}>{mes}</option>
          ))}
        </select>
        <select 
          value={anoSelecionado} 
          onChange={(e) => setAnoSelecionado(e.target.value)}
          style={{ 
            background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid var(--glass-border)',
            padding: '8px 12px', borderRadius: '8px', outline: 'none', fontFamily: 'inherit'
          }}
        >
          {[2024, 2025, 2026, 2027].map((ano) => (
            <option key={ano} value={ano} style={{ color: 'black' }}>{ano}</option>
          ))}
        </select>
      </div>

      <section className="glass dashboard-card" style={{ padding: '24px', marginBottom: '30px' }}>
        <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Lucro do Mês</h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
          <h2 className="text-gradient" style={{ fontSize: '2.5rem', lineHeight: '1' }}>€ {lucroTotal.toFixed(2)}</h2>
        </div>
      </section>

      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3>Vendas de {meses[mesSelecionado]}</h3>
        </div>
        
        {vendas.length === 0 && <p style={{color: 'var(--text-muted)'}}>Nenhuma venda registrada neste mês.</p>}

        {vendas.map(venda => (
          <div key={venda.id} className="glass list-item">
            <div className="avatar">{venda.clienteNome?.charAt(0).toUpperCase()}</div>
            <div className="info">
              <h4>{venda.clienteNome}</h4>
              <p>{venda.produtoNome}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--orange)', marginTop: '4px' }}>
                Prev. Pagamento: {formatarData(venda.dataPagamento)}
              </p>
            </div>
            <div className="value">
              <h4>€ {venda.valor?.toFixed(2)}</h4>
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

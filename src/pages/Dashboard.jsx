import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { Calendar, CheckCircle, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import '../components.css';

export default function Dashboard() {
  const [vendas, setVendas] = useState([]);
  const [lucroTotal, setLucroTotal] = useState(0);
  const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth());
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear());
  const [vendedora, setVendedora] = useState('');
  const [fraseMotivacional, setFraseMotivacional] = useState('');

  const frases = [
    "O sucesso é a soma de pequenos esforços.",
    "Acredite e você já estará no meio do caminho.",
    "Grandes coisas nunca vêm da zona de conforto.",
    "O otimismo é a fé em ação.",
    "Cada venda é um degrau para o topo.",
    "Seu único limite é a sua própria mente.",
    "Aja como se o que você faz fizesse diferença. E faz.",
    "Não espere por oportunidades, crie-as.",
    "Hoje é um ótimo dia para bater metas!"
  ];

  const getSaudacao = () => {
    const hora = new Date().getHours();
    if (hora >= 0 && hora < 6) return 'Boa madrugada';
    if (hora >= 6 && hora < 12) return 'Bom dia';
    if (hora >= 12 && hora < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  useEffect(() => {
    const nome = localStorage.getItem('vendedoraNome');
    if (nome) setVendedora(nome);
    setFraseMotivacional(frases[Math.floor(Math.random() * frases.length)]);
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
    data.setMinutes(data.getMinutes() + data.getTimezoneOffset());
    return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const getStatusInfo = (venda) => {
    if (venda.status === 'pago') return { texto: 'Pago', cor: '#00e676' };
    if (!venda.dataPagamento) return { texto: 'Pendente', cor: 'var(--orange)' };

    const hoje = new Date();
    hoje.setHours(0,0,0,0);
    
    const dataPg = new Date(venda.dataPagamento);
    dataPg.setMinutes(dataPg.getMinutes() + dataPg.getTimezoneOffset());
    dataPg.setHours(0,0,0,0);

    if (dataPg > hoje) return { texto: 'No Prazo', cor: '#00e676' }; // verde
    if (dataPg.getTime() === hoje.getTime()) return { texto: 'Vence Hoje', cor: 'var(--orange)' }; // laranja
    return { texto: 'Atrasado', cor: '#ff4a5a' }; // vermelho
  };

  const handleMarcarPago = async (id) => {
    try {
      await updateDoc(doc(db, 'vendas', id), { status: 'pago' });
      toast.success('Venda marcada como paga!');
    } catch (error) {
      toast.error('Erro ao atualizar pagamento.');
    }
  };

  const handleWhatsApp = (venda) => {
    const saudacao = vendedora ? `Oii, aqui é a ${vendedora}! Tudo bem? ` : `Oii! Tudo bem? `;
    const parte1 = encodeURIComponent(saudacao);
    const emoji1 = '%E2%9C%A8'; // brilho
    
    const texto2 = `\n\nPassando aqui com muito carinho para te lembrar do acerto do seu *${venda.produtoNome}* (Valor: *€ ${venda.valor?.toFixed(2)}*), que está previsto para dia *${formatarData(venda.dataPagamento)}*.\n\nQualquer dúvida me avisa, viu? Muito obrigada pela preferência de sempre! `;
    const parte2 = encodeURIComponent(texto2);
    
    const emoji2 = '%F0%9F%92%96'; // coracao
    const emoji3 = '%F0%9F%9B%8D%EF%B8%8F'; // sacola
    
    const url = `https://wa.me/?text=${parte1}${emoji1}${parte2}${emoji2}${emoji3}`;
    window.open(url, '_blank');
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  };

  return (
    <motion.div 
      className="page-container"
      initial="initial" animate="in" exit="out" variants={pageVariants} transition={{ duration: 0.3 }}
    >
      <header style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
        <div>
          <h1 className="header-title">{getSaudacao()}{vendedora ? `, ${vendedora}` : ''}!</h1>
          <p className="subtitle">Aqui está o resumo das suas vendas.</p>
        </div>
        
        <div style={{ maxWidth: '40%', textAlign: 'right', background: 'var(--bg-gradient-2)', padding: '10px 14px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
          <p style={{ fontSize: '0.65rem', color: 'var(--magenta)', fontWeight: 'bold', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>💡 Inspiração</p>
          <p style={{ fontSize: '0.75rem', fontStyle: 'italic', lineHeight: '1.3' }}>"{fraseMotivacional}"</p>
        </div>
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
        <div className="vendas-list">
        {vendas.length === 0 && <p style={{color: 'var(--text-muted)', textAlign: 'center'}}>Nenhuma venda este mês.</p>}
        {vendas.map((venda, index) => (
          <motion.div 
            key={venda.id} 
            className="glass list-item"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="info">
              <h4>{venda.clienteNome}</h4>
              <p>{venda.produtoNome}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Compra: {formatarData(venda.dataVenda)} • Vence: {formatarData(venda.dataPagamento)}
              </p>
            </div>
            <div className="value" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
              <h4>€ {venda.valor?.toFixed(2)}</h4>
              <p style={{ color: getStatusInfo(venda).cor, fontWeight: 'bold', fontSize: '0.85rem' }}>
                {getStatusInfo(venda).texto}
              </p>
              {venda.status !== 'pago' && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => handleWhatsApp(venda)}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent', border: '1px solid var(--magenta)', color: 'var(--magenta)', padding: '4px 8px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', marginTop: '4px' }}
                  >
                    <MessageCircle size={14} /> Cobrar
                  </button>
                  <button 
                    onClick={() => handleMarcarPago(venda.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent', border: '1px solid #00e676', color: '#00e676', padding: '4px 8px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', marginTop: '4px' }}
                  >
                    <CheckCircle size={14} /> Receber
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
        </div>
      </section>
    </motion.div>
  );
}

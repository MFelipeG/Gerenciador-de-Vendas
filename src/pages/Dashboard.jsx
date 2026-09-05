import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Calendar, CheckCircle, MessageCircle, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import '../components.css';

export default function Dashboard() {
  const [vendas, setVendas] = useState([]);
  const [lucroTotal, setLucroTotal] = useState(0);
  const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth());
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear());
  
  const user = auth.currentUser;
  const [vendedora, setVendedora] = useState(user?.displayName?.split(' ')[0] || '');
  const userPhoto = user?.photoURL;
  const [fraseMotivacional, setFraseMotivacional] = useState('');
  const [gastoTotal, setGastoTotal] = useState(0);

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

  const saudacao = getSaudacao();

  useEffect(() => {
    setFraseMotivacional(frases[Math.floor(Math.random() * frases.length)]);
    if (!user) {
      const savedName = localStorage.getItem('vendedoraNome');
      if (savedName) setVendedora(savedName);
    }
  }, [user]);

  useEffect(() => {
    const q = query(collection(db, 'vendas'), orderBy('dataVenda', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allVendas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const filteredVendas = allVendas.filter(venda => {
        if (!venda.dataVenda) return false;
        const data = new Date(venda.dataVenda);
        return data.getMonth() === parseInt(mesSelecionado) && data.getFullYear() === parseInt(anoSelecionado);
      });

      setVendas(filteredVendas);
      
      let tLucro = 0;
      let tGasto = 0;
      filteredVendas.forEach(curr => {
        const lucro = curr.lucro || 0;
        const valor = curr.valor || 0;
        const gasto = valor - lucro;
        tLucro += lucro;
        tGasto += gasto;
      });
      
      setLucroTotal(tLucro);
      setGastoTotal(tGasto);
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

    if (dataPg > hoje) return { texto: 'No Prazo', cor: '#00e676' };
    if (dataPg.getTime() === hoje.getTime()) return { texto: 'Vence Hoje', cor: 'var(--orange)' };
    return { texto: 'Atrasado', cor: '#ff4a5a' };
  };

  const handleMarcarPago = async (id) => {
    try {
      await updateDoc(doc(db, 'vendas', id), { status: 'pago' });
      toast.success('Oba! Pagamento recebido!');
    } catch (error) {
      toast.error('Erro ao atualizar pagamento.');
    }
  };

  const handleExcluir = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta venda?')) {
      try {
        await deleteDoc(doc(db, 'vendas', id));
        toast.success('Venda excluída!');
      } catch (error) {
        toast.error('Erro ao excluir venda.');
      }
    }
  };

  const handleWhatsApp = (venda) => {
    const saudacaoWpp = vendedora ? `Oii, aqui é a ${vendedora}! Tudo bem? ` : `Oii! Tudo bem? `;
    const parte1 = encodeURIComponent(saudacaoWpp);
    const emoji1 = '%E2%9C%A8';
    
    const texto2 = `\n\nPassando aqui com muito carinho para te lembrar do acerto do seu *${venda.produtoNome}* (Valor: *€ ${venda.valor?.toFixed(2)}*), que está previsto para dia *${formatarData(venda.dataPagamento)}*.\n\nQualquer dúvida me avisa, viu? Muito obrigada pela preferência de sempre! `;
    const parte2 = encodeURIComponent(texto2);
    
    const emoji2 = '%F0%9F%92%96';
    const emoji3 = '%F0%9F%9B%8D%EF%B8%8F';
    
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {userPhoto ? (
            <img src={userPhoto} alt="Perfil" referrerPolicy="no-referrer" style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid var(--magenta)', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--purple), var(--magenta))', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}>
              {vendedora ? vendedora.charAt(0).toUpperCase() : 'M'}
            </div>
          )}
          <div>
            <h1 className="header-title" style={{ fontSize: '1.2rem' }}>
              {saudacao}, {vendedora || 'Vendedora'}!
            </h1>
            <p className="subtitle" style={{ fontSize: '0.85rem' }}>Resumo das suas vendas.</p>
          </div>
        </div>

        <div style={{ maxWidth: '45%', textAlign: 'right', background: 'var(--bg-gradient-2)', padding: '10px 14px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
          <p style={{ fontSize: '0.65rem', color: 'var(--magenta)', fontWeight: 'bold', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>💡 Inspiração</p>
          <p style={{ fontSize: '0.75rem', fontStyle: 'italic', lineHeight: '1.3' }}>"{fraseMotivacional}"</p>
        </div>
      </header>

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
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', marginBottom: '16px' }}>
          <h2 className="text-gradient" style={{ fontSize: '2.5rem', lineHeight: '1' }}>€ {lucroTotal.toFixed(2)}</h2>
          <span style={{ padding: '4px 8px', background: 'rgba(0, 230, 118, 0.2)', color: '#00e676', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '4px' }}>
            {((gastoTotal + lucroTotal) > 0 ? (lucroTotal / (gastoTotal + lucroTotal) * 100) : 0).toFixed(1)}% Margem
          </span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Gasto (Compras)</p>
            <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#ff4a5a' }}>€ {gastoTotal.toFixed(2)}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Faturamento</p>
            <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff' }}>€ {(gastoTotal + lucroTotal).toFixed(2)}</p>
          </div>
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
              {venda.status !== 'pago' ? (
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
                  <button 
                    onClick={() => handleExcluir(venda.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent', border: '1px solid #ff4a5a', color: '#ff4a5a', padding: '4px 8px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', marginTop: '4px' }}
                  >
                    <Trash2 size={14} /> Excluir
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => handleExcluir(venda.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent', border: '1px solid #ff4a5a', color: '#ff4a5a', padding: '4px 8px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', marginTop: '4px' }}
                >
                  <Trash2 size={14} /> Excluir
                </button>
              )}
            </div>
          </motion.div>
        ))}
        </div>
      </section>
    </motion.div>
  );
}

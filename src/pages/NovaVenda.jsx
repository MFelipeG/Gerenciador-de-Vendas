import React, { useState, useEffect } from 'react';
import { ShoppingBag, Calendar, User, ShoppingCart } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function NovaVenda() {
  const [venda, setVenda] = useState({ clienteId: '', clienteNome: '', produtoId: '', produtoNome: '', valor: 0, lucro: 0, dataVenda: '', dataPagamento: '' });
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubC = onSnapshot(collection(db, 'clientes'), (snap) => setClientes(snap.docs.map(d => ({id: d.id, ...d.data()}))));
    const unsubP = onSnapshot(collection(db, 'produtos'), (snap) => setProdutos(snap.docs.map(d => ({id: d.id, ...d.data()}))));
    return () => { unsubC(); unsubP(); };
  }, []);

  const handleProdutoChange = (e) => {
    const pId = e.target.value;
    const prod = produtos.find(p => p.id === pId);
    if (prod) {
      setVenda({ ...venda, produtoId: pId, produtoNome: prod.nome, valor: prod.precoVenda, lucro: prod.precoVenda - prod.precoCusto });
    } else {
      setVenda({ ...venda, produtoId: '' });
    }
  };

  const handleClienteChange = (e) => {
    const cId = e.target.value;
    const cli = clientes.find(c => c.id === cId);
    setVenda({ ...venda, clienteId: cId, clienteNome: cli ? cli.nome : '' });
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    if(venda.clienteId && venda.produtoId) {
      await addDoc(collection(db, 'vendas'), {
        ...venda,
        status: 'pendente',
        dataCriacao: new Date().toISOString()
      });
      toast.success('Venda registrada com sucesso!');
      setVenda({ clienteId: '', clienteNome: '', produtoId: '', produtoNome: '', valor: 0, lucro: 0, dataVenda: '', dataPagamento: '' });
      navigate('/');
    }
  };

  return (
    <motion.div 
      className="page-container"
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}
    >
      <header style={{ marginBottom: '24px' }}>
        <h1 className="header-title">Nova Venda</h1>
        <p className="subtitle">Registre o pedido da cliente</p>
      </header>

      <form onSubmit={handleSalvar} className="glass" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <div>
          <label style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px', color: 'var(--text-muted)' }}>
            <User size={18} /> Cliente
          </label>
          <select className="input-field" required value={venda.clienteId} onChange={handleClienteChange}>
            <option value="">Selecione a cliente</option>
            {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>

        <div>
          <label style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px', color: 'var(--text-muted)' }}>
            <ShoppingBag size={18} /> Produto
          </label>
          <select className="input-field" required value={venda.produtoId} onChange={handleProdutoChange}>
            <option value="">Selecione o produto</option>
            {produtos.map(p => <option key={p.id} value={p.id}>{p.codigo ? `[${p.codigo}] ` : ''}{p.nome} - € {p.precoVenda?.toFixed(2)}</option>)}
          </select>
        </div>

        <div>
          <label style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px', color: 'var(--text-muted)' }}>
            <Calendar size={18} /> Data da Venda
          </label>
          <input type="date" className="input-field" required value={venda.dataVenda} onChange={e => setVenda({...venda, dataVenda: e.target.value})} />
        </div>

        <div>
          <label style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px', color: 'var(--text-muted)' }}>
            <Calendar size={18} /> Data Combinada p/ Pagamento
          </label>
          <input type="date" className="input-field" required value={venda.dataPagamento} onChange={e => setVenda({...venda, dataPagamento: e.target.value})} />
        </div>

        <button type="submit" className="btn-primary" style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <ShoppingCart size={20} /> Registrar Venda
        </button>
      </form>
    </motion.div>
  );
}

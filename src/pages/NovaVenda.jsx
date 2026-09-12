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
  
  const [buscaCliente, setBuscaCliente] = useState('');
  const [buscaProduto, setBuscaProduto] = useState('');
  const [showClientes, setShowClientes] = useState(false);
  const [showProdutos, setShowProdutos] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    const unsubC = onSnapshot(collection(db, 'clientes'), (snap) => setClientes(snap.docs.map(d => ({id: d.id, ...d.data()}))));
    const unsubP = onSnapshot(collection(db, 'produtos'), (snap) => setProdutos(snap.docs.map(d => ({id: d.id, ...d.data()}))));
    return () => { unsubC(); unsubP(); };
  }, []);

  const handleProdutoSelect = (prod) => {
    setVenda({ ...venda, produtoId: prod.id, produtoNome: prod.nome, valor: prod.precoVenda, lucro: prod.precoVenda - prod.precoCusto });
    setBuscaProduto(prod.nome);
    setShowProdutos(false);
  };

  const handleClienteSelect = (cli) => {
    setVenda({ ...venda, clienteId: cli.id, clienteNome: cli.nome });
    setBuscaCliente(cli.nome);
    setShowClientes(false);
  };

  const clientesFiltrados = clientes.filter(c => c.nome.toLowerCase().includes(buscaCliente.toLowerCase()));
  const produtosFiltrados = produtos.filter(p => p.nome.toLowerCase().includes(buscaProduto.toLowerCase()) || (p.codigo && p.codigo.toLowerCase().includes(buscaProduto.toLowerCase())));

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
      setBuscaCliente('');
      setBuscaProduto('');
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
        
        <div style={{ position: 'relative' }}>
          <label style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px', color: 'var(--text-muted)' }}>
            <User size={18} /> Cliente
          </label>
          <input 
            type="text" 
            className="input-field" 
            placeholder="Buscar cliente..." 
            value={buscaCliente} 
            onChange={e => {
              setBuscaCliente(e.target.value);
              setShowClientes(true);
              if (!e.target.value) setVenda({...venda, clienteId: '', clienteNome: ''});
            }}
            onFocus={() => setShowClientes(true)}
            onBlur={() => setTimeout(() => setShowClientes(false), 200)}
            required
          />
          {showClientes && (
            <div className="glass" style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10, maxHeight: '200px', overflowY: 'auto', borderRadius: '8px', marginTop: '4px', border: '1px solid var(--glass-border)' }}>
              {clientesFiltrados.length === 0 ? (
                <div style={{ padding: '12px', color: 'var(--text-muted)' }}>Nenhum cliente encontrado</div>
              ) : (
                clientesFiltrados.map(c => (
                  <div key={c.id} style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }} onMouseDown={() => handleClienteSelect(c)}>
                    {c.nome}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div style={{ position: 'relative' }}>
          <label style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px', color: 'var(--text-muted)' }}>
            <ShoppingBag size={18} /> Produto
          </label>
          <input 
            type="text" 
            className="input-field" 
            placeholder="Buscar produto ou código..." 
            value={buscaProduto} 
            onChange={e => {
              setBuscaProduto(e.target.value);
              setShowProdutos(true);
              if (!e.target.value) setVenda({...venda, produtoId: '', produtoNome: '', valor: 0, lucro: 0});
            }}
            onFocus={() => setShowProdutos(true)}
            onBlur={() => setTimeout(() => setShowProdutos(false), 200)}
            required
          />
          {showProdutos && (
            <div className="glass" style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10, maxHeight: '200px', overflowY: 'auto', borderRadius: '8px', marginTop: '4px', border: '1px solid var(--glass-border)' }}>
              {produtosFiltrados.length === 0 ? (
                <div style={{ padding: '12px', color: 'var(--text-muted)' }}>Nenhum produto encontrado</div>
              ) : (
                produtosFiltrados.map(p => (
                  <div key={p.id} style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }} onMouseDown={() => handleProdutoSelect(p)}>
                    {p.codigo ? `[${p.codigo}] ` : ''}{p.nome} - € {p.precoVenda?.toFixed(2)}
                  </div>
                ))
              )}
            </div>
          )}
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

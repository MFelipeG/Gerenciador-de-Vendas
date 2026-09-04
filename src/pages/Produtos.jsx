import React, { useState, useEffect } from 'react';
import { PackagePlus, Search, Edit2, Trash2, Plus, Minus } from 'lucide-react';
import toast from 'react-hot-toast';
import { toastConfirm } from '../utils/toastConfirm';
import { db } from '../firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, updateDoc } from 'firebase/firestore';

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [novoProduto, setNovoProduto] = useState({ nome: '', codigo: '', precoCusto: '', precoVenda: '', estoque: '' });
  const [lucroPadrao, setLucroPadrao] = useState(30);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const savedLucro = localStorage.getItem('lucroPadrao');
    if (savedLucro) setLucroPadrao(Number(savedLucro));

    const q = query(collection(db, 'produtos'), orderBy('nome'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProdutos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleSalvar = async (e) => {
    e.preventDefault();
    if (novoProduto.nome) {
      try {
        await addDoc(collection(db, 'produtos'), {
          nome: novoProduto.nome,
          codigo: novoProduto.codigo || '',
          precoCusto: parseFloat(novoProduto.precoCusto || 0),
          precoVenda: parseFloat(novoProduto.precoVenda || 0),
          estoque: parseInt(novoProduto.estoque || 0)
        });
        setNovoProduto({ nome: '', codigo: '', precoCusto: '', precoVenda: '', estoque: '' });
        setShowForm(false);
        toast.success('Produto adicionado!');
      } catch (error) {
        toast.error('Erro ao adicionar produto');
      }
    }
  };

  const handleExcluir = async (id) => {
    toastConfirm('Excluir este produto?', async () => {
      await deleteDoc(doc(db, 'produtos', id));
      toast.success('Produto excluído');
    });
  };

  const handleUpdateEstoque = async (id, novoEstoque) => {
    if (novoEstoque < 0) return;
    try {
      await updateDoc(doc(db, 'produtos', id), { estoque: novoEstoque });
    } catch (error) {
      toast.error('Erro ao atualizar estoque');
    }
  };

  const filteredProdutos = produtos.filter(p => {
    const term = searchTerm.toLowerCase();
    return p.nome.toLowerCase().includes(term) || (p.codigo && p.codigo.toLowerCase().includes(term));
  });

  return (
    <div className="page-container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="header-title">Produtos</h1>
          <p className="subtitle">Seu catálogo e estoque</p>
        </div>
        <button className="btn-primary" style={{ width: 'auto', padding: '10px 16px' }} onClick={() => setShowForm(!showForm)}>
          <PackagePlus size={20} />
        </button>
      </header>

      {showForm && (
        <form onSubmit={handleSalvar} className="glass" style={{ padding: '20px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3>Novo Produto</h3>
          <input 
            type="text" 
            placeholder="Nome do produto" 
            className="input-field" 
            value={novoProduto.nome} 
            onChange={(e) => setNovoProduto({...novoProduto, nome: e.target.value})} 
            required
          />
          <input 
            type="text" 
            placeholder="Código (opcional)" 
            className="input-field" 
            value={novoProduto.codigo} 
            onChange={(e) => setNovoProduto({...novoProduto, codigo: e.target.value})} 
          />
          <div style={{ display: 'flex', gap: '12px' }}>
            <input 
              type="number" 
              placeholder="Venda (€)" 
              className="input-field" 
              value={novoProduto.precoVenda} 
              onChange={(e) => {
                const venda = e.target.value;
                const custoAuto = venda ? (parseFloat(venda) * (1 - (lucroPadrao / 100))).toFixed(2) : '';
                setNovoProduto({...novoProduto, precoVenda: venda, precoCusto: custoAuto});
              }} 
              required
            />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input 
              type="number" 
              placeholder="Custo (€)" 
              className="input-field" 
              value={novoProduto.precoCusto} 
              onChange={(e) => setNovoProduto({...novoProduto, precoCusto: e.target.value})} 
              required
            />
            <input 
              type="number" 
              placeholder="Estoque Inicial" 
              className="input-field" 
              value={novoProduto.estoque} 
              onChange={(e) => setNovoProduto({...novoProduto, estoque: e.target.value})} 
            />
          </div>
          <button type="submit" className="btn-primary">Salvar Produto</button>
        </form>
      )}

      <div style={{ position: 'relative', marginBottom: '24px' }}>
        <Search size={20} style={{ position: 'absolute', left: '16px', top: '14px', color: 'var(--text-muted)' }} />
        <input 
          type="text" 
          placeholder="Buscar produto ou código..." 
          className="input-field" 
          style={{ paddingLeft: '48px' }} 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="produtos-list">
        {filteredProdutos.length === 0 && <p style={{color: 'var(--text-muted)', textAlign: 'center'}}>Nenhum produto encontrado.</p>}
        {filteredProdutos.map(produto => (
          <div key={produto.id} className="glass list-item" style={{ alignItems: 'flex-start' }}>
            <div className="avatar" style={{ background: 'var(--bg-gradient-2)', borderRadius: '12px' }}>
               <PackagePlus size={20} color="var(--magenta)"/>
            </div>
            <div className="info">
              <h4>{produto.nome} {produto.codigo && <span style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>#{produto.codigo}</span>}</h4>
              <p style={{ color: '#00e676', fontWeight: 'bold' }}>€ {produto.precoVenda?.toFixed(2)}</p>
              <p style={{ fontSize: '0.75rem', marginTop: '4px' }}>Custo: € {produto.precoCusto?.toFixed(2)} • Lucro: € {(produto.precoVenda - produto.precoCusto)?.toFixed(2)}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-end' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '8px' }}>
                <button onClick={() => handleUpdateEstoque(produto.id, produto.estoque - 1)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}><Minus size={16} /></button>
                <span style={{ fontSize: '0.9rem', width: '20px', textAlign: 'center' }}>{produto.estoque || 0}</span>
                <button onClick={() => handleUpdateEstoque(produto.id, (produto.estoque || 0) + 1)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}><Plus size={16} /></button>
              </div>
              <div style={{ display: 'flex', gap: '12px', color: 'var(--text-muted)' }}>
                <Trash2 size={18} style={{ cursor: 'pointer', color: '#ff4a5a' }} onClick={() => handleExcluir(produto.id)} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

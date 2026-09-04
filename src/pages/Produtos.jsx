import React, { useState, useEffect } from 'react';
import { PackagePlus, Search, Edit2, Trash2 } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [novoProduto, setNovoProduto] = useState({ nome: '', precoCusto: '', precoVenda: '', estoque: '' });

  useEffect(() => {
    const q = query(collection(db, 'produtos'), orderBy('nome'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProdutos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleSalvar = async (e) => {
    e.preventDefault();
    if (novoProduto.nome) {
      await addDoc(collection(db, 'produtos'), {
        nome: novoProduto.nome,
        precoCusto: parseFloat(novoProduto.precoCusto || 0),
        precoVenda: parseFloat(novoProduto.precoVenda || 0),
        estoque: parseInt(novoProduto.estoque || 0)
      });
      setNovoProduto({ nome: '', precoCusto: '', precoVenda: '', estoque: '' });
      setShowForm(false);
    }
  };

  const handleExcluir = async (id) => {
    if (window.confirm('Excluir produto?')) {
      await deleteDoc(doc(db, 'produtos', id));
    }
  };

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
            placeholder="Nome do Produto" 
            className="input-field" 
            value={novoProduto.nome} 
            onChange={(e) => setNovoProduto({...novoProduto, nome: e.target.value})} 
            required
          />
          <div style={{ display: 'flex', gap: '12px' }}>
            <input 
              type="number" 
              placeholder="Custo (R$)" 
              className="input-field" 
              value={novoProduto.precoCusto} 
              onChange={(e) => setNovoProduto({...novoProduto, precoCusto: e.target.value})} 
            />
            <input 
              type="number" 
              placeholder="Venda (R$)" 
              className="input-field" 
              value={novoProduto.precoVenda} 
              onChange={(e) => setNovoProduto({...novoProduto, precoVenda: e.target.value})} 
            />
          </div>
          <input 
            type="number" 
            placeholder="Estoque Inicial" 
            className="input-field" 
            value={novoProduto.estoque} 
            onChange={(e) => setNovoProduto({...novoProduto, estoque: e.target.value})} 
          />
          <button type="submit" className="btn-primary">Salvar Produto</button>
        </form>
      )}

      <div style={{ position: 'relative', marginBottom: '24px' }}>
        <Search size={20} style={{ position: 'absolute', left: '16px', top: '14px', color: 'var(--text-muted)' }} />
        <input type="text" placeholder="Buscar produto..." className="input-field" style={{ paddingLeft: '48px' }} />
      </div>

      <div className="produtos-list">
        {produtos.length === 0 && <p style={{color: 'var(--text-muted)', textAlign: 'center'}}>Nenhum produto cadastrado.</p>}
        {produtos.map(produto => (
          <div key={produto.id} className="glass list-item" style={{ alignItems: 'flex-start' }}>
            <div className="avatar" style={{ background: 'var(--bg-gradient-2)', borderRadius: '12px' }}>
               <PackagePlus size={20} color="var(--magenta)"/>
            </div>
            <div className="info">
              <h4>{produto.nome}</h4>
              <p style={{ color: '#00e676', fontWeight: 'bold' }}>R$ {produto.precoVenda?.toFixed(2)}</p>
              <p style={{ fontSize: '0.75rem', marginTop: '4px' }}>Custo: R$ {produto.precoCusto?.toFixed(2)} • Lucro: R$ {(produto.precoVenda - produto.precoCusto)?.toFixed(2)}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-end' }}>
              <div style={{ display: 'flex', gap: '12px', color: 'var(--text-muted)' }}>
                <Trash2 size={18} style={{ cursor: 'pointer', color: '#ff4a5a' }} onClick={() => handleExcluir(produto.id)} />
              </div>
              <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '8px' }}>Estoque: {produto.estoque}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

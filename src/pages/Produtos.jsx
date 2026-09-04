import React, { useState } from 'react';
import { PackagePlus, Search, Edit2, Trash2 } from 'lucide-react';

export default function Produtos() {
  const [produtos, setProdutos] = useState([
    { id: 1, nome: 'Lily Eau de Parfum', precoCusto: 150.00, precoVenda: 299.90, estoque: 2 },
    { id: 2, nome: 'Malbec Gold', precoCusto: 90.00, precoVenda: 189.90, estoque: 5 },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [novoProduto, setNovoProduto] = useState({ nome: '', precoCusto: '', precoVenda: '', estoque: '' });

  const handleSalvar = (e) => {
    e.preventDefault();
    if (novoProduto.nome) {
      setProdutos([...produtos, { 
        id: Date.now(), 
        ...novoProduto,
        precoCusto: parseFloat(novoProduto.precoCusto || 0),
        precoVenda: parseFloat(novoProduto.precoVenda || 0),
      }]);
      setNovoProduto({ nome: '', precoCusto: '', precoVenda: '', estoque: '' });
      setShowForm(false);
    }
  };

  const handleExcluir = (id) => {
    setProdutos(produtos.filter(p => p.id !== id));
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
          <button type="submit" className="btn-primary">Salvar Produto</button>
        </form>
      )}

      <div style={{ position: 'relative', marginBottom: '24px' }}>
        <Search size={20} style={{ position: 'absolute', left: '16px', top: '14px', color: 'var(--text-muted)' }} />
        <input type="text" placeholder="Buscar produto..." className="input-field" style={{ paddingLeft: '48px' }} />
      </div>

      <div className="produtos-list">
        {produtos.map(produto => (
          <div key={produto.id} className="glass list-item" style={{ alignItems: 'flex-start' }}>
            <div className="avatar" style={{ background: 'var(--bg-gradient-2)', borderRadius: '12px' }}>
               <PackagePlus size={20} color="var(--magenta)"/>
            </div>
            <div className="info">
              <h4>{produto.nome}</h4>
              <p style={{ color: '#00e676', fontWeight: 'bold' }}>R$ {produto.precoVenda.toFixed(2)}</p>
              <p style={{ fontSize: '0.75rem', marginTop: '4px' }}>Custo: R$ {produto.precoCusto.toFixed(2)} • Lucro: R$ {(produto.precoVenda - produto.precoCusto).toFixed(2)}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-end' }}>
              <div style={{ display: 'flex', gap: '12px', color: 'var(--text-muted)' }}>
                <Edit2 size={18} style={{ cursor: 'pointer' }} />
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

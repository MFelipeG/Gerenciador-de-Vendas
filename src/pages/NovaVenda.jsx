import React, { useState } from 'react';
import { ShoppingBag, Calendar, User } from 'lucide-react';

export default function NovaVenda() {
  const [venda, setVenda] = useState({ clienteId: '', produtoId: '', dataVenda: '', dataPagamento: '' });

  // Mock data for dropdowns
  const clientes = [
    { id: 1, nome: 'Maria Silva' },
    { id: 2, nome: 'Carla Mendes' },
  ];
  
  const produtos = [
    { id: 1, nome: 'Lily Eau de Parfum - R$ 299,90' },
    { id: 2, nome: 'Malbec Gold - R$ 189,90' },
  ];

  const handleSalvar = (e) => {
    e.preventDefault();
    alert('Venda salva com sucesso!');
    // In future: push to Firebase
  };

  return (
    <div className="page-container">
      <header style={{ marginBottom: '24px' }}>
        <h1 className="header-title">Nova Venda</h1>
        <p className="subtitle">Registre o pedido da cliente</p>
      </header>

      <form onSubmit={handleSalvar} className="glass" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <div>
          <label style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px', color: 'var(--text-muted)' }}>
            <User size={18} /> Cliente
          </label>
          <select className="input-field" required value={venda.clienteId} onChange={e => setVenda({...venda, clienteId: e.target.value})}>
            <option value="">Selecione a cliente</option>
            {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>

        <div>
          <label style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px', color: 'var(--text-muted)' }}>
            <ShoppingBag size={18} /> Produto
          </label>
          <select className="input-field" required value={venda.produtoId} onChange={e => setVenda({...venda, produtoId: e.target.value})}>
            <option value="">Selecione o produto</option>
            {produtos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
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

        <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>Finalizar Venda</button>
      </form>
    </div>
  );
}

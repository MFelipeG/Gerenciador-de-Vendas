import React, { useState } from 'react';
import { UserPlus, Search, Edit2, Trash2 } from 'lucide-react';

export default function Clientes() {
  const [clientes, setClientes] = useState([
    { id: 1, nome: 'Maria Silva', telefone: '(11) 99999-9999' },
    { id: 2, nome: 'Carla Mendes', telefone: '(11) 98888-8888' },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [novoCliente, setNovoCliente] = useState({ nome: '', telefone: '' });

  const handleSalvar = (e) => {
    e.preventDefault();
    if (novoCliente.nome) {
      setClientes([...clientes, { id: Date.now(), ...novoCliente }]);
      setNovoCliente({ nome: '', telefone: '' });
      setShowForm(false);
    }
  };

  const handleExcluir = (id) => {
    setClientes(clientes.filter(c => c.id !== id));
  };

  return (
    <div className="page-container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="header-title">Clientes</h1>
          <p className="subtitle">Gerencie sua carteira</p>
        </div>
        <button className="btn-primary" style={{ width: 'auto', padding: '10px 16px' }} onClick={() => setShowForm(!showForm)}>
          <UserPlus size={20} />
        </button>
      </header>

      {showForm && (
        <form onSubmit={handleSalvar} className="glass" style={{ padding: '20px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3>Novo Cliente</h3>
          <input 
            type="text" 
            placeholder="Nome completo" 
            className="input-field" 
            value={novoCliente.nome} 
            onChange={(e) => setNovoCliente({...novoCliente, nome: e.target.value})} 
            required
          />
          <input 
            type="tel" 
            placeholder="WhatsApp" 
            className="input-field" 
            value={novoCliente.telefone} 
            onChange={(e) => setNovoCliente({...novoCliente, telefone: e.target.value})} 
          />
          <button type="submit" className="btn-primary">Salvar Cliente</button>
        </form>
      )}

      <div style={{ position: 'relative', marginBottom: '24px' }}>
        <Search size={20} style={{ position: 'absolute', left: '16px', top: '14px', color: 'var(--text-muted)' }} />
        <input type="text" placeholder="Buscar cliente..." className="input-field" style={{ paddingLeft: '48px' }} />
      </div>

      <div className="clientes-list">
        {clientes.map(cliente => (
          <div key={cliente.id} className="glass list-item">
            <div className="avatar">{cliente.nome.charAt(0)}</div>
            <div className="info">
              <h4>{cliente.nome}</h4>
              <p>{cliente.telefone}</p>
            </div>
            <div style={{ display: 'flex', gap: '12px', color: 'var(--text-muted)' }}>
              <Edit2 size={18} style={{ cursor: 'pointer' }} />
              <Trash2 size={18} style={{ cursor: 'pointer', color: '#ff4a5a' }} onClick={() => handleExcluir(cliente.id)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

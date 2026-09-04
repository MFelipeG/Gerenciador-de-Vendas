import React, { useState, useEffect } from 'react';
import { Save, User } from 'lucide-react';

export default function Configuracoes() {
  const [nome, setNome] = useState('');

  useEffect(() => {
    const savedName = localStorage.getItem('vendedoraNome');
    if (savedName) setNome(savedName);
  }, []);

  const handleSalvar = (e) => {
    e.preventDefault();
    localStorage.setItem('vendedoraNome', nome);
    alert('Configurações salvas com sucesso!');
  };

  return (
    <div className="page-container">
      <header style={{ marginBottom: '24px' }}>
        <h1 className="header-title">Configurações</h1>
        <p className="subtitle">Ajuste as preferências do seu app</p>
      </header>

      <form onSubmit={handleSalvar} className="glass" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px', color: 'var(--text-muted)' }}>
            <User size={18} /> Seu Nome (Vendedora)
          </label>
          <input 
            type="text" 
            className="input-field" 
            placeholder="Como quer ser chamada?" 
            value={nome} 
            onChange={e => setNome(e.target.value)} 
          />
        </div>
        
        <div>
           <p style={{color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.4'}}>
             A moeda do sistema já foi configurada para Euro (€) conforme solicitado.
           </p>
        </div>

        <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>
          <Save size={20} /> Salvar Alterações
        </button>
      </form>
    </div>
  );
}

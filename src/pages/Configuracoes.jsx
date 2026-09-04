import React, { useState, useEffect } from 'react';
import { Save, User, Percent } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Configuracoes() {
  const [nome, setNome] = useState('');
  const [lucroPadrao, setLucroPadrao] = useState(30);

  useEffect(() => {
    const savedName = localStorage.getItem('vendedoraNome');
    if (savedName) setNome(savedName);
    
    const savedLucro = localStorage.getItem('lucroPadrao');
    if (savedLucro) setLucroPadrao(savedLucro);
  }, []);

  const handleSalvar = (e) => {
    e.preventDefault();
    localStorage.setItem('vendedoraNome', nome);
    localStorage.setItem('lucroPadrao', lucroPadrao);
    toast.success('Configurações salvas com sucesso!');
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
          <label style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px', color: 'var(--text-muted)' }}>
            <Percent size={18} /> Margem de Lucro Padrão (%)
          </label>
          <input 
            type="number" 
            className="input-field" 
            placeholder="Ex: 30" 
            value={lucroPadrao} 
            onChange={e => setLucroPadrao(e.target.value)} 
          />
        </div>
        
        <button type="submit" className="btn-primary" style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <Save size={20} /> Salvar Alterações
        </button>
      </form>
    </div>
  );
}

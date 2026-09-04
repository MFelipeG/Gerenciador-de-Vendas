import React, { useState, useEffect } from 'react';
import { UserPlus, Trash2, Search, MessageCircle, ShoppingBag, CheckCircle, X } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, where, getDocs, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { toastConfirm } from '../utils/toastConfirm';
import { useNavigate } from 'react-router-dom';
import '../components.css';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [novoCliente, setNovoCliente] = useState({ nome: '', telefone: '' });
  const [clienteModal, setClienteModal] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, 'clientes'), orderBy('nome'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setClientes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleSalvar = async (e) => {
    e.preventDefault();
    try {
      if (novoCliente.nome) {
        await addDoc(collection(db, 'clientes'), { ...novoCliente, dataCadastro: new Date().toISOString() });
        setNovoCliente({ nome: '', telefone: '' });
        setShowForm(false);
        toast.success('Cliente adicionado!');
      }
    } catch (error) {
      toast.error('Erro ao salvar cliente');
    }
  };

  const handleExcluir = (id) => {
    toastConfirm('Tem certeza que deseja excluir este cliente?', async () => {
      try {
        await deleteDoc(doc(db, 'clientes', id));
        toast.success('Cliente excluído');
        setClienteModal(null);
      } catch (error) {
        toast.error('Erro ao excluir cliente');
      }
    });
  };

  const handleWhatsApp = (tel) => {
    if (!tel) return toast.error('Cliente não possui telefone cadastrado.');
    const cleanTel = tel.replace(/\D/g, '');
    window.open(`https://wa.me/351${cleanTel}`, '_blank');
  };

  const handleMarcarPago = async (clienteId) => {
    try {
      const q = query(collection(db, 'vendas'), where('clienteId', '==', clienteId), where('status', '==', 'pendente'));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        toast.success('Este cliente não tem vendas pendentes de pagamento!');
        return;
      }
      
      snapshot.docs.forEach(async (d) => {
        await updateDoc(doc(db, 'vendas', d.id), { status: 'pago' });
      });
      
      toast.success('Todas as pendências deste cliente foram marcadas como pagas!');
      setClienteModal(null);
    } catch (error) {
      toast.error('Erro ao atualizar pagamentos.');
    }
  };

  return (
    <div className="page-container" style={{ position: 'relative' }}>
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
            placeholder="WhatsApp (com DDD)" 
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
        {clientes.length === 0 && <p style={{color: 'var(--text-muted)', textAlign: 'center'}}>Nenhum cliente cadastrado.</p>}
        {clientes.map(cliente => (
          <div key={cliente.id} className="glass list-item" onClick={() => setClienteModal(cliente)} style={{ cursor: 'pointer' }}>
            <div className="avatar">{cliente.nome.charAt(0).toUpperCase()}</div>
            <div className="info">
              <h4>{cliente.nome}</h4>
              <p>{cliente.telefone || 'Sem telefone'}</p>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL DE AÇÕES DO CLIENTE */}
      {clienteModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
          padding: '20px'
        }} onClick={() => setClienteModal(null)}>
          
          <div className="glass" style={{ width: '100%', maxWidth: '400px', padding: '24px', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setClienteModal(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'white' }}>
              <X size={24} />
            </button>
            
            <h2 style={{ marginBottom: '8px' }}>{clienteModal.nome}</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>{clienteModal.telefone}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button className="btn-primary" style={{ background: '#25D366' }} onClick={() => handleWhatsApp(clienteModal.telefone)}>
                <MessageCircle size={20} /> Mandar WhatsApp
              </button>
              
              <button className="btn-primary" onClick={() => navigate('/nova-venda')}>
                <ShoppingBag size={20} /> Nova Venda
              </button>
              
              <button className="btn-primary" style={{ background: 'var(--orange)' }} onClick={() => handleMarcarPago(clienteModal.id)}>
                <CheckCircle size={20} /> Quitar Pendências
              </button>

              <button className="btn-primary" style={{ background: 'transparent', border: '1px solid #ff4a5a', color: '#ff4a5a', marginTop: '16px' }} onClick={() => handleExcluir(clienteModal.id)}>
                <Trash2 size={20} /> Excluir Cliente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

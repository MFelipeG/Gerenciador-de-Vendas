import React, { useState, useEffect } from 'react';
import { UserPlus, Trash2, Search, MessageCircle, ShoppingBag, CheckCircle, X, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
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
  const [searchTerm, setSearchTerm] = useState('');
  
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
        toast('Nenhuma pendência encontrada para este cliente.');
        return;
      }

      const promises = snapshot.docs.map(vendaDoc => 
        updateDoc(doc(db, 'vendas', vendaDoc.id), { status: 'pago' })
      );
      
      await Promise.all(promises);
      toast.success('Todas as pendências foram quitadas!');
      setClienteModal(null);
    } catch (error) {
      toast.error('Erro ao quitar pendências.');
    }
  };

  const handleGerarExtrato = async (cliente) => {
    try {
      toast.loading('Gerando extrato...', { id: 'pdf-cliente' });
      const q = query(collection(db, 'vendas'), where('clienteId', '==', cliente.id), orderBy('dataVenda', 'desc'));
      const querySnapshot = await getDocs(q);
      const vendasDoCliente = querySnapshot.docs.map(d => d.data());

      if (vendasDoCliente.length === 0) {
        toast.error('Nenhuma compra encontrada para este cliente.', { id: 'pdf-cliente' });
        return;
      }

      let tGasto = 0, tPendente = 0;
      const linhasTabela = vendasDoCliente.map(v => {
        const valor = v.valor || 0;
        tGasto += valor;
        if (v.status !== 'pago') tPendente += valor;

        const dataVenda = v.dataVenda ? new Date(v.dataVenda).toLocaleDateString('pt-BR') : '';
        const dataPg = v.dataPagamento ? new Date(v.dataPagamento).toLocaleDateString('pt-BR') : '';
        
        return [
          v.produtoNome,
          `€ ${valor.toFixed(2)}`,
          dataVenda,
          dataPg,
          v.status === 'pago' ? 'Pago' : 'Pendente'
        ];
      });

      const docPdf = new jsPDF();
      const vendedoraNome = localStorage.getItem('vendedoraNome') || 'Sua Loja';
      
      docPdf.setFillColor(30, 20, 50);
      docPdf.rect(0, 0, 210, 40, 'F');
      
      docPdf.setTextColor(255, 255, 255);
      docPdf.setFontSize(22);
      docPdf.text('Extrato do Cliente', 14, 22);
      
      docPdf.setFontSize(12);
      docPdf.text(`Cliente: ${cliente.nome} | Emitido por: ${vendedoraNome}`, 14, 30);

      docPdf.setTextColor(0, 0, 0);
      docPdf.setFontSize(14);
      docPdf.text('Resumo da Conta', 14, 50);
      
      docPdf.setFontSize(11);
      docPdf.setTextColor(80, 80, 80);
      docPdf.text(`Total em Compras: € ${tGasto.toFixed(2)}`, 14, 60);
      docPdf.setTextColor(255, 74, 90);
      docPdf.text(`Valor Pendente (A Pagar): € ${tPendente.toFixed(2)}`, 14, 67);

      autoTable(docPdf, {
        startY: 75,
        head: [['Produto', 'Valor', 'Data Compra', 'Previsão Pgto', 'Status']],
        body: linhasTabela,
        headStyles: { fillColor: [232, 28, 255], textColor: [255, 255, 255] },
        styles: { fontSize: 9 },
        alternateRowStyles: { fillColor: [245, 245, 245] }
      });

      docPdf.save(`Extrato_${cliente.nome.replace(/\s+/g, '_')}.pdf`);
      toast.success('Extrato gerado com sucesso!', { id: 'pdf-cliente' });
      
    } catch (error) {
      console.error(error);
      toast.error('Erro ao gerar extrato.', { id: 'pdf-cliente' });
    }
  };

  const filteredClientes = clientes.filter(c => 
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.telefone && c.telefone.includes(searchTerm))
  );

  return (
    <motion.div 
      className="page-container" style={{ position: 'relative' }}
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}
    >
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
        <input 
          type="text" 
          placeholder="Buscar cliente..." 
          className="input-field" 
          style={{ paddingLeft: '48px' }} 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="clientes-list">
        {filteredClientes.length === 0 && <p style={{color: 'var(--text-muted)', textAlign: 'center'}}>Nenhum cliente encontrado.</p>}
        {filteredClientes.map(cliente => (
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

              <button className="btn-primary" style={{ background: 'var(--purple)' }} onClick={() => handleGerarExtrato(clienteModal)}>
                <FileText size={20} /> Gerar Extrato (PDF)
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
    </motion.div>
  );
}

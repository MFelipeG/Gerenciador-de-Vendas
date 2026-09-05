import React, { useState, useEffect } from 'react';
import { Save, User, Percent, Download, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { db, auth } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { LogOut } from 'lucide-react';
import '../components.css';

export default function Configuracoes() {
  const user = auth.currentUser;
  const [lucroPadrao, setLucroPadrao] = useState(30);

  useEffect(() => {
    const savedLucro = localStorage.getItem('lucroPadrao');
    if (savedLucro) setLucroPadrao(savedLucro);
  }, []);

  const handleSalvar = (e) => {
    e.preventDefault();
    localStorage.setItem('lucroPadrao', lucroPadrao);
    toast.success('Configurações salvas com sucesso!');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Você saiu da sua conta.');
    } catch (error) {
      toast.error('Erro ao sair da conta.');
    }
  };

  const gerarRelatorioMensal = async () => {
    try {
      toast.loading('Gerando relatório...', { id: 'pdf' });
      const querySnapshot = await getDocs(collection(db, 'vendas'));
      const todasVendas = querySnapshot.docs.map(doc => doc.data());
      
      const hoje = new Date();
      const mesAtual = hoje.getMonth();
      const anoAtual = hoje.getFullYear();
      const mesesStr = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

      const vendasDoMes = todasVendas.filter(v => {
        if (!v.dataVenda) return false;
        const dv = new Date(v.dataVenda);
        return dv.getMonth() === mesAtual && dv.getFullYear() === anoAtual;
      });

      if (vendasDoMes.length === 0) {
        toast.error('Nenhuma venda encontrada neste mês.', { id: 'pdf' });
        return;
      }

      let tLucro = 0, tGasto = 0, tFaturamento = 0;
      const linhasTabela = vendasDoMes.map(v => {
        const lucro = v.lucro || 0;
        const valor = v.valor || 0;
        const gasto = valor - lucro;
        tLucro += lucro;
        tGasto += gasto;
        tFaturamento += valor;

        const dataVenda = v.dataVenda ? new Date(v.dataVenda).toLocaleDateString('pt-BR') : '';
        const dataPg = v.dataPagamento ? new Date(v.dataPagamento).toLocaleDateString('pt-BR') : '';
        
        return [
          v.clienteNome,
          v.produtoNome,
          `€ ${valor.toFixed(2)}`,
          `€ ${lucro.toFixed(2)}`,
          dataVenda,
          dataPg,
          v.status === 'pago' ? 'Pago' : 'Pendente'
        ];
      });

      const doc = new jsPDF();
      
      doc.setFillColor(30, 20, 50); // var(--bg-dark) equivalent
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.text('Relatório de Vendas', 14, 22);
      
      doc.setFontSize(12);
      doc.text(`${mesesStr[mesAtual]} de ${anoAtual} | Vendedora: ${user?.displayName || 'Vendedora'}`, 14, 30);

      // Resumo financeiro
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.text('Resumo Financeiro', 14, 50);
      
      doc.setFontSize(11);
      doc.setTextColor(80, 80, 80);
      doc.text(`Faturamento Bruto: € ${tFaturamento.toFixed(2)}`, 14, 60);
      doc.text(`Gasto (Compras): € ${tGasto.toFixed(2)}`, 14, 67);
      doc.text(`Lucro Líquido: € ${tLucro.toFixed(2)}`, 100, 60);
      
      const margem = tFaturamento > 0 ? ((tLucro / tFaturamento) * 100).toFixed(1) : 0;
      doc.text(`Margem de Lucro: ${margem}%`, 100, 67);

      // Tabela
      autoTable(doc, {
        startY: 75,
        head: [['Cliente', 'Produto', 'Valor', 'Lucro', 'Data Compra', 'Previsão', 'Status']],
        body: linhasTabela,
        headStyles: { fillColor: [232, 28, 255], textColor: [255, 255, 255] }, // var(--magenta)
        styles: { fontSize: 9 },
        alternateRowStyles: { fillColor: [245, 245, 245] }
      });

      doc.save(`Relatorio_Vendas_${mesesStr[mesAtual]}_${anoAtual}.pdf`);
      toast.success('Relatório gerado com sucesso!', { id: 'pdf' });
      
    } catch (error) {
      console.error(error);
      toast.error('Erro ao gerar relatório.', { id: 'pdf' });
    }
  };

  return (
    <motion.div 
      className="page-container"
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}
    >
      <header style={{ marginBottom: '24px' }}>
        <h1 className="header-title">Configurações</h1>
        <p className="subtitle">Ajuste as preferências do seu app</p>
      </header>

      {user && (
        <div className="glass" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {user.photoURL ? (
              <img src={user.photoURL} alt="Perfil" referrerPolicy="no-referrer" style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid var(--magenta)' }} />
            ) : (
              <User size={32} color="var(--magenta)" />
            )}
            <div>
              <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{user.displayName}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{user.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 12px', borderRadius: '8px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <LogOut size={18} color="#ff4a5a" /> Sair
          </button>
        </div>
      )}

      <form onSubmit={handleSalvar} className="glass" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
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

      <div className="glass" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={20} color="var(--magenta)" /> Relatórios
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Gere um arquivo PDF com o balanço financeiro e a lista de vendas do mês atual.</p>
        
        <button 
          onClick={gerarRelatorioMensal}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'linear-gradient(135deg, var(--purple), var(--magenta))', border: 'none', color: 'white', padding: '14px', borderRadius: '12px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}
        >
          <Download size={20} /> Baixar Relatório do Mês
        </button>
      </div>
    </motion.div>
  );
}

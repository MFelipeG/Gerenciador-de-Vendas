import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { auth, provider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import toast from 'react-hot-toast';
import { LogIn } from 'lucide-react';
import '../components.css';

export default function Login() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, provider);
      toast.success('Login realizado com sucesso!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao fazer login com o Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
      <div className="bg-orbs" />
      
      <motion.div 
        className="glass"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{ padding: '40px 24px', textAlign: 'center', maxWidth: '400px', width: '100%', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        <div style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, var(--purple), var(--magenta))', borderRadius: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '24px', boxShadow: '0 8px 32px rgba(232, 28, 255, 0.3)' }}>
          <LogIn size={40} color="white" />
        </div>
        
        <h1 style={{ fontSize: '1.8rem', marginBottom: '8px', background: 'linear-gradient(to right, #fff, rgba(255,255,255,0.7))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Bem-vindo de volta</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '0.95rem' }}>Faça login com sua conta do Google para acessar o Gerenciador de Vendas.</p>

        <button 
          onClick={handleLogin}
          disabled={loading}
          style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', 
            background: 'white', color: '#333', border: 'none', padding: '14px', borderRadius: '12px', 
            width: '100%', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold', 
            opacity: loading ? 0.7 : 1, transition: 'all 0.2s',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '24px' }} />
          {loading ? 'Entrando...' : 'Entrar com o Google'}
        </button>
      </motion.div>
    </div>
  );
}

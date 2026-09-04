import toast from 'react-hot-toast';

export const toastConfirm = (message, onConfirm) => {
  toast((t) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <p style={{ margin: 0, color: 'white', fontSize: '0.9rem' }}>{message}</p>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button 
          onClick={() => {
            toast.dismiss(t.id);
            onConfirm();
          }}
          style={{ background: 'var(--magenta)', color: 'white', padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Confirmar
        </button>
        <button 
          onClick={() => toast.dismiss(t.id)}
          style={{ background: 'rgba(255,255,255,0.1)', color: 'white', padding: '6px 12px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', cursor: 'pointer' }}
        >
          Cancelar
        </button>
      </div>
    </div>
  ), { 
    duration: 5000, 
    style: { 
      background: 'rgba(30, 20, 50, 0.95)',
      border: '1px solid var(--magenta)',
      backdropFilter: 'blur(10px)'
    }
  });
};

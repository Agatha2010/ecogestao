import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { fazerLogin } = useAuth(); // Vamos criar isso no AuthContext

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro('');

    try {
      const data = await api.login(email, senha);
      
      if (data.mensagem === 'Login realizado com sucesso!') {
        fazerLogin(data.usuario, data.permissoes); // Salva no contexto
        navigate('/'); // Vai para o Dashboard
      } else {
        setErro(data.mensagem);
      }
    } catch (err) {
      setErro('Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)'
    }}>
      <div style={{
        background: '#fff', padding: '40px', borderRadius: '16px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{
            width: '60px', height: '60px', background: '#1e5631', color: '#fff',
            borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', margin: '0 auto 15px'
          }}>🌿</div>
          <h1 style={{ color: '#1a202c', fontSize: '1.5rem' }}>EcoGestão</h1>
          <p style={{ color: '#718096', fontSize: '0.9rem' }}>Faça login para continuar</p>
        </div>

        {erro && (
          <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '0.85rem', textAlign: 'center' }}>
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: 600, color: '#4a5568' }}>E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
              placeholder="seu@email.com"
            />
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: 600, color: '#4a5568' }}>Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
              placeholder="••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '14px', background: '#1e5631', color: '#fff',
              border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 600,
              cursor: loading ? 'wait' : 'pointer'
            }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.75rem', color: '#94a3b8' }}>
          Teste: fulano@teste.com (Visualizador) / sicrano@teste.com (Admin)<br/>
          Senha: 123456
        </div>
      </div>
    </div>
  );
}
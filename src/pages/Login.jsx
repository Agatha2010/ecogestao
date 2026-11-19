import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [loading, setLoading] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const navigate = useNavigate();
  const { fazerLogin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro('');
    setSucesso('');

    try {
      const data = await api.login(email, senha);

      // Se o backend retornar o usuário, o login deu certo
      if (data.usuario) {
        setSucesso('Login realizado com sucesso! Redirecionando...');
        
        // Espera 800ms para o usuário ver a mensagem verde
        setTimeout(() => {
          fazerLogin(data.usuario, data.permissoes || {});
          navigate('/');
        }, 800);
      } else {
        // Se não tiver usuário, mostra a mensagem de erro do backend
        setErro(data.mensagem || 'E-mail ou senha incorretos.');
      }
    } catch (err) {
      console.error(err);
      setErro('Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      overflow: 'hidden'
    }}>
      {/* ============ LADO ESQUERDO (IMAGEM/IDENTIDADE) ============ */}
      <div style={{
        flex: 1,
        background: 'linear-gradient(135deg, #1e5631 0%, #4c9a5f 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '60px',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Elementos decorativos de fundo */}
        <div style={{
          position: 'absolute', top: '-100px', right: '-100px',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)'
        }}></div>
        <div style={{
          position: 'absolute', bottom: '-80px', left: '-80px',
          width: '300px', height: '300px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)'
        }}></div>

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{
            width: '100px', height: '100px', background: 'rgba(255,255,255,0.15)',
            borderRadius: '24px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '3rem', margin: '0 auto 30px',
            backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)'
          }}>
            🌿
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '15px', letterSpacing: '-1px' }}>
            EcoGestão
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '400px', lineHeight: 1.6 }}>
            Centralize as informações da sua empresa e nunca mais perca um prazo de licença.
          </p>
        </div>

        <div style={{ position: 'absolute', bottom: '30px', fontSize: '0.8rem', opacity: 0.7 }}>
          © {new Date().getFullYear()} EcoGestão - Sistema de Gestão Ambiental
        </div>
      </div>

      {/* ============ LADO DIREITO (FORMULÁRIO) ============ */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f7f9fa',
        padding: '40px'
      }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.8rem', color: '#1a202c', fontWeight: 700, marginBottom: '8px' }}>
              Bem-vindo de volta! 👋
            </h2>
            <p style={{ color: '#718096', fontSize: '0.95rem' }}>
              Faça login para acessar o painel de gestão.
            </p>
          </div>

          {/* MENSAGEM DE ERRO */}
          {erro && (
            <div style={{
              background: '#fee2e2', color: '#991b1b', padding: '12px 16px',
              borderRadius: '10px', marginBottom: '25px', fontSize: '0.9rem',
              display: 'flex', alignItems: 'center', gap: '10px',
              border: '1px solid #fecaca'
            }}>
              <span>⚠️</span> {erro}
            </div>
          )}

          {/* MENSAGEM DE SUCESSO */}
          {sucesso && (
            <div style={{
              background: '#d4edda', color: '#155724', padding: '12px 16px',
              borderRadius: '10px', marginBottom: '25px', fontSize: '0.9rem',
              display: 'flex', alignItems: 'center', gap: '10px',
              border: '1px solid #c3e6cb'
            }}>
              <span>✅</span> {sucesso}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#4a5568' }}>
                E-mail corporativo
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
                style={{
                  width: '100%', padding: '14px 16px', borderRadius: '10px',
                  border: '1px solid #e2e8f0', fontSize: '0.95rem',
                  outline: 'none', transition: 'all 0.2s', background: '#fff',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#4c9a5f'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#4a5568' }}>
                Senha
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  placeholder="••••••••"
                  style={{
                    width: '100%', padding: '14px 16px', borderRadius: '10px',
                    border: '1px solid #e2e8f0', fontSize: '0.95rem',
                    outline: 'none', transition: 'all 0.2s', background: '#fff',
                    boxSizing: 'border-box', paddingRight: '50px'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#4c9a5f'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%',
                    transform: 'translateY(-50%)', background: 'none',
                    border: 'none', cursor: 'pointer', fontSize: '1.1rem',
                    color: '#94a3b8', padding: '5px'
                  }}
                  title={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {mostrarSenha ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '15px', background: '#1e5631', color: '#fff',
                border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: 600,
                cursor: loading ? 'wait' : 'pointer', transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(30, 86, 49, 0.2)'
              }}
              onMouseOver={(e) => e.target.style.background = '#164228'}
              onMouseOut={(e) => e.target.style.background = '#1e5631'}
            >
              {loading ? 'Entrando...' : 'Entrar no Sistema'}
            </button>
          </form>

          <div style={{ marginTop: '30px', textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8' }}>
            <p>🔒 Ambiente seguro • Dados criptografados</p>
          </div>

        </div>
      </div>
    </div>
  );
}
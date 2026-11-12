import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext'; // <-- NOVO

export default function Header({ titulo, subtitulo }) {
  const { usuarioAtual, fazerLogout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme(); // <-- NOVO
  const [menuAberto, setMenuAberto] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    fazerLogout();
    navigate('/login');
  };

  return (
    <div className="page-header">
      <div className="page-header-titles">
        <h1>{titulo}</h1>
        {subtitulo && <p className="subtitulo">{subtitulo}</p>}
      </div>

      <div className="page-header-user" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '15px' }}>
        
        {/* BOTÃO DE MODO ESCURO */}
        <button
          onClick={toggleDarkMode}
          style={{
            background: 'transparent',
            border: 'none',
            fontSize: '1.3rem',
            cursor: 'pointer',
            padding: '5px',
            display: 'flex',
            alignItems: 'center'
          }}
          title={darkMode ? 'Modo Claro' : 'Modo Escuro'}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>

        <div className="user-info">
          <div className="nome">{usuarioAtual?.nome || 'Usuário'}</div>
          <div className="cargo">{usuarioAtual?.cargo || '-'}</div>
        </div>

        <button
          onClick={() => setMenuAberto(!menuAberto)}
          className="user-avatar"
          style={{ border: 'none', cursor: 'pointer' }}
        >
          {usuarioAtual?.nome ? (
            <span style={{ fontWeight: 600, fontSize: '1rem' }}>{usuarioAtual.nome.charAt(0).toUpperCase()}</span>
          ) : (
            <Icon name="perfil" size={20} />
          )}
        </button>

        {menuAberto && (
          <div className="user-dropdown">
            <div style={{ padding: '10px', borderBottom: '1px solid #e2e8f0', marginBottom: '5px' }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{usuarioAtual?.nome}</div>
              <div style={{ fontSize: '0.75rem', color: '#718096' }}>{usuarioAtual?.email}</div>
            </div>

            <button
              onClick={() => { navigate('/perfil'); setMenuAberto(false); }}
              className="user-dropdown-item"
            >
              👤 Meu Perfil
            </button>

            <button
              onClick={handleLogout}
              style={{
                width: '100%', padding: '10px', background: '#fee2e2', color: '#b91c1c',
                border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '8px',
                fontWeight: 600, fontSize: '0.85rem', textAlign: 'left'
              }}
            >
              🚪 Sair da conta
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
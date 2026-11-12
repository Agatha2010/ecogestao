import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuarioAtual, setUsuarioAtual] = useState(null);
  const [permissoes, setPermissoes] = useState({});
  const [loading, setLoading] = useState(true);

  // Ao carregar a página, restaura a sessão salva
  useEffect(() => {
    const usuarioSalvo = localStorage.getItem('usuario_logado');
    const permissoesSalvas = localStorage.getItem('permissoes_usuario');

    if (usuarioSalvo && permissoesSalvas) {
      try {
        setUsuarioAtual(JSON.parse(usuarioSalvo));
        setPermissoes(JSON.parse(permissoesSalvas));
      } catch (e) {
        console.error('Erro ao restaurar sessão:', e);
      }
    }
    setLoading(false);
  }, []);

  // Fazer login (chamado pela tela de Login)
  const fazerLogin = (usuario, permissoesDoBanco) => {
    setUsuarioAtual(usuario);
    setPermissoes(permissoesDoBanco || {});

    localStorage.setItem('usuario_logado', JSON.stringify(usuario));
    localStorage.setItem('permissoes_usuario', JSON.stringify(permissoesDoBanco || {}));
  };

  // Fazer logout
  const fazerLogout = () => {
    setUsuarioAtual(null);
    setPermissoes({});
    localStorage.removeItem('usuario_logado');
    localStorage.removeItem('permissoes_usuario');
  };

  const pode = (funcionalidade, acao) => {
  // Verifica se o cargo (ignorando maiúsculas/minúsculas) é administrador
  if (usuarioAtual && usuarioAtual.cargo?.trim().toLowerCase() === 'administrador') {
    return true;
  }

  if (!permissoes || !permissoes[funcionalidade]) return false;
  return permissoes[funcionalidade][`pode_${acao}`];
};
  return (
    <AuthContext.Provider value={{
      usuarioAtual,
      permissoes,
      fazerLogin,
      fazerLogout,
      pode,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>');
  return ctx;
}
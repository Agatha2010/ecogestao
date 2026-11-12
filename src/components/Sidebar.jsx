import React from 'react';
import { NavLink } from 'react-router-dom';
import Icon from './Icon';
import { useAuth } from '../contexts/AuthContext';

export default function Sidebar() {
  const { usuarioAtual } = useAuth();
  const isAdmin = usuarioAtual?.cargo === 'Administrador';

  const linksBase = [
    { to: '/', label: 'Dashboard', icon: 'dashboard', end: true },
    { to: '/clientes', label: 'Clientes', icon: 'clientes' },
    { to: '/licencas', label: 'Licenças', icon: 'licencas' },
    { to: '/protocolos', label: 'Protocolos', icon: 'protocolos' },
    { to: '/oficios', label: 'Ofícios', icon: 'oficios' },
    { to: '/analises', label: 'Análises', icon: 'analises' },
    { to: '/especies', label: 'Espécies', icon: 'especies' },
    { to: '/agenda', label: 'Agenda', icon: 'agenda' },
    { to: '/financeiro', label: 'Pagamentos', icon: 'financeiro' }
  ];


  const linksAdmin = [
    { to: '/logs', label: 'Logs', icon: 'protocolos' },
    { to: '/usuarios', label: 'Usuários', icon: 'perfil' },
    { to: '/configuracoes', label: 'Configurações', icon: 'configuracoes' }
  ];

  // Junta os dois se for admin
  const links = isAdmin ? [...linksBase, ...linksAdmin] : linksBase;

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Icon name="especies" size={22} />
        </div>
        <div>
          <h2>EcoGestão</h2>
          <span className="subtitulo">Gestão ambiental</span>
        </div>
      </div>
      <nav>
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            <span className="icon">
              <Icon name={link.icon} size={18} />
            </span>
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
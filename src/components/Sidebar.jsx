import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  const links = [
    { to: '/', label: 'Dashboard', icon: '📊', end: true },
    { to: '/clientes', label: 'Clientes', icon: '👥' },
    { to: '/licencas', label: 'Licenças', icon: '📜' },
    { to: '/protocolos', label: 'Protocolos', icon: '📋' },
    { to: '/oficios', label: 'Ofícios', icon: '📄' },
    { to: '/analises', label: 'Análises', icon: '🔬' },
    { to: '/especies', label: 'Espécies', icon: '🌱' },
    { to: '/agenda', label: 'Agenda', icon: '📅' },
    { to: '/financeiro', label: 'Pagamentos', icon: '💰' },
    { to: '/configuracoes', label: 'Configurações', icon: '⚙️' }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">🌿</div>
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
            <span className="icon">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
import React from 'react';

export default function Header({ titulo, subtitulo }) {
  return (
    <div className="page-header">
      <div className="page-header-titles">
        <h1>{titulo}</h1>
        {subtitulo && <p className="subtitulo">{subtitulo}</p>}
      </div>

      <div className="page-header-user">
        <div className="user-info">
          <div className="nome">Administrador</div>
          <div className="cargo">Gestor</div>
        </div>
        <div className="user-avatar">A</div>
      </div>
    </div>
  );
}
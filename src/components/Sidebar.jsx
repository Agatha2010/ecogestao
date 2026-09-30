import React from "react";
const itens = [
  { nome: "Visão geral", simbolo: "📜" },
  { nome: "Clientes", simbolo: "👥" },
  { nome: "Licenças", simbolo: "📄" },
  { nome: "Protocolos", simbolo: "📑" },
  { nome: "Agenda", simbolo: "📅" },
  { nome: "Financeiro", simbolo: "💰" },
  { nome: "Espécies vegetais", simbolo: "🌱" },
  { nome: "Análises", simbolo: "🔬" },
  { nome: "Ofícios", simbolo: "📮" },
];

const preferencias = [
  { nome: "Meu perfil", simbolo: "👤" },
  { nome: "Configurações", simbolo: "⚙️" },
];

export default function Sidebar({ pagina, setPagina }) {
  function selecionar(nome) {
    const destino = nome === "Visão geral" ? "Dashboard" :
      nome === "Agenda" ? "Agenda Ambiental" : nome;
    setPagina(destino);
  }

  function ativo(nome) {
    if (nome === "Visão geral") return pagina === "Dashboard";
    if (nome === "Agenda") return pagina === "Agenda Ambiental";
    return pagina === nome;
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">♧</div>
        <div>
          <strong>ecogestão</strong>
          <small>GESTÃO AMBIENTAL</small>
        </div>
      </div>

      <button
        className="workspace-card"
        type="button"
        onClick={() => selecionar("Visão geral")}
      >
        <span className="workspace-icon">EC</span>
        <span className="workspace-text">
          <strong>Eco Consultoria</strong>
          <small>Espaço de trabalho</small>
        </span>
        <span className="workspace-arrow">›</span>
      </button>

      <div className="sidebar-heading">MENU PRINCIPAL</div>

      <nav className="sidebar-nav">
        {itens.map((item) => (
          <button
            key={item.nome}
            type="button"
            className={`sidebar-link ${ativo(item.nome) ? "active" : ""}`}
            onClick={() => selecionar(item.nome)}
          >
            <span className="sidebar-symbol">{item.simbolo}</span>
            <span>{item.nome}</span>
            {ativo(item.nome) && <span className="active-dot" />}
          </button>
        ))}
      </nav>

      <div className="sidebar-heading preferences-heading">
        PREFERÊNCIAS
      </div>

      <nav className="sidebar-nav">
        {preferencias.map((item) => (
          <button
            key={item.nome}
            type="button"
            className={`sidebar-link ${pagina === item.nome ? "active" : ""}`}
            onClick={() => selecionar(item.nome)}
          >
            <span className="sidebar-symbol">{item.simbolo}</span>
            <span>{item.nome}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
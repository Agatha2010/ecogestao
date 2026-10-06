
import React from "react";
import { FileText, BarChart3, Settings, Leaf } from "lucide-react";

const conteudo = {
  Relatórios: {
    texto: "Consulte os dados e acompanhe a evolução das atividades ambientais.",
    Icon: BarChart3,
    cards: ["Relatório de clientes", "Licenças e vencimentos", "Agenda e atividades"],
  },
  Documentos: {
    texto: "Centralize documentos, arquivos e ofícios relacionados aos processos.",
    Icon: FileText,
    cards: ["Documentos ambientais", "Ofícios", "Arquivos de processos"],
  },
  Configurações: {
    texto: "Gerencie as preferências e informações gerais do EcoGestão.",
    Icon: Settings,
    cards: ["Dados do sistema", "Preferências", "Acesso e segurança"],
  },
};

export default function Simple({ name = "Página" }) {
  const pagina = conteudo[name] || {
    texto: "Acompanhe e organize as informações deste módulo.",
    Icon: Leaf,
    cards: ["Visão geral", "Registros", "Acompanhamento"],
  };
  const Icon = pagina.Icon;

  return (
    <section className="simple-page">
      <div className="welcome">
        <div>
          <div className="eyebrow"><span /> ECogestão · MÓDULO</div>
          <h1>{name}</h1>
          <p>{pagina.texto}</p>
        </div>
        <div className="simple-icon"><Icon size={30} /></div>
      </div>

      <div className="simple-grid">
        {pagina.cards.map((titulo, i) => (
          <article className="panel simple-card" key={titulo}>
            <div className="record-icon"><Icon size={20} /></div>
            <h2>{titulo}</h2>
            <p>
              {name === "Relatórios"
                ? "Área preparada para consultas e indicadores."
                : name === "Documentos"
                ? "Área preparada para organizar e consultar arquivos."
                : "Área preparada para personalizar o sistema."}
            </p>
            <span className="muted">Etapa {i + 1}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
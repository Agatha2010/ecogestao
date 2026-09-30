
import React, { useEffect, useState } from "react";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import RegistroForm from "./components/RegistroForm";

import Dashboard from "./pages/Dashboard";
import Listing from "./pages/Listing";
import Simple from "./pages/Simple";

import initialData from "./data/initialData";

import "./styles/global.css";

const CHAVE_DADOS = "eco-data";

function obterDadosIniciais() {
  return Array.isArray(initialData) ? initialData : [];
}

function carregarDados() {
  try {
    const salvos = localStorage.getItem(CHAVE_DADOS);

    if (!salvos) {
      return obterDadosIniciais();
    }

    const convertidos = JSON.parse(salvos);

    // Formato esperado: uma lista de registros.
    if (Array.isArray(convertidos)) {
      return convertidos;
    }

    // Se os dados antigos estiverem dentro de uma propriedade,
    // tenta recuperar uma lista conhecida.
    if (convertidos && typeof convertidos === "object") {
      const possiveisListas = [
        convertidos.dados,
        convertidos.registros,
        convertidos.clientes,
        convertidos.items,
      ];

      const listaEncontrada = possiveisListas.find(
        (valor) => Array.isArray(valor)
      );

      if (listaEncontrada) {
        return listaEncontrada;
      }
    }

    console.warn(
      "Os dados antigos têm um formato diferente. Usando dados iniciais."
    );

    return obterDadosIniciais();
  } catch (erro) {
    console.error("Erro ao carregar dados:", erro);
    return obterDadosIniciais();
  }
}

export default function App() {
  const [pagina, setPagina] = useState("Dashboard");
  const [dados, setDados] = useState(carregarDados);

  const [busca, setBusca] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [registroEditando, setRegistroEditando] = useState(null);

  const secoes = [
    "Clientes",
    "Licenças",
    "Agenda Ambiental",
    "Relatórios",
    "Documentos",
  ];

  useEffect(() => {
    try {
      localStorage.setItem(CHAVE_DADOS, JSON.stringify(dados));
    } catch (erro) {
      console.error("Erro ao salvar dados:", erro);
    }
  }, [dados]);

  function abrirCadastro() {
    setRegistroEditando(null);
    setModalAberto(true);
  }

  function abrirEdicao(registro) {
    setRegistroEditando(registro);
    setModalAberto(true);
  }

  function salvarRegistro(registro) {
    if (registroEditando) {
      setDados((atuais) =>
        atuais.map((item) =>
          item.id === registroEditando.id
            ? {
                ...registro,
                id: registroEditando.id,
              }
            : item
        )
      );
    } else {
      const novoRegistro = {
        ...registro,
        id: `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`,
      };

      setDados((atuais) => [
        ...atuais,
        novoRegistro,
      ]);
    }

    setModalAberto(false);
    setRegistroEditando(null);
  }

  function excluirRegistro(id) {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir este registro?"
    );

    if (!confirmar) return;

    setDados((atuais) =>
      atuais.filter((item) => item.id !== id)
    );
  }

  const dadosDaPagina = dados.filter(
    (item) => item.categoria === pagina
  );

  function mudarPagina(novaPagina) {
    setPagina(novaPagina);
    setBusca("");
    setModalAberto(false);
    setRegistroEditando(null);
  }

  function renderizarPagina() {
    if (pagina === "Dashboard") {
      return (
        <Dashboard
          data={dados}
          add={abrirCadastro}
          setPagina={mudarPagina}
        />
      );
    }

    if (secoes.includes(pagina)) {
      return (
        <Listing
          name={pagina}
          data={dadosDaPagina}
          add={abrirCadastro}
          edit={abrirEdicao}
          remove={excluirRegistro}
          query={busca}
          setQuery={setBusca}
        />
      );
    }

    return <Simple name={pagina} />;
  }

  return (
    <div className="app-container">
      <Sidebar
        pagina={pagina}
        setPagina={mudarPagina}
      />

      <div className="app-content">
        <Header pagina={pagina} />

        <main className="main-content">
          {renderizarPagina()}
        </main>
      </div>

      {modalAberto && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setModalAberto(false);
              setRegistroEditando(null);
            }
          }}
        >
          <div
            className="modal-content"
            role="dialog"
            aria-modal="true"
            aria-label="Formulário de cadastro"
          >
            <RegistroForm
              name={pagina}
              initialData={registroEditando}
              onSave={salvarRegistro}
              onCancel={() => {
                setModalAberto(false);
                setRegistroEditando(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
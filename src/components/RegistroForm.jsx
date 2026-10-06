
import React, { useEffect, useState } from "react";

const vazio = {
  nome: "",
  tipo: "Pessoa Física",
  documento: "",
  responsavel: "",
  telefone: "",
  email: "",
  endereco: "",
  cidade: "",
  estado: "",
  observacoes: "",
  tipoRegistro: "",
  numero: "",
  cliente: "",
  orgao: "",
  emissao: "",
  vencimento: "",
  data: "",
  horario: "",
  local: "",
  descricao: "",
  status: "Ativo",
  sub: "",
};

export default function RegistroForm({
  name,
  initialData,
  onSave,
  onCancel,
}) {
  const isCliente = name === "Clientes";
  const isLicenca = name === "Licenças";
  const isAgenda = name === "Agenda Ambiental";

  const [form, setForm] = useState({ ...vazio });
  const [erros, setErros] = useState({});
  const [salvando, setSalvando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState("");

  useEffect(() => {
    if (initialData) {
      setForm({
        ...vazio,
        ...initialData,
        nome: initialData.nome || initialData.titulo || "",
        documento:
          initialData.documento || initialData.cpf_cnpj || "",
        data:
          initialData.data || initialData.data_evento || "",
        horario:
          initialData.horario || initialData.hora_inicio || "",
        emissao:
          initialData.emissao || initialData.data_emissao || "",
        vencimento:
          initialData.vencimento || initialData.data_validade || "",
      });
    } else {
      setForm({
        ...vazio,
        status: isCliente ? "Ativo" : "Pendente",
      });
    }

    setErros({});
    setErroEnvio("");
  }, [initialData, name, isCliente]);

  function atualizar(campo, valor) {
    setForm((atual) => ({
      ...atual,
      [campo]: valor,
    }));

    setErros((atuais) => ({
      ...atuais,
      [campo]: "",
    }));

    setErroEnvio("");
  }

  function campo(rotulo, chave, props = {}) {
    const id = `campo-${chave}`;
    const { className = "", ...inputProps } = props;

    return (
      <label className="form-field" htmlFor={id}>
        <span>{rotulo}</span>
        <input
          id={id}
          name={chave}
          value={form[chave] ?? ""}
          onChange={(e) => atualizar(chave, e.target.value)}
          aria-invalid={Boolean(erros[chave])}
          aria-describedby={erros[chave] ? `${id}-erro` : undefined}
          className={`${className} ${erros[chave] ? "campo-invalido" : ""}`}
          {...inputProps}
        />
        {erros[chave] && (
          <small className="mensagem-erro" id={`${id}-erro`}>
            {erros[chave]}
          </small>
        )}
      </label>
    );
  }

  function areaTexto(rotulo, chave, linhas = 3) {
    const id = `campo-${chave}`;

    return (
      <label className="form-field" htmlFor={id}>
        <span>{rotulo}</span>
        <textarea
          id={id}
          name={chave}
          value={form[chave] ?? ""}
          onChange={(e) => atualizar(chave, e.target.value)}
          rows={linhas}
          aria-invalid={Boolean(erros[chave])}
          aria-describedby={erros[chave] ? `${id}-erro` : undefined}
          className={erros[chave] ? "campo-invalido" : ""}
        />
        {erros[chave] && (
          <small className="mensagem-erro" id={`${id}-erro`}>
            {erros[chave]}
          </small>
        )}
      </label>
    );
  }

  function campoSelect(rotulo, chave, opcoes) {
    const id = `campo-${chave}`;

    return (
      <label className="form-field" htmlFor={id}>
        <span>{rotulo}</span>
        <select
          id={id}
          name={chave}
          value={form[chave] ?? ""}
          onChange={(e) => atualizar(chave, e.target.value)}
          aria-invalid={Boolean(erros[chave])}
        >
          {opcoes.map((opcao) => (
            <option key={opcao.value} value={opcao.value}>
              {opcao.label}
            </option>
          ))}
        </select>
        {erros[chave] && (
          <small className="mensagem-erro">{erros[chave]}</small>
        )}
      </label>
    );
  }

  function validar() {
    const novosErros = {};

    if (!form.nome.trim()) {
      novosErros.nome = isAgenda
        ? "Informe o título do compromisso."
        : "Informe o nome.";
    }

    if (isAgenda) {
      if (!form.data) {
        novosErros.data = "Informe a data.";
      }

      if (!form.horario) {
        novosErros.horario = "Informe o horário.";
      }
    }

    if (isLicenca) {
      if (
        form.emissao &&
        form.vencimento &&
        form.vencimento < form.emissao
      ) {
        novosErros.vencimento =
          "O vencimento não pode ser anterior à emissão.";
      }
    }

    if (form.email.trim()) {
      const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        form.email.trim()
      );

      if (!emailValido) {
        novosErros.email = "Digite um e-mail válido.";
      }
    }

    if (form.estado.trim() && form.estado.trim().length !== 2) {
      novosErros.estado = "Informe a UF com 2 letras.";
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErroEnvio("");

    if (!validar()) {
      return;
    }

    const payload = {
      ...form,
      nome: form.nome.trim(),
      categoria: name,
      documento: form.documento.trim(),
      email: form.email.trim(),
      estado: form.estado.trim().toUpperCase(),
      sub: isAgenda
        ? form.descricao
        : isLicenca
        ? `${form.tipoRegistro} ${form.numero}`.trim()
        : form.sub,
    };

    try {
      setSalvando(true);
      await onSave(payload);
    } catch (erro) {
      setErroEnvio(
        erro?.message ||
          "Não foi possível salvar. Verifique sua conexão e tente novamente."
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form className="registro-form" onSubmit={handleSubmit} noValidate>
      <div className="form-header">
        <div>
          <span className="form-eyebrow">
            {initialData ? "ATUALIZAÇÃO" : "NOVO REGISTRO"}
          </span>
          <h2>
            {initialData ? "Editar cadastro" : "Novo cadastro"}
          </h2>
          <p>{name}</p>
        </div>

        <button
          type="button"
          className="form-fechar"
          onClick={onCancel}
          aria-label="Fechar formulário"
          disabled={salvando}
        >
          ×
        </button>
      </div>

      {isCliente && (
        <>
          <div className="form-section">
            <h3>Dados do cliente</h3>
            <div className="form-grid">
              {campo("Nome do cliente *", "nome", {
                required: true,
                placeholder: "Nome completo ou razão social",
                className: "campo-largo",
              })}

              {campoSelect("Tipo de pessoa", "tipo", [
                { value: "Pessoa Física", label: "Pessoa Física" },
                { value: "Pessoa Jurídica", label: "Pessoa Jurídica" },
              ])}

              {campo("CPF/CNPJ", "documento", {
                placeholder: "Digite o documento",
              })}

              {campo("Responsável", "responsavel", {
                placeholder: "Nome do responsável",
              })}
            </div>
          </div>

          <div className="form-section">
            <h3>Contato</h3>
            <div className="form-grid">
              {campo("Telefone", "telefone", {
                type: "tel",
                placeholder: "(00) 00000-0000",
              })}

              {campo("E-mail", "email", {
                type: "email",
                placeholder: "email@exemplo.com",
              })}

              {campo("Endereço", "endereco", {
                placeholder: "Rua, número e complemento",
                className: "campo-largo",
              })}

              {campo("Cidade", "cidade", {
                placeholder: "Cidade",
              })}

              {campo("Estado (UF)", "estado", {
                maxLength: 2,
                placeholder: "UF",
              })}
            </div>
          </div>

          <div className="form-section">
            <h3>Informações adicionais</h3>
            {areaTexto("Observações", "observacoes")}
            {campoSelect("Status", "status", [
              { value: "Ativo", label: "Ativo" },
              { value: "Inativo", label: "Inativo" },
            ])}
          </div>
        </>
      )}

      {isLicenca && (
        <>
          <div className="form-section">
            <h3>Identificação da licença</h3>
            <div className="form-grid">
              {campo("Nome da licença *", "nome", {
                required: true,
                placeholder: "Ex.: Licença de operação",
                className: "campo-largo",
              })}

              {campoSelect("Tipo", "tipoRegistro", [
                { value: "", label: "Selecione" },
                { value: "LP", label: "Licença Prévia (LP)" },
                { value: "LI", label: "Licença de Instalação (LI)" },
                { value: "LO", label: "Licença de Operação (LO)" },
                { value: "Autorização", label: "Autorização" },
                { value: "Outro", label: "Outro" },
              ])}

              {campo("Número", "numero", {
                placeholder: "Número do documento",
              })}

              {campo("Cliente", "cliente", {
                placeholder: "Nome do cliente",
              })}

              {campo("Órgão ambiental", "orgao", {
                placeholder: "Ex.: IBAMA",
                className: "campo-largo",
              })}
            </div>
          </div>

          <div className="form-section">
            <h3>Prazos e situação</h3>
            <div className="form-grid">
              {campo("Data de emissão", "emissao", {
                type: "date",
              })}

              {campo("Data de vencimento", "vencimento", {
                type: "date",
              })}
            </div>

            {campoSelect("Status", "status", [
              { value: "Pendente", label: "Pendente" },
              { value: "Em análise", label: "Em análise" },
              { value: "Aprovada", label: "Aprovada" },
              { value: "Vencida", label: "Vencida" },
            ])}
          </div>
        </>
      )}

      {isAgenda && (
        <>
          <div className="form-section">
            <h3>Dados do compromisso</h3>
            <div className="form-grid">
              {campo("Título do compromisso *", "nome", {
                required: true,
                placeholder: "Ex.: Vistoria ambiental",
                className: "campo-largo",
              })}

              {campoSelect("Tipo", "tipo", [
                { value: "", label: "Selecione" },
                ...[
                  "Reunião",
                  "Vistoria",
                  "Auditoria",
                  "Entrega de documento",
                  "Prazo ambiental",
                  "Outro",
                ].map((v) => ({ value: v, label: v })),
              ])}

              {campo("Data *", "data", {
                type: "date",
                required: true,
              })}

              {campo("Horário *", "horario", {
                type: "time",
                required: true,
              })}

              {campo("Local", "local", {
                placeholder: "Endereço ou local",
                className: "campo-largo",
              })}

              {campo("Responsável", "responsavel", {
                placeholder: "Pessoa responsável",
              })}
            </div>
          </div>

          <div className="form-section">
            <h3>Detalhes</h3>
            {areaTexto("Descrição", "descricao")}
            {campoSelect("Status", "status", [
              { value: "Pendente", label: "Pendente" },
              { value: "Confirmado", label: "Confirmado" },
              { value: "Concluído", label: "Concluído" },
              { value: "Cancelado", label: "Cancelado" },
            ])}
          </div>
        </>
      )}

      {!isCliente && !isLicenca && !isAgenda && (
        <div className="form-section">
          <h3>Informações do registro</h3>
          {campo("Nome *", "nome", {
            required: true,
            placeholder: "Digite o nome",
          })}

          {areaTexto("Descrição", "sub")}

          {campoSelect("Status", "status", [
            { value: "Pendente", label: "Pendente" },
            { value: "Ativo", label: "Ativo" },
            { value: "Concluído", label: "Concluído" },
          ])}
        </div>
      )}

      {erroEnvio && (
        <div className="form-alerta" role="alert">
          {erroEnvio}
        </div>
      )}

      <div className="form-actions">
        <button
          type="button"
          className="btn-cancelar"
          onClick={onCancel}
          disabled={salvando}
        >
          Cancelar
        </button>

        <button
          type="submit"
          className="btn-salvar"
          disabled={salvando}
        >
          {salvando
            ? "Salvando..."
            : initialData
            ? "Salvar alterações"
            : "Cadastrar"}
        </button>
      </div>
    </form>
  );
}
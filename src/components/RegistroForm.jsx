
import { useEffect, useState } from "react";

export default function RegistroForm({
  name,
  initialData,
  onSave,
  onCancel,
}) {
  const isCliente = name === "Clientes";
  const isLicenca = name === "Licenças";
  const isAgenda =
    name === "Agenda Ambiental" || name === "Agenda";

  const [form, setForm] = useState({
    nome: "",
    documento: "",
    responsavel: "",
    telefone: "",
    email: "",
    endereco: "",
    tipo: "",
    numero: "",
    cliente: "",
    orgao: "",
    emissao: "",
    vencimento: "",
    data: "",
    horario: "",
    local: "",
    descricao: "",
    status: "Pendente",
    sub: "",
  });

  useEffect(() => {
    if (initialData) {
      setForm((atual) => ({
        ...atual,
        ...initialData,
      }));
    } else {
      setForm({
        nome: "",
        documento: "",
        responsavel: "",
        telefone: "",
        email: "",
        endereco: "",
        tipo: "",
        numero: "",
        cliente: "",
        orgao: "",
        emissao: "",
        vencimento: "",
        data: "",
        horario: "",
        local: "",
        descricao: "",
        status: "Pendente",
        sub: "",
      });
    }
  }, [initialData]);

  function atualizar(campo, valor) {
    setForm((atual) => ({
      ...atual,
      [campo]: valor,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (isAgenda) {
      if (!form.nome.trim()) {
        alert("Informe o título do compromisso.");
        return;
      }

      if (!form.data) {
        alert("Informe a data do compromisso.");
        return;
      }

      if (!form.horario) {
        alert("Informe o horário.");
        return;
      }
    }

    if (isCliente && !form.nome.trim()) {
      alert("Informe o nome do cliente.");
      return;
    }

    if (isLicenca && !form.nome.trim()) {
      alert("Informe o nome da licença.");
      return;
    }

    if (isLicenca && form.emissao && form.vencimento) {
      if (form.vencimento < form.emissao) {
        alert("O vencimento não pode ser anterior à emissão.");
        return;
      }
    }

    const registro = {
      ...form,
      nome: form.nome.trim(),
      sub: isAgenda
        ? form.descricao
        : isLicenca
        ? `${form.tipo} ${form.numero}`.trim()
        : form.sub,
      categoria: isAgenda
        ? "Agenda Ambiental"
        : isLicenca
        ? "Licenças"
        : isCliente
        ? "Clientes"
        : name,
    };

    onSave(registro);
  }

  return (
    <form className="registro-form" onSubmit={handleSubmit}>
      <h2>
        {initialData ? "Editar" : "Novo cadastro"} - {name}
      </h2>

      {isAgenda ? (
        <>
          <label>Título do compromisso *</label>
          <input
            value={form.nome}
            onChange={(e) => atualizar("nome", e.target.value)}
            placeholder="Ex.: Vistoria ambiental"
            required
          />

          <label>Tipo de compromisso</label>
          <select
            value={form.tipo}
            onChange={(e) => atualizar("tipo", e.target.value)}
          >
            <option value="">Selecione</option>
            <option value="Reunião">Reunião</option>
            <option value="Vistoria">Vistoria</option>
            <option value="Auditoria">Auditoria</option>
            <option value="Entrega de documento">
              Entrega de documento
            </option>
            <option value="Prazo ambiental">Prazo ambiental</option>
            <option value="Outro">Outro</option>
          </select>

          <div className="form-grid">
            <div>
              <label>Data *</label>
              <input
                type="date"
                value={form.data}
                onChange={(e) => atualizar("data", e.target.value)}
                required
              />
            </div>

            <div>
              <label>Horário *</label>
              <input
                type="time"
                value={form.horario}
                onChange={(e) => atualizar("horario", e.target.value)}
                required
              />
            </div>
          </div>

          <label>Local</label>
          <input
            value={form.local}
            onChange={(e) => atualizar("local", e.target.value)}
            placeholder="Endereço ou local do compromisso"
          />

          <label>Responsável</label>
          <input
            value={form.responsavel}
            onChange={(e) =>
              atualizar("responsavel", e.target.value)
            }
            placeholder="Nome do responsável"
          />

          <label>Descrição</label>
          <textarea
            value={form.descricao}
            onChange={(e) =>
              atualizar("descricao", e.target.value)
            }
            placeholder="Detalhes do compromisso..."
            rows="4"
          />

          <label>Status</label>
          <select
            value={form.status}
            onChange={(e) => atualizar("status", e.target.value)}
          >
            <option value="Pendente">Pendente</option>
            <option value="Confirmado">Confirmado</option>
            <option value="Concluído">Concluído</option>
            <option value="Cancelado">Cancelado</option>
          </select>
        </>
      ) : isCliente ? (
        <>
          <label>Nome do cliente *</label>
          <input
            value={form.nome}
            onChange={(e) => atualizar("nome", e.target.value)}
            required
          />

          <label>CNPJ / CPF</label>
          <input
            value={form.documento}
            onChange={(e) =>
              atualizar("documento", e.target.value)
            }
          />

          <label>Responsável</label>
          <input
            value={form.responsavel}
            onChange={(e) =>
              atualizar("responsavel", e.target.value)
            }
          />

          <label>Telefone</label>
          <input
            value={form.telefone}
            onChange={(e) =>
              atualizar("telefone", e.target.value)
            }
          />

          <label>E-mail</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => atualizar("email", e.target.value)}
          />

          <label>Endereço</label>
          <input
            value={form.endereco}
            onChange={(e) =>
              atualizar("endereco", e.target.value)
            }
          />

          <label>Status</label>
          <select
            value={form.status}
            onChange={(e) => atualizar("status", e.target.value)}
          >
            <option value="Ativo">Ativo</option>
            <option value="Inativo">Inativo</option>
          </select>
        </>
      ) : isLicenca ? (
        <>
          <label>Nome da licença *</label>
          <input
            value={form.nome}
            onChange={(e) => atualizar("nome", e.target.value)}
            placeholder="Ex.: Licença de Operação"
            required
          />

          <label>Tipo</label>
          <select
            value={form.tipo}
            onChange={(e) => atualizar("tipo", e.target.value)}
          >
            <option value="">Selecione</option>
            <option value="LP">Licença Prévia (LP)</option>
            <option value="LI">Licença de Instalação (LI)</option>
            <option value="LO">Licença de Operação (LO)</option>
            <option value="Autorização">Autorização</option>
            <option value="Outro">Outro</option>
          </select>

          <label>Número</label>
          <input
            value={form.numero}
            onChange={(e) => atualizar("numero", e.target.value)}
          />

          <label>Cliente</label>
          <input
            value={form.cliente}
            onChange={(e) => atualizar("cliente", e.target.value)}
            placeholder="Nome do cliente"
          />

          <label>Órgão ambiental</label>
          <input
            value={form.orgao}
            onChange={(e) => atualizar("orgao", e.target.value)}
          />

          <div className="form-grid">
            <div>
              <label>Emissão</label>
              <input
                type="date"
                value={form.emissao}
                onChange={(e) =>
                  atualizar("emissao", e.target.value)
                }
              />
            </div>

            <div>
              <label>Vencimento</label>
              <input
                type="date"
                value={form.vencimento}
                onChange={(e) =>
                  atualizar("vencimento", e.target.value)
                }
              />
            </div>
          </div>

          <label>Status</label>
          <select
            value={form.status}
            onChange={(e) => atualizar("status", e.target.value)}
          >
            <option value="Pendente">Pendente</option>
            <option value="Em análise">Em análise</option>
            <option value="Aprovada">Aprovada</option>
            <option value="Vencida">Vencida</option>
          </select>
        </>
      ) : (
        <>
          <label>Nome *</label>
          <input
            value={form.nome}
            onChange={(e) => atualizar("nome", e.target.value)}
            required
          />

          <label>Descrição</label>
          <textarea
            value={form.sub}
            onChange={(e) => atualizar("sub", e.target.value)}
            rows="3"
          />

          <label>Status</label>
          <select
            value={form.status}
            onChange={(e) => atualizar("status", e.target.value)}
          >
            <option value="Pendente">Pendente</option>
            <option value="Ativo">Ativo</option>
            <option value="Concluído">Concluído</option>
          </select>
        </>
      )}

      <div className="form-actions">
        <button type="submit">
          {initialData ? "Salvar alterações" : "Cadastrar"}
        </button>

        <button type="button" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
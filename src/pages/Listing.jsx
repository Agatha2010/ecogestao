
function formatDate(date) {
  if (!date) return "Não informada";
  const partes = date.split("-");
  if (partes.length !== 3) return date;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

export default function Listing({
  name,
  data = [],
  add,
  edit,
  remove,
  query = "",
  setQuery,
}) {
  const isAgenda =
    name === "Agenda Ambiental" || name === "Agenda";
  const isLicenca = name === "Licenças";

  const filtrados = data.filter((item) => {
    const texto = query.toLowerCase();

    return [
      item.nome,
      item.sub,
      item.status,
      item.tipo,
      item.numero,
      item.cliente,
      item.orgao,
      item.local,
      item.responsavel,
      item.descricao,
    ]
      .filter(Boolean)
      .some((valor) =>
        String(valor).toLowerCase().includes(texto)
      );
  });

  const ordenarAgenda = isAgenda
    ? [...filtrados].sort((a, b) => {
        const dataA = `${a.data || ""} ${a.horario || ""}`;
        const dataB = `${b.data || ""} ${b.horario || ""}`;
        return dataA.localeCompare(dataB);
      })
    : filtrados;

  return (
    <section className="listing-page">
      <div className="listing-header">
        <div>
          <h1>{name}</h1>
          <p>
            {isAgenda
              ? "Organize seus compromissos e prazos ambientais."
              : `Gerencie os registros de ${name.toLowerCase()}.`}
          </p>
        </div>

        <button onClick={add}>
          + Novo cadastro
        </button>
      </div>

      <input
        className="listing-search"
        value={query}
        onChange={(e) => setQuery?.(e.target.value)}
        placeholder="Buscar registro..."
      />

      {ordenarAgenda.length === 0 ? (
        <div className="empty-state">
          <h3>Nenhum registro encontrado</h3>
          <p>
            {query
              ? "Tente buscar por outro termo."
              : "Clique em Novo cadastro para adicionar o primeiro registro."}
          </p>
        </div>
      ) : (
        <div className="records-list">
          {ordenarAgenda.map((item) => (
            <article className="record-card" key={item.id}>
              <div className="record-main">
                <div className="record-title">
                  <h3>{item.nome}</h3>
                  <span className="status-badge">
                    {item.status || "Pendente"}
                  </span>
                </div>

                {isAgenda ? (
                  <div className="agenda-details">
                    <p>
                      <strong>Tipo:</strong>{" "}
                      {item.tipo || "Não informado"}
                    </p>
                    <p>
                      <strong>Data:</strong>{" "}
                      {formatDate(item.data)}
                    </p>
                    <p>
                      <strong>Horário:</strong>{" "}
                      {item.horario || "Não informado"}
                    </p>
                    <p>
                      <strong>Local:</strong>{" "}
                      {item.local || "Não informado"}
                    </p>
                    <p>
                      <strong>Responsável:</strong>{" "}
                      {item.responsavel || "Não informado"}
                    </p>
                    {item.descricao && (
                      <p>
                        <strong>Descrição:</strong>{" "}
                        {item.descricao}
                      </p>
                    )}
                  </div>
                ) : isLicenca ? (
                  <div className="license-details">
                    <p>
                      <strong>Tipo:</strong>{" "}
                      {item.tipo || "Não informado"}
                    </p>
                    <p>
                      <strong>Número:</strong>{" "}
                      {item.numero || "Não informado"}
                    </p>
                    <p>
                      <strong>Cliente:</strong>{" "}
                      {item.cliente || "Não informado"}
                    </p>
                    <p>
                      <strong>Órgão:</strong>{" "}
                      {item.orgao || "Não informado"}
                    </p>
                    <p>
                      <strong>Emissão:</strong>{" "}
                      {formatDate(item.emissao)}
                    </p>
                    <p>
                      <strong>Vencimento:</strong>{" "}
                      {formatDate(item.vencimento)}
                    </p>
                  </div>
                ) : (
                  <>
                    {item.sub && <p>{item.sub}</p>}
                    {item.email && <p>{item.email}</p>}
                    {item.telefone && <p>{item.telefone}</p>}
                    {item.documento && <p>{item.documento}</p>}
                  </>
                )}
              </div>

              <div className="record-actions">
                <button
                  type="button"
                  onClick={() => edit(item)}
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => remove(item.id)}
                >
                  Excluir
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
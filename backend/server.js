const express = require("express");
const cors = require("cors");
const db = require("./db");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Página inicial
app.get("/", (req, res) => {
  res.send(`
    <h1>EcoGestão API</h1>
    <p>Servidor funcionando. Rotas disponíveis:</p>
    <ul>
      <li><a href="/api/status">Status do MySQL</a></li>
      <li><a href="/api/clientes">Clientes</a></li>
      <li><a href="/api/licencas">Licenças</a></li>
      <li><a href="/api/protocolos">Protocolos</a></li>
      <li><a href="/api/oficios">Ofícios</a></li>
      <li><a href="/api/analises">Análises</a></li>
      <li><a href="/api/especies">Espécies</a></li>
      <li><a href="/api/agenda">Agenda</a></li>
      <li><a href="/api/financeiro">Financeiro</a></li>
    </ul>
  `);
});

// Testar conexão
app.get("/api/status", async (req, res) => {
  try {
    await db.query("SELECT 1");
    res.json({ mensagem: "API e MySQL funcionando!" });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: "Erro ao conectar com o MySQL." });
  }
});

// ==================================================
// Função auxiliar para criar rotas CRUD
// ==================================================
function registrarCRUD(nomeRota, nomeTabela, campos, campoObrigatorio) {
  console.log(`📌 Registrando rota: /api/${nomeRota}`);

  // LISTAR
  app.get(`/api/${nomeRota}`, async (req, res) => {
    try {
      const [rows] = await db.query(`SELECT * FROM ${nomeTabela} ORDER BY id DESC`);
      res.json(rows);
    } catch (erro) {
      console.error(erro);
      res.status(500).json({ mensagem: `Erro ao buscar ${nomeRota}.` });
    }
  });

  // CRIAR
  app.post(`/api/${nomeRota}`, async (req, res) => {
    try {
      if (campoObrigatorio && (!req.body[campoObrigatorio] || !String(req.body[campoObrigatorio]).trim())) {
        return res.status(400).json({ mensagem: `Campo '${campoObrigatorio}' é obrigatório.` });
      }
      const valores = campos.map(c => req.body[c] ?? null);
      const placeholders = campos.map(() => "?").join(", ");
      const [resultado] = await db.query(
        `INSERT INTO ${nomeTabela} (${campos.join(", ")}) VALUES (${placeholders})`,
        valores
      );
      res.status(201).json({ mensagem: "Cadastrado!", id: resultado.insertId });
    } catch (erro) {
      console.error(erro);
      res.status(500).json({ mensagem: `Erro ao cadastrar.` });
    }
  });

  // EDITAR
  app.put(`/api/${nomeRota}/:id`, async (req, res) => {
    try {
      const valores = campos.map(c => req.body[c] ?? null);
      const sets = campos.map(c => `${c} = ?`).join(", ");
      const [resultado] = await db.query(
        `UPDATE ${nomeTabela} SET ${sets} WHERE id = ?`,
        [...valores, req.params.id]
      );
      if (resultado.affectedRows === 0) {
        return res.status(404).json({ mensagem: "Não encontrado." });
      }
      res.json({ mensagem: "Atualizado!" });
    } catch (erro) {
      console.error(erro);
      res.status(500).json({ mensagem: `Erro ao atualizar.` });
    }
  });

  // EXCLUIR
  app.delete(`/api/${nomeRota}/:id`, async (req, res) => {
    try {
      const [resultado] = await db.query(`DELETE FROM ${nomeTabela} WHERE id = ?`, [req.params.id]);
      if (resultado.affectedRows === 0) {
        return res.status(404).json({ mensagem: "Não encontrado." });
      }
      res.json({ mensagem: "Excluído!" });
    } catch (erro) {
      console.error(erro);
      res.status(500).json({ mensagem: `Erro ao excluir.` });
    }
  });
}

// ==================================================
// REGISTRAR TODAS AS ROTAS CRUD
// ==================================================

registrarCRUD("clientes", "clientes",
  ["nome", "tipo", "cpf_cnpj", "email", "telefone", "endereco", "cidade", "estado", "observacoes", "status"],
  "nome"
);

registrarCRUD("licencas", "licencas",
  ["numero", "cliente", "orgao", "emissao", "vencimento", "descricao", "status"],
  "numero"
);

registrarCRUD("protocolos", "protocolos",
  ["numero", "assunto", "cliente", "abertura", "status"],
  "numero"
);

registrarCRUD("oficios", "oficios",
  ["numero", "destinatario", "assunto", "data", "status"],
  "numero"
);

registrarCRUD("analises", "analises",
  ["tipo", "cliente", "resultado", "data"],
  "tipo"
);

registrarCRUD("especies", "especies",
  ["nome", "nome_popular", "status", "registro"],
  "nome"
);

registrarCRUD("agenda", "agenda",
  ["titulo", "data", "hora", "local", "tipo"],
  "titulo"
);

registrarCRUD("financeiro", "financeiro",
  ["descricao", "cliente", "valor", "tipo", "data", "status"],
  "descricao"
);

// Iniciar servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`Rotas registradas: clientes, licencas, protocolos, oficios, analises, especies, agenda, financeiro`);
});
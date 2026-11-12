const express = require("express");
const cors = require("cors");
const db = require("./db");
const bcrypt = require('bcrypt');
const { enviarEmail, enviarAlertaVencimento } = require('./mailer');
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// ==================================================
// STATUS E PÁGINA INICIAL
// ==================================================
app.get("/", (req, res) => {
  res.send(`
    <h1>EcoGestão API</h1>
    <p>Servidor funcionando. Rotas disponíveis:</p>
    <ul>
      <li><a href="/api/status">Status do MySQL</a></li>
      <li><a href="/api/clientes">Clientes</a></li>
      <li><a href="/api/logs">Logs</a></li>
    </ul>
  `);
});

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
// FUNÇÃO DE LOG
// ==================================================
async function registrarLog(req, acao, modulo, detalhes) {
  try {
    const usuarioNome = req.headers['x-usuario-nome'] || 'Sistema';
    const usuarioId = req.headers['x-usuario-id'] || null;
    await db.query(
      `INSERT INTO logs (usuario_id, usuario_nome, acao, modulo, detalhes) VALUES (?, ?, ?, ?, ?)`,
      [usuarioId, usuarioNome, acao, modulo, detalhes]
    );
  } catch (erro) {
    console.error('Erro ao registrar log:', erro);
  }
}

// ==================================================
// CRUD GENÉRICO COM LOGS
// ==================================================
function registrarCRUD(nomeRota, nomeTabela, campos, campoObrigatorio) {
  console.log(`📌 Registrando rota: /api/${nomeRota}`);

  app.get(`/api/${nomeRota}`, async (req, res) => {
    try {
      const [rows] = await db.query(`SELECT * FROM ${nomeTabela} ORDER BY id DESC`);
      res.json(rows);
    } catch (erro) {
      console.error(erro);
      res.status(500).json({ mensagem: `Erro ao buscar.` });
    }
  });

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
      await registrarLog(req, 'Criou', nomeRota, `Registro ID ${resultado.insertId}`);
      res.status(201).json({ mensagem: "Cadastrado!", id: resultado.insertId });
    } catch (erro) {
      console.error(erro);
      res.status(500).json({ mensagem: `Erro ao cadastrar.` });
    }
  });

  app.put(`/api/${nomeRota}/:id`, async (req, res) => {
    try {
      const valores = campos.map(c => req.body[c] ?? null);
      const sets = campos.map(c => `${c} = ?`).join(", ");
      const [resultado] = await db.query(
        `UPDATE ${nomeTabela} SET ${sets} WHERE id = ?`,
        [...valores, req.params.id]
      );
      if (resultado.affectedRows === 0) return res.status(404).json({ mensagem: "Não encontrado." });
      await registrarLog(req, 'Editou', nomeRota, `Registro ID ${req.params.id}`);
      res.json({ mensagem: "Atualizado!" });
    } catch (erro) {
      console.error(erro);
      res.status(500).json({ mensagem: `Erro ao atualizar.` });
    }
  });

  app.delete(`/api/${nomeRota}/:id`, async (req, res) => {
    try {
      const [resultado] = await db.query(`DELETE FROM ${nomeTabela} WHERE id = ?`, [req.params.id]);
      if (resultado.affectedRows === 0) return res.status(404).json({ mensagem: "Não encontrado." });
      await registrarLog(req, 'Excluiu', nomeRota, `Registro ID ${req.params.id}`);
      res.json({ mensagem: "Excluído!" });
    } catch (erro) {
      console.error(erro);
      res.status(500).json({ mensagem: `Erro ao excluir.` });
    }
  });
}

// ==================================================
// REGISTRAR CRUDS
// ==================================================
registrarCRUD("clientes", "clientes", ["nome", "tipo", "cpf_cnpj", "email", "telefone", "endereco", "cidade", "estado", "observacoes", "status"], "nome");
registrarCRUD("licencas", "licencas", ["numero", "cliente", "orgao", "emissao", "vencimento", "descricao", "status"], "numero");
registrarCRUD("protocolos", "protocolos", ["numero", "assunto", "cliente", "abertura", "status"], "numero");
registrarCRUD("oficios", "oficios", ["numero", "destinatario", "assunto", "data", "status"], "numero");
registrarCRUD("analises", "analises", ["tipo", "cliente", "resultado", "data"], "tipo");
registrarCRUD("especies", "especies", ["nome", "nome_popular", "status", "registro"], "nome");
registrarCRUD("agenda", "agenda", ["titulo", "data", "hora", "local", "tipo"], "titulo");
registrarCRUD("financeiro", "financeiro", ["descricao", "cliente", "valor", "tipo", "data", "status"], "descricao");

// ==================================================
// LOGS
// ==================================================
app.get('/api/logs', async (req, res) => {
  try {
    const [logs] = await db.query('SELECT * FROM logs ORDER BY created_at DESC LIMIT 100');
    res.json(logs);
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao buscar logs.' });
  }
});

// ==================================================
// VENCIMENTOS E E-MAIL
// ==================================================
app.get('/api/vencimentos', async (req, res) => {
  try {
    const dias = parseInt(req.query.dias) || 30;
    const [licencas] = await db.query(`
      SELECT * FROM licencas
      WHERE vencimento IS NOT NULL
      AND vencimento <= DATE_ADD(CURDATE(), INTERVAL ? DAY)
      ORDER BY vencimento ASC
    `, [dias]);

    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    const comDias = licencas.map(l => {
      const venc = new Date(l.vencimento); venc.setHours(0, 0, 0, 0);
      const diasRestantes = Math.ceil((venc - hoje) / (1000 * 60 * 60 * 24));
      let nivel = 'normal';
      if (diasRestantes < 0) nivel = 'vencida';
      else if (diasRestantes <= 7) nivel = 'urgente';
      else if (diasRestantes <= 15) nivel = 'atencao';
      else if (diasRestantes <= 30) nivel = 'proximo';
      return { ...l, diasRestantes, nivel };
    });
    res.json(comDias);
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao buscar vencimentos.' });
  }
});

app.post('/api/enviar-alertas', async (req, res) => {
  try {
    const [licencas] = await db.query(`
      SELECT * FROM licencas
      WHERE vencimento IS NOT NULL
      AND vencimento <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
      ORDER BY vencimento ASC
    `);

    if (licencas.length === 0) return res.json({ mensagem: 'Nenhuma licença vencendo.', enviados: 0 });

    let enviados = 0;
    const erros = [];
    for (const licenca of licencas) {
      const resultado = await enviarAlertaVencimento(process.env.EMAIL_DESTINO, licenca);
      if (resultado.sucesso) enviados++;
      else erros.push({ numero: licenca.numero, erro: resultado.erro });
    }

    res.json({ mensagem: `${enviados} e-mail(s) enviado(s).`, total: licencas.length, enviados, erros: erros.length > 0 ? erros : undefined });
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao enviar alertas.' });
  }
});

app.get('/api/testar-email', async (req, res) => {
  try {
    const resultado = await enviarEmail({
      para: process.env.EMAIL_DESTINO,
      assunto: '🌿 Teste EcoGestão',
      html: `<h2>✅ E-mail funcionando!</h2>`
    });
    res.json(resultado);
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
});

// ==================================================
// CONFIGURAÇÕES
// ==================================================
app.get('/api/configuracoes', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM configuracoes WHERE id = 1');
    if (rows.length === 0) {
      await db.query(`INSERT INTO configuracoes (id) VALUES (1)`);
      const [novo] = await db.query('SELECT * FROM configuracoes WHERE id = 1');
      return res.json(novo[0]);
    }
    res.json(rows[0]);
  } catch (erro) { res.status(500).json({ mensagem: 'Erro.' }); }
});

app.put('/api/configuracoes', async (req, res) => {
  try {
    const { nome_empresa, email, telefone, notificacoes_vencimento, dias_antecedencia } = req.body;
    const [existe] = await db.query('SELECT id FROM configuracoes WHERE id = 1');
    if (existe.length === 0) await db.query(`INSERT INTO configuracoes (id) VALUES (1)`);
    await db.query(`
      UPDATE configuracoes SET nome_empresa = ?, email = ?, telefone = ?, notificacoes_vencimento = ?, dias_antecedencia = ? WHERE id = 1
    `, [nome_empresa || 'EcoGestão', email || null, telefone || null, notificacoes_vencimento ? 1 : 0, parseInt(dias_antecedencia) || 30]);
    const [atualizado] = await db.query('SELECT * FROM configuracoes WHERE id = 1');
    res.json({ mensagem: 'Configurações salvas!', dados: atualizado[0] });
  } catch (erro) { res.status(500).json({ mensagem: 'Erro ao salvar configurações.' }); }
});

// ==================================================
// USUÁRIOS
// ==================================================
app.get('/api/usuarios', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, nome, email, cpf, cargo, telefone, ativo, created_at FROM usuarios ORDER BY id ASC');
    res.json(rows);
  } catch (erro) { res.status(500).json({ mensagem: 'Erro.' }); }
});

app.get('/api/usuarios/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, nome, email, cpf, cargo, telefone, ativo, created_at FROM usuarios WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
    res.json(rows[0]);
  } catch (erro) { res.status(500).json({ mensagem: 'Erro.' }); }
});

app.post('/api/usuarios', async (req, res) => {
  try {
    const { nome, email, cpf, cargo, telefone, senha, ativo } = req.body;
    if (!nome || !email) return res.status(400).json({ mensagem: 'Nome e email são obrigatórios.' });
    const senhaCriptografada = await bcrypt.hash(senha || '123456', 10);
    const [resultado] = await db.query(
      `INSERT INTO usuarios (nome, email, cpf, cargo, telefone, senha, ativo) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nome, email, cpf || null, cargo || 'Usuário', telefone || null, senhaCriptografada, ativo ? 1 : 1]
    );
    res.status(201).json({ mensagem: 'Usuário cadastrado!', id: resultado.insertId });
  } catch (erro) { res.status(500).json({ mensagem: 'Erro ao cadastrar usuário.' }); }
});

app.put('/api/usuarios/:id', async (req, res) => {
  try {
    const { nome, email, cpf, cargo, telefone, ativo, senha } = req.body;
    let query = `UPDATE usuarios SET nome=?, email=?, cpf=?, cargo=?, telefone=?, ativo=? WHERE id=?`;
    let params = [nome, email, cpf || null, cargo || 'Usuário', telefone || null, ativo ? 1 : 0, req.params.id];
    if (senha && senha.trim() !== '') {
      query = `UPDATE usuarios SET nome=?, email=?, cpf=?, cargo=?, telefone=?, ativo=?, senha=? WHERE id=?`;
      const senhaCriptografada = await bcrypt.hash(senha, 10);
      params = [nome, email, cpf || null, cargo || 'Usuário', telefone || null, ativo ? 1 : 0, senhaCriptografada, req.params.id];
    }
    const [resultado] = await db.query(query, params);
    if (resultado.affectedRows === 0) return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
    res.json({ mensagem: 'Usuário atualizado!' });
  } catch (erro) { res.status(500).json({ mensagem: 'Erro ao atualizar usuário.' }); }
});

app.delete('/api/usuarios/:id', async (req, res) => {
  try {
    const [resultado] = await db.query('DELETE FROM usuarios WHERE id = ?', [req.params.id]);
    if (resultado.affectedRows === 0) return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
    res.json({ mensagem: 'Usuário excluído!' });
  } catch (erro) { res.status(500).json({ mensagem: 'Erro ao excluir usuário.' }); }
});

app.get('/api/usuarios/:id/permissoes', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM permissoes WHERE usuario_id = ?', [req.params.id]);
    res.json(rows);
  } catch (erro) { res.status(500).json({ mensagem: 'Erro.' }); }
});

app.put('/api/usuarios/:id/permissoes', async (req, res) => {
  try {
    const usuarioId = req.params.id;
    const lista = req.body.permissoes || [];
    await db.query('DELETE FROM permissoes WHERE usuario_id = ?', [usuarioId]);
    for (const p of lista) {
      await db.query(
        `INSERT INTO permissoes (usuario_id, funcionalidade, pode_criar, pode_visualizar, pode_editar, pode_excluir) VALUES (?, ?, ?, ?, ?, ?)`,
        [usuarioId, p.funcionalidade, p.pode_criar ? 1 : 0, p.pode_visualizar ? 1 : 0, p.pode_editar ? 1 : 0, p.pode_excluir ? 1 : 0]
      );
    }
    res.json({ mensagem: 'Permissões salvas!' });
  } catch (erro) { res.status(500).json({ mensagem: 'Erro.' }); }
});

// ==================================================
// LOGIN E SENHA
// ==================================================
app.post('/api/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ mensagem: 'E-mail e senha são obrigatórios.' });
    const [usuarios] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (usuarios.length === 0) return res.status(401).json({ mensagem: 'E-mail ou senha incorretos.' });
    const usuario = usuarios[0];
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) return res.status(401).json({ mensagem: 'E-mail ou senha incorretos.' });
    if (!usuario.ativo) return res.status(403).json({ mensagem: 'Usuário inativo.' });
    const [permissoesLista] = await db.query('SELECT * FROM permissoes WHERE usuario_id = ?', [usuario.id]);
    const permissoes = {};
    permissoesLista.forEach(p => {
      permissoes[p.funcionalidade] = {
        pode_criar: !!p.pode_criar, pode_visualizar: !!p.pode_visualizar,
        pode_editar: !!p.pode_editar, pode_excluir: !!p.pode_excluir
      };
    });
    delete usuario.senha;
    res.json({ mensagem: 'Login realizado com sucesso!', usuario, permissoes });
  } catch (erro) { res.status(500).json({ mensagem: 'Erro no servidor.' }); }
});

app.put('/api/usuarios/:id/senha', async (req, res) => {
  try {
    const { id } = req.params;
    const { senhaAtual, novaSenha } = req.body;
    if (!senhaAtual || !novaSenha) return res.status(400).json({ mensagem: 'Senhas obrigatórias.' });
    if (novaSenha.length < 6) return res.status(400).json({ mensagem: 'A nova senha deve ter 6 caracteres.' });
    const [usuarios] = await db.query('SELECT * FROM usuarios WHERE id = ?', [id]);
    if (usuarios.length === 0) return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
    const usuario = usuarios[0];
    const senhaCorreta = await bcrypt.compare(senhaAtual, usuario.senha);
    if (!senhaCorreta) return res.status(401).json({ mensagem: 'Senha atual incorreta.' });
    const novaSenhaCriptografada = await bcrypt.hash(novaSenha, 10);
    await db.query('UPDATE usuarios SET senha = ? WHERE id = ?', [novaSenhaCriptografada, id]);
    res.json({ mensagem: 'Senha alterada com sucesso!' });
  } catch (erro) { res.status(500).json({ mensagem: 'Erro.' }); }
});

// ==================================================
// INICIAR SERVIDOR
// ==================================================
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
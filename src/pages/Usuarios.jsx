import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Icon from '../components/Icon';

const FORM_VAZIO = {
  nome: '', email: '', cpf: '', cargo: 'Usuário', telefone: '', ativo: true
};

const FUNCIONALIDADES = [
  'Dashboard', 'Clientes', 'Licenças', 'Protocolos', 'Ofícios',
  'Análises', 'Espécies', 'Agenda', 'Financeiro', 'Configurações'
];

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState(FORM_VAZIO);
  const [editandoId, setEditandoId] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);

  // Permissões do usuário selecionado
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [permissoes, setPermissoes] = useState({});
  const [salvandoPerm, setSalvandoPerm] = useState(false);

  const carregar = async () => {
    setLoading(true);
    try { setUsuarios(await api.usuarios.listar()); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };
  useEffect(() => { carregar(); }, []);

  // Abrir usuário para ver/editar permissões
  const abrirPermissoes = async (u) => {
    setUsuarioSelecionado(u);
    try {
      const lista = await api.usuarios.permissoes.buscar(u.id);
      const mapa = {};
      FUNCIONALIDADES.forEach(f => {
        const existente = lista.find(p => p.funcionalidade === f);
        mapa[f] = {
          pode_criar: existente?.pode_criar ? true : false,
          pode_visualizar: existente?.pode_visualizar ? true : false,
          pode_editar: existente?.pode_editar ? true : false,
          pode_excluir: existente?.pode_excluir ? true : false
        };
      });
      setPermissoes(mapa);
    } catch (e) {
      console.error(e);
    }
  };

  const togglePermissao = (func, campo) => {
    setPermissoes(prev => ({
      ...prev,
      [func]: { ...prev[func], [campo]: !prev[func][campo] }
    }));
  };

  const salvarPermissoes = async () => {
    if (!usuarioSelecionado) return;
    setSalvandoPerm(true);
    try {
      const lista = FUNCIONALIDADES.map(f => ({
        funcionalidade: f,
        ...permissoes[f]
      }));
      await api.usuarios.permissoes.salvar(usuarioSelecionado.id, lista);
      alert('Permissões salvas!');
    } catch (e) {
      console.error(e);
      alert('Erro ao salvar permissões.');
    } finally {
      setSalvandoPerm(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editandoId) await api.usuarios.atualizar(editandoId, form);
    else await api.usuarios.criar(form);
    setForm(FORM_VAZIO); setEditandoId(null); setMostrarForm(false); carregar();
  };

  const handleEditar = (u) => {
    setForm({
      nome: u.nome || '', email: u.email || '', cpf: u.cpf || '',
      cargo: u.cargo || 'Usuário', telefone: u.telefone || '',
      ativo: !!u.ativo
    });
    setEditandoId(u.id); setMostrarForm(true);
  };

  const handleExcluir = async (id) => {
    if (!window.confirm('Excluir este usuário?')) return;
    await api.usuarios.excluir(id); carregar();
  };

  const handleCancelar = () => { setForm(FORM_VAZIO); setEditandoId(null); setMostrarForm(false); };

  const usuariosFiltrados = usuarios.filter(u =>
    u.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    u.email?.toLowerCase().includes(busca.toLowerCase()) ||
    u.cpf?.includes(busca)
  );

  return (
    <div>
      <div className="page-header">
        <div className="page-header-titles">
          <h1>Usuários</h1>
          <p className="subtitulo">Gerencie usuários do sistema e suas permissões.</p>
        </div>
        <button
          className={mostrarForm ? 'btn btn-secondary' : 'btn btn-primary'}
          onClick={() => (mostrarForm ? handleCancelar() : setMostrarForm(true))}
        >
          {mostrarForm ? 'Cancelar' : '+ Novo usuário'}
        </button>
      </div>

      {mostrarForm && (
        <form className="form-card" onSubmit={handleSubmit}>
          <h3>{editandoId ? 'Editar Usuário' : 'Novo Usuário'}</h3>
          <div className="form-grid">
            <div className="form-group"><label>Nome *</label><input name="nome" value={form.nome} onChange={handleChange} required /></div>
            <div className="form-group"><label>Email *</label><input type="email" name="email" value={form.email} onChange={handleChange} required /></div>
            <div className="form-group"><label>CPF</label><input name="cpf" value={form.cpf} onChange={handleChange} /></div>
            <div className="form-group"><label>Cargo</label><input name="cargo" value={form.cargo} onChange={handleChange} /></div>
            <div className="form-group"><label>Telefone</label><input name="telefone" value={form.telefone} onChange={handleChange} /></div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-success">{editandoId ? 'Atualizar' : 'Salvar'}</button>
            <button type="button" className="btn btn-secondary" onClick={handleCancelar}>Cancelar</button>
          </div>
        </form>
      )}

      <div style={{ marginBottom: '15px' }}>
        <input
          placeholder="🔍 Buscar usuário por nome, email ou CPF..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          style={{ padding: '11px 15px', width: '100%', border: '1px solid var(--cinza-borda)', borderRadius: '8px', fontSize: '0.9rem', background: '#fff' }}
        />
      </div>

      {loading ? <div className="loading">Carregando...</div> : usuariosFiltrados.length === 0 ? (
        <div className="empty-message">Nenhum usuário encontrado.</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr><th>ID</th><th>Nome</th><th>Email</th><th>Cargo</th><th>CPF</th><th>Ativo</th><th style={{ width: '180px' }}>Ações</th></tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map(u => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td><strong>{u.nome}</strong></td>
                  <td>{u.email}</td>
                  <td>{u.cargo || '-'}</td>
                  <td>{u.cpf || '-'}</td>
                  <td>{u.ativo ? <span className="status-pill status-normal">Sim</span> : <span className="status-pill status-urgente">Não</span>}</td>
                  <td>
                    <div className="acoes-cell">
                      <button className="btn-icon" onClick={() => abrirPermissoes(u)} title="Permissões">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                      </button>
                      <button className="btn-icon" onClick={() => handleEditar(u)} title="Editar">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                        </svg>
                      </button>
                      <button className="btn-icon danger" onClick={() => handleExcluir(u.id)} title="Excluir">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Painel de Permissões */}
      {usuarioSelecionado && (
        <div className="panel" style={{ marginTop: '25px' }}>
          <div className="panel-header">
            <h3>Permissões de {usuarioSelecionado.nome}</h3>
            <button className="link" onClick={() => setUsuarioSelecionado(null)}>Fechar</button>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Funcionalidade</th>
                  <th style={{ textAlign: 'center' }}>Criar</th>
                  <th style={{ textAlign: 'center' }}>Visualizar</th>
                  <th style={{ textAlign: 'center' }}>Editar</th>
                  <th style={{ textAlign: 'center' }}>Excluir</th>
                </tr>
              </thead>
              <tbody>
                {FUNCIONALIDADES.map(f => (
                  <tr key={f}>
                    <td><strong>{f}</strong></td>
                    <td style={{ textAlign: 'center' }}>
                      <input type="checkbox" checked={permissoes[f]?.pode_criar || false} onChange={() => togglePermissao(f, 'pode_criar')} />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <input type="checkbox" checked={permissoes[f]?.pode_visualizar || false} onChange={() => togglePermissao(f, 'pode_visualizar')} />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <input type="checkbox" checked={permissoes[f]?.pode_editar || false} onChange={() => togglePermissao(f, 'pode_editar')} />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <input type="checkbox" checked={permissoes[f]?.pode_excluir || false} onChange={() => togglePermissao(f, 'pode_excluir')} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="form-actions">
            <button className="btn btn-success" onClick={salvarPermissoes} disabled={salvandoPerm}>
              {salvandoPerm ? 'Salvando...' : 'Salvar permissões'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
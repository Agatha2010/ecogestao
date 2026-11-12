import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { exportarParaCSV } from '../utils/exportar';
import { exportarParaPDF } from '../utils/exportarPDF';

const FORM_VAZIO = {
  nome: '', tipo: 'Pessoa Física', cpf_cnpj: '', email: '',
  telefone: '', endereco: '', cidade: '', estado: '', observacoes: ''
};

export default function Listing() {
  const { pode } = useAuth();
  const podeCriar = pode('Clientes', 'criar');
  const podeEditar = pode('Clientes', 'editar');
  const podeExcluir = pode('Clientes', 'excluir');

  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState(FORM_VAZIO);
  const [editandoId, setEditandoId] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  const [filtroBusca, setFiltroBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('Todos');
  const [filtroStatus, setFiltroStatus] = useState('Todos');

  const carregar = async () => {
    setLoading(true);
    try { setClientes(await api.clientes.listar()); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };
  useEffect(() => { carregar(); }, []);

  useEffect(() => {
    if (searchParams.get('novo') === 'true' && podeCriar) setMostrarForm(true);
  }, [searchParams, podeCriar]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editandoId) await api.clientes.atualizar(editandoId, form);
    else await api.clientes.criar(form);
    setForm(FORM_VAZIO); setEditandoId(null); setMostrarForm(false); carregar();
  };
  const handleEditar = (c) => {
    setForm({
      nome: c.nome || '', tipo: c.tipo || 'Pessoa Física',
      cpf_cnpj: c.cpf_cnpj || '', email: c.email || '',
      telefone: c.telefone || '', endereco: c.endereco || '',
      cidade: c.cidade || '', estado: c.estado || '',
      observacoes: c.observacoes || ''
    });
    setEditandoId(c.id); setMostrarForm(true);
  };
  const handleExcluir = async (id) => {
    if (!window.confirm('Excluir este cliente?')) return;
    await api.clientes.excluir(id); carregar();
  };
  const handleCancelar = () => { setForm(FORM_VAZIO); setEditandoId(null); setMostrarForm(false); };

  const limparFiltros = () => {
    setFiltroBusca('');
    setFiltroTipo('Todos');
    setFiltroStatus('Todos');
  };

  const clientesFiltrados = clientes.filter(c => {
    const matchBusca = !filtroBusca || 
      c.nome?.toLowerCase().includes(filtroBusca.toLowerCase()) ||
      c.email?.toLowerCase().includes(filtroBusca.toLowerCase()) ||
      c.cpf_cnpj?.includes(filtroBusca);
    const matchTipo = filtroTipo === 'Todos' || c.tipo === filtroTipo;
    const matchStatus = filtroStatus === 'Todos' || (c.status || 'Ativo') === filtroStatus;
    return matchBusca && matchTipo && matchStatus;
  });

  // ========== FUNÇÃO DE EXPORTAR PDF ==========
  const gerarPDF = () => {
    const colunas = ['Nome', 'Tipo', 'CPF/CNPJ', 'Email', 'Telefone', 'Cidade'];
    const dados = clientesFiltrados.map(c => [
      c.nome || '-',
      c.tipo || '-',
      c.cpf_cnpj || '-',
      c.email || '-',
      c.telefone || '-',
      c.cidade || '-'
    ]);
    exportarParaPDF('Relatório de Clientes', colunas, dados, 'clientes');
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-titles">
          <h1>Clientes</h1>
          <p className="subtitulo">Aqui você encontra tudo sobre seus clientes.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={() => exportarParaCSV(clientesFiltrados, 'clientes')}>
            📥 CSV
          </button>
          <button 
            className="btn" 
            onClick={gerarPDF} 
            style={{ background: '#dc2626', color: '#fff', border: 'none' }}
          >
            📄 PDF
          </button>
          {podeCriar && (
            <button className={mostrarForm ? 'btn btn-secondary' : 'btn btn-primary'} onClick={() => (mostrarForm ? handleCancelar() : setMostrarForm(true))}>
              {mostrarForm ? 'Cancelar' : '+ Novo cliente'}
            </button>
          )}
        </div>
      </div>

      {mostrarForm && podeCriar && (
        <form className="form-card" onSubmit={handleSubmit}>
          <h3>{editandoId ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}</h3>
          <div className="form-grid">
            <div className="form-group"><label>Nome *</label><input name="nome" value={form.nome} onChange={handleChange} required /></div>
            <div className="form-group"><label>Tipo *</label>
              <select name="tipo" value={form.tipo} onChange={handleChange}>
                <option>Pessoa Física</option><option>Pessoa Jurídica</option>
              </select>
            </div>
            <div className="form-group"><label>CPF/CNPJ</label><input name="cpf_cnpj" value={form.cpf_cnpj} onChange={handleChange} /></div>
            <div className="form-group"><label>Email</label><input type="email" name="email" value={form.email} onChange={handleChange} /></div>
            <div className="form-group"><label>Telefone</label><input name="telefone" value={form.telefone} onChange={handleChange} /></div>
            <div className="form-group"><label>Endereço</label><input name="endereco" value={form.endereco} onChange={handleChange} /></div>
            <div className="form-group"><label>Cidade</label><input name="cidade" value={form.cidade} onChange={handleChange} /></div>
            <div className="form-group"><label>Estado</label><input name="estado" value={form.estado} onChange={handleChange} maxLength={2} /></div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-success">{editandoId ? 'Atualizar' : 'Salvar Cliente'}</button>
            <button type="button" className="btn btn-secondary" onClick={handleCancelar}>Cancelar</button>
          </div>
        </form>
      )}

      <div className="filtros-bar">
        <input className="filtro-input" placeholder="🔍 Buscar..." value={filtroBusca} onChange={(e) => setFiltroBusca(e.target.value)} />
        <select className="filtro-select" value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
          <option value="Todos">Todos os tipos</option>
          <option value="Pessoa Física">Pessoa Física</option>
          <option value="Pessoa Jurídica">Pessoa Jurídica</option>
        </select>
        <select className="filtro-select" value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
          <option value="Todos">Todos os status</option>
          <option value="Ativo">Ativos</option>
          <option value="Inativo">Inativos</option>
        </select>
        <button className="btn btn-secondary" onClick={limparFiltros}>Limpar</button>
      </div>

      <p style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '15px' }}>
        Mostrando <strong>{clientesFiltrados.length}</strong> de <strong>{clientes.length}</strong> cliente(s).
      </p>

      {loading ? <div className="loading">Carregando clientes...</div> : clientesFiltrados.length === 0 ? (
        <div className="empty-message">Nenhum cliente encontrado com esses filtros.</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nome / Razão Social</th>
                <th>Documento</th>
                <th>Endereço</th>
                {(podeEditar || podeExcluir) && <th style={{ width: '110px' }}>Ações</th>}
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.map(c => (
                <tr key={c.id}>
                  <td><strong>{c.nome}</strong></td>
                  <td>{c.cpf_cnpj || '-'}</td>
                  <td>{c.endereco || 'Endereço não disponível'}</td>
                  {(podeEditar || podeExcluir) && (
                    <td>
                      <div className="acoes-cell">
                        {podeEditar && (
                          <button className="btn-icon" onClick={() => handleEditar(c)} title="Editar">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                          </button>
                        )}
                        {podeExcluir && (
                          <button className="btn-icon danger" onClick={() => handleExcluir(c.id)} title="Excluir">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
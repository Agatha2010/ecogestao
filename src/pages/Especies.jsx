import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { exportarParaCSV } from '../utils/exportar';
import { exportarParaPDF } from '../utils/exportarPDF';

const FORM_VAZIO = { nome: '', nome_popular: '', status: 'Comum', registro: '' };

export default function Especies() {
  const { pode } = useAuth();
  const podeCriar = pode('Espécies', 'criar');
  const podeEditar = pode('Espécies', 'editar');
  const podeExcluir = pode('Espécies', 'excluir');

  const [itens, setItens] = useState([]);
  const [form, setForm] = useState(FORM_VAZIO);
  const [editandoId, setEditandoId] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  const [filtroBusca, setFiltroBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('Todos');
  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFim, setFiltroDataFim] = useState('');

  const carregar = async () => {
    setLoading(true);
    try { setItens(await api.especies.listar()); }
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
    if (editandoId) await api.especies.atualizar(editandoId, form);
    else await api.especies.criar(form);
    setForm(FORM_VAZIO); setEditandoId(null); setMostrarForm(false); carregar();
  };
  const handleEditar = (i) => {
    setForm({ nome: i.nome || '', nome_popular: i.nome_popular || '', status: i.status || 'Comum', registro: i.registro ? i.registro.substring(0, 10) : '' });
    setEditandoId(i.id); setMostrarForm(true);
  };
  const handleExcluir = async (id) => { if (window.confirm('Excluir?')) { await api.especies.excluir(id); carregar(); } };
  const handleCancelar = () => { setForm(FORM_VAZIO); setEditandoId(null); setMostrarForm(false); };

  const limparFiltros = () => { setFiltroBusca(''); setFiltroStatus('Todos'); setFiltroDataInicio(''); setFiltroDataFim(''); };
  const formatarData = (d) => (d ? new Date(d).toLocaleDateString('pt-BR') : '-');

  const itensFiltrados = itens.filter(i => {
    const matchBusca = !filtroBusca ||
      i.nome?.toLowerCase().includes(filtroBusca.toLowerCase()) ||
      i.nome_popular?.toLowerCase().includes(filtroBusca.toLowerCase());
    const matchStatus = filtroStatus === 'Todos' || i.status === filtroStatus;
    let matchPeriodo = true;
    if (filtroDataInicio || filtroDataFim) {
      const dataItem = i.registro ? new Date(i.registro) : null;
      if (!dataItem) matchPeriodo = false;
      else {
        if (filtroDataInicio && dataItem < new Date(filtroDataInicio)) matchPeriodo = false;
        if (filtroDataFim && dataItem > new Date(filtroDataFim)) matchPeriodo = false;
      }
    }
    return matchBusca && matchStatus && matchPeriodo;
  });

  const gerarPDF = () => {
    const colunas = ['Nome Científico', 'Nome Popular', 'Status', 'Registro'];
    const dados = itensFiltrados.map(i => [
      i.nome || '-', i.nome_popular || '-', i.status || '-', formatarData(i.registro)
    ]);
    exportarParaPDF('Relatório de Espécies', colunas, dados, 'especies');
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-titles">
          <h1>Espécies</h1>
          <p className="subtitulo">Catálogo de espécies monitoradas.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={() => exportarParaCSV(itensFiltrados, 'especies')}>📥 CSV</button>
          <button className="btn" onClick={gerarPDF} style={{ background: '#dc2626', color: '#fff', border: 'none' }}>📄 PDF</button>
          {podeCriar && (<button className={mostrarForm ? 'btn btn-secondary' : 'btn btn-primary'} onClick={() => (mostrarForm ? handleCancelar() : setMostrarForm(true))}>{mostrarForm ? 'Cancelar' : '+ Nova espécie'}</button>)}
        </div>
      </div>

      {mostrarForm && podeCriar && (
        <form className="form-card" onSubmit={handleSubmit}>
          <h3>{editandoId ? 'Editar Espécie' : 'Nova Espécie'}</h3>
          <div className="form-grid">
            <div className="form-group"><label>Nome científico *</label><input name="nome" value={form.nome} onChange={handleChange} required /></div>
            <div className="form-group"><label>Nome popular</label><input name="nome_popular" value={form.nome_popular} onChange={handleChange} /></div>
            <div className="form-group"><label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}><option>Comum</option><option>Ameaçada</option><option>Endêmica</option><option>Exótica</option></select>
            </div>
            <div className="form-group"><label>Data de Registro</label><input type="date" name="registro" value={form.registro} onChange={handleChange} /></div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-success">{editandoId ? 'Atualizar' : 'Salvar'}</button>
            <button type="button" className="btn btn-secondary" onClick={handleCancelar}>Cancelar</button>
          </div>
        </form>
      )}

      <div className="filtros-bar">
        <input className="filtro-input" placeholder="🔍 Buscar..." value={filtroBusca} onChange={(e) => setFiltroBusca(e.target.value)} />
        <select className="filtro-select" value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
          <option value="Todos">Todos os status</option>
          <option value="Comum">Comum</option>
          <option value="Ameaçada">Ameaçada</option>
          <option value="Endêmica">Endêmica</option>
          <option value="Exótica">Exótica</option>
        </select>
        <input type="date" className="filtro-select" value={filtroDataInicio} onChange={(e) => setFiltroDataInicio(e.target.value)} title="De" />
        <span style={{ color: '#718096', fontSize: '0.9rem' }}>até</span>
        <input type="date" className="filtro-select" value={filtroDataFim} onChange={(e) => setFiltroDataFim(e.target.value)} title="Até" />
        <button className="btn btn-secondary" onClick={limparFiltros}>Limpar</button>
      </div>

      <p style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '15px' }}>
        Mostrando <strong>{itensFiltrados.length}</strong> de <strong>{itens.length}</strong> espécie(s).
      </p>

      {loading ? <div className="loading">Carregando...</div> : itensFiltrados.length === 0 ? (
        <div className="empty-message">Nenhuma espécie encontrada.</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nome Científico</th><th>Nome Popular</th><th>Status</th><th>Registro</th>
                {(podeEditar || podeExcluir) && <th style={{ width: '110px' }}>Ações</th>}
              </tr>
            </thead>
            <tbody>
              {itensFiltrados.map(i => (
                <tr key={i.id}>
                  <td><strong>{i.nome}</strong></td><td>{i.nome_popular || '-'}</td>
                  <td><span className={`status-pill ${i.status === 'Ameaçada' ? 'status-urgente' : i.status === 'Endêmica' ? 'status-atencao' : 'status-normal'}`}>{i.status}</span></td>
                  <td>{formatarData(i.registro)}</td>
                  {(podeEditar || podeExcluir) && (
                    <td><div className="acoes-cell">
                      {podeEditar && (<button className="btn-icon" onClick={() => handleEditar(i)} title="Editar"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg></button>)}
                      {podeExcluir && (<button className="btn-icon danger" onClick={() => handleExcluir(i.id)} title="Excluir"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg></button>)}
                    </div></td>
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
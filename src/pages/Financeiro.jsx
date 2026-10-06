import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const FORM_VAZIO = {
  descricao: '', cliente: '', valor: '',
  tipo: 'Receita', data: '', status: 'Pendente'
};

export default function Financeiro() {
  const [itens, setItens] = useState([]);
  const [form, setForm] = useState(FORM_VAZIO);
  const [editandoId, setEditandoId] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const carregar = async () => {
    setLoading(true);
    try { setItens(await api.financeiro.listar()); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };
  useEffect(() => { carregar(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    const dados = { ...form, valor: parseFloat(form.valor) || 0 };
    if (editandoId) await api.financeiro.atualizar(editandoId, dados);
    else await api.financeiro.criar(dados);
    setForm(FORM_VAZIO); setEditandoId(null); setMostrarForm(false); carregar();
  };
  const handleEditar = (i) => {
    setForm({
      descricao: i.descricao || '',
      cliente: i.cliente || '',
      valor: String(i.valor || ''),
      tipo: i.tipo || 'Receita',
      data: i.data ? i.data.substring(0, 10) : '',
      status: i.status || 'Pendente'
    });
    setEditandoId(i.id); setMostrarForm(true);
  };
  const handleExcluir = async (id) => { if (window.confirm('Excluir?')) { await api.financeiro.excluir(id); carregar(); } };
  const handleCancelar = () => { setForm(FORM_VAZIO); setEditandoId(null); setMostrarForm(false); };

  const formatarMoeda = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatarData = (d) => (d ? new Date(d).toLocaleDateString('pt-BR') : '-');

  const totalReceitas = itens.filter(i => i.tipo === 'Receita').reduce((s, i) => s + Number(i.valor), 0);
  const totalDespesas = itens.filter(i => i.tipo === 'Despesa').reduce((s, i) => s + Number(i.valor), 0);
  const saldo = totalReceitas - totalDespesas;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-titles"><h1>Financeiro</h1><p className="subtitulo">Controle receitas, despesas e pagamentos.</p></div>
        <button className={mostrarForm ? 'btn btn-secondary' : 'btn btn-primary'} onClick={() => (mostrarForm ? handleCancelar() : setMostrarForm(true))}>
          {mostrarForm ? 'Cancelar' : '+ Novo lançamento'}
        </button>
      </div>

      <div className="cards-grid">
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#d4edda', color: '#155724' }}>💰</div>
          <div className="stat-card-content"><h3>Receitas</h3>
            <div className="value" style={{ color: '#16a34a', fontSize: '1.5rem' }}>{formatarMoeda(totalReceitas)}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#fee2e2', color: '#b91c1c' }}>📉</div>
          <div className="stat-card-content"><h3>Despesas</h3>
            <div className="value" style={{ color: '#dc2626', fontSize: '1.5rem' }}>{formatarMoeda(totalDespesas)}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#e0e7ff', color: '#3730a3' }}>📊</div>
          <div className="stat-card-content"><h3>Saldo</h3>
            <div className="value" style={{ color: saldo >= 0 ? '#16a34a' : '#dc2626', fontSize: '1.5rem' }}>{formatarMoeda(saldo)}</div>
          </div>
        </div>
      </div>

      {mostrarForm && (
        <form className="form-card" onSubmit={handleSubmit}>
          <h3>{editandoId ? 'Editar Lançamento' : 'Novo Lançamento'}</h3>
          <div className="form-grid">
            <div className="form-group"><label>Descrição *</label><input name="descricao" value={form.descricao} onChange={handleChange} required /></div>
            <div className="form-group"><label>Cliente</label><input name="cliente" value={form.cliente} onChange={handleChange} /></div>
            <div className="form-group"><label>Valor (R$) *</label><input type="number" step="0.01" name="valor" value={form.valor} onChange={handleChange} required /></div>
            <div className="form-group"><label>Tipo</label>
              <select name="tipo" value={form.tipo} onChange={handleChange}>
                <option>Receita</option><option>Despesa</option>
              </select>
            </div>
            <div className="form-group"><label>Data</label><input type="date" name="data" value={form.data} onChange={handleChange} /></div>
            <div className="form-group"><label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                <option>Pendente</option><option>Pago</option><option>Atrasado</option>
              </select>
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-success">{editandoId ? 'Atualizar' : 'Salvar'}</button>
            <button type="button" className="btn btn-secondary" onClick={handleCancelar}>Cancelar</button>
          </div>
        </form>
      )}

      {loading ? <div className="loading">Carregando...</div> : (
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Descrição</th><th>Cliente</th><th>Tipo</th><th>Valor</th><th>Data</th><th>Status</th><th style={{ width: '100px' }}>Ações</th></tr>
            </thead>
            <tbody>
              {itens.map(i => (
                <tr key={i.id}>
                  <td><strong>{i.descricao}</strong></td>
                  <td>{i.cliente || '-'}</td>
                  <td><span className={`status-pill ${i.tipo === 'Receita' ? 'status-normal' : 'status-urgente'}`}>{i.tipo}</span></td>
                  <td style={{ fontWeight: 600 }}>{formatarMoeda(i.valor)}</td>
                  <td>{formatarData(i.data)}</td>
                  <td>{i.status}</td>
                  <td>
                    <button className="btn-icon" onClick={() => handleEditar(i)}>✏️</button>
                    <button className="btn-icon" onClick={() => handleExcluir(i.id)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
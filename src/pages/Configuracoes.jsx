import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function Configuracoes() {
  const [config, setConfig] = useState({
    nome_empresa: '',
    email: '',
    telefone: '',
    notificacoes_vencimento: true,
    dias_antecedencia: 30
  });
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');

  useEffect(() => {
    async function carregar() {
      try {
        const data = await api.configuracoes.buscar();
        setConfig({
          nome_empresa: data.nome_empresa || '',
          email: data.email || '',
          telefone: data.telefone || '',
          notificacoes_vencimento: !!data.notificacoes_vencimento,
          dias_antecedencia: data.dias_antecedencia || 30
        });
      } catch (err) {
        console.error(err);
        setErro('Não foi possível carregar as configurações.');
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig({ ...config, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSalvando(true);
    setMensagem('');
    setErro('');
    try {
      await api.configuracoes.salvar(config);
      setMensagem('✅ Configurações salvas no banco de dados!');
      setTimeout(() => setMensagem(''), 4000);
    } catch (err) {
      console.error(err);
      setErro('❌ Erro ao salvar. Verifique o backend.');
    } finally {
      setSalvando(false);
    }
  };

  if (loading) return <div className="loading">Carregando configurações...</div>;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-titles">
          <h1>Configurações</h1>
          <p className="subtitulo">Gerencie as preferências e dados da sua conta.</p>
        </div>
      </div>

      <form className="form-card" onSubmit={handleSubmit}>
        <h3>Informações da Empresa</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Nome da empresa</label>
            <input
              name="nome_empresa"
              value={config.nome_empresa}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>E-mail</label>
            <input
              type="email"
              name="email"
              value={config.email}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Telefone</label>
            <input
              name="telefone"
              value={config.telefone}
              onChange={handleChange}
            />
          </div>
        </div>
      </form>

      <form className="form-card" onSubmit={handleSubmit}>
        <h3>Notificações</h3>

        <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
          <input
            type="checkbox"
            id="notif"
            name="notificacoes_vencimento"
            checked={config.notificacoes_vencimento}
            onChange={handleChange}
            style={{ width: 'auto' }}
          />
          <label htmlFor="notif" style={{ margin: 0 }}>
            Receber notificações de vencimento de licenças
          </label>
        </div>

        <div className="form-group" style={{ maxWidth: '300px' }}>
          <label>Dias de antecedência para alertar</label>
          <input
            type="number"
            name="dias_antecedencia"
            value={config.dias_antecedencia}
            onChange={handleChange}
            min="1"
            max="365"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-success" disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar configurações'}
          </button>
          {mensagem && (
            <span style={{ color: '#16a34a', alignSelf: 'center', fontWeight: 600 }}>
              {mensagem}
            </span>
          )}
          {erro && (
            <span style={{ color: '#dc2626', alignSelf: 'center', fontWeight: 600 }}>
              {erro}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
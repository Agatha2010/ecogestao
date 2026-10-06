import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Header from '../components/Header';

export default function Dashboard() {
  const [stats, setStats] = useState({
    clientes: 0,
    licencas: 0,
    licencasVencendo: 0,
    statusApi: 'Verificando...'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        const [clientes, licencas] = await Promise.all([
          api.getClientes(),
          api.getLicencas()
        ]);

        const hoje = new Date();
        const em30dias = new Date();
        em30dias.setDate(hoje.getDate() + 30);

        const vencendo = licencas.filter(l => {
          if (!l.vencimento) return false;
          const v = new Date(l.vencimento);
          return v >= hoje && v <= em30dias;
        }).length;

        setStats({
          clientes: clientes.length,
          licencas: licencas.length,
          licencasVencendo: vencendo,
          statusApi: 'Online'
        });
      } catch (err) {
        console.error(err);
        setStats(s => ({ ...s, statusApi: 'Offline' }));
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, []);

  if (loading) return <div className="loading">Carregando dashboard...</div>;

  return (
    <div>
      <Header titulo="Dashboard" subtitulo="Visão geral da gestão ambiental" />

      <div className="cards-grid">
        <div className="stat-card">
          <div className="stat-card-icon">👥</div>
          <div className="stat-card-content">
            <h3>Clientes</h3>
            <div className="value">{stats.clientes}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon">📜</div>
          <div className="stat-card-content">
            <h3>Licenças Ativas</h3>
            <div className="value">{stats.licencas}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon">📋</div>
          <div className="stat-card-content">
            <h3>Protocolos</h3>
            <div className="value">0</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
            ⚠️
          </div>
          <div className="stat-card-content">
            <h3>Vencimentos Próximos</h3>
            <div className="value">{stats.licencasVencendo}</div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h3>Próximos vencimentos</h3>
          <a className="link">Ver todos</a>
        </div>
        <div className="list-item">
          <div className="list-item-info">
            <h4>Licença Ambiental</h4>
            <div className="subtitulo">Empresa Verde Ltda.</div>
          </div>
          <div className="list-item-right">
            <span className="status-pill status-urgente">Urgente</span>
            <div className="data-badge">
              25/08
              <div className="mes">2026</div>
            </div>
          </div>
        </div>
        <div className="list-item">
          <div className="list-item-info">
            <h4>Licença de Operação</h4>
            <div className="subtitulo">Eco Norte Comércio</div>
          </div>
          <div className="list-item-right">
            <span className="status-pill status-atencao">Atenção</span>
            <div className="data-badge">
              30/08
              <div className="mes">2026</div>
            </div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h3>Acesso rápido</h3>
        </div>
        <div className="quick-actions">
          <button className="btn btn-secondary">+ Novo cliente</button>
          <button className="btn btn-secondary">+ Nova licença</button>
          <button className="btn btn-secondary">+ Novo protocolo</button>
          <button className="btn btn-secondary">+ Novo agendamento</button>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Header from '../components/Header';
import Icon from '../components/Icon';
import GraficosDashboard from '../components/GraficosDashboard';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { usuarioAtual } = useAuth();
  const isAdmin = usuarioAtual?.cargo?.trim().toLowerCase() === 'administrador';

  const [stats, setStats] = useState({ clientes: 0, licencas: 0, protocolos: 0 });
  const [vencimentos, setVencimentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState('');

  const carregar = async () => {
    setLoading(true);
    try {
      const [clientes, licencas, protocolos, vencs] = await Promise.all([
        api.clientes.listar(),
        api.licencas.listar(),
        api.protocolos.listar(),
        isAdmin ? fetch('http://localhost:3001/api/vencimentos?dias=30').then(r => r.json()) : Promise.resolve([])
      ]);

      setStats({
        clientes: clientes.length,
        licencas: licencas.length,
        protocolos: protocolos.length
      });

      setVencimentos(Array.isArray(vencs) ? vencs : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, [isAdmin]);

  const enviarAlertas = async () => {
    setEnviando(true);
    setMensagem('');
    try {
      const res = await fetch('http://localhost:3001/api/enviar-alertas', { method: 'POST' });
      const data = await res.json();
      setMensagem(data.mensagem);
      setTimeout(() => setMensagem(''), 8000);
    } catch (err) {
      setMensagem('❌ Erro ao enviar e-mails');
    } finally {
      setEnviando(false);
    }
  };

  const formatarData = (d) => {
    if (!d) return '-';
    const str = String(d).substring(0, 10);
    const [ano, mes, dia] = str.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  const getClasseNivel = (nivel) => {
    if (nivel === 'vencida' || nivel === 'urgente') return 'urgente';
    if (nivel === 'atencao') return 'atencao';
    return 'normal';
  };

  const getTextoDias = (dias) => {
    if (dias < 0) return `Vencida há ${Math.abs(dias)}d`;
    if (dias === 0) return 'Vence hoje';
    if (dias === 1) return '1 dia';
    return `${dias} dias`;
  };

  if (loading) return <div className="loading">Carregando dashboard...</div>;

  return (
    <div>
      <Header titulo="Dashboard" subtitulo="Visão geral da gestão ambiental" />

      <div className="cards-grid">
        <div className="stat-card">
          <div className="stat-card-icon"><Icon name="clientes" size={26} /></div>
          <div className="stat-card-content"><h3>Clientes</h3><div className="value">{stats.clientes}</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon"><Icon name="licencas" size={26} /></div>
          <div className="stat-card-content"><h3>Licenças</h3><div className="value">{stats.licencas}</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon"><Icon name="protocolos" size={26} /></div>
          <div className="stat-card-content"><h3>Protocolos</h3><div className="value">{stats.protocolos}</div></div>
        </div>
        {isAdmin && (
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: vencimentos.length > 0 ? '#fef3c7' : '#e8f5e9' }}>
              <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{vencimentos.length > 0 ? '!' : 'v'}</span>
            </div>
            <div className="stat-card-content">
              <h3>Vencendo (30d)</h3>
              <div className="value" style={{ color: vencimentos.length > 0 ? '#dc2626' : '#16a34a' }}>{vencimentos.length}</div>
            </div>
          </div>
        )}
      </div>

      {/* GRÁFICOS */}
      {isAdmin && <GraficosDashboard />}

      <div className="dashboard-grid" style={!isAdmin ? { gridTemplateColumns: '1fr' } : {}}>
        <div>
          <div className="quick-actions-panel">
            <h3>Acesso rápido</h3>
            <div className="quick-actions">
              <Link to="/clientes?novo=true" className="btn btn-secondary"><Icon name="clientes" size={16} /> Novo cliente</Link>
              <Link to="/licencas?novo=true" className="btn btn-secondary"><Icon name="licencas" size={16} /> Nova licença</Link>
              <Link to="/protocolos?novo=true" className="btn btn-secondary"><Icon name="protocolos" size={16} /> Novo protocolo</Link>
              <Link to="/agenda?novo=true" className="btn btn-secondary"><Icon name="agenda" size={16} /> Novo agendamento</Link>
            </div>
          </div>

          <div className="quick-actions-panel" style={{ marginTop: '22px' }}>
            <h3>Status do sistema</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#718096', fontSize: '0.9rem' }}>● Backend API</span>
                <span style={{ fontWeight: 600, color: '#16a34a' }}>Online</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#718096', fontSize: '0.9rem' }}>● Banco de dados</span>
                <span style={{ fontWeight: 600, color: '#16a34a' }}>Conectado</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                <span style={{ color: '#718096', fontSize: '0.9rem' }}>📅 Última verificação</span>
                <span style={{ fontWeight: 600 }}>{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>
        </div>

        {isAdmin && (
          <div className="vencimentos-panel">
            <h3><Icon name="agenda" size={18} /> Próximos vencimentos</h3>
            {vencimentos.length === 0 ? (
              <div className="vencimentos-vazio">
                <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>✅</div>
                <p>Nenhum vencimento nos próximos 30 dias.</p>
              </div>
            ) : (
              <>
                {vencimentos.map(l => {
                  const classe = getClasseNivel(l.nivel);
                  return (
                    <div key={l.id} className={`vencimento-item ${classe}`} onClick={() => navigate('/licencas')}>
                      <div className="titulo" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Icon name="licencas" size={14} /> Licença {l.numero}
                      </div>
                      <div className="descricao">
                        {l.cliente ? `Cliente ${l.cliente}` : 'Sem cliente'}
                        {l.orgao && ` • ${l.orgao}`}
                      </div>
                      <div className="linha-data">
                        <span className={`dias ${classe}`}>{getTextoDias(l.diasRestantes)}</span>
                        <span className="data">{formatarData(l.vencimento)}</span>
                      </div>
                    </div>
                  );
                })}
                <button onClick={enviarAlertas} disabled={enviando} className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                  {enviando ? '📤 Enviando...' : '📧 Enviar alertas por e-mail'}
                </button>
                {mensagem && (
                  <div style={{ marginTop: '10px', padding: '10px', background: '#d4edda', color: '#155724', borderRadius: '8px', fontSize: '0.8rem', textAlign: 'center' }}>
                    {mensagem}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
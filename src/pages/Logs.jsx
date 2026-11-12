import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    async function carregar() {
      try {
        console.log('🔍 Buscando logs...');
        const data = await api.logs.listar();
        console.log('✅ Logs recebidos:', data);
        setLogs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('❌ Erro:', err);
        setErro('Não foi possível carregar os logs.');
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, []);

  const formatarData = (d) => {
    if (!d) return '-';
    return new Date(d).toLocaleString('pt-BR');
  };

  const getCorAcao = (acao) => {
    if (acao === 'Criou') return 'status-normal';
    if (acao === 'Editou') return 'status-atencao';
    if (acao === 'Excluiu') return 'status-urgente';
    return 'status-normal';
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#718096' }}>
        Carregando logs...
      </div>
    );
  }

  if (erro) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#dc2626' }}>
        {erro}
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-titles">
          <h1>Logs do Sistema</h1>
          <p className="subtitulo">Histórico de ações realizadas.</p>
        </div>
      </div>

      <p style={{ marginBottom: '15px', color: '#718096' }}>
        <strong>{logs.length}</strong> registro(s) encontrado(s).
      </p>

      {logs.length === 0 ? (
        <div className="empty-message">
          Nenhum log registrado ainda. Cadastre, edite ou exclua algo para ver aqui.
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Data / Hora</th>
                <th>Usuário</th>
                <th>Ação</th>
                <th>Módulo</th>
                <th>Detalhes</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id}>
                  <td>{formatarData(log.created_at)}</td>
                  <td><strong>{log.usuario_nome}</strong></td>
                  <td><span className={`status-pill ${getCorAcao(log.acao)}`}>{log.acao}</span></td>
                  <td>{log.modulo}</td>
                  <td>{log.detalhes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
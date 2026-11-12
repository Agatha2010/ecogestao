import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Filler
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { api } from '../services/api';

// Registra os elementos do Chart.js
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Filler
);

export default function GraficosDashboard() {
  const [loading, setLoading] = useState(true);
  const [dados, setDados] = useState({
    licencas: [],
    financeiro: [],
    vencimentos: []
  });

  useEffect(() => {
    async function carregar() {
      try {
        const [licencas, financeiro, vencimentos] = await Promise.all([
          api.licencas.listar(),
          api.financeiro.listar(),
          fetch('http://localhost:3001/api/vencimentos?dias=180').then(r => r.json())
        ]);
        setDados({ licencas, financeiro, vencimentos });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, []);

  if (loading) {
    return (
      <div className="panel">
        <div className="loading">Carregando gráficos...</div>
      </div>
    );
  }

  // ============ GRÁFICO 1: PIZZA (STATUS DAS LICENÇAS) ============
  const statusLicencas = {
    ativas: dados.licencas.filter(l => l.status === 'Ativo').length,
    vencidas: dados.licencas.filter(l => l.status === 'Vencido').length,
    renovacao: dados.licencas.filter(l => l.status === 'Em Renovação').length,
    inativas: dados.licencas.filter(l => l.status === 'Inativo').length
  };

  const dadosPizza = {
    labels: ['Ativas', 'Vencidas', 'Em Renovação', 'Inativas'],
    datasets: [
      {
        data: [statusLicencas.ativas, statusLicencas.vencidas, statusLicencas.renovacao, statusLicencas.inativas],
        backgroundColor: ['#16a34a', '#dc2626', '#f59e0b', '#64748b'],
        borderWidth: 0,
        hoverOffset: 8
      }
    ]
  };

  const opcoesPizza = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { padding: 15, font: { size: 11 }, color: '#718096' }
      }
    }
  };

  // ============ GRÁFICO 2: BARRAS (RECEITAS VS DESPESAS) ============
  const totalReceitas = dados.financeiro.filter(f => f.tipo === 'Receita').reduce((s, f) => s + Number(f.valor), 0);
  const totalDespesas = dados.financeiro.filter(f => f.tipo === 'Despesa').reduce((s, f) => s + Number(f.valor), 0);

  const dadosBarras = {
    labels: ['Receitas', 'Despesas', 'Saldo'],
    datasets: [
      {
        label: 'R$',
        data: [totalReceitas, totalDespesas, totalReceitas - totalDespesas],
        backgroundColor: ['#16a34a', '#dc2626', '#1e5631'],
        borderRadius: 8,
        barThickness: 50
      }
    ]
  };

  const opcoesBarras = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `R$ ${Number(ctx.raw).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#718096',
          callback: (v) => `R$ ${Number(v).toLocaleString('pt-BR')}`
        },
        grid: { color: '#f1f5f9' }
      },
      x: { ticks: { color: '#718096' }, grid: { display: false } }
    }
  };

  // ============ GRÁFICO 3: LINHA (VENCIMENTOS NOS PRÓXIMOS 6 MESES) ============
  const meses = [];
  const contagens = [];
  const hoje = new Date();

  for (let i = 0; i < 6; i++) {
    const data = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1);
    const nomeMes = data.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
    meses.push(nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1));

    const qtd = dados.vencimentos.filter(v => {
      if (!v.vencimento) return false;
      const vDate = new Date(v.vencimento);
      return vDate.getMonth() === data.getMonth() && vDate.getFullYear() === data.getFullYear();
    }).length;
    contagens.push(qtd);
  }

  const dadosLinha = {
    labels: meses,
    datasets: [
      {
        label: 'Licenças vencendo',
        data: contagens,
        borderColor: '#1e5631',
        backgroundColor: 'rgba(30, 86, 49, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#16a34a',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
      }
    ]
  };

  const opcoesLinha = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.raw} licença(s)`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: '#718096', stepSize: 1 },
        grid: { color: '#f1f5f9' }
      },
      x: { ticks: { color: '#718096' }, grid: { display: false } }
    }
  };

  return (
    <div>
      <div className="panel" style={{ marginBottom: '22px' }}>
        <div className="panel-header">
          <h3>📊 Visão Geral</h3>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '22px'
        }}>
          <div style={{ height: '280px', display: 'flex', flexDirection: 'column' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#4a5568', marginBottom: '10px', textAlign: 'center' }}>
              Status das Licenças
            </h4>
            <div style={{ flex: 1, position: 'relative' }}>
              <Doughnut data={dadosPizza} options={opcoesPizza} />
            </div>
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '22px',
        marginBottom: '22px'
      }}>
        <div className="panel">
          <div className="panel-header">
            <h3>💰 Receitas vs Despesas</h3>
          </div>
          <div style={{ height: '280px' }}>
            <Bar data={dadosBarras} options={opcoesBarras} />
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>📅 Vencimentos Futuros (6 meses)</h3>
          </div>
          <div style={{ height: '280px' }}>
            <Line data={dadosLinha} options={opcoesLinha} />
          </div>
        </div>
      </div>
    </div>
  );
}
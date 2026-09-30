import React from 'react';
import { NavLink } from 'react-router-dom';

import {
  Users,
  FileCheck,
  ClipboardList,
  Wallet,
  Plus,
  ArrowUpRight,
  Clock,
  CalendarDays,
  Leaf
} from 'lucide-react';

import Stat from '../components/Stat';
import Status from '../components/Status';

export default function Dashboard({ data, add }) {
  const count = (key) => (data[key] || []).length;

  return (
    <>
      <div className="welcome">
        <div>
          <div className="eyebrow">
            <span />
            PAINEL DE CONTROLE
          </div>

          <h1>
            Bom dia! <span>🌿</span>
          </h1>

          <p>
            Acompanhe a operação ambiental da sua
            consultoria em um só lugar.
          </p>
        </div>

        <button
          className="primary"
          onClick={() => add('Clientes')}
        >
          <Plus size={17} />
          Novo cliente
        </button>
      </div>

      <div className="stats">
        <Stat
          title="Clientes cadastrados"
          value={count('Clientes')}
          note="Base de clientes"
          icon={Users}
        />

        <Stat
          title="Licenças registradas"
          value={count('Licenças')}
          note="Acompanhe os prazos"
          icon={FileCheck}
        />

        <Stat
          title="Protocolos ativos"
          value={count('Protocolos')}
          note="Em acompanhamento"
          icon={ClipboardList}
        />

        <Stat
          title="A receber"
          value="R$ 7.300"
          note="Valores demonstrativos"
          icon={Wallet}
        />
      </div>

      <div className="dash-grid">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Licenças e vencimentos</h2>
              <p>Registros que precisam de atenção</p>
            </div>

            <NavLink to="/licencas">
              Ver todas
              <ArrowUpRight size={15} />
            </NavLink>
          </div>

          {(data.Licenças || [])
            .slice(0, 3)
            .map((item, index) => (
              <div className="record" key={index}>
                <div className="record-icon">
                  <FileCheck size={18} />
                </div>

                <div className="record-main">
                  <b>{item.nome}</b>
                  <small>{item.sub}</small>
                </div>

                <Status value={item.status} />
              </div>
            ))}

          <div className="panel-foot">
            <Clock size={15} />
            Confira as datas de vencimento nos detalhes
            de cada licença.
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Ações rápidas</h2>
              <p>Atalhos para sua rotina</p>
            </div>
          </div>

          <div className="quick">
            {[
              ['Cadastrar cliente', 'Clientes', Users],
              ['Adicionar licença', 'Licenças', FileCheck],
              ['Novo protocolo', 'Protocolos', ClipboardList],
              ['Agendar compromisso', 'Agenda', CalendarDays]
            ].map(([title, key, Icon]) => (
              <button
                onClick={() => add(key)}
                key={title}
              >
                <span>
                  <Icon size={18} />
                </span>

                <b>{title}</b>
                <Plus size={16} />
              </button>
            ))}
          </div>

          <div className="green-note">
            <Leaf size={18} />

            <span>
              <b>Gestão consciente</b>
              <small>
                Seus processos organizados ajudam a
                cuidar do meio ambiente.
              </small>
            </span>
          </div>
        </section>
      </div>

      <section className="panel recent">
        <div className="panel-head">
          <div>
            <h2>Atividade recente</h2>
            <p>Últimos registros cadastrados</p>
          </div>
        </div>

        {(data.Clientes || [])
          .slice(0, 3)
          .map((item, index) => (
            <div className="record" key={index}>
              <div className="record-icon">
                <Users size={18} />
              </div>

              <div className="record-main">
                <b>{item.nome}</b>
                <small>Cliente · Registro disponível</small>
              </div>

              <span className="muted">
                Recentemente
              </span>
            </div>
          ))}
      </section>
    </>
  );
}
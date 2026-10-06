import React, { useState } from 'react';

export default function Configuracoes() {
  const [config, setConfig] = useState({
    nomeEmpresa: 'EcoGestão',
    email: 'contato@ecogestao.com',
    telefone: '(00) 0000-0000',
    notificacoesVencimento: true,
    diasAntecedencia: 30
  });
  const [salvo, setSalvo] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig({ ...config, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('ecogestao_config', JSON.stringify(config));
    setSalvo(true);
    setTimeout(() => setSalvo(false), 3000);
  };

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
            <input name="nomeEmpresa" value={config.nomeEmpresa} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>E-mail</label>
            <input type="email" name="email" value={config.email} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Telefone</label>
            <input name="telefone" value={config.telefone} onChange={handleChange} />
          </div>
        </div>
      </form>

      <form className="form-card" onSubmit={handleSubmit}>
        <h3>Notificações</h3>
        <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
          <input
            type="checkbox"
            id="notif"
            name="notificacoesVencimento"
            checked={config.notificacoesVencimento}
            onChange={handleChange}
            style={{ width: 'auto' }}
          />
          <label htmlFor="notif" style={{ margin: 0 }}>Receber notificações de vencimento de licenças</label>
        </div>

        <div className="form-group" style={{ maxWidth: '300px' }}>
          <label>Dias de antecedência para alertar</label>
          <input
            type="number"
            name="diasAntecedencia"
            value={config.diasAntecedencia}
            onChange={handleChange}
            min="1"
            max="90"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-success">Salvar configurações</button>
          {salvo && <span style={{ color: '#16a34a', alignSelf: 'center', fontWeight: 600 }}>✅ Salvo!</span>}
        </div>
      </form>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function Perfil() {
  const { usuarioAtual, fazerLogin } = useAuth();
  
  // Estado dos dados do perfil
  const [form, setForm] = useState({
    nome: '', email: '', cpf: '', cargo: '', telefone: ''
  });
  
  // Estado da senha
  const [senhas, setSenhas] = useState({
    senhaAtual: '', novaSenha: '', confirmarSenha: ''
  });
  const [erroSenha, setErroSenha] = useState('');
  const [sucessoSenha, setSucessoSenha] = useState('');
  const [salvandoSenha, setSalvandoSenha] = useState(false);

  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (usuarioAtual) {
      setForm({
        nome: usuarioAtual.nome || '',
        email: usuarioAtual.email || '',
        cpf: usuarioAtual.cpf || '',
        cargo: usuarioAtual.cargo || '',
        telefone: usuarioAtual.telefone || ''
      });
      setLoading(false);
    }
  }, [usuarioAtual]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const salvar = async (e) => {
    e.preventDefault();
    setSalvando(true);
    try {
      await api.usuarios.atualizar(usuarioAtual.id, form);
      fazerLogin({ ...usuarioAtual, ...form }, JSON.parse(localStorage.getItem('permissoes_usuario')));
      setEditando(false);
      alert('Perfil atualizado com sucesso!');
    } catch (e) {
      console.error(e);
      alert('Erro ao salvar perfil.');
    } finally {
      setSalvando(false);
    }
  };

  // Função para trocar a senha
  const handleSenhaSubmit = async (e) => {
    e.preventDefault();
    setErroSenha('');
    setSucessoSenha('');

    if (senhas.novaSenha !== senhas.confirmarSenha) {
      setErroSenha('A nova senha e a confirmação não coincidem.');
      return;
    }

    if (senhas.novaSenha.length < 6) {
      setErroSenha('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setSalvandoSenha(true);
    try {
      const data = await api.usuarios.alterarSenha(
        usuarioAtual.id,
        senhas.senhaAtual,
        senhas.novaSenha
      );

      if (data.mensagem === 'Senha alterada com sucesso!') {
        setSucessoSenha('Senha alterada com sucesso!');
        setSenhas({ senhaAtual: '', novaSenha: '', confirmarSenha: '' });
        setTimeout(() => setSucessoSenha(''), 4000);
      } else {
        setErroSenha(data.mensagem || 'Erro ao alterar senha.');
      }
    } catch (err) {
      console.error(err);
      setErroSenha('Erro ao conectar com o servidor.');
    } finally {
      setSalvandoSenha(false);
    }
  };

  if (loading) return <div className="loading">Carregando perfil...</div>;
  if (!usuarioAtual) return <div className="empty-message">Nenhum usuário logado.</div>;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-titles">
          <h1>Meu Perfil</h1>
          <p className="subtitulo">Visualize e edite seus dados pessoais.</p>
        </div>
        <button
          className={editando ? 'btn btn-secondary' : 'btn btn-primary'}
          onClick={() => setEditando(!editando)}
        >
          {editando ? 'Cancelar' : 'Editar perfil'}
        </button>
      </div>

      {/* CABEÇALHO DO PERFIL */}
      <div className="panel" style={{ display: 'flex', alignItems: 'center', gap: '25px', marginBottom: '25px' }}>
        <div style={{
          width: '90px', height: '90px', borderRadius: '50%',
          background: 'var(--verde-escuro)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2rem', fontWeight: 700
        }}>
          {usuarioAtual.nome?.charAt(0).toUpperCase() || '?'}
        </div>
        <div>
          <h2 style={{ fontSize: '1.4rem', color: '#1a202c', marginBottom: '4px' }}>{usuarioAtual.nome}</h2>
          <p style={{ color: '#718096', fontSize: '0.9rem' }}>{usuarioAtual.cargo || 'Usuário'}</p>
          <p style={{ color: '#718096', fontSize: '0.85rem' }}>{usuarioAtual.email}</p>
        </div>
      </div>

      {/* CARD DE DADOS PESSOAIS */}
      <form className="form-card" onSubmit={salvar}>
        <h3>Informações do Perfil</h3>
        <div className="form-grid">
          <div className="form-group"><label>Nome</label><input name="nome" value={form.nome} onChange={handleChange} disabled={!editando} /></div>
          <div className="form-group"><label>Email</label><input type="email" name="email" value={form.email} onChange={handleChange} disabled={!editando} /></div>
          <div className="form-group"><label>CPF</label><input name="cpf" value={form.cpf} onChange={handleChange} disabled={!editando} /></div>
          <div className="form-group"><label>Cargo</label><input name="cargo" value={form.cargo} onChange={handleChange} disabled={!editando} /></div>
          <div className="form-group"><label>Telefone</label><input name="telefone" value={form.telefone} onChange={handleChange} disabled={!editando} /></div>
        </div>
        {editando && (
          <div className="form-actions">
            <button type="submit" className="btn btn-success" disabled={salvando}>
              {salvando ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        )}
      </form>

      {/* CARD DE ALTERAR SENHA */}
      <form className="form-card" onSubmit={handleSenhaSubmit} style={{ marginTop: '25px' }}>
        <h3>🔒 Alterar Senha</h3>
        <p style={{ color: '#718096', fontSize: '0.85rem', marginBottom: '20px' }}>
          Use uma senha forte com pelo menos 6 caracteres.
        </p>

        {erroSenha && (
          <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '0.85rem' }}>
            {erroSenha}
          </div>
        )}
        {sucessoSenha && (
          <div style={{ background: '#d4edda', color: '#155724', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '0.85rem' }}>
            ✅ {sucessoSenha}
          </div>
        )}

        <div className="form-grid">
          <div className="form-group">
            <label>Senha atual</label>
            <input
              type="password"
              value={senhas.senhaAtual}
              onChange={(e) => setSenhas({ ...senhas, senhaAtual: e.target.value })}
              required
              placeholder="Digite sua senha atual"
            />
          </div>

          <div className="form-group">
            <label>Nova senha</label>
            <input
              type="password"
              value={senhas.novaSenha}
              onChange={(e) => setSenhas({ ...senhas, novaSenha: e.target.value })}
              required
              placeholder="Digite a nova senha"
            />
          </div>

          <div className="form-group">
            <label>Confirmar nova senha</label>
            <input
              type="password"
              value={senhas.confirmarSenha}
              onChange={(e) => setSenhas({ ...senhas, confirmarSenha: e.target.value })}
              required
              placeholder="Repita a nova senha"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-success" disabled={salvandoSenha}>
            {salvandoSenha ? 'Alterando...' : 'Alterar senha'}
          </button>
        </div>
      </form>
    </div>
  );
}
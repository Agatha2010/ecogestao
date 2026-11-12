import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Listing from './pages/Listing';
import Licencas from './pages/Licencas';
import Protocolos from './pages/Protocolos';
import Agenda from './pages/Agenda';
import Financeiro from './pages/Financeiro';
import Oficios from './pages/Oficios';
import Analises from './pages/Analises';
import Especies from './pages/Especies';
import Configuracoes from './pages/Configuracoes';
import Usuarios from './pages/Usuarios';
import Perfil from './pages/Perfil';
import Login from './pages/Login';
import './styles/global.css';
import Logs from './pages/Logs';


function RotaProtegida({ children }) {
  const { usuarioAtual, loading } = useAuth();
  
  if (loading) return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>Carregando...</div>;
  
  if (!usuarioAtual) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

export default function App() {
  const { usuarioAtual } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Rota pública */}
        <Route path="/login" element={
          usuarioAtual ? <Navigate to="/" replace /> : <Login />
        } />

        {/* Rotas protegidas */}
        <Route path="/*" element={
          <RotaProtegida>
            <div className="app-layout">
              <Sidebar />
              <main className="main-content">
                <Routes>
                 <Route path="/logs" element={<Logs />} />
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/clientes" element={<Listing />} />
                  <Route path="/licencas" element={<Licencas />} />
                  <Route path="/protocolos" element={<Protocolos />} />
                  <Route path="/oficios" element={<Oficios />} />
                  <Route path="/analises" element={<Analises />} />
                  <Route path="/especies" element={<Especies />} />
                  <Route path="/agenda" element={<Agenda />} />
                  <Route path="/financeiro" element={<Financeiro />} />
                  <Route path="/configuracoes" element={<Configuracoes />} />
                  <Route path="/usuarios" element={<Usuarios />} />
                  <Route path="/perfil" element={<Perfil />} />
                </Routes>
              </main>
            </div>
          </RotaProtegida>
        } />
      </Routes>
    </BrowserRouter>
  );
}
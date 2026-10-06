import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import './styles/global.css';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
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
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
import React from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { ModuleCard } from '../components/ModuleCard';
import { StatusWidget } from '../components/StatusWidget';
import { RecentProjects } from '../components/RecentProjects';
import { PixelOverlay } from '../components/PixelOverlay';

export const Dashboard: React.FC = () => {
  const { modules } = useAppStore();

  return (
    <div className="web-classic-container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <a href="/" className="logo">Son1kVerse</a>
          <nav>
            <ul className="nav-links">
              <li><a href="/dashboard" className="nav-link">Dashboard</a></li>
              <li><a href="/projects" className="nav-link">Proyectos</a></li>
              <li><a href="/settings" className="nav-link">Configuración</a></li>
            </ul>
          </nav>
          <button className="nexus-activate-btn">
            Activar Nexus
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-cyan mb-2">
              Bienvenido al Son1kVerse
            </h1>
            <p className="text-accent text-lg">
              Tu centro de control para creación musical con IA, clonación de voz y automatización social
            </p>
          </motion.div>

          {/* Widgets Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <StatusWidget />
            <RecentProjects />
          </div>

          {/* Modules Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-cyan mb-6">
              Módulos Disponibles
            </h2>
            <div className="dashboard-grid">
              {modules.map((module, index) => (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <ModuleCard module={module} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      {/* Pixel AI Overlay */}
      <PixelOverlay />
    </div>
  );
};
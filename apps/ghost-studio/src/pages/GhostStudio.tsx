import React from 'react';
import { motion } from 'framer-motion';
import { useGhostStore } from '../store/useGhostStore';
import { MusicGenerator } from '../components/MusicGenerator';
import { VoiceCloner } from '../components/VoiceCloner';
import { TextToSpeech } from '../components/TextToSpeech';
import { GenerationHistory } from '../components/GenerationHistory';
import { AISuggestions } from '../components/AISuggestions';
import { MiniDAW } from '../components/MiniDAW';
import { GhostStudioPremium } from '../components/GhostStudioPremium';
import '../components/MiniDAW.css';
import '../components/GhostStudioCovers.css';
import '../components/GhostStudioPremium.css';

export const GhostStudio: React.FC = () => {
  const { activeTab, setActiveTab } = useGhostStore();

  const tabs = [
    { id: 'covers', label: 'Arreglos IA', icon: '', component: GhostStudioPremium },
    { id: 'music', label: 'Generar Música', icon: '', component: MusicGenerator },
    { id: 'voice', label: 'Clonar Voz', icon: '', component: VoiceCloner },
    { id: 'tts', label: 'Texto a Voz', icon: '', component: TextToSpeech },
    { id: 'daw', label: 'Mini DAW', icon: '', component: MiniDAW }
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'covers':
        return <GhostStudioPremium />;
      case 'music':
        return <MusicGenerator />;
      case 'voice':
        return <VoiceCloner />;
      case 'tts':
        return <TextToSpeech />;
      case 'daw':
        return <MiniDAW 
          onTrackRecorded={(track) => {
            console.log('Track recorded:', track);
            // Here you could integrate with the AI processing
          }}
          onTrackProcessed={(trackId, processedAudio) => {
            console.log('Track processed:', trackId, processedAudio);
            // Here you could update the track with AI processed audio
          }}
        />;
      default:
        return <GhostStudioPremium />; // Default to premium covers
    }
  };

  return (
    <div className="daw-container">
      {/* Header */}
      <header className="daw-header">
        <div className="daw-header-content">
          <a href="/" className="daw-logo">
            <span className="logo-icon">🎛️</span>
            <span className="logo-text">Ghost Studio</span>
            <span className="logo-subtitle">Democratización Musical</span>
          </a>
          <nav>
            <ul className="daw-nav">
              <li><a href="/web-classic" className="daw-nav-link">Dashboard</a></li>
              <li><a href="/nexus-visual" className="daw-nav-link">Nexus</a></li>
              <li><a href="/sanctuary-social" className="daw-nav-link">Sanctuary</a></li>
              <li><a href="/nova-post-pilot" className="daw-nav-link">Nova</a></li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="daw-main">
        {/* Left Sidebar */}
        <aside className="daw-sidebar">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-cyan mb-4">Herramientas Profesionales</h2>
            <div className="daw-tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`daw-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id as any)}
                >
                  <span className="mr-2"></span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <AISuggestions />
        </aside>

        {/* Main Content Area */}
        <section className="daw-content">
          {renderActiveTab()}
        </section>

        {/* Right Panel */}
        <aside className="daw-panel">
          <GenerationHistory />
        </aside>
      </main>
    </div>
  );
};
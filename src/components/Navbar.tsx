import React from 'react';
import { LineChart, Sliders, BookOpen, Award, Sparkles, RefreshCw } from 'lucide-react';

interface NavbarProps {
  activeTab: 'studio' | 'transform' | 'theory' | 'quiz';
  setActiveTab: (tab: 'studio' | 'transform' | 'theory' | 'quiz') => void;
  onResetAll: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onResetAll }) => {
  return (
    <header className="navbar-wrapper">
      <nav className="navbar-container">
        {/* Brand Logo */}
        <div className="navbar-brand" onClick={() => setActiveTab('studio')} style={{ cursor: 'pointer' }}>
          <div className="brand-icon-box">
            <LineChart size={20} className="brand-icon" />
          </div>
          <div className="brand-text-block">
            <div className="brand-title">
              Calcula<span className="brand-gradient">Graph</span>
            </div>
            <div className="brand-subtitle">Calculus Visual Studio</div>
          </div>
        </div>

        {/* Center Floating Navigation Pills */}
        <div className="navbar-links">
          <button
            onClick={() => setActiveTab('studio')}
            className={`nav-pill ${activeTab === 'studio' ? 'active' : ''}`}
          >
            <LineChart size={15} />
            <span>Studio Grafik</span>
          </button>

          <button
            onClick={() => setActiveTab('transform')}
            className={`nav-pill ${activeTab === 'transform' ? 'active' : ''}`}
          >
            <Sliders size={15} />
            <span>Transformasi</span>
          </button>

          <button
            onClick={() => setActiveTab('theory')}
            className={`nav-pill ${activeTab === 'theory' ? 'active' : ''}`}
          >
            <BookOpen size={15} />
            <span>Modul Teori</span>
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`nav-pill ${activeTab === 'quiz' ? 'active' : ''}`}
          >
            <Award size={15} />
            <span>Kuis & Latihan</span>
          </button>
        </div>

        {/* Right Action */}
        <div className="navbar-actions">
          <div className="curriculum-badge">
            <Sparkles size={12} className="text-cyan" />
            <span>Materi Fungsi & Grafik</span>
          </div>

          <button onClick={onResetAll} className="nav-action-btn" title="Kembalikan Tampilan Awal">
            <RefreshCw size={14} />
            <span className="btn-label">Reset</span>
          </button>
        </div>
      </nav>
    </header>
  );
};

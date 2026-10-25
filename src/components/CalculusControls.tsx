import React from 'react';
import { TangentConfig, RiemannConfig } from '../types/calculus';
import { KatexMath } from './KatexMath';
import { Activity, Sliders, Layers, Compass, HelpCircle } from 'lucide-react';

interface CalculusControlsProps {
  showDerivative1: boolean;
  setShowDerivative1: (val: boolean) => void;
  showDerivative2: boolean;
  setShowDerivative2: (val: boolean) => void;
  tangentConfig: TangentConfig;
  setTangentConfig: React.Dispatch<React.SetStateAction<TangentConfig>>;
  riemannConfig: RiemannConfig;
  setRiemannConfig: React.Dispatch<React.SetStateAction<RiemannConfig>>;
  tangentSlope?: number;
  tangentEquation?: string;
  riemannArea?: number;
  exactIntegral?: number;
}

export const CalculusControls: React.FC<CalculusControlsProps> = ({
  showDerivative1,
  setShowDerivative1,
  showDerivative2,
  setShowDerivative2,
  tangentConfig,
  setTangentConfig,
  riemannConfig,
  setRiemannConfig,
  tangentSlope,
  tangentEquation,
  riemannArea,
  exactIntegral,
}) => {
  return (
    <div className="calculus-controls-container">
      {/* 1. DERIVATIVE OVERLAYS */}
      <div className="control-section-card">
        <div className="section-title">
          <Activity size={16} className="text-amber" />
          <span>Kurva Turunan (Derivatives)</span>
        </div>

        <div className="toggle-group">
          <label className={`toggle-pill ${showDerivative1 ? 'active amber' : ''}`}>
            <input
              type="checkbox"
              checked={showDerivative1}
              onChange={(e) => setShowDerivative1(e.target.checked)}
            />
            <span className="toggle-indicator"></span>
            <div className="toggle-text">
              <span className="toggle-heading">Turunan Pertama f'(x)</span>
              <span className="toggle-sub">Gradien kemiringan garis singgung</span>
            </div>
          </label>

          <label className={`toggle-pill ${showDerivative2 ? 'active purple' : ''}`}>
            <input
              type="checkbox"
              checked={showDerivative2}
              onChange={(e) => setShowDerivative2(e.target.checked)}
            />
            <span className="toggle-indicator"></span>
            <div className="toggle-text">
              <span className="toggle-heading">Turunan Kedua f''(x)</span>
              <span className="toggle-sub">Analisis kecekungan kurva (concavity)</span>
            </div>
          </label>
        </div>
      </div>

      {/* 2. TANGENT & SECANT LINE SIMULATOR */}
      <div className="control-section-card">
        <div className="section-title-between">
          <div className="section-title">
            <Compass size={16} className="text-pink" />
            <span>Garis Singgung & Garis Potong</span>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={tangentConfig.enabled}
              onChange={(e) => setTangentConfig((prev) => ({ ...prev, enabled: e.target.checked }))}
            />
            <span className="slider round"></span>
          </label>
        </div>

        {tangentConfig.enabled && (
          <div className="section-body">
            {/* Tangent Point Slider */}
            <div className="slider-control">
              <div className="slider-label-row">
                <span>Titik Singgung x₀:</span>
                <span className="slider-value mono">{tangentConfig.x0.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="-6"
                max="6"
                step="0.05"
                value={tangentConfig.x0}
                onChange={(e) =>
                  setTangentConfig((prev) => ({ ...prev, x0: parseFloat(e.target.value) }))
                }
                className="range-slider pink"
              />
            </div>

            {/* Live Tangent Slope & Equation */}
            <div className="readout-box">
              <div className="readout-item">
                <span className="readout-label">Kemiringan (m = f'(x₀)):</span>
                <span className="readout-val text-pink mono">
                  {tangentSlope !== undefined ? (isNaN(tangentSlope) ? 'Undefined' : tangentSlope.toFixed(3)) : '...'}
                </span>
              </div>
              {tangentEquation && (
                <div className="readout-item">
                  <span className="readout-label">Persamaan Garis:</span>
                  <span className="readout-val mono">{tangentEquation}</span>
                </div>
              )}
            </div>

            {/* Secant Line (Difference Quotient) Toggle */}
            <div className="secant-subbox">
              <label className="sub-checkbox">
                <input
                  type="checkbox"
                  checked={tangentConfig.showSecant}
                  onChange={(e) =>
                    setTangentConfig((prev) => ({ ...prev, showSecant: e.target.checked }))
                  }
                />
                <span>Tampilkan Garis Potong (Secant / Selisih Δx)</span>
              </label>

              {tangentConfig.showSecant && (
                <div className="slider-control mt-2">
                  <div className="slider-label-row">
                    <span>Jarak Δx (atau h):</span>
                    <span className="slider-value mono text-emerald">{tangentConfig.deltaX.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="3"
                    step="0.05"
                    value={tangentConfig.deltaX}
                    onChange={(e) =>
                      setTangentConfig((prev) => ({ ...prev, deltaX: parseFloat(e.target.value) }))
                    }
                    className="range-slider emerald"
                  />
                  <div className="hint-text">
                    Geser Δx mendekati 0 untuk mengamati bagaimana Garis Potong berubah menjadi Garis Singgung (Definisi Limit Turunan)!
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3. INTEGRAL & JUMLAH RIEMANN */}
      <div className="control-section-card">
        <div className="section-title-between">
          <div className="section-title">
            <Layers size={16} className="text-cyan" />
            <span>Integral & Jumlah Riemann</span>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={riemannConfig.enabled}
              onChange={(e) => setRiemannConfig((prev) => ({ ...prev, enabled: e.target.checked }))}
            />
            <span className="slider round"></span>
          </label>
        </div>

        {riemannConfig.enabled && (
          <div className="section-body">
            {/* Method Select */}
            <div className="button-group-segment">
              {(['left', 'midpoint', 'right'] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  className={`segment-btn ${riemannConfig.type === method ? 'active' : ''}`}
                  onClick={() => setRiemannConfig((prev) => ({ ...prev, type: method }))}
                >
                  {method === 'left' ? 'Kiri (Left)' : method === 'right' ? 'Kanan (Right)' : 'Titik Tengah (Mid)'}
                </button>
              ))}
            </div>

            {/* Limits a and b */}
            <div className="limits-grid">
              <div className="limit-input-group">
                <label>Batas Bawah (a):</label>
                <input
                  type="number"
                  step="0.5"
                  value={riemannConfig.a}
                  onChange={(e) =>
                    setRiemannConfig((prev) => ({ ...prev, a: parseFloat(e.target.value) || 0 }))
                  }
                  className="limit-input"
                />
              </div>
              <div className="limit-input-group">
                <label>Batas Atas (b):</label>
                <input
                  type="number"
                  step="0.5"
                  value={riemannConfig.b}
                  onChange={(e) =>
                    setRiemannConfig((prev) => ({ ...prev, b: parseFloat(e.target.value) || 0 }))
                  }
                  className="limit-input"
                />
              </div>
            </div>

            {/* Partitions Slider (N) */}
            <div className="slider-control">
              <div className="slider-label-row">
                <span>Jumlah Persegi Panjang (n):</span>
                <span className="slider-value mono text-cyan">{riemannConfig.n}</span>
              </div>
              <input
                type="range"
                min="2"
                max="80"
                step="2"
                value={riemannConfig.n}
                onChange={(e) =>
                  setRiemannConfig((prev) => ({ ...prev, n: parseInt(e.target.value, 10) }))
                }
                className="range-slider cyan"
              />
            </div>

            {/* Integral Result Comparison */}
            <div className="integral-summary-card">
              <div className="summary-stat">
                <span className="stat-title">Jumlah Riemann Lₙ:</span>
                <span className="stat-value mono cyan">
                  {riemannArea !== undefined ? riemannArea.toFixed(4) : '...'}
                </span>
              </div>
              <div className="summary-stat">
                <span className="stat-title">Integral Eksak ∫ₐᵇ f(x)dx:</span>
                <span className="stat-value mono emerald">
                  {exactIntegral !== undefined ? exactIntegral.toFixed(4) : '...'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

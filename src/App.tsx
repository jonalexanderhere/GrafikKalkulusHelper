import React, { useState, useMemo, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { GraphCanvas } from './components/GraphCanvas';
import { FunctionInput } from './components/FunctionInput';
import { CalculusControls } from './components/CalculusControls';
import { FunctionAnalysis } from './components/FunctionAnalysis';
import { TransformationLab } from './components/TransformationLab';
import { TheoryModule } from './components/TheoryModule';
import { QuizModule } from './components/QuizModule';
import { Viewport, TangentConfig, RiemannConfig, PresetFunction, FunctionAnalysisData } from './types/calculus';
import { CalculusEngine } from './utils/mathEngine';
import { PRESET_FUNCTIONS } from './utils/presets';
import { Compass, Sparkles, TrendingUp, Info } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'studio' | 'transform' | 'theory' | 'quiz'>('studio');

  // Core Math State
  const [expression, setExpression] = useState<string>('x^3 - 3*x');
  const [viewport, setViewport] = useState<Viewport>({
    xMin: -5,
    xMax: 5,
    yMin: -5,
    yMax: 5,
  });

  // Calculus Toggles
  const [showDerivative1, setShowDerivative1] = useState<boolean>(true);
  const [showDerivative2, setShowDerivative2] = useState<boolean>(false);

  // Tangent and Secant State
  const [tangentConfig, setTangentConfig] = useState<TangentConfig>({
    enabled: true,
    x0: 1.5,
    showSecant: false,
    deltaX: 0.8,
  });

  // Riemann Integral State
  const [riemannConfig, setRiemannConfig] = useState<RiemannConfig>({
    enabled: false,
    type: 'midpoint',
    n: 14,
    a: -1,
    b: 2,
  });

  // Compute Engine & Analysis
  const { engine, analysis, isValid, errorMessage } = useMemo(() => {
    try {
      const eng = new CalculusEngine(expression);
      // Test evaluation at a few points
      const testVal = eng.f(1);
      if (isNaN(testVal) && isNaN(eng.f(0)) && isNaN(eng.f(-1))) {
        // Might be pure syntax error
        return {
          engine: eng,
          analysis: eng.analyze(viewport),
          isValid: true,
          errorMessage: undefined,
        };
      }
      const data = eng.analyze(viewport);
      return { engine: eng, analysis: data, isValid: true, errorMessage: undefined };
    } catch (err: any) {
      return {
        engine: new CalculusEngine('0'),
        analysis: {
          isValid: false,
          error: 'Format formula tidak valid',
          roots: [],
          extrema: [],
          inflections: [],
          yIntercept: undefined,
          verticalAsymptotes: [],
          horizontalAsymptotes: [],
          parity: 'unknown' as const,
          domainNote: 'Tidak diketahui',
          rangeEstimated: { min: -10, max: 10 },
        } as FunctionAnalysisData,
        isValid: false,
        errorMessage: 'Periksa kembali penulisan tanda kurung atau variabel.',
      };
    }
  }, [expression, viewport]);

  // Tangent Calculations
  const tangentData = useMemo(() => {
    if (!tangentConfig.enabled || !isValid) return null;
    return engine.getTangentLine(tangentConfig.x0);
  }, [engine, tangentConfig.enabled, tangentConfig.x0, isValid]);

  // Riemann Calculations
  const riemannData = useMemo(() => {
    if (!riemannConfig.enabled || !isValid) return null;
    return engine.calculateRiemann(riemannConfig);
  }, [engine, riemannConfig, isValid]);

  // Handlers
  const handleSelectPreset = (preset: PresetFunction) => {
    setExpression(preset.expr);
    if (preset.suggestedViewport) {
      setViewport((prev) => ({ ...prev, ...preset.suggestedViewport }));
    }
    if (preset.suggestedTangentX !== undefined) {
      setTangentConfig((prev) => ({ ...prev, x0: preset.suggestedTangentX! }));
    }
  };

  const handleResetAll = () => {
    setExpression('x^3 - 3*x');
    setViewport({ xMin: -5, xMax: 5, yMin: -5, yMax: 5 });
    setShowDerivative1(true);
    setShowDerivative2(false);
    setTangentConfig({ enabled: true, x0: 1.5, showSecant: false, deltaX: 0.8 });
    setRiemannConfig({ enabled: false, type: 'midpoint', n: 14, a: -1, b: 2 });
  };

  // Critical points combining roots, extrema, inflections, y-intercept
  const allCriticalPoints = useMemo(() => {
    const list = [...analysis.roots, ...analysis.extrema, ...analysis.inflections];
    if (analysis.yIntercept) list.push(analysis.yIntercept);
    return list;
  }, [analysis]);

  return (
    <div className="app-layout">
      {/* Dynamic Background Mesh Orbs */}
      <div className="bg-orb orb-1" />
      <div className="bg-orb orb-2" />

      {/* Floating Header */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} onResetAll={handleResetAll} />

      {/* Main App Content */}
      <main className="main-content">
        {/* TAB 1: STUDIO GRAFIK */}
        {activeTab === 'studio' && (
          <div className="studio-bento-grid">
            {/* Left Column: Massive Canvas Display */}
            <div className="canvas-column">
              <div className="double-bezel-card canvas-card">
                <div className="card-inner">
                  <div className="canvas-header-bar">
                    <div className="header-meta">
                      <span className="live-indicator">
                        <span className="ping-dot"></span>
                        Kanvas Kalkulus Interaktif
                      </span>
                      <span className="viewport-info mono">
                        [{viewport.xMin.toFixed(1)}, {viewport.xMax.toFixed(1)}] × [{viewport.yMin.toFixed(1)}, {viewport.yMax.toFixed(1)}]
                      </span>
                    </div>
                    <div className="canvas-quick-tips">
                      <span className="tip-item">Geser untuk pan</span>
                      <span className="tip-sep">•</span>
                      <span className="tip-item">Scroll untuk zoom</span>
                    </div>
                  </div>

                  <GraphCanvas
                    expression={expression}
                    viewport={viewport}
                    onViewportChange={setViewport}
                    showDerivative1={showDerivative1}
                    showDerivative2={showDerivative2}
                    tangentConfig={tangentConfig}
                    riemannConfig={riemannConfig}
                    criticalPoints={allCriticalPoints}
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Controls & Analysis */}
            <div className="controls-column">
              {/* Formula Input */}
              <div className="double-bezel-card">
                <div className="card-inner">
                  <FunctionInput
                    expression={expression}
                    onExpressionChange={setExpression}
                    onSelectPreset={handleSelectPreset}
                    isValid={isValid}
                    errorMessage={errorMessage}
                    onResetViewport={(vp) => setViewport((prev) => ({ ...prev, ...vp }))}
                  />
                </div>
              </div>

              {/* Calculus Controls (Tangent, Derivatives, Integrals) */}
              <div className="double-bezel-card">
                <div className="card-inner">
                  <CalculusControls
                    showDerivative1={showDerivative1}
                    setShowDerivative1={setShowDerivative1}
                    showDerivative2={showDerivative2}
                    setShowDerivative2={setShowDerivative2}
                    tangentConfig={tangentConfig}
                    setTangentConfig={setTangentConfig}
                    riemannConfig={riemannConfig}
                    setRiemannConfig={setRiemannConfig}
                    tangentSlope={tangentData?.m}
                    tangentEquation={tangentData?.equation}
                    riemannArea={riemannData?.totalArea}
                    exactIntegral={riemannData?.exactIntegral}
                  />
                </div>
              </div>

              {/* Curve Characteristics Analysis */}
              <div className="double-bezel-card">
                <div className="card-inner">
                  <FunctionAnalysis analysis={analysis} expression={expression} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TRANSFORMASI GRAFIK */}
        {activeTab === 'transform' && (
          <div className="transform-layout-grid">
            <div className="canvas-column">
              <div className="double-bezel-card canvas-card">
                <div className="card-inner">
                  <div className="canvas-header-bar">
                    <span className="live-indicator">
                      <span className="ping-dot"></span>
                      Hasil Transformasi Real-time
                    </span>
                    <span className="formula-active-badge mono">f(x) = {expression}</span>
                  </div>
                  <GraphCanvas
                    expression={expression}
                    viewport={viewport}
                    onViewportChange={setViewport}
                    showDerivative1={showDerivative1}
                    showDerivative2={false}
                    tangentConfig={{ enabled: false, x0: 0, showSecant: false, deltaX: 0 }}
                    riemannConfig={{ enabled: false, type: 'midpoint', n: 10, a: 0, b: 1 }}
                    criticalPoints={allCriticalPoints}
                  />
                </div>
              </div>
            </div>

            <div className="controls-column">
              <div className="double-bezel-card">
                <div className="card-inner">
                  <TransformationLab
                    baseExpr={expression}
                    onApplyTransformedExpression={(newExpr) => setExpression(newExpr)}
                  />
                </div>
              </div>

              <div className="double-bezel-card">
                <div className="card-inner">
                  <FunctionAnalysis analysis={analysis} expression={expression} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MODUL TEORI */}
        {activeTab === 'theory' && (
          <div className="theory-layout">
            <div className="double-bezel-card">
              <div className="card-inner">
                <TheoryModule />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: KUIS & LATIHAN */}
        {activeTab === 'quiz' && (
          <div className="quiz-layout">
            <div className="double-bezel-card">
              <div className="card-inner">
                <QuizModule />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-left">
            <span className="footer-logo">CalculaGraph Studio</span>
            <span className="footer-tagline">Visualisasi Kalkulus Tingkat Lanjut: Eksplorasi Fungsi, Turunan, dan Analisis Kurva</span>
          </div>
          <div className="footer-right">
            <span className="footer-badge">Kalkulus I Diferensial & Integral</span>
            <span className="footer-badge">TypeScript + Vite</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default App;

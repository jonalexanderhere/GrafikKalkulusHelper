import React, { useState } from 'react';
import { KatexMath } from './KatexMath';
import { Sliders, RotateCcw, ArrowRight, Eye } from 'lucide-react';

interface TransformationLabProps {
  baseExpr: string;
  onApplyTransformedExpression: (transformedExpr: string) => void;
}

export const TransformationLab: React.FC<TransformationLabProps> = ({
  baseExpr,
  onApplyTransformedExpression,
}) => {
  const [a, setA] = useState<number>(1);
  const [b, setB] = useState<number>(1);
  const [c, setC] = useState<number>(0);
  const [d, setD] = useState<number>(0);

  // Generate transformed expression
  const generateFormula = (aV: number, bV: number, cV: number, dV: number): string => {
    // Inner term for x
    let innerX = 'x';
    if (cV > 0) innerX = `(x - ${cV})`;
    else if (cV < 0) innerX = `(x + ${Math.abs(cV)})`;

    if (bV !== 1) {
      innerX = `${bV}*${innerX}`;
    }

    // Substitute into baseExpr if simple or wrap
    // Let's create an explicit formula wrapper
    // For standard functions like x^2, sin(x), x^3, etc.
    let transformed = '';
    if (baseExpr === 'x^2') {
      transformed = `${innerX}^2`;
    } else if (baseExpr === 'x^3') {
      transformed = `${innerX}^3`;
    } else if (baseExpr === 'sin(x)') {
      transformed = `sin(${innerX})`;
    } else if (baseExpr === 'cos(x)') {
      transformed = `cos(${innerX})`;
    } else if (baseExpr === '1 / x') {
      transformed = `1 / (${innerX})`;
    } else if (baseExpr === 'exp(x)') {
      transformed = `exp(${innerX})`;
    } else {
      // General replacement: replace whole standalone 'x' with innerX
      const replaced = baseExpr.replace(/\bx\b/g, `(${innerX})`);
      transformed = replaced;
    }

    if (aV !== 1) {
      if (aV === -1) transformed = `-(${transformed})`;
      else transformed = `${aV} * (${transformed})`;
    }

    if (dV > 0) transformed = `${transformed} + ${dV}`;
    else if (dV < 0) transformed = `${transformed} - ${Math.abs(dV)}`;

    return transformed;
  };

  const handleApply = () => {
    const expr = generateFormula(a, b, c, d);
    onApplyTransformedExpression(expr);
  };

  const resetDefaults = () => {
    setA(1);
    setB(1);
    setC(0);
    setD(0);
    onApplyTransformedExpression(baseExpr);
  };

  return (
    <div className="transformation-card">
      <div className="trans-header">
        <div className="card-badge">
          <Sliders size={14} className="text-cyan" />
          <span>Laboratorium Transformasi Geometris Grafik</span>
        </div>
        <button onClick={resetDefaults} className="reset-mini-btn" title="Reset parameter ke default">
          <RotateCcw size={13} />
          <span>Reset</span>
        </button>
      </div>

      <div className="trans-formula-hero">
        <KatexMath math="g(x) = a \cdot f\big(b(x - c)\big) + d" block />
      </div>

      <div className="trans-sliders-grid">
        {/* Slider A */}
        <div className="trans-slider-box">
          <div className="slider-header">
            <span className="param-tag cyan">a = {a}</span>
            <span className="param-desc">Peregangan Vertikal & Refleksi X</span>
          </div>
          <input
            type="range"
            min="-3"
            max="3"
            step="0.5"
            value={a}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setA(val);
              onApplyTransformedExpression(generateFormula(val, b, c, d));
            }}
            className="range-slider cyan"
          />
          <div className="slider-sub-note">
            {a < 0 ? 'Kurva terbalik (refleksi horizontal)' : Math.abs(a) > 1 ? 'Kurva meregang vertikal' : 'Normal / Terkompresi'}
          </div>
        </div>

        {/* Slider B */}
        <div className="trans-slider-box">
          <div className="slider-header">
            <span className="param-tag emerald">b = {b}</span>
            <span className="param-desc">Kompresi Horisontal & Frekuensi</span>
          </div>
          <input
            type="range"
            min="-3"
            max="3"
            step="0.5"
            value={b}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (val === 0) return; // avoid 0
              setB(val);
              onApplyTransformedExpression(generateFormula(a, val, c, d));
            }}
            className="range-slider emerald"
          />
          <div className="slider-sub-note">
            {b !== 1 ? `Periode / skala sumbu X berubah faktor 1/|${b}|` : 'Skala standar'}
          </div>
        </div>

        {/* Slider C */}
        <div className="trans-slider-box">
          <div className="slider-header">
            <span className="param-tag amber">c = {c}</span>
            <span className="param-desc">Pergeseran Horisontal (Translasi X)</span>
          </div>
          <input
            type="range"
            min="-4"
            max="4"
            step="0.5"
            value={c}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setC(val);
              onApplyTransformedExpression(generateFormula(a, b, val, d));
            }}
            className="range-slider amber"
          />
          <div className="slider-sub-note">
            {c > 0 ? `Grafik bergeser ${c} satuan ke KANAN` : c < 0 ? `Grafik bergeser ${Math.abs(c)} satuan ke KIRI` : 'Pusat di nol'}
          </div>
        </div>

        {/* Slider D */}
        <div className="trans-slider-box">
          <div className="slider-header">
            <span className="param-tag purple">d = {d}</span>
            <span className="param-desc">Pergeseran Vertikal (Translasi Y)</span>
          </div>
          <input
            type="range"
            min="-5"
            max="5"
            step="0.5"
            value={d}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setD(val);
              onApplyTransformedExpression(generateFormula(a, b, c, val));
            }}
            className="range-slider purple"
          />
          <div className="slider-sub-note">
            {d > 0 ? `Grafik naik ${d} satuan ke ATAS` : d < 0 ? `Grafik turun ${Math.abs(d)} satuan ke BAWAH` : 'Tanpa translasi vertikal'}
          </div>
        </div>
      </div>
    </div>
  );
};

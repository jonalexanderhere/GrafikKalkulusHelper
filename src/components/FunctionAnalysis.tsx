import React from 'react';
import { FunctionAnalysisData } from '../types/calculus';
import { KatexMath } from './KatexMath';
import { Check, Target, Maximize, ArrowUpRight, Scale, Info } from 'lucide-react';

interface FunctionAnalysisProps {
  analysis: FunctionAnalysisData;
  expression: string;
}

export const FunctionAnalysis: React.FC<FunctionAnalysisProps> = ({ analysis, expression }) => {
  return (
    <div className="function-analysis-card">
      <div className="analysis-header">
        <div className="card-badge">
          <Target size={14} className="text-emerald" />
          <span>Analisis Karakteristik Kurva</span>
        </div>
        <span className="parity-badge">
          {analysis.parity === 'even'
            ? 'Fungsi Genap (Simetris Sumbu-Y)'
            : analysis.parity === 'odd'
            ? 'Fungsi Ganjil (Simetris Titik Pusat)'
            : 'Asimetris (Bukan Genap/Ganjil)'}
        </span>
      </div>

      {/* Grid of Key Features */}
      <div className="analysis-metrics-grid">
        {/* Domain & Range */}
        <div className="metric-box">
          <div className="metric-title">Daerah Asal (Domain)</div>
          <div className="metric-val">{analysis.domainNote}</div>
          <div className="metric-sub">Himpunan semua nilai x yang membuat f(x) terdefinisi</div>
        </div>

        <div className="metric-box">
          <div className="metric-title">Titik Potong Sumbu Y</div>
          <div className="metric-val mono amber">
            {analysis.yIntercept ? `(0, ${analysis.yIntercept.y.toFixed(2)})` : 'Tidak ada'}
          </div>
          <div className="metric-sub">Nilai fungsi f(0) saat memotong sumbu vertikal</div>
        </div>
      </div>

      {/* Critical Points Breakdown */}
      <div className="points-section">
        <h4 className="sub-heading">Titik Kritis & Karakteristik Utama</h4>
        <div className="points-list">
          {/* Roots */}
          {analysis.roots.length > 0 ? (
            analysis.roots.map((r, i) => (
              <div key={`root-${i}`} className="point-item root">
                <span className="badge-tag green">Akar (x-intercept)</span>
                <span className="point-coord mono">({r.x}, 0)</span>
                <span className="point-desc">f({r.x}) = 0</span>
              </div>
            ))
          ) : (
            <div className="point-empty">Tidak ada akar real yang terdeteksi di jendela tampilan</div>
          )}

          {/* Extrema */}
          {analysis.extrema.map((e, i) => (
            <div key={`ext-${i}`} className={`point-item ${e.type === 'local_max' ? 'max' : 'min'}`}>
              <span className={`badge-tag ${e.type === 'local_max' ? 'rose' : 'blue'}`}>
                {e.type === 'local_max' ? 'Maksimum Lokal' : 'Minimum Lokal'}
              </span>
              <span className="point-coord mono">
                ({e.x}, {e.y})
              </span>
              <span className="point-desc">f'({e.x}) = 0</span>
            </div>
          ))}

          {/* Inflection points */}
          {analysis.inflections.map((inf, i) => (
            <div key={`inf-${i}`} className="point-item inflection">
              <span className="badge-tag purple">Titik Belok</span>
              <span className="point-coord mono">
                ({inf.x}, {inf.y})
              </span>
              <span className="point-desc">Perubahan kecekungan (f''=0)</span>
            </div>
          ))}

          {/* Asymptotes */}
          {analysis.verticalAsymptotes.map((va, i) => (
            <div key={`va-${i}`} className="point-item asymptote">
              <span className="badge-tag red">Asimtot Tegak</span>
              <span className="point-coord mono">x = {va}</span>
              <span className="point-desc">Singularitas fungsi (pembagian dengan nol)</span>
            </div>
          ))}

          {analysis.horizontalAsymptotes.map((ha, i) => (
            <div key={`ha-${i}`} className="point-item asymptote">
              <span className="badge-tag cyan">Asimtot Datar</span>
              <span className="point-coord mono">y = {ha}</span>
              <span className="point-desc">Perilaku ujung kurva saat x → ±∞</span>
            </div>
          ))}
        </div>
      </div>

      {/* Guide Note */}
      <div className="analysis-callout">
        <Info size={16} className="callout-icon" />
        <div className="callout-text">
          Gunakan <strong>Turunan Pertama f'(x)</strong> untuk menentukan interval grafik naik/turun dan titik stasioner, serta <strong>Turunan Kedua f''(x)</strong> untuk menguji apakah titik stasioner tersebut merupakan puncak maksimum atau lembah minimum.
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { KatexMath } from './KatexMath';
import { PRESET_FUNCTIONS } from '../utils/presets';
import { PresetFunction, Viewport } from '../types/calculus';
import { CheckCircle2, AlertCircle, Sparkles, BookOpen } from 'lucide-react';

interface FunctionInputProps {
  expression: string;
  onExpressionChange: (expr: string) => void;
  onSelectPreset: (preset: PresetFunction) => void;
  isValid: boolean;
  errorMessage?: string;
  onResetViewport: (vp: Partial<Viewport>) => void;
}

export const FunctionInput: React.FC<FunctionInputProps> = ({
  expression,
  onExpressionChange,
  onSelectPreset,
  isValid,
  errorMessage,
  onResetViewport,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('cubic_classic');

  // Math keypad buttons
  const quickTokens = [
    { label: 'x²', insert: '^2' },
    { label: 'x³', insert: '^3' },
    { label: '√x', insert: 'sqrt(' },
    { label: 'sin', insert: 'sin(' },
    { label: 'cos', insert: 'cos(' },
    { label: 'tan', insert: 'tan(' },
    { label: 'ln', insert: 'ln(' },
    { label: 'eˣ', insert: 'exp(' },
    { label: 'π', insert: 'pi' },
    { label: '|x|', insert: 'abs(' },
    { label: '(', insert: '(' },
    { label: ')', insert: ')' },
    { label: '÷', insert: ' / ' },
    { label: '×', insert: ' * ' },
  ];

  const handleInsertToken = (token: string) => {
    onExpressionChange(expression + token);
  };

  const handlePresetSelect = (id: string) => {
    setSelectedPresetId(id);
    const found = PRESET_FUNCTIONS.find((p) => p.id === id);
    if (found) {
      onSelectPreset(found);
      if (found.suggestedViewport) {
        onResetViewport(found.suggestedViewport);
      }
    }
  };

  // Convert raw expression into approximate LaTeX for preview
  const formatExprToLatex = (raw: string): string => {
    let s = raw;
    s = s.replace(/\*/g, ' \\cdot ');
    s = s.replace(/pi/g, '\\pi');
    s = s.replace(/sqrt\(([^)]+)\)/g, '\\sqrt{$1}');
    s = s.replace(/sin\(/g, '\\sin(');
    s = s.replace(/cos\(/g, '\\cos(');
    s = s.replace(/tan\(/g, '\\tan(');
    s = s.replace(/ln\(/g, '\\ln(');
    s = s.replace(/exp\(([^)]+)\)/g, 'e^{$1}');
    s = s.replace(/\^([0-9a-zA-Z]+)/g, '^{$1}');
    return `f(x) = ${s}`;
  };

  return (
    <div className="function-input-card">
      {/* Top Header with Presets Dropdown */}
      <div className="input-card-header">
        <div className="card-badge">
          <Sparkles size={13} className="text-cyan" />
          <span>Fungsi Matematika</span>
        </div>

        <div className="preset-selector-wrapper">
          <BookOpen size={14} className="selector-icon" />
          <select
            value={selectedPresetId}
            onChange={(e) => handlePresetSelect(e.target.value)}
            className="preset-dropdown"
          >
            <optgroup label="Polinomial & Pangkat">
              {PRESET_FUNCTIONS.filter((p) => p.category === 'polinomial').map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.expr})
                </option>
              ))}
            </optgroup>
            <optgroup label="Fungsi Rasional & Asimtot">
              {PRESET_FUNCTIONS.filter((p) => p.category === 'rasional').map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.expr})
                </option>
              ))}
            </optgroup>
            <optgroup label="Fungsi Trigonometri">
              {PRESET_FUNCTIONS.filter((p) => p.category === 'trigonometri').map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.expr})
                </option>
              ))}
            </optgroup>
            <optgroup label="Eksponensial & Logaritma">
              {PRESET_FUNCTIONS.filter((p) => p.category === 'eksponensial').map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.expr})
                </option>
              ))}
            </optgroup>
            <optgroup label="Khusus & Singularitas">
              {PRESET_FUNCTIONS.filter((p) => p.category === 'khusus').map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.expr})
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      {/* Main Formula Input Row */}
      <div className="formula-input-container">
        <span className="formula-prefix">f(x) =</span>
        <input
          type="text"
          value={expression}
          onChange={(e) => onExpressionChange(e.target.value)}
          placeholder="Contoh: x^3 - 3*x atau sin(x) / x"
          className={`formula-input ${!isValid ? 'input-error' : ''}`}
          spellCheck={false}
        />
        <div className="status-indicator">
          {isValid ? (
            <span title="Ekspresi valid" className="status-valid">
              <CheckCircle2 size={18} />
            </span>
          ) : (
            <span title={errorMessage || 'Sintaks matematika tidak valid'} className="status-invalid">
              <AlertCircle size={18} />
            </span>
          )}
        </div>
      </div>

      {/* KaTeX Live Math Preview */}
      <div className="math-preview-row">
        <span className="preview-label">Format Notasi:</span>
        <div className="preview-katex">
          <KatexMath math={formatExprToLatex(expression)} />
        </div>
      </div>

      {/* Quick Math Pad */}
      <div className="keypad-grid">
        {quickTokens.map((t) => (
          <button
            key={t.label}
            type="button"
            onClick={() => handleInsertToken(t.insert)}
            className="keypad-btn"
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export interface CriticalPoint {
  x: number;
  y: number;
  type: 'root' | 'local_max' | 'local_min' | 'inflection' | 'y_intercept' | 'asymptote';
  label: string;
  description: string;
}

export interface Asymptote {
  type: 'vertical' | 'horizontal';
  value: number;
  label: string;
}

export interface Viewport {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export interface RiemannConfig {
  enabled: boolean;
  type: 'left' | 'right' | 'midpoint';
  n: number;
  a: number;
  b: number;
}

export interface TangentConfig {
  enabled: boolean;
  x0: number;
  showSecant: boolean;
  deltaX: number;
}

export interface FunctionAnalysisData {
  isValid: boolean;
  error?: string;
  roots: CriticalPoint[];
  extrema: CriticalPoint[];
  inflections: CriticalPoint[];
  yIntercept?: CriticalPoint;
  verticalAsymptotes: number[];
  horizontalAsymptotes: number[];
  parity: 'even' | 'odd' | 'neither' | 'unknown';
  domainNote: string;
  rangeEstimated: { min: number; max: number };
}

export interface PresetFunction {
  id: string;
  name: string;
  category: 'polinomial' | 'rasional' | 'trigonometri' | 'eksponensial' | 'khusus';
  latex: string;
  expr: string;
  description: string;
  highlights: string[];
  suggestedViewport?: Partial<Viewport>;
  suggestedTangentX?: number;
}

export interface QuizQuestion {
  id: number;
  title: string;
  question: string;
  mathPrompt?: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  explanation: string;
  category: string;
}

import { CriticalPoint, FunctionAnalysisData, RiemannConfig, Viewport } from '../types/calculus';

// Supported functions and constants
const MATH_CONSTANTS: Record<string, number> = {
  pi: Math.PI,
  e: Math.E,
};

const MATH_FUNCTIONS: Record<string, (a: number) => number> = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
  sinh: Math.sinh,
  cosh: Math.cosh,
  tanh: Math.tanh,
  sqrt: (x) => (x < 0 ? NaN : Math.sqrt(x)),
  cbrt: Math.cbrt,
  abs: Math.abs,
  ln: (x) => (x <= 0 ? NaN : Math.log(x)),
  log: (x) => (x <= 0 ? NaN : Math.log10(x)),
  log2: (x) => (x <= 0 ? NaN : Math.log2(x)),
  exp: Math.exp,
  sign: Math.sign,
};

export class MathParser {
  private raw: string;
  private normalized: string;
  private tokens: string[] = [];

  constructor(expression: string) {
    this.raw = expression.trim();
    this.normalized = this.normalize(this.raw);
    this.tokens = this.tokenize(this.normalized);
  }

  public getNormalizedExpression(): string {
    return this.normalized;
  }

  private normalize(expr: string): string {
    if (!expr) return '0';
    let s = expr.toLowerCase();
    // Replace unicode
    s = s.replace(/[\u03C0\u03A0]/g, 'pi');
    s = s.replace(/[\u221A]/g, 'sqrt');
    s = s.replace(/[\u00D7\u22C5]/g, '*');
    s = s.replace(/[\u00F7]/g, '/');

    // Remove whitespace
    s = s.replace(/\s+/g, '');

    // Insert multiplication where implicit:
    // digit followed by variable or function or open paren: 2x -> 2*x, 2sin -> 2*sin, 2( -> 2*(
    s = s.replace(/(\d)([a-zA-Z(])/g, '$1*$2');
    // variable 'x' followed by number or function or open paren: x2 -> x*2, x( -> x*(, xsin -> x*sin
    s = s.replace(/(x)([0-9(a-zA-Z])/g, (match, p1, p2) => {
      // Don't separate function names like 'exp' if it had x? (x is not prefix of standard func, but check)
      return `${p1}*${p2}`;
    });
    // close paren followed by open paren or variable or number: )( -> )*(, )x -> )*x
    s = s.replace(/\)([0-9a-zA-Z(])/g, ')*$1');

    return s;
  }

  private tokenize(expr: string): string[] {
    const tokens: string[] = [];
    let i = 0;
    while (i < expr.length) {
      const c = expr[i];

      // Operators and parentheses
      if (['+', '-', '*', '/', '^', '%', '(', ')'].includes(c)) {
        tokens.push(c);
        i++;
        continue;
      }

      // Numbers (including decimals)
      if (/[0-9.]/.test(c)) {
        let numStr = '';
        while (i < expr.length && /[0-9.]/.test(expr[i])) {
          numStr += expr[i];
          i++;
        }
        tokens.push(numStr);
        continue;
      }

      // Words (x, functions, constants)
      if (/[a-zA-Z_]/.test(c)) {
        let wordStr = '';
        while (i < expr.length && /[a-zA-Z_0-9]/.test(expr[i])) {
          wordStr += expr[i];
          i++;
        }
        tokens.push(wordStr);
        continue;
      }

      // Unrecognized character
      i++;
    }
    return tokens;
  }

  // Evaluate expression at x using Shunting-Yard + RPN Evaluator
  public evaluate(xVal: number): number {
    try {
      const rpn = this.toRPN(this.tokens);
      return this.evaluateRPN(rpn, xVal);
    } catch {
      return NaN;
    }
  }

  private getPrecedence(op: string): number {
    switch (op) {
      case '+':
      case '-':
        return 1;
      case '*':
      case '/':
      case '%':
        return 2;
      case '^':
        return 3;
      case 'u-':
      case 'u+':
        return 4; // Unary negation/plus
      default:
        return 0;
    }
  }

  private isRightAssociative(op: string): boolean {
    return op === '^' || op === 'u-' || op === 'u+';
  }

  private toRPN(tokens: string[]): string[] {
    const output: string[] = [];
    const opStack: string[] = [];

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const prev = i > 0 ? tokens[i - 1] : null;

      // Number or constant
      if (!isNaN(Number(token))) {
        output.push(token);
      } else if (token === 'x') {
        output.push('x');
      } else if (token in MATH_CONSTANTS) {
        output.push(String(MATH_CONSTANTS[token]));
      } else if (token in MATH_FUNCTIONS) {
        opStack.push(token);
      } else if (token === '(') {
        opStack.push(token);
      } else if (token === ')') {
        while (opStack.length > 0 && opStack[opStack.length - 1] !== '(') {
          output.push(opStack.pop()!);
        }
        if (opStack.length > 0 && opStack[opStack.length - 1] === '(') {
          opStack.pop(); // Remove '('
        }
        // If there's a function token right before '(', pop it to output
        if (opStack.length > 0 && opStack[opStack.length - 1] in MATH_FUNCTIONS) {
          output.push(opStack.pop()!);
        }
      } else {
        // Operator
        let op = token;
        // Check for unary minus / plus
        if (op === '-' || op === '+') {
          if (prev === null || ['(', '+', '-', '*', '/', '^', '%'].includes(prev)) {
            op = op === '-' ? 'u-' : 'u+';
          }
        }

        while (
          opStack.length > 0 &&
          opStack[opStack.length - 1] !== '(' &&
          (this.getPrecedence(opStack[opStack.length - 1]) > this.getPrecedence(op) ||
            (this.getPrecedence(opStack[opStack.length - 1]) === this.getPrecedence(op) &&
              !this.isRightAssociative(op)))
        ) {
          output.push(opStack.pop()!);
        }
        opStack.push(op);
      }
    }

    while (opStack.length > 0) {
      const top = opStack.pop()!;
      if (top !== '(' && top !== ')') {
        output.push(top);
      }
    }

    return output;
  }

  private evaluateRPN(rpn: string[], xVal: number): number {
    const stack: number[] = [];

    for (const token of rpn) {
      if (!isNaN(Number(token))) {
        stack.push(Number(token));
      } else if (token === 'x') {
        stack.push(xVal);
      } else if (token === 'u-') {
        const a = stack.pop() ?? 0;
        stack.push(-a);
      } else if (token === 'u+') {
        // no-op
      } else if (token in MATH_FUNCTIONS) {
        const a = stack.pop() ?? 0;
        const res = MATH_FUNCTIONS[token](a);
        stack.push(res);
      } else {
        const b = stack.pop() ?? 0;
        const a = stack.pop() ?? 0;
        let res = 0;
        switch (token) {
          case '+':
            res = a + b;
            break;
          case '-':
            res = a - b;
            break;
          case '*':
            res = a * b;
            break;
          case '/':
            res = Math.abs(b) < 1e-12 ? (a >= 0 ? Infinity : -Infinity) : a / b;
            break;
          case '^':
            // Support negative base with integer exponents or fractional
            if (a < 0 && Math.abs(Math.round(b) - b) < 1e-9) {
              res = Math.pow(-1, Math.round(b)) * Math.pow(-a, b);
            } else {
              res = Math.pow(a, b);
            }
            break;
          case '%':
            res = a % b;
            break;
          default:
            res = NaN;
        }
        stack.push(res);
      }
    }

    const finalVal = stack.pop() ?? NaN;
    return isFinite(finalVal) ? finalVal : NaN;
  }
}

// Numerical Calculus Engine
export class CalculusEngine {
  private parser: MathParser;

  constructor(expression: string) {
    this.parser = new MathParser(expression);
  }

  public f(x: number): number {
    return this.parser.evaluate(x);
  }

  // Central Difference Method: f'(x)
  public df(x: number, h = 1e-5): number {
    const yPlus = this.f(x + h);
    const yMinus = this.f(x - h);
    if (isNaN(yPlus) || isNaN(yMinus)) {
      // Forward or backward fallback
      const y0 = this.f(x);
      if (!isNaN(yPlus) && !isNaN(y0)) return (yPlus - y0) / h;
      if (!isNaN(yMinus) && !isNaN(y0)) return (y0 - yMinus) / h;
      return NaN;
    }
    return (yPlus - yMinus) / (2 * h);
  }

  // Second derivative: f''(x)
  public d2f(x: number, h = 1e-4): number {
    const yPlus = this.f(x + h);
    const y0 = this.f(x);
    const yMinus = this.f(x - h);
    if (isNaN(yPlus) || isNaN(y0) || isNaN(yMinus)) return NaN;
    return (yPlus - 2 * y0 + yMinus) / (h * h);
  }

  // Definite Integral via Simpson's 1/3 Rule
  public integrate(a: number, b: number, steps = 100): number {
    if (a === b) return 0;
    const isReversed = a > b;
    const xStart = isReversed ? b : a;
    const xEnd = isReversed ? a : b;
    const n = steps % 2 === 0 ? steps : steps + 1;
    const h = (xEnd - xStart) / n;

    let sum = this.f(xStart) + this.f(xEnd);
    if (isNaN(sum)) return NaN;

    for (let i = 1; i < n; i++) {
      const x = xStart + i * h;
      const y = this.f(x);
      if (isNaN(y)) return NaN;
      sum += (i % 2 === 0 ? 2 : 4) * y;
    }

    const result = (sum * h) / 3;
    return isReversed ? -result : result;
  }

  // Generate Riemann Sum Data (Left, Right, Midpoint rectangles)
  public calculateRiemann(config: RiemannConfig): {
    rectangles: { x: number; y: number; width: number; height: number }[];
    totalArea: number;
    exactIntegral: number;
  } {
    const { a, b, n, type } = config;
    const rectangles: { x: number; y: number; width: number; height: number }[] = [];
    const dx = (b - a) / n;
    let totalArea = 0;

    for (let i = 0; i < n; i++) {
      const xLeft = a + i * dx;
      const xRight = xLeft + dx;
      let sampleX = xLeft;
      if (type === 'right') sampleX = xRight;
      else if (type === 'midpoint') sampleX = xLeft + dx / 2;

      const yVal = this.f(sampleX);
      const height = isNaN(yVal) ? 0 : yVal;
      totalArea += height * dx;

      rectangles.push({
        x: xLeft,
        y: height,
        width: dx,
        height: height,
      });
    }

    const exactIntegral = this.integrate(a, b, 200);

    return {
      rectangles,
      totalArea,
      exactIntegral,
    };
  }

  // Tangent line at x0: y = m(x - x0) + y0 => y = m*x + (y0 - m*x0)
  public getTangentLine(x0: number): {
    m: number;
    y0: number;
    intercept: number;
    equation: string;
    angleDeg: number;
  } {
    const y0 = this.f(x0);
    const m = this.df(x0);
    const intercept = y0 - m * x0;
    const angleRad = Math.atan(m);
    const angleDeg = (angleRad * 180) / Math.PI;

    const mStr = Math.abs(m) < 1e-4 ? '0' : m.toFixed(2);
    const cStr = intercept >= 0 ? `+ ${intercept.toFixed(2)}` : `- ${Math.abs(intercept).toFixed(2)}`;
    const eq = `y = ${mStr}x ${cStr}`;

    return { m, y0, intercept, equation: eq, angleDeg };
  }

  // Secant line between x0 and x0 + deltaX
  public getSecantLine(x0: number, deltaX: number): {
    mSec: number;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    equation: string;
  } {
    const x1 = x0;
    const y1 = this.f(x1);
    const x2 = x0 + deltaX;
    const y2 = this.f(x2);
    const mSec = (y2 - y1) / deltaX;
    const intercept = y1 - mSec * x1;

    const mStr = mSec.toFixed(2);
    const cStr = intercept >= 0 ? `+ ${intercept.toFixed(2)}` : `- ${Math.abs(intercept).toFixed(2)}`;

    return {
      mSec,
      x1,
      y1,
      x2,
      y2,
      equation: `y = ${mStr}x ${cStr}`,
    };
  }

  // Analyze function characteristics in a viewport
  public analyze(viewport: Viewport): FunctionAnalysisData {
    const { xMin, xMax } = viewport;
    const step = (xMax - xMin) / 600;

    const roots: CriticalPoint[] = [];
    const extrema: CriticalPoint[] = [];
    const inflections: CriticalPoint[] = [];
    const verticalAsymptotes: number[] = [];

    let prevY = this.f(xMin);
    let prevDf = this.df(xMin);
    let prevD2f = this.d2f(xMin);

    let minEstimated = Infinity;
    let maxEstimated = -Infinity;

    // Scan through viewport interval
    for (let x = xMin; x <= xMax; x += step) {
      const y = this.f(x);
      const dfVal = this.df(x);
      const d2fVal = this.d2f(x);

      if (!isNaN(y)) {
        if (y < minEstimated) minEstimated = y;
        if (y > maxEstimated) maxEstimated = y;
      }

      // Check for vertical asymptote (sign flip across huge values or NaN)
      if (
        (Math.abs(y) > 100 && Math.abs(prevY) > 100 && Math.sign(y) !== Math.sign(prevY)) ||
        (isNaN(y) && !isNaN(prevY) && Math.abs(prevY) > 50)
      ) {
        // Refine asymptote location
        verticalAsymptotes.push(Number(x.toFixed(2)));
      }

      // Root detection: f(x) sign change
      if (!isNaN(prevY) && !isNaN(y) && Math.sign(prevY) !== Math.sign(y) && Math.abs(y - prevY) < 50) {
        // Bisection root approximation
        let a = x - step;
        let b = x;
        for (let iter = 0; iter < 10; iter++) {
          const mid = (a + b) / 2;
          const yMid = this.f(mid);
          if (Math.sign(yMid) === Math.sign(this.f(a))) a = mid;
          else b = mid;
        }
        const rootX = (a + b) / 2;
        const rootY = this.f(rootX);
        if (Math.abs(rootY) < 0.1) {
          if (!roots.some((r) => Math.abs(r.x - rootX) < 0.2)) {
            roots.push({
              x: Number(rootX.toFixed(3)),
              y: 0,
              type: 'root',
              label: `Akar (${rootX.toFixed(2)}, 0)`,
              description: `Titik potong sumbu-X di x = ${rootX.toFixed(3)} di mana f(x) = 0`,
            });
          }
        }
      }

      // Extrema detection: f'(x) sign change
      if (!isNaN(prevDf) && !isNaN(dfVal) && Math.sign(prevDf) !== Math.sign(dfVal)) {
        const extX = x - step / 2;
        const extY = this.f(extX);
        const secondDeriv = this.d2f(extX);

        if (!isNaN(extY) && Math.abs(extY) < 1000) {
          const isMax = secondDeriv < 0;
          if (!extrema.some((e) => Math.abs(e.x - extX) < 0.25)) {
            extrema.push({
              x: Number(extX.toFixed(3)),
              y: Number(extY.toFixed(3)),
              type: isMax ? 'local_max' : 'local_min',
              label: isMax ? `Maks Lokal (${extX.toFixed(2)}, ${extY.toFixed(2)})` : `Min Lokal (${extX.toFixed(2)}, ${extY.toFixed(2)})`,
              description: isMax
                ? `Maksimum Lokal di x = ${extX.toFixed(3)} (f'(x)=0, f''(x) < 0: cekung ke bawah)`
                : `Minimum Lokal di x = ${extX.toFixed(3)} (f'(x)=0, f''(x) > 0: cekung ke atas)`,
            });
          }
        }
      }

      // Inflection point: f''(x) sign change
      if (!isNaN(prevD2f) && !isNaN(d2fVal) && Math.sign(prevD2f) !== Math.sign(d2fVal)) {
        const infX = x - step / 2;
        const infY = this.f(infX);
        if (!isNaN(infY) && Math.abs(infY) < 1000) {
          if (!inflections.some((p) => Math.abs(p.x - infX) < 0.3)) {
            inflections.push({
              x: Number(infX.toFixed(3)),
              y: Number(infY.toFixed(3)),
              type: 'inflection',
              label: `Titik Belok (${infX.toFixed(2)}, ${infY.toFixed(2)})`,
              description: `Titik belok di x = ${infX.toFixed(3)} di mana kecekungan grafik berubah (f''(x)=0)`,
            });
          }
        }
      }

      prevY = y;
      prevDf = dfVal;
      prevD2f = d2fVal;
    }

    // Y-intercept f(0)
    let yIntercept: CriticalPoint | undefined;
    const y0 = this.f(0);
    if (!isNaN(y0) && isFinite(y0)) {
      yIntercept = {
        x: 0,
        y: Number(y0.toFixed(3)),
        type: 'y_intercept',
        label: `Titik Potong Y (0, ${y0.toFixed(2)})`,
        description: `Titik potong kurva dengan sumbu-Y di mana x = 0`,
      };
    }

    // Parity analysis: check f(-x) vs f(x) and -f(x)
    let isEven = true;
    let isOdd = true;
    const testPoints = [0.5, 1, 1.5, 2, 2.7, 3.4];
    for (const tp of testPoints) {
      const pos = this.f(tp);
      const neg = this.f(-tp);
      if (isNaN(pos) || isNaN(neg)) continue;
      if (Math.abs(pos - neg) > 1e-3) isEven = false;
      if (Math.abs(pos + neg) > 1e-3) isOdd = false;
    }

    let parity: 'even' | 'odd' | 'neither' | 'unknown' = 'neither';
    if (isEven && isOdd) parity = 'even'; // e.g., f(x) = 0
    else if (isEven) parity = 'even';
    else if (isOdd) parity = 'odd';

    // Horizontal asymptotes: lim_{x -> +/- 1000} f(x)
    const horizontalAsymptotes: number[] = [];
    const limitPos = this.f(500);
    const limitPosPlus = this.f(1000);
    if (!isNaN(limitPos) && !isNaN(limitPosPlus) && Math.abs(limitPos - limitPosPlus) < 0.05) {
      horizontalAsymptotes.push(Number(limitPosPlus.toFixed(2)));
    }
    const limitNeg = this.f(-500);
    const limitNegPlus = this.f(-1000);
    if (!isNaN(limitNeg) && !isNaN(limitNegPlus) && Math.abs(limitNeg - limitNegPlus) < 0.05) {
      const val = Number(limitNegPlus.toFixed(2));
      if (!horizontalAsymptotes.includes(val)) {
        horizontalAsymptotes.push(val);
      }
    }

    // Filter unique vertical asymptotes
    const cleanVertAsymp = Array.from(new Set(verticalAsymptotes));

    return {
      isValid: true,
      roots,
      extrema,
      inflections,
      yIntercept,
      verticalAsymptotes: cleanVertAsymp,
      horizontalAsymptotes,
      parity,
      domainNote: cleanVertAsymp.length > 0 ? `Semua x \u2208 \u211D kecuali {${cleanVertAsymp.join(', ')}}` : 'Semua x \u2208 \u211D',
      rangeEstimated: {
        min: minEstimated === Infinity ? -10 : Number(minEstimated.toFixed(2)),
        max: maxEstimated === -Infinity ? 10 : Number(maxEstimated.toFixed(2)),
      },
    };
  }
}

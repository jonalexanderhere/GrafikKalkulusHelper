import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Viewport, CriticalPoint, RiemannConfig, TangentConfig } from '../types/calculus';
import { CalculusEngine } from '../utils/mathEngine';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Crosshair, Download } from 'lucide-react';

interface GraphCanvasProps {
  expression: string;
  viewport: Viewport;
  onViewportChange: (newVp: Viewport) => void;
  showDerivative1: boolean;
  showDerivative2: boolean;
  tangentConfig: TangentConfig;
  riemannConfig: RiemannConfig;
  criticalPoints: CriticalPoint[];
  showGrid?: boolean;
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  expression,
  viewport,
  onViewportChange,
  showDerivative1,
  showDerivative2,
  tangentConfig,
  riemannConfig,
  criticalPoints,
  showGrid = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Mouse drag state
  const isDragging = useRef(false);
  const lastMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Hover state
  const [hoverCoord, setHoverCoord] = useState<{ x: number; y: number; fVal: number; dfVal: number } | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<CriticalPoint | null>(null);

  // Convert Math coordinates to Canvas pixel coordinates
  const mathToPixel = useCallback(
    (x: number, y: number, width: number, height: number): { px: number; py: number } => {
      const px = ((x - viewport.xMin) / (viewport.xMax - viewport.xMin)) * width;
      const py = height - ((y - viewport.yMin) / (viewport.yMax - viewport.yMin)) * height;
      return { px, py };
    },
    [viewport]
  );

  // Convert Canvas pixel to Math coordinate
  const pixelToMath = useCallback(
    (px: number, py: number, width: number, height: number): { x: number; y: number } => {
      const x = viewport.xMin + (px / width) * (viewport.xMax - viewport.xMin);
      const y = viewport.yMin + ((height - py) / height) * (viewport.yMax - viewport.yMin);
      return { x, y };
    },
    [viewport]
  );

  // Render routine
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Retina display support
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Background: Deep luxury dark canvas
    ctx.fillStyle = '#080c14';
    ctx.fillRect(0, 0, width, height);

    // Subtle background radial glow
    const centerGrad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, width * 0.7);
    centerGrad.addColorStop(0, 'rgba(30, 41, 59, 0.4)');
    centerGrad.addColorStop(1, 'rgba(8, 12, 20, 1)');
    ctx.fillStyle = centerGrad;
    ctx.fillRect(0, 0, width, height);

    // Calculate grid step dynamically
    const xRange = viewport.xMax - viewport.xMin;
    const yRange = viewport.yMax - viewport.yMin;

    const calculateGridStep = (range: number): number => {
      const rough = range / 10;
      const power = Math.floor(Math.log10(rough));
      const factor = rough / Math.pow(10, power);
      let step = 1;
      if (factor < 2) step = 1;
      else if (factor < 5) step = 2;
      else step = 5;
      return step * Math.pow(10, power);
    };

    const xStep = calculateGridStep(xRange);
    const yStep = calculateGridStep(yRange);

    // 1. DRAW GRID
    if (showGrid) {
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
      ctx.font = '10px JetBrains Mono, monospace';

      // Vertical grid lines
      const firstX = Math.floor(viewport.xMin / xStep) * xStep;
      for (let x = firstX; x <= viewport.xMax; x += xStep) {
        if (Math.abs(x) < 1e-9) continue;
        const { px } = mathToPixel(x, 0, width, height);
        ctx.beginPath();
        ctx.moveTo(px, 0);
        ctx.lineTo(px, height);
        ctx.stroke();

        // Label on X axis or bottom
        const { py: originPy } = mathToPixel(0, 0, width, height);
        const labelY = Math.min(Math.max(originPy + 14, 16), height - 8);
        ctx.textAlign = 'center';
        ctx.fillText(Number(x.toFixed(4)).toString(), px, labelY);
      }

      // Horizontal grid lines
      const firstY = Math.floor(viewport.yMin / yStep) * yStep;
      for (let y = firstY; y <= viewport.yMax; y += yStep) {
        if (Math.abs(y) < 1e-9) continue;
        const { py } = mathToPixel(0, y, width, height);
        ctx.beginPath();
        ctx.moveTo(0, py);
        ctx.lineTo(width, py);
        ctx.stroke();

        // Label on Y axis or left
        const { px: originPx } = mathToPixel(0, 0, width, height);
        const labelX = Math.min(Math.max(originPx - 8, 28), width - 10);
        ctx.textAlign = 'right';
        ctx.fillText(Number(y.toFixed(4)).toString(), labelX, py + 3);
      }
    }

    // 2. MAIN AXES (Sumbu X dan Sumbu Y)
    const origin = mathToPixel(0, 0, width, height);

    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';

    // X Axis
    if (origin.py >= 0 && origin.py <= height) {
      ctx.beginPath();
      ctx.moveTo(0, origin.py);
      ctx.lineTo(width, origin.py);
      ctx.stroke();

      // Axis arrow
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.beginPath();
      ctx.moveTo(width - 8, origin.py - 4);
      ctx.lineTo(width, origin.py);
      ctx.lineTo(width - 8, origin.py + 4);
      ctx.fill();

      ctx.font = '600 11px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('x', width - 12, origin.py - 8);
    }

    // Y Axis
    if (origin.px >= 0 && origin.px <= width) {
      ctx.beginPath();
      ctx.moveTo(origin.px, 0);
      ctx.lineTo(origin.px, height);
      ctx.stroke();

      // Axis arrow
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.beginPath();
      ctx.moveTo(origin.px - 4, 8);
      ctx.lineTo(origin.px, 0);
      ctx.lineTo(origin.px + 4, 8);
      ctx.fill();

      ctx.font = '600 11px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('y', origin.px + 8, 14);
    }

    // Origin (0,0) indicator
    if (origin.px >= 0 && origin.px <= width && origin.py >= 0 && origin.py <= height) {
      ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'right';
      ctx.fillText('O', origin.px - 5, origin.py + 14);
    }

    const engine = new CalculusEngine(expression);

    // 3. RIEMANN SUM RECTANGLES / INTEGRAL SHADING
    if (riemannConfig.enabled) {
      const riemann = engine.calculateRiemann(riemannConfig);

      // Render rectangles
      for (const rect of riemann.rectangles) {
        const pTopLeft = mathToPixel(rect.x, Math.max(0, rect.height), width, height);
        const pBottomRight = mathToPixel(rect.x + rect.width, Math.min(0, rect.height), width, height);
        const rectW = pBottomRight.px - pTopLeft.px;
        const rectH = pBottomRight.py - pTopLeft.py;

        ctx.fillStyle = rect.height >= 0 ? 'rgba(56, 189, 248, 0.22)' : 'rgba(239, 68, 68, 0.22)';
        ctx.fillRect(pTopLeft.px, pTopLeft.py, rectW, rectH);

        ctx.lineWidth = 1;
        ctx.strokeStyle = rect.height >= 0 ? 'rgba(56, 189, 248, 0.7)' : 'rgba(239, 68, 68, 0.7)';
        ctx.strokeRect(pTopLeft.px, pTopLeft.py, rectW, rectH);
      }

      // Interval boundaries a and b
      const pa = mathToPixel(riemannConfig.a, 0, width, height);
      const pb = mathToPixel(riemannConfig.b, 0, width, height);

      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(pa.px, 0);
      ctx.lineTo(pa.px, height);
      ctx.moveTo(pb.px, 0);
      ctx.lineTo(pb.px, height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label a and b
      ctx.fillStyle = '#38bdf8';
      ctx.font = '600 11px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`a = ${riemannConfig.a}`, pa.px, origin.py + 18);
      ctx.fillText(`b = ${riemannConfig.b}`, pb.px, origin.py + 18);
    }

    // Helper to draw a curve
    const plotCurve = (
      fn: (x: number) => number,
      strokeStyle: string,
      lineWidth = 2.5,
      glowColor?: string
    ) => {
      ctx.save();
      if (glowColor) {
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 10;
      }
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = strokeStyle;
      ctx.beginPath();

      let isDrawing = false;
      const numSamples = width * 1.5;
      const dx = (viewport.xMax - viewport.xMin) / numSamples;

      for (let i = 0; i <= numSamples; i++) {
        const x = viewport.xMin + i * dx;
        const y = fn(x);

        if (isNaN(y) || !isFinite(y) || Math.abs(y) > 1e4) {
          isDrawing = false;
          continue;
        }

        const { px, py } = mathToPixel(x, y, width, height);

        // Check if jump is too big (likely asymptote)
        if (!isDrawing) {
          ctx.moveTo(px, py);
          isDrawing = true;
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.stroke();
      ctx.restore();
    };

    // 4. SECOND DERIVATIVE f''(x)
    if (showDerivative2) {
      plotCurve((x) => engine.d2f(x), 'rgba(168, 85, 247, 0.85)', 2, 'rgba(168, 85, 247, 0.4)');
    }

    // 5. FIRST DERIVATIVE f'(x)
    if (showDerivative1) {
      plotCurve((x) => engine.df(x), 'rgba(251, 191, 36, 0.9)', 2.2, 'rgba(251, 191, 36, 0.5)');
    }

    // 6. MAIN FUNCTION f(x)
    plotCurve((x) => engine.f(x), '#00f2fe', 3, 'rgba(0, 242, 254, 0.6)');

    // 7. TANGENT & SECANT LINES
    if (tangentConfig.enabled) {
      const x0 = tangentConfig.x0;
      const tanData = engine.getTangentLine(x0);

      if (!isNaN(tanData.y0) && !isNaN(tanData.m)) {
        // Tangent Line
        const yLeft = tanData.m * viewport.xMin + tanData.intercept;
        const yRight = tanData.m * viewport.xMax + tanData.intercept;
        const pLeft = mathToPixel(viewport.xMin, yLeft, width, height);
        const pRight = mathToPixel(viewport.xMax, yRight, width, height);

        ctx.save();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#ec4899'; // Vibrant Pink
        ctx.shadowColor = 'rgba(236, 72, 153, 0.6)';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(pLeft.px, pLeft.py);
        ctx.lineTo(pRight.px, pRight.py);
        ctx.stroke();
        ctx.restore();

        // Tangent point (x0, f(x0))
        const p0 = mathToPixel(x0, tanData.y0, width, height);
        ctx.fillStyle = '#ec4899';
        ctx.beginPath();
        ctx.arc(p0.px, p0.py, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Secant Line
        if (tangentConfig.showSecant && Math.abs(tangentConfig.deltaX) > 1e-4) {
          const secData = engine.getSecantLine(x0, tangentConfig.deltaX);
          if (!isNaN(secData.y2)) {
            const ySecLeft = secData.mSec * viewport.xMin + (secData.y1 - secData.mSec * secData.x1);
            const ySecRight = secData.mSec * viewport.xMax + (secData.y1 - secData.mSec * secData.x1);
            const pSecLeft = mathToPixel(viewport.xMin, ySecLeft, width, height);
            const pSecRight = mathToPixel(viewport.xMax, ySecRight, width, height);

            ctx.save();
            ctx.setLineDash([6, 4]);
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#10b981'; // Emerald
            ctx.beginPath();
            ctx.moveTo(pSecLeft.px, pSecLeft.py);
            ctx.lineTo(pSecRight.px, pSecRight.py);
            ctx.stroke();
            ctx.restore();

            // Point 2 (x0 + deltaX, f(x0 + deltaX))
            const p1 = mathToPixel(secData.x2, secData.y2, width, height);
            ctx.fillStyle = '#10b981';
            ctx.beginPath();
            ctx.arc(p1.px, p1.py, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
        }
      }
    }

    // 8. CRITICAL POINTS ON GRAPH
    for (const pt of criticalPoints) {
      if (pt.x < viewport.xMin || pt.x > viewport.xMax || pt.y < viewport.yMin || pt.y > viewport.yMax) {
        continue;
      }

      const { px, py } = mathToPixel(pt.x, pt.y, width, height);

      ctx.save();
      if (pt.type === 'root') {
        // Green circle for roots
        ctx.fillStyle = '#10b981';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (pt.type === 'local_max') {
        // Red/Orange upward triangle
        ctx.fillStyle = '#f43f5e';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(px, py - 6);
        ctx.lineTo(px + 6, py + 5);
        ctx.lineTo(px - 6, py + 5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (pt.type === 'local_min') {
        // Blue downward triangle
        ctx.fillStyle = '#3b82f6';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(px, py + 6);
        ctx.lineTo(px + 6, py - 5);
        ctx.lineTo(px - 6, py - 5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (pt.type === 'inflection') {
        // Purple diamond
        ctx.fillStyle = '#a855f7';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(px, py - 6);
        ctx.lineTo(px + 5, py);
        ctx.lineTo(px, py + 6);
        ctx.lineTo(px - 5, py);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (pt.type === 'y_intercept') {
        // Yellow circle
        ctx.fillStyle = '#f59e0b';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(px, py, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }

    // 9. CROSSHAIR & HOVER CURSOR
    if (hoverCoord) {
      const { px, py } = mathToPixel(hoverCoord.x, hoverCoord.y, width, height);

      // Dotted crosshair
      ctx.save();
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, height);
      ctx.moveTo(0, py);
      ctx.lineTo(width, py);
      ctx.stroke();

      // Point on f(x)
      if (!isNaN(hoverCoord.fVal)) {
        const fPoint = mathToPixel(hoverCoord.x, hoverCoord.fVal, width, height);
        ctx.fillStyle = '#00f2fe';
        ctx.beginPath();
        ctx.arc(fPoint.px, fPoint.py, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }, [
    expression,
    viewport,
    showDerivative1,
    showDerivative2,
    tangentConfig,
    riemannConfig,
    criticalPoints,
    showGrid,
    hoverCoord,
    mathToPixel,
  ]);

  // Redraw when viewport or inputs change
  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Window resize observer
  useEffect(() => {
    const handleResize = () => {
      renderCanvas();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [renderCanvas]);

  // Mouse Handlers for Pan & Zoom
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const mathCoord = pixelToMath(px, py, rect.width, rect.height);
    const engine = new CalculusEngine(expression);
    const fVal = engine.f(mathCoord.x);
    const dfVal = engine.df(mathCoord.x);

    setHoverCoord({
      x: mathCoord.x,
      y: mathCoord.y,
      fVal,
      dfVal,
    });

    // Check proximity to critical points
    let foundPt: CriticalPoint | null = null;
    for (const pt of criticalPoints) {
      const ptPx = mathToPixel(pt.x, pt.y, rect.width, rect.height);
      const dist = Math.hypot(ptPx.px - px, ptPx.py - py);
      if (dist < 14) {
        foundPt = pt;
        break;
      }
    }
    setHoveredPoint(foundPt);

    if (!isDragging.current) return;

    const deltaPx = e.clientX - lastMousePos.current.x;
    const deltaPy = e.clientY - lastMousePos.current.y;
    lastMousePos.current = { x: e.clientX, y: e.clientY };

    const dxMath = (deltaPx / rect.width) * (viewport.xMax - viewport.xMin);
    const dyMath = (deltaPy / rect.height) * (viewport.yMax - viewport.yMin);

    onViewportChange({
      xMin: viewport.xMin - dxMath,
      xMax: viewport.xMax - dxMath,
      yMin: viewport.yMin + dyMath,
      yMax: viewport.yMax + dyMath,
    });
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
    setHoverCoord(null);
    setHoveredPoint(null);
  };

  // Wheel to Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const center = pixelToMath(px, py, rect.width, rect.height);

    const zoomFactor = e.deltaY < 0 ? 0.85 : 1.18;
    const newXMin = center.x + (viewport.xMin - center.x) * zoomFactor;
    const newXMax = center.x + (viewport.xMax - center.x) * zoomFactor;
    const newYMin = center.y + (viewport.yMin - center.y) * zoomFactor;
    const newYMax = center.y + (viewport.yMax - center.y) * zoomFactor;

    onViewportChange({
      xMin: newXMin,
      xMax: newXMax,
      yMin: newYMin,
      yMax: newYMax,
    });
  };

  // Quick Controls
  const zoomIn = () => {
    const cx = (viewport.xMin + viewport.xMax) / 2;
    const cy = (viewport.yMin + viewport.yMax) / 2;
    const factor = 0.75;
    onViewportChange({
      xMin: cx + (viewport.xMin - cx) * factor,
      xMax: cx + (viewport.xMax - cx) * factor,
      yMin: cy + (viewport.yMin - cy) * factor,
      yMax: cy + (viewport.yMax - cy) * factor,
    });
  };

  const zoomOut = () => {
    const cx = (viewport.xMin + viewport.xMax) / 2;
    const cy = (viewport.yMin + viewport.yMax) / 2;
    const factor = 1.33;
    onViewportChange({
      xMin: cx + (viewport.xMin - cx) * factor,
      xMax: cx + (viewport.xMax - cx) * factor,
      yMin: cy + (viewport.yMin - cy) * factor,
      yMax: cy + (viewport.yMax - cy) * factor,
    });
  };

  const resetView = () => {
    onViewportChange({ xMin: -5, xMax: 5, yMin: -5, yMax: 5 });
  };

  const exportImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `kalkulus-grafik-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="canvas-wrapper" ref={containerRef}>
      <canvas
        ref={canvasRef}
        className="graph-canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
      />

      {/* Floating Toolbar */}
      <div className="canvas-toolbar">
        <button onClick={zoomIn} className="tool-btn" title="Perbesar (Zoom In)">
          <ZoomIn size={16} />
        </button>
        <button onClick={zoomOut} className="tool-btn" title="Perkecil (Zoom Out)">
          <ZoomOut size={16} />
        </button>
        <button onClick={resetView} className="tool-btn" title="Reset Pandangan">
          <RotateCcw size={16} />
        </button>
        <button onClick={exportImage} className="tool-btn" title="Simpan Gambar PNG">
          <Download size={16} />
        </button>
      </div>

      {/* Realtime Coordinate Tracker HUD */}
      {hoverCoord && (
        <div className="canvas-hud">
          <div className="hud-item">
            <span className="hud-label">x:</span>
            <span className="hud-val">{hoverCoord.x.toFixed(3)}</span>
          </div>
          <div className="hud-item">
            <span className="hud-label">f(x):</span>
            <span className="hud-val cyan">{isNaN(hoverCoord.fVal) ? 'undefined' : hoverCoord.fVal.toFixed(3)}</span>
          </div>
          <div className="hud-item">
            <span className="hud-label">f'(x):</span>
            <span className="hud-val amber">{isNaN(hoverCoord.dfVal) ? 'undefined' : hoverCoord.dfVal.toFixed(3)}</span>
          </div>
        </div>
      )}

      {/* Point Tooltip on Hover */}
      {hoveredPoint && (
        <div className="point-tooltip">
          <div className="tooltip-title">{hoveredPoint.label}</div>
          <div className="tooltip-desc">{hoveredPoint.description}</div>
        </div>
      )}

      {/* Legend Badge */}
      <div className="canvas-legend">
        <div className="legend-pill cyan">
          <span className="dot"></span>
          <span>f(x)</span>
        </div>
        {showDerivative1 && (
          <div className="legend-pill amber">
            <span className="dot"></span>
            <span>f'(x) Turunan 1</span>
          </div>
        )}
        {showDerivative2 && (
          <div className="legend-pill purple">
            <span className="dot"></span>
            <span>f''(x) Turunan 2</span>
          </div>
        )}
        {tangentConfig.enabled && (
          <div className="legend-pill pink">
            <span className="dot"></span>
            <span>Garis Singgung</span>
          </div>
        )}
        {tangentConfig.enabled && tangentConfig.showSecant && (
          <div className="legend-pill emerald">
            <span className="dot"></span>
            <span>Garis Potong (Secant)</span>
          </div>
        )}
      </div>
    </div>
  );
};

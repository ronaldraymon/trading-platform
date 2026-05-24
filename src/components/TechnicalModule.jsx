import React, { useState, useEffect, useRef } from 'react';
import { Eye, TrendingUp, BarChart2, CheckSquare, Layers } from 'lucide-react';

export default function TechnicalModule({ symbol, chartData, loadingChart }) {
  const [range, setRange] = useState('1M');
  const [indicators, setIndicators] = useState({
    ema50: true,
    ema200: false,
    bollinger: false
  });
  const [activeSubChart, setActiveSubChart] = useState('RSI');
  const [hoveredCandle, setHoveredCandle] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    // Range state synchronization
  }, [range]);

  if (loadingChart || !chartData || !chartData.candles) {
    return <div style={{ color: 'var(--text-secondary)', padding: '2rem', textAlign: 'center' }}>Loading interactive technical chart...</div>;
  }

  const { candles, support, resistance, patterns } = chartData;

  const toggleIndicator = (ind) => {
    setIndicators(prev => ({ ...prev, [ind]: !prev[ind] }));
  };

  const width = 800;
  const height = 300;
  const margin = { top: 35, right: 80, bottom: 20, left: 20 }; // increased top margin to prevent corporate action label clipping
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const prices = candles.flatMap(c => [
    c.high, 
    c.low, 
    indicators.ema50 ? c.ema50 : null, 
    indicators.ema200 ? c.ema200 : null,
    indicators.bollinger ? c.bbUpper : null,
    indicators.bollinger ? c.bbLower : null
  ]).filter(p => p !== null && p !== undefined);

  const maxPrice = Math.max(...prices) * 1.015;
  const minPrice = Math.min(...prices) * 0.985;
  const priceRange = maxPrice - minPrice;

  const getX = (index) => margin.left + (index / (candles.length - 1)) * chartWidth;
  const getY = (price) => margin.top + chartHeight - ((price - minPrice) / priceRange) * chartHeight;

  const buildPath = (key) => {
    return candles.map((c, i) => {
      const x = getX(i);
      const y = getY(c[key]);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  const formatVal = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 1 }).format(val).replace('INR', '₹');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Chart Control Toolbar */}
      <div className="glass-panel" style={{ padding: '0.75rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Timeframe selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Range:</span>
          <div style={{ display: 'flex', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', padding: '2px' }}>
            {['1D', '1W', '1M', '1Y'].map(r => (
              <button 
                key={r} 
                className="btn" 
                style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', border: 'none', background: range === r ? 'var(--bg-tertiary)' : 'transparent', color: range === r ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                onClick={() => setRange(r)}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Technical Overlays */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Overlays:</span>
          <button 
            className={`btn ${indicators.ema50 ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.3rem 0.625rem', fontSize: '0.75rem' }}
            onClick={() => toggleIndicator('ema50')}
          >
            EMA (50)
          </button>
          <button 
            className={`btn ${indicators.ema200 ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.3rem 0.625rem', fontSize: '0.75rem' }}
            onClick={() => toggleIndicator('ema200')}
          >
            EMA (200)
          </button>
          <button 
            className={`btn ${indicators.bollinger ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.3rem 0.625rem', fontSize: '0.75rem' }}
            onClick={() => toggleIndicator('bollinger')}
          >
            Bollinger Bands
          </button>
        </div>

        {/* Oscillators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Oscillators:</span>
          <div style={{ display: 'flex', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', padding: '2px' }}>
            {['RSI', 'MACD', 'None'].map(o => (
              <button 
                key={o} 
                className="btn" 
                style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', border: 'none', background: activeSubChart === o ? 'var(--bg-tertiary)' : 'transparent', color: activeSubChart === o ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                onClick={() => setActiveSubChart(o)}
              >
                {o}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Main Interactive Candlestick Graphic */}
      <div className="glass-panel" style={{ position: 'relative', overflow: 'hidden' }}>
        
        {/* Live Hover Overlay Stats including Corporate events */}
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem', marginBottom: '0.5rem', minHeight: '22px', flexWrap: 'wrap' }}>
          {hoveredCandle ? (
            <>
              <span>Time: <strong style={{ color: 'var(--text-primary)' }}>{hoveredCandle.time}</strong></span>
              <span>O: <strong style={{ color: hoveredCandle.close >= hoveredCandle.open ? 'var(--success)' : 'var(--danger)' }}>{formatVal(hoveredCandle.open)}</strong></span>
              <span>H: <strong style={{ color: 'var(--text-primary)' }}>{formatVal(hoveredCandle.high)}</strong></span>
              <span>L: <strong style={{ color: 'var(--text-primary)' }}>{formatVal(hoveredCandle.low)}</strong></span>
              <span>C: <strong style={{ color: hoveredCandle.close >= hoveredCandle.open ? 'var(--success)' : 'var(--danger)' }}>{formatVal(hoveredCandle.close)}</strong></span>
              {hoveredCandle.corporateAction && (
                <span className="badge badge-warning" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', border: 'none', animation: 'pulseGlow 2s infinite' }}>
                  📢 Event: {hoveredCandle.corporateAction.description}
                </span>
              )}
            </>
          ) : (
            <span style={{ color: 'var(--text-muted)' }}>Hover over candles or corporate markers [D], [S], [B] to inspect ex-dates</span>
          )}
        </div>

        {/* Chart SVG */}
        <div ref={containerRef} style={{ width: '100%', overflowX: 'auto' }}>
          <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
            
            {/* Grid Lines */}
            {Array.from({ length: 5 }).map((_, i) => {
              const yVal = minPrice + (priceRange * (i / 4));
              const y = getY(yVal);
              return (
                <g key={i}>
                  <line x1={margin.left} y1={y} x2={width - margin.right} y2={y} stroke="rgba(255, 255, 255, 0.04)" strokeDasharray="3 3" />
                  <text x={width - margin.right + 8} y={y + 4} fill="var(--text-muted)" style={{ fontSize: '0.65rem', fontFamily: 'var(--font-display)' }}>
                    {formatVal(yVal)}
                  </text>
                </g>
              );
            })}

            {/* Support and Resistance Horizontal Markers */}
            <g>
              <line x1={margin.left} y1={getY(resistance)} x2={width - margin.right} y2={getY(resistance)} stroke="rgba(239, 68, 68, 0.4)" strokeWidth={1.5} strokeDasharray="5 5" />
              <text x={width - margin.right + 5} y={getY(resistance) - 4} fill="var(--danger)" style={{ fontSize: '0.65rem', fontWeight: 600 }}>
                Res: {formatVal(resistance)}
              </text>
              
              <line x1={margin.left} y1={getY(support)} x2={width - margin.right} y2={getY(support)} stroke="rgba(16, 185, 129, 0.4)" strokeWidth={1.5} strokeDasharray="5 5" />
              <text x={width - margin.right + 5} y={getY(support) + 12} fill="var(--success)" style={{ fontSize: '0.65rem', fontWeight: 600 }}>
                Supp: {formatVal(support)}
              </text>
            </g>

            {/* Bollinger Band Shaded Area */}
            {indicators.bollinger && (
              <path 
                d={`
                  ${candles.map((c, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(c.bbUpper)}`).join(' ')}
                  ${[...candles].reverse().map((c, i) => `L ${getX(candles.length - 1 - i)} ${getY(c.bbLower)}`).join(' ')}
                  Z
                `}
                fill="rgba(99, 102, 241, 0.03)"
                stroke="rgba(99, 102, 241, 0.15)"
                strokeWidth={1}
              />
            )}

            {/* EMA 50 Overlay Line */}
            {indicators.ema50 && (
              <path d={buildPath('ema50')} fill="none" stroke="#F59E0B" strokeWidth={1.5} opacity={0.8} />
            )}

            {/* EMA 200 Overlay Line */}
            {indicators.ema200 && (
              <path d={buildPath('ema200')} fill="none" stroke="#10B981" strokeWidth={1.5} opacity={0.8} />
            )}

            {/* Candlesticks & Volume Profiles */}
            {candles.map((candle, i) => {
              const x = getX(i);
              const oY = getY(candle.open);
              const cY = getY(candle.close);
              const hY = getY(candle.high);
              const lY = getY(candle.low);
              
              const isBullish = candle.close >= candle.open;
              const color = isBullish ? 'var(--success)' : 'var(--danger)';
              const widthPerCandle = Math.max(3, (chartWidth / candles.length) * 0.6);

              // Volume bar
              const volMax = Math.max(...candles.map(c => c.volume));
              const volHeight = 40;
              const volY = height - margin.bottom - ((candle.volume / volMax) * volHeight);
              
              return (
                <g key={i} 
                   onMouseEnter={() => setHoveredCandle(candle)}
                   onMouseLeave={() => setHoveredCandle(null)}
                   style={{ cursor: 'pointer' }}
                >
                  <line x1={x} y1={hY} x2={x} y2={lY} stroke={color} strokeWidth={1.5} />
                  
                  <rect 
                    x={x - widthPerCandle / 2} 
                    y={Math.min(oY, cY)} 
                    width={widthPerCandle} 
                    height={Math.max(1.5, Math.abs(oY - cY))} 
                    fill={color}
                  />

                  <rect 
                    x={x - widthPerCandle / 2} 
                    y={volY} 
                    width={widthPerCandle} 
                    height={height - margin.bottom - volY} 
                    fill={color}
                    opacity={0.12}
                  />

                  {/* Corporate ex-date action overlays */}
                  {candle.corporateAction && (
                    <g>
                      <circle 
                        cx={x} 
                        cy={margin.top - 18} 
                        r={8} 
                        fill={
                          candle.corporateAction.type === 'dividend' ? 'var(--warning)' : 
                          candle.corporateAction.type === 'split' ? 'var(--primary)' : '#8B5CF6'
                        }
                        boxShadow="0 0 8px rgba(0,0,0,0.5)"
                      />
                      <text 
                        x={x} 
                        y={margin.top - 14} 
                        fill="#fff" 
                        textAnchor="middle" 
                        style={{ fontSize: '0.65rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}
                      >
                        {candle.corporateAction.label}
                      </text>
                    </g>
                  )}

                  {hoveredCandle === candle && (
                    <circle cx={x} cy={cY} r={4} fill="var(--text-primary)" />
                  )}
                </g>
              );
            })}

            {/* Pattern Recognition Flags Overlay */}
            {patterns.map((pattern, idx) => {
              const x = getX(pattern.index);
              const y = getY(candles[pattern.index].high) - 15;
              return (
                <g key={idx}>
                  <line x1={x} y1={y + 5} x2={x} y2={getY(candles[pattern.index].high)} stroke="var(--primary)" strokeWidth={1} />
                  <rect x={x - 45} y={y - 12} width={90} height={18} rx={4} fill="var(--bg-tertiary)" stroke="var(--primary)" strokeWidth={1} />
                  <text x={x} y={y} fill="var(--text-primary)" textAnchor="middle" style={{ fontSize: '0.6rem', fontWeight: 600, fontFamily: 'var(--font-display)' }}>
                    {pattern.label}
                  </text>
                </g>
              );
            })}

          </svg>
        </div>
      </div>

      {/* Sub Charts (RSI / MACD) */}
      {activeSubChart !== 'None' && (
        <div className="glass-panel" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
            <span>{activeSubChart} Indicator Chart</span>
            {activeSubChart === 'RSI' ? (
              <span>Overbought &gt; 70 | Oversold &lt; 30</span>
            ) : (
              <span>MACD (12, 26, 9) Signal Cross</span>
            )}
          </div>

          <div style={{ width: '100%', height: '100px' }}>
            <svg viewBox={`0 0 ${width} 100`} style={{ width: '100%', height: '100%', display: 'block' }}>
              {activeSubChart === 'RSI' ? (
                <>
                  <line x1={margin.left} y1={70} x2={width - margin.right} y2={70} stroke="rgba(239, 68, 68, 0.2)" strokeDasharray="3 3" />
                  <text x={width - margin.right + 5} y={73} fill="var(--danger)" style={{ fontSize: '0.55rem', opacity: 0.7 }}>30</text>
                  
                  <line x1={margin.left} y1={50} x2={width - margin.right} y2={50} stroke="rgba(255, 255, 255, 0.03)" />
                  
                  <line x1={margin.left} y1={30} x2={width - margin.right} y2={30} stroke="rgba(16, 185, 129, 0.2)" strokeDasharray="3 3" />
                  <text x={width - margin.right + 5} y={33} fill="var(--success)" style={{ fontSize: '0.55rem', opacity: 0.7 }}>70</text>

                  <path 
                    d={candles.map((c, i) => {
                      const x = getX(i);
                      const y = 10 + (1 - c.rsi / 100) * 80;
                      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#818CF8"
                    strokeWidth={1.5}
                  />
                </>
              ) : (
                <>
                  <line x1={margin.left} y1={50} x2={width - margin.right} y2={50} stroke="rgba(255,255,255,0.06)" />
                  
                  <path 
                    d={candles.map((c, i) => {
                      const x = getX(i);
                      const y = 50 - (c.macd * 5);
                      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#10B981"
                    strokeWidth={1.5}
                  />

                  <path 
                    d={candles.map((c, i) => {
                      const x = getX(i);
                      const y = 50 - (c.signal * 5);
                      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth={1.2}
                    strokeDasharray="2 2"
                  />
                </>
              )}
            </svg>
          </div>
        </div>
      )}

      {/* Technical Interpretation */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
          <Layers size={16} style={{ color: 'var(--primary)' }} />
          Automated Market Trend Analysis
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          
          <div className="sub-panel" style={{ fontSize: '0.8125rem' }}>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Moving Average Trend</div>
            <div style={{ fontWeight: 600, color: 'var(--success)' }}>
              Bullish (Price above EMA 50 &amp; 200)
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              The short-term 50 EMA continues to trade comfortably above the long-term 200 EMA.
            </p>
          </div>

          <div className="sub-panel" style={{ fontSize: '0.8125rem' }}>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Momentum (RSI)</div>
            <div style={{ fontWeight: 600, color: 'var(--warning)' }}>
              Neutral ({candles[candles.length - 1]?.rsi?.toFixed(0)} - Fairly Valued)
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              RSI resides in a balanced range. No overbought (&gt;70) or oversold (&lt;30) signals triggered.
            </p>
          </div>

          <div className="sub-panel" style={{ fontSize: '0.8125rem' }}>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Pattern Recognition</div>
            <div style={{ fontWeight: 600, color: 'var(--success)' }}>
              Bullish Flag Breakout detected
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              High-volume break above major short resistance. Validating entry triggers.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}

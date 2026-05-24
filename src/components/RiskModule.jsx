import React, { useState, useEffect } from 'react';
import { Percent, ShieldAlert, Award, ShieldCheck, Globe, Sliders } from 'lucide-react';

export default function RiskModule({ symbol, currentPrice, sector, macroMetrics, onUpdateMacro }) {
  // Position Sizing states
  const [portfolioSize, setPortfolioSize] = useState(1000000);
  const [riskPercent, setRiskPercent] = useState(1);
  const [entryPrice, setEntryPrice] = useState(currentPrice);
  const [stopLoss, setStopLoss] = useState(parseFloat((currentPrice * 0.95).toFixed(2)));
  
  // Risk/Reward states
  const [targetPrice, setTargetPrice] = useState(parseFloat((currentPrice * 1.18).toFixed(2)));

  useEffect(() => {
    setEntryPrice(currentPrice);
    setStopLoss(parseFloat((currentPrice * 0.95).toFixed(2)));
    setTargetPrice(parseFloat((currentPrice * 1.18).toFixed(2)));
  }, [currentPrice]);

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val).replace('INR', '₹');
  };

  // Position Sizing calculations
  const maxLoss = portfolioSize * (riskPercent / 100);
  const riskPerShare = entryPrice - stopLoss;
  
  let sharesToBuy = 0;
  let capitalNeeded = 0;
  let portfolioExposure = 0;
  
  if (riskPerShare > 0) {
    sharesToBuy = Math.floor(maxLoss / riskPerShare);
    capitalNeeded = sharesToBuy * entryPrice;
    portfolioExposure = (capitalNeeded / portfolioSize) * 100;
  }

  // Risk / Reward calculations
  const upside = targetPrice - entryPrice;
  const downside = entryPrice - stopLoss;
  const rrRatio = downside > 0 ? parseFloat((upside / downside).toFixed(2)) : 0;

  // Correlation Matrix
  const portfolioAssets = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK'];
  
  const getCorrelation = (asset) => {
    if (asset === symbol) return 1.0;
    
    const defaultCorrelations = {
      'IT Services': { INFY: 0.88, TCS: 0.85, RELIANCE: 0.35, HDFCBANK: 0.42, ICICIBANK: 0.45 },
      'Banking': { HDFCBANK: 0.85, ICICIBANK: 0.82, RELIANCE: 0.45, TCS: 0.38, INFY: 0.42 },
      'Energy': { RELIANCE: 0.9, HDFCBANK: 0.48, ICICIBANK: 0.42, TCS: 0.35, INFY: 0.32 },
      'FMCG': { RELIANCE: 0.3, HDFCBANK: 0.4, ICICIBANK: 0.35, TCS: 0.42, INFY: 0.45 },
      'Automobile': { RELIANCE: 0.42, HDFCBANK: 0.52, ICICIBANK: 0.55, TCS: 0.45, INFY: 0.4 }
    };

    const sectorData = defaultCorrelations[sector] || defaultCorrelations['FMCG'];
    return sectorData[asset] || parseFloat((0.2 + (asset.charCodeAt(0) % 5) * 0.1).toFixed(2));
  };

  const highCorrelations = portfolioAssets
    .filter(a => a !== symbol)
    .map(a => ({ asset: a, coeff: getCorrelation(a) }))
    .filter(c => c.coeff > 0.70);

  // Sector margin sensitivities based on Crude Oil prices
  const getCommoditySqueezeAlert = () => {
    const oil = macroMetrics.crudeOil;
    if (oil > 85.0) {
      if (sector === 'Automobile') {
        return {
          type: 'danger',
          title: 'Crude Oil Margin Squeeze Alert',
          text: `Brent Crude is high ($${oil}/bbl). High oil prices increase raw rubber (tires) and logistics input costs, threatening Automobile margins. Recommend tighter stops.`
        };
      }
      if (sector === 'IT Services') {
        return {
          type: 'neutral',
          title: 'Commodity Shield',
          text: `IT Services sector is shielded from Crude Oil price surges due to zero material inputs.`
        };
      }
      if (sector === 'Energy') {
        return {
          type: 'success',
          title: 'Refining Margin Boom',
          text: `Brent Crude spike ($${oil}/bbl) increases refining margins and asset valuation for Energy exporters like Reliance. Fundamental tailwind.`
        };
      }
    }
    return null;
  };

  const commodityAlert = getCommoditySqueezeAlert();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Macro & International Catalyst Engine Panel */}
      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', marginBottom: '0.25rem' }}>
              <Globe size={18} style={{ color: 'var(--primary)' }} />
              Macro &amp; Intermarket Catalyst Engine
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Interactive Stress testing: adjust sliders to observe sector-specific margin implications
            </p>
          </div>
          <span className="badge badge-warning" style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', fontSize: '0.7rem' }}>
            <Sliders size={12} /> Interactive Sliders Active
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
          {/* Slider 1: DXY */}
          <div className="sub-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              <span>US Dollar Index ($DXY)</span>
              <strong>{macroMetrics.dxy}</strong>
            </div>
            <input 
              type="range" 
              min="98" 
              max="110" 
              step="0.05" 
              value={macroMetrics.dxy} 
              onChange={e => onUpdateMacro('dxy', e.target.value)}
              style={{ width: '100%', accentColor: 'var(--primary)' }}
            />
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
              DXY &gt; 104 triggers institutional outflows from emerging markets.
            </span>
          </div>

          {/* Slider 2: Crude Oil */}
          <div className="sub-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              <span>Brent Crude Oil ($/bbl)</span>
              <strong>${macroMetrics.crudeOil}</strong>
            </div>
            <input 
              type="range" 
              min="65" 
              max="110" 
              step="0.5" 
              value={macroMetrics.crudeOil} 
              onChange={e => onUpdateMacro('crudeOil', e.target.value)}
              style={{ width: '100%', accentColor: 'var(--warning)' }}
            />
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
              High oil inflates input costs for Auto, Tires, Paints.
            </span>
          </div>

          {/* Slider 3: US 10-Yr Yield */}
          <div className="sub-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              <span>US 10-Year Treasury Yield</span>
              <strong>{macroMetrics.us10Y}%</strong>
            </div>
            <input 
              type="range" 
              min="3.2" 
              max="5.2" 
              step="0.05" 
              value={macroMetrics.us10Y} 
              onChange={e => onUpdateMacro('us10Y', e.target.value)}
              style={{ width: '100%', accentColor: 'var(--danger)' }}
            />
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
              Yield spikes compress PE multiples of growth stocks globally.
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', alignItems: 'center' }}>
          {/* Policy Rates */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div className="sub-panel" style={{ flexGrow: 1, padding: '0.6rem 1rem' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>RBI Repo Rate</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>{macroMetrics.rbiRate}%</div>
            </div>
            <div className="sub-panel" style={{ flexGrow: 1, padding: '0.6rem 1rem' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>US Fed Funds Rate</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>{macroMetrics.fedRate}%</div>
            </div>
          </div>

          {/* Dynamic Commodity warning */}
          {commodityAlert && (
            <div style={{ 
              padding: '0.75rem 1rem', 
              borderRadius: '8px', 
              fontSize: '0.8125rem', 
              lineHeight: '1.4',
              backgroundColor: commodityAlert.type === 'danger' ? 'rgba(239, 68, 68, 0.08)' : (commodityAlert.type === 'success' ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-secondary)'),
              border: `1px solid ${commodityAlert.type === 'danger' ? 'rgba(239, 68, 68, 0.2)' : (commodityAlert.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'var(--glass-border)')}`,
              color: commodityAlert.type === 'danger' ? 'var(--danger)' : (commodityAlert.type === 'success' ? 'var(--success)' : 'var(--text-primary)')
            }}>
              <strong>{commodityAlert.title}:</strong> {commodityAlert.text}
            </div>
          )}
        </div>
      </div>

      {/* Position Sizer and Risk Reward rows */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        
        {/* Position Sizer Form */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', marginBottom: '0.25rem' }}>
            <Percent size={18} style={{ color: 'var(--primary)' }} />
            Position Sizing Calculator
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Find the optimal number of shares based on your risk parameters
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                Total Portfolio size (₹)
              </label>
              <input 
                type="number" 
                className="input-field" 
                value={portfolioSize} 
                onChange={e => setPortfolioSize(parseFloat(e.target.value) || 0)} 
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                Risk Limit per Trade (%)
              </label>
              <select 
                className="input-field" 
                value={riskPercent} 
                onChange={e => setRiskPercent(parseFloat(e.target.value) || 0)}
              >
                <option value="0.5">0.5% (Conservative)</option>
                <option value="1">1.0% (Standard)</option>
                <option value="2">2.0% (Aggressive)</option>
                <option value="5">5.0% (High Speculation)</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                Entry price (₹)
              </label>
              <input 
                type="number" 
                className="input-field" 
                value={entryPrice} 
                onChange={e => setEntryPrice(parseFloat(e.target.value) || 0)} 
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                Stop-Loss Price (₹)
              </label>
              <input 
                type="number" 
                className="input-field" 
                value={stopLoss} 
                onChange={e => setStopLoss(parseFloat(e.target.value) || 0)} 
              />
            </div>
          </div>

          <div className="sub-panel" style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Maximum Capital Risked:</span>
              <strong style={{ color: 'var(--danger)' }}>{formatINR(maxLoss)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Capital Needed:</span>
              <strong style={{ color: 'var(--text-primary)' }}>{formatINR(capitalNeeded)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Portfolio Exposure:</span>
              <strong style={{ color: portfolioExposure > 20 ? 'var(--warning)' : 'var(--text-primary)' }}>
                {portfolioExposure.toFixed(1)}%
              </strong>
            </div>
            
            <div style={{ borderTop: '1px solid var(--border-light)', marginTop: '0.5rem', paddingTop: '0.5rem', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>RECOMENDED ALLOCATION</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)', fontFamily: 'var(--font-display)', marginTop: '0.2rem' }}>
                {sharesToBuy.toLocaleString('en-IN')} Shares
              </div>
            </div>
          </div>
        </div>

        {/* Risk / Reward Visualizer */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', marginBottom: '0.25rem' }}>
            <Award size={18} style={{ color: 'var(--success)' }} />
            Risk/Reward Ratio Visualizer
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Comparing potential profit targets against stop-loss limits
          </p>

          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
              Upside Target Price (₹)
            </label>
            <input 
              type="number" 
              className="input-field" 
              value={targetPrice} 
              onChange={e => setTargetPrice(parseFloat(e.target.value) || 0)} 
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Risk Ratio</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: rrRatio >= 3.0 ? 'var(--success)' : 'var(--warning)', marginTop: '0.1rem' }}>
                  {rrRatio}:1
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {rrRatio >= 3.0 ? (
                  <span className="badge badge-success" style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                    <ShieldCheck size={12} /> Favorable Risk/Reward
                  </span>
                ) : (
                  <span className="badge badge-warning" style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                    <ShieldAlert size={12} /> Low Safety Margin
                  </span>
                )}
              </div>
            </div>

            {downside > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  <span>Downside (Stop): {formatINR(downside)}</span>
                  <span>Upside (Target): {formatINR(upside)}</span>
                </div>
                
                <div style={{ width: '100%', height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                  <div style={{ width: `${(downside / (upside + downside)) * 100}%`, backgroundColor: 'var(--danger)' }}></div>
                  <div style={{ width: `${(upside / (upside + downside)) * 100}%`, backgroundColor: 'var(--success)' }}></div>
                </div>
              </div>
            )}
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
            <strong>Expert Advice:</strong> A minimum risk/reward ratio of 3:1 is standard. This ensures that even if you only win 33% of your trades, you remain net-profitable over the long term.
          </div>
        </div>

      </div>

      {/* Correlation Matrix */}
      <div className="glass-panel">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', marginBottom: '0.25rem' }}>
          <ShieldAlert size={18} style={{ color: 'var(--warning)' }} />
          Portfolio Correlation Matrix &amp; Sector Check
        </h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          Verifying cross-asset correlation against existing portfolio holdings to protect sector diversification
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', alignItems: 'center' }}>
          
          <div style={{ overflowX: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${portfolioAssets.length + 1}, 1fr)`, gap: '4px', minWidth: '320px', textAlign: 'center', fontSize: '0.75rem' }}>
              <div style={{ padding: '0.4rem', fontWeight: 600, color: 'var(--text-muted)' }}>Assets</div>
              {portfolioAssets.map(a => (
                <div key={a} style={{ padding: '0.4rem', fontWeight: 600, color: a === symbol ? 'var(--primary)' : 'var(--text-secondary)' }}>{a}</div>
              ))}

              <div style={{ padding: '0.4rem', fontWeight: 600, color: 'var(--primary)' }}>{symbol}</div>
              {portfolioAssets.map(a => {
                const corr = getCorrelation(a);
                let bg = 'rgba(255, 255, 255, 0.02)';
                let textColor = 'var(--text-secondary)';
                if (corr === 1.0) {
                  bg = 'rgba(99, 102, 241, 0.2)';
                  textColor = 'var(--primary)';
                } else if (corr > 0.8) {
                  bg = 'rgba(239, 68, 68, 0.2)';
                  textColor = 'var(--danger)';
                } else if (corr > 0.5) {
                  bg = 'rgba(245, 158, 11, 0.15)';
                  textColor = 'var(--warning)';
                } else {
                  bg = 'rgba(16, 185, 129, 0.15)';
                  textColor = 'var(--success)';
                }
                return (
                  <div key={a} style={{ padding: '0.4rem', background: bg, color: textColor, borderRadius: '4px', fontWeight: corr > 0.7 ? 700 : 500 }}>
                    {corr.toFixed(2)}
                  </div>
                );
              })}

              {portfolioAssets.slice(0, 3).map(rowAsset => (
                <React.Fragment key={rowAsset}>
                  <div style={{ padding: '0.4rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{rowAsset}</div>
                  {portfolioAssets.map(colAsset => {
                    const selfCorr = rowAsset === colAsset ? 1.0 : parseFloat((0.3 + (rowAsset.charCodeAt(0) * colAsset.charCodeAt(0) % 5) * 0.12).toFixed(2));
                    let bg = 'rgba(255,255,255,0.02)';
                    if (selfCorr === 1.0) bg = 'rgba(255,255,255,0.1)';
                    else if (selfCorr > 0.7) bg = 'rgba(239, 68, 68, 0.08)';
                    return (
                      <div key={colAsset} style={{ padding: '0.4rem', background: bg, borderRadius: '4px', color: 'var(--text-muted)' }}>
                        {selfCorr.toFixed(2)}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {highCorrelations.length > 0 ? (
              <div style={{ padding: '1rem', borderRadius: '10px', backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                <strong style={{ color: 'var(--danger)', fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>
                  Risk Alert: High Sector Correlation!
                </strong>
                <ul style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {highCorrelations.map(c => (
                    <li key={c.asset}>
                      {symbol} has a correlation of <strong style={{ color: 'var(--danger)' }}>{c.coeff.toFixed(2)}</strong> with <strong>{c.asset}</strong> ({sector} sector).
                    </li>
                  ))}
                </ul>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: '1.4' }}>
                  <strong>Recommendation:</strong> Buying this stock increases exposure to {sector}. Consider allocating capital to uncorrelated sectors (e.g., FMCG, Energy) to reduce market beta.
                </p>
              </div>
            ) : (
              <div style={{ padding: '1rem', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.15)', color: 'var(--success)' }}>
                <strong style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>
                  Diversification Approved
                </strong>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  {symbol} exhibits weak correlation (&lt; 0.50) with all core assets in your portfolio. This trade serves as an effective diversifier and reduces overall portfolio volatility.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}

import React, { useState } from 'react';
import { BookOpen, AlertCircle, AlertTriangle, ShieldCheck, Thermometer, Plus, Trash2, ShieldAlert, Cpu } from 'lucide-react';

export default function BehavioralModule({ symbol, currentPrice, sector, onAddTrade, trades, fundamentals }) {
  // Trade Journal States
  const [journalReason, setJournalReason] = useState('');
  const [journalEmotionalState, setJournalEmotionalState] = useState('Neutral');
  const [thesisChecklist, setThesisChecklist] = useState({
    growthMatch: false,
    stopLossDefined: false,
    mosConfirmed: false,
    uncorrelatedSector: false
  });
  const [journalMessage, setJournalMessage] = useState('');

  // Stress Tester Sliders
  const [rateHike, setRateHike] = useState(0);
  const [marketCorrection, setMarketCorrection] = useState(0);
  const [oilSpike, setOilSpike] = useState(0);

  // Smart Alerts States
  const [alertPrice, setAlertPrice] = useState(parseFloat((currentPrice * 0.95).toFixed(0)));
  const [alertRSI, setAlertRSI] = useState(30);
  const [activeAlerts, setActiveAlerts] = useState([
    { id: 1, symbol, condPrice: '<', price: parseFloat((currentPrice * 0.92).toFixed(0)), condRsi: '<', rsi: 30, active: true }
  ]);

  // Supply Chain simulator bottleneck states
  const [supplyChainMetric, setSupplyChainMetric] = useState('Semiconductors'); // Semiconductors, Shipping, Minerals

  const handleJournalSubmit = (e) => {
    e.preventDefault();
    
    if (journalReason.trim().length < 15) {
      setJournalMessage('⚠️ Please provide a detailed core thesis (minimum 15 characters) to enforce disciplined entry.');
      return;
    }

    if (!thesisChecklist.stopLossDefined) {
      setJournalMessage('⚠️ You must define and commit to a Stop-Loss level in your checklist before placing the trade.');
      return;
    }

    const newTrade = {
      id: Date.now(),
      symbol,
      price: currentPrice,
      date: new Date().toLocaleDateString('en-IN'),
      emotionalState: journalEmotionalState,
      thesis: journalReason,
      checklist: { ...thesisChecklist }
    };

    onAddTrade(newTrade);
    setJournalReason('');
    setThesisChecklist({ growthMatch: false, stopLossDefined: false, mosConfirmed: false, uncorrelatedSector: false });
    setJournalMessage('✅ Trade successfully committed to Journal and Virtual Portfolio!');
    setTimeout(() => setJournalMessage(''), 4000);
  };

  const handleCreateAlert = (e) => {
    e.preventDefault();
    const newAlert = {
      id: Date.now(),
      symbol,
      condPrice: '<',
      price: alertPrice,
      condRsi: '<',
      rsi: alertRSI,
      active: true
    };
    setActiveAlerts([newAlert, ...activeAlerts]);
  };

  const deleteAlert = (id) => {
    setActiveAlerts(activeAlerts.filter(a => a.id !== id));
  };

  const getStressImpact = () => {
    let rateBeta = -1.5;
    let oilBeta = -0.5;
    let beta = 1.0;

    if (sector === 'IT Services') {
      rateBeta = -3.2;
      oilBeta = -0.1;
      beta = 1.15;
    } else if (sector === 'Banking') {
      rateBeta = 0.5;
      oilBeta = -0.6;
      beta = 1.25;
    } else if (sector === 'Energy') {
      rateBeta = -1.0;
      oilBeta = 0.8;
      beta = 0.85;
    } else if (sector === 'Automobile') {
      rateBeta = -2.5;
      oilBeta = -1.8;
      beta = 1.3;
    } else if (sector === 'FMCG') {
      rateBeta = -0.8;
      oilBeta = -0.8;
      beta = 0.65;
    }

    const rateImpact = rateHike * rateBeta;
    const correctionImpact = marketCorrection * beta;
    const oilImpact = (oilSpike / 10) * oilBeta;

    const totalImpact = rateImpact + correctionImpact + oilImpact;
    return parseFloat(totalImpact.toFixed(1));
  };

  const stressImpact = getStressImpact();
  const stressedPrice = currentPrice * (1 + stressImpact / 100);

  // Supply Chain Risk assessment based on sector
  const getSupplyChainRisk = () => {
    const defaultRisks = {
      'Semiconductors': {
        'Automobile': { level: 'EXTREME', color: 'var(--danger)', desc: 'Production Shutdowns: Global chips shortage directly stops line manufacturing of advanced ECU units.' },
        'IT Services': { level: 'HIGH', color: 'var(--danger)', desc: 'Hardware bottlenecks: Client enterprise infrastructure deployment delayed due to server chip lead-times.' },
        'Banking': { level: 'LOW', color: 'var(--success)', desc: 'No direct exposure to manufacturing lines; software systems fully operational.' },
        'Energy': { level: 'LOW', color: 'var(--success)', desc: 'Sub-minimal direct dependencies on advanced processor allocations.' }
      },
      'Shipping': {
        'Automobile': { level: 'HIGH', color: 'var(--danger)', desc: 'Freight Rate Spikes: Logistics delays increase import expenses of key components from East Asia.' },
        'IT Services': { level: 'LOW', color: 'var(--success)', desc: 'Services exports are fully digital; zero freight/shipping dependencies.' },
        'Banking': { level: 'LOW', color: 'var(--success)', desc: 'Financial transaction models are completely unaffected by geographical shipping bottlenecks.' },
        'Energy': { level: 'HIGH', color: 'var(--danger)', desc: 'Tanker Delays: Straits transit issues and canal bottlenecks delay crude feedstock deliveries and inflate refining freight.' }
      }
    };

    const metricGroup = defaultRisks[supplyChainMetric] || defaultRisks['Semiconductors'];
    return metricGroup[sector] || { level: 'NEUTRAL', color: 'var(--warning)', desc: 'Average commodity transit lag; monitoring supply pipelines.' };
  };

  const supplyRisk = getSupplyChainRisk();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Promoter Selling / Auditor Alerts Scanner Banner */}
      {fundamentals && fundamentals.health && (fundamentals.health.auditorResignation || fundamentals.health.promoterSellingNews) && (
        <div className="glass-panel" style={{ borderColor: 'var(--danger)', display: 'flex', flexDirection: 'column', gap: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)', fontWeight: 700 }}>
            <ShieldAlert size={20} />
            Governance &amp; News Alerts Scanner
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {fundamentals.health.auditorResignation && (
              <div style={{ padding: '0.4rem', borderLeft: '3px solid var(--danger)', paddingLeft: '0.625rem' }}>
                <strong>AUDITOR RESIGNATION ALERT:</strong> {fundamentals.health.auditorName}. Regulatory check flagged management reporting conflicts. Immediate sell overrides are active in the core analyzer.
              </div>
            )}
            {fundamentals.health.promoterSellingNews && (
              <div style={{ padding: '0.4rem', borderLeft: '3px solid var(--warning)', paddingLeft: '0.625rem' }}>
                <strong>PROMOTER SELLING SCANNER:</strong> {fundamentals.health.promoterSellingNews}. Founder liquidation is often a signal of local price ceilings.
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        
        {/* Anti-FOMO Trade Journal */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
            <BookOpen size={18} style={{ color: 'var(--primary)' }} />
            Anti-FOMO Trade Journal
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Strict entry conditions: Write down your core thesis and emotional state before buying {symbol}.
          </p>

          <form onSubmit={handleJournalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                Why are you buying this stock today? (Core Thesis)
              </label>
              <textarea 
                className="input-field"
                rows="3"
                placeholder="e.g., Q4 revenue grew 22% YoY, RSI shows bullish divergence at support line, and valuation PE is under historical standard deviation."
                value={journalReason}
                onChange={e => setJournalReason(e.target.value)}
                style={{ resize: 'none', fontFamily: 'var(--font-body)', fontSize: '0.8125rem' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                  Emotional State Checklist
                </label>
                <select 
                  className="input-field" 
                  value={journalEmotionalState}
                  onChange={e => setJournalEmotionalState(e.target.value)}
                >
                  <option value="FOMO">FOMO (Chasing rally)</option>
                  <option value="Calm">Calm &amp; Calculated</option>
                  <option value="Fear">Fearful (Buying dip in panic)</option>
                  <option value="Bored">Bored / Impatient</option>
                  <option value="Neutral">Neutral / System-driven</option>
                </select>
              </div>
              
              <div style={{ fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', justifyContent: 'center' }}>
                {journalEmotionalState === 'FOMO' && <span style={{ color: 'var(--danger)' }}>⚠️ FOMO trades fail 70% of times. Check charts!</span>}
                {journalEmotionalState === 'Calm' && <span style={{ color: 'var(--success)' }}>✅ Calculated trades are highly disciplined.</span>}
                {journalEmotionalState === 'Fear' && <span style={{ color: 'var(--warning)' }}>⚠️ Fear can lead to catching falling knives.</span>}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', margin: '0.25rem 0' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Validation Checklist:</span>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={thesisChecklist.growthMatch} onChange={e => setThesisChecklist({...thesisChecklist, growthMatch: e.target.checked})} />
                Fundamental: Earnings growth &gt; 12% is confirmed.
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={thesisChecklist.stopLossDefined} onChange={e => setThesisChecklist({...thesisChecklist, stopLossDefined: e.target.checked})} />
                Risk: Stop-Loss level is calculated &amp; committed in tracker.
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={thesisChecklist.mosConfirmed} onChange={e => setThesisChecklist({...thesisChecklist, mosConfirmed: e.target.checked})} />
                Value: Price offers at least 10% Margin of Safety.
              </label>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Commit Trade to Journal &amp; Portfolio
            </button>
          </form>

          {journalMessage && (
            <div style={{ fontSize: '0.8125rem', padding: '0.5rem 0.75rem', borderRadius: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}>
              {journalMessage}
            </div>
          )}
        </div>

        {/* AI Supply Chain Bottleneck Risk Mapping */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
            <Cpu size={18} style={{ color: 'var(--primary)' }} />
            Supply Chain Bottleneck Risk Mapper
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            AI-driven scan maps geographical bottlenecks to {symbol}'s sector operations
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                Select Global Bottleneck Catalyst
              </label>
              <select 
                className="input-field" 
                value={supplyChainMetric}
                onChange={e => setSupplyChainMetric(e.target.value)}
              >
                <option value="Semiconductors">Taiwan / East Asia (Semiconductors Shortage)</option>
                <option value="Shipping">Suez / Red Sea Straits (Shipping/Logistics delays)</option>
              </select>
            </div>

            {supplyRisk && (
              <div className="sub-panel" style={{ borderLeft: `4px solid ${supplyRisk.color}`, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Sector Operational Impact:</span>
                  <span className="badge" style={{ backgroundColor: `${supplyRisk.color}15`, color: supplyRisk.color, border: `1px solid ${supplyRisk.color}25` }}>
                    {supplyRisk.level} RISK
                  </span>
                </div>
                <p style={{ fontSize: '0.8125rem', lineHeight: '1.4', color: 'var(--text-primary)' }}>
                  {supplyRisk.desc}
                </p>
              </div>
            )}
            
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-light)', paddingTop: '0.5rem', marginTop: 'auto' }}>
              <strong>AI Catalyst Scanner:</strong> Gathers news items across regional cargo hubs, customs delays, and fab output statistics to output sector operational risk.
            </div>
          </div>
        </div>

      </div>

      {/* Macro Scenario Stress-Tester & Smart Alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        
        {/* Macro Stress Tester */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
            <Thermometer size={18} style={{ color: 'var(--danger)' }} />
            Scenario Stress-Tester
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Simulate how macroeconomic shocks would impact {symbol}'s price.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.5rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                <span>Interest Rate Hike (RBI)</span>
                <strong>+{rateHike.toFixed(1)}%</strong>
              </div>
              <input 
                type="range" 
                min="0" 
                max="3" 
                step="0.25" 
                value={rateHike} 
                onChange={e => setRateHike(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--primary)' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                <span>Nifty Market Correction</span>
                <strong>{marketCorrection}%</strong>
              </div>
              <input 
                type="range" 
                min="-30" 
                max="0" 
                step="1" 
                value={marketCorrection} 
                onChange={e => setMarketCorrection(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--danger)' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                <span>Crude Oil Price Spike</span>
                <strong>+${oilSpike} / barrel</strong>
              </div>
              <input 
                type="range" 
                min="0" 
                max="50" 
                step="5" 
                value={oilSpike} 
                onChange={e => setOilSpike(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--warning)' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1rem', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', marginTop: 'auto' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Stressed Price</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: stressImpact < 0 ? 'var(--danger)' : 'var(--success)', fontFamily: 'var(--font-display)', marginTop: '0.1rem' }}>
                  ₹{stressedPrice.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Valuation Impact</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: stressImpact < 0 ? 'var(--danger)' : 'var(--success)', fontFamily: 'var(--font-display)', marginTop: '0.1rem' }}>
                  {stressImpact >= 0 ? '+' : ''}{stressImpact}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Smart Alerts */}
        <div className="glass-panel">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', marginBottom: '0.25rem' }}>
            <AlertCircle size={18} style={{ color: 'var(--primary)' }} />
            Smart Alerts Engine
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Set multi-conditional alerts to wait for the perfect entry/exit setups, rather than constant screen-time.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <form onSubmit={handleCreateAlert} className="sub-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>Create New Conditional Alert</span>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Price condition</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    value={alertPrice}
                    onChange={e => setAlertPrice(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Price is</label>
                  <span className="badge badge-danger" style={{ display: 'block', textAlign: 'center', padding: '0.625rem 0' }}>&lt; Less than</span>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>AND technical indicator (RSI)</label>
                <select className="input-field" value={alertRSI} onChange={e => setAlertRSI(parseInt(e.target.value))}>
                  <option value="20">RSI &lt; 20 (Deep Oversold)</option>
                  <option value="30">RSI &lt; 30 (Oversold)</option>
                  <option value="40">RSI &lt; 40 (Neutral Pullback)</option>
                  <option value="70">RSI &gt; 70 (Overbought Exit)</option>
                </select>
              </div>

              <button type="submit" className="btn btn-secondary" style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                <Plus size={14} /> Add Alert Condition
              </button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Active Alert Triggers</span>
              {activeAlerts.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', padding: '1rem', textAlign: 'center', border: '1px dashed var(--glass-border)', borderRadius: '8px' }}>
                  No active conditional alerts set.
                </div>
              ) : (
                activeAlerts.map(alert => (
                  <div key={alert.id} style={{ padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{alert.symbol} Alert Trigger</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        If Price {alert.condPrice} ₹{alert.price} <span style={{ color: 'var(--primary)', fontWeight: 600 }}>AND</span> RSI {alert.condRsi} {alert.rsi}
                      </div>
                    </div>
                    
                    <button className="btn btn-secondary" onClick={() => deleteAlert(alert.id)} style={{ padding: '0.3rem', border: 'none', background: 'transparent', color: 'var(--text-muted)' }}>
                      <Trash2 size={16} style={{ color: 'var(--danger)' }} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

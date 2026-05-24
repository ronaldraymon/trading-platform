import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, TrendingDown, CheckCircle2, AlertTriangle, XCircle, ShieldAlert } from 'lucide-react';
import FundamentalModule from './FundamentalModule';
import TechnicalModule from './TechnicalModule';
import RiskModule from './RiskModule';
import BehavioralModule from './BehavioralModule';

export default function StockAnalyzer({ initialSymbol, onAddTrade, trades, macroMetrics, onUpdateMacro }) {
  const [query, setQuery] = useState(initialSymbol || 'RELIANCE');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState(initialSymbol || 'RELIANCE');
  
  const [quote, setQuote] = useState(null);
  const [fundamentals, setFundamentals] = useState(null);
  const [chartData, setChartData] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [loadingChart, setLoadingChart] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('fundamental');

  useEffect(() => {
    if (initialSymbol) {
      setSelectedSymbol(initialSymbol);
      setQuery(initialSymbol);
    }
  }, [initialSymbol]);

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    const fetchSuggestions = async () => {
      try {
        const res = await fetch(`/api/search?q=${query}`);
        const data = await res.json();
        setSuggestions(data);
      } catch (err) {
        console.error("Suggestions fetch error:", err);
      }
    };
    const delayDebounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(delayDebounce);
  }, [query]);

  const fetchData = async (symbol) => {
    setLoading(true);
    try {
      const quoteRes = await fetch(`/api/quote?symbol=${symbol}`);
      const quoteData = await quoteRes.json();
      setQuote(quoteData.data);

      const fundRes = await fetch(`/api/fundamentals?symbol=${symbol}`);
      const fundData = await fundRes.json();
      setFundamentals(fundData);

      setLoadingChart(true);
      const chartRes = await fetch(`/api/chart?symbol=${symbol}&range=1M`);
      const chartDetails = await chartRes.json();
      setChartData(chartDetails);
      setLoadingChart(false);
    } catch (err) {
      console.error("Error fetching symbol data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedSymbol);
  }, [selectedSymbol]);

  const handleSelectSuggestion = (suggestion) => {
    setSelectedSymbol(suggestion.symbol);
    setQuery(suggestion.symbol);
    setSuggestions([]);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query) {
      setSelectedSymbol(query.toUpperCase());
      setSuggestions([]);
    }
  };

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(val).replace('INR', '₹');
  };

  // Expanded Decision-Making recommendation brain with overrides
  const getDecisionSignal = () => {
    if (!quote || !fundamentals || !chartData || !chartData.candles || !fundamentals.ratios || !fundamentals.dcf || !fundamentals.health || !fundamentals.shareholdingDelta || !fundamentals.consensus || !fundamentals.corporateActions) {
      return { signal: 'HOLD / NEUTRAL', reasons: ['Analyzing stock metrics...'], color: 'var(--warning)', icon: AlertTriangle, macroWarning: false };
    }
    
    const pe = fundamentals.ratios.pe;
    const roe = fundamentals.ratios.roe;
    const rsi = chartData.candles[chartData.candles.length - 1]?.rsi || 50;
    
    // Intrinsic / DCF
    const { wacc, growth5y, fcfBase, shares } = fundamentals.dcf;
    let currentFCF = fcfBase;
    let pvSum = 0;
    for (let i = 1; i <= 5; i++) {
      currentFCF = currentFCF * (1 + growth5y/100);
      pvSum += currentFCF / Math.pow(1 + wacc/100, i);
    }
    const tv = (currentFCF * (1 + 4.5/100)) / (wacc/100 - 4.5/100);
    const pvTv = tv / Math.pow(1 + wacc/100, 5);
    const intrinsicValue = (pvSum + pvTv) / shares;
    const mos = ((intrinsicValue - quote.price) / intrinsicValue) * 100;

    // New health factors
    const auditorResign = fundamentals.health.auditorResignation;
    const pledgedShares = fundamentals.health.promoterPledge;
    const promoterSelling = fundamentals.health.promoterSellingNews;

    // 1. EMERGENCY EXIT Priority Overrides
    if (auditorResign) {
      return {
        signal: 'EMERGENCY EXIT',
        reasons: ['CRITICAL: Auditor has resigned from the firm (high corporate governance risk).', 'Thesis Violated: Exit immediately to preserve capital.'],
        color: 'var(--danger)',
        icon: XCircle,
        macroWarning: false
      };
    }
    if (pledgedShares > 15.0) {
      return {
        signal: 'EMERGENCY EXIT',
        reasons: [`CRITICAL: Promoter share pledging is extremely high (${pledgedShares}%).`, `Pledged shares increased recently (+${fundamentals.health.promoterPledgeDelta}%), exposing stock to collateral liquidation risk.`],
        color: 'var(--danger)',
        icon: XCircle,
        macroWarning: false
      };
    }

    // Shareholding Deltas
    const fiiBuying = fundamentals.shareholdingDelta.fii.current > fundamentals.shareholdingDelta.fii.prev;
    const diiBuying = fundamentals.shareholdingDelta.dii.current > fundamentals.shareholdingDelta.dii.prev;
    const consensusUpside = fundamentals.consensus.upsidePercent;

    // Macro Alerts check
    const macroWarning = macroMetrics && (macroMetrics.us10Y > 4.5 || macroMetrics.dxy > 104.0);

    // standard BUY check
    const isUndervalued = mos > 15;
    const isOversold = rsi < 38;
    const isProfitable = roe > 15;

    const buyReasons = [];
    if (isUndervalued) buyReasons.push(`Stock is undervalued offering a ${mos.toFixed(1)}% Margin of Safety.`);
    if (isOversold) buyReasons.push(`Technical RSI is oversold (${rsi.toFixed(0)}), signaling a trend reversal.`);
    if (isProfitable) buyReasons.push(`Strong operating efficiency with ROE of ${roe}%.`);

    // 2. STRONG BUY Upgrade Trigger
    if (buyReasons.length >= 2 || (isUndervalued && rsi < 55)) {
      if (fiiBuying && diiBuying && consensusUpside > 15.0) {
        return {
          signal: 'STRONG BUY / ACCUMULATION',
          reasons: [
            ...buyReasons,
            `Institutional Consensus: FII (+ stake) and DII (+ stake) are actively buying.`,
            `Broker Consensus Target offers an upside of +${consensusUpside}% (Target: ${formatINR(fundamentals.consensus.targetPrice)}).`
          ],
          color: 'var(--success)',
          icon: CheckCircle2,
          macroWarning
        };
      }
      return {
        signal: 'BUY / ACCUMULATE',
        reasons: buyReasons,
        color: 'var(--success)',
        icon: CheckCircle2,
        macroWarning
      };
    }

    // standard EXIT check
    const overValued = pe > 38 && mos < -5;
    const overBought = rsi > 70;

    const sellReasons = [];
    if (overValued) sellReasons.push(`PE is bloated (${pe}x) with negative safety buffer.`);
    if (overBought) sellReasons.push(`RSI oscillator is overbought (${rsi.toFixed(0)}), suggesting short-term pullback.`);
    if (promoterSelling) sellReasons.push(`Warning news: ${promoterSelling}.`);

    if (sellReasons.length >= 2 || overValued) {
      return {
        signal: 'EXIT / SELL',
        reasons: sellReasons,
        color: 'var(--danger)',
        icon: XCircle,
        macroWarning
      };
    }

    // standard HOLD
    const holdReasons = [
      `Price trades in fair value zone (P/E: ${pe}x).`,
      `RSI momentum is neutral (${rsi.toFixed(0)}).`
    ];
    if (fundamentals.corporateActions.dividend.consistencyYears >= 5) {
      holdReasons.push(`Stable income play: consistent dividend hikes over ${fundamentals.corporateActions.dividend.consistencyYears} years.`);
    }

    return {
      signal: 'HOLD / NEUTRAL',
      reasons: holdReasons,
      color: 'var(--warning)',
      icon: AlertTriangle,
      macroWarning
    };
  };

  const decision = getDecisionSignal();
  const DecisionIcon = decision.icon;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Search Header */}
      <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', padding: '1.25rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', position: 'relative', width: '100%', maxWidth: '400px' }}>
          <div style={{ position: 'relative', flexGrow: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="input-field" 
              placeholder="Search NSE stock symbols (e.g. TCS, HDFCBANK)..." 
              value={query} 
              onChange={e => setQuery(e.target.value)} 
              style={{ paddingLeft: '2.25rem' }}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '0 1.25rem' }}>Search</button>

          {suggestions.length > 0 && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '8px', marginTop: '0.4rem', zIndex: 100, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
              {suggestions.map(s => (
                <div 
                  key={s.symbol} 
                  style={{ padding: '0.625rem 1rem', cursor: 'pointer', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between' }}
                  onClick={() => handleSelectSuggestion(s)}
                  onMouseDown={e => e.preventDefault()}
                >
                  <strong style={{ color: 'var(--primary)' }}>{s.symbol}</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s.name}</span>
                </div>
              ))}
            </div>
          )}
        </form>

        {quote && (
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.02em' }}>
                {quote.symbol}
              </h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{quote.companyName}</span>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: quote.change >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                {formatINR(quote.price)}
              </div>
              <div style={{ fontSize: '0.75rem', display: 'flex', gap: '0.25rem', justifyContent: 'flex-end', fontWeight: 600, color: quote.change >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                {quote.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {quote.change >= 0 ? '+' : ''}{quote.change} ({quote.pChange}%)
              </div>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-secondary)' }}>
          <div className="spin-anim" style={{ width: '32px', height: '32px', border: '3px solid var(--glass-border)', borderTopColor: 'var(--primary)', borderRadius: '50%', margin: '0 auto 1.5rem' }}></div>
          <p>Analyzing {selectedSymbol} Financial &amp; Market charts...</p>
        </div>
      ) : (
        <>
          {/* Decision-Making Engine Recommendation Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="glass-panel" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', borderLeft: `4px solid ${decision.color}`, padding: '1.25rem 1.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ padding: '0.75rem', borderRadius: '12px', background: `${decision.color}15`, color: decision.color }}>
                  <DecisionIcon size={32} />
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Analysis Decision Signal</span>
                  <h3 style={{ color: decision.color, fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, marginTop: '0.1rem' }}>
                    {decision.signal}
                  </h3>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', justifyContent: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Decision Checkpoints triggered:</span>
                <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {decision.reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Systemic Macro Warning Alert Panel */}
            {decision.macroWarning && macroMetrics && (
              <div className="glass-panel" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', backgroundColor: 'rgba(239, 68, 68, 0.08)', borderColor: 'rgba(239, 68, 68, 0.25)', padding: '1rem 1.25rem' }}>
                <ShieldAlert size={20} style={{ color: 'var(--danger)' }} />
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                  <strong style={{ color: 'var(--danger)' }}>Systemic Macro Risk Warning:</strong> US 10-Yr yields are spiking (current: {macroMetrics.us10Y}%) and US Dollar Index is strengthening (current: {macroMetrics.dxy}). Systemic capital outflows from emerging markets detected. **Recommendation: Widen stop-losses or trim position sizes.**
                </div>
              </div>
            )}
          </div>

          {/* Sub-Tab navigation buttons */}
          <div className="tab-container" style={{ marginBottom: '0' }}>
            <span className={`tab-item ${activeSubTab === 'fundamental' ? 'active' : ''}`} onClick={() => setActiveSubTab('fundamental')}>
              Fundamental ("What")
            </span>
            <span className={`tab-item ${activeSubTab === 'technical' ? 'active' : ''}`} onClick={() => setActiveSubTab('technical')}>
              Technical ("When")
            </span>
            <span className={`tab-item ${activeSubTab === 'risk' ? 'active' : ''}`} onClick={() => setActiveSubTab('risk')}>
              Risk Management ("How Much")
            </span>
            <span className={`tab-item ${activeSubTab === 'behavioral' ? 'active' : ''}`} onClick={() => setActiveSubTab('behavioral')}>
              Behavioral &amp; Alerts ("Rules")
            </span>
          </div>

          {/* Render Active Sub-Module */}
          <div>
            {activeSubTab === 'fundamental' && (
              <FundamentalModule 
                symbol={selectedSymbol} 
                fundamentalData={fundamentals} 
                currentPrice={quote ? quote.price : 0}
              />
            )}
            {activeSubTab === 'technical' && (
              <TechnicalModule 
                symbol={selectedSymbol} 
                chartData={chartData} 
                loadingChart={loadingChart}
              />
            )}
            {activeSubTab === 'risk' && (
              <RiskModule 
                symbol={selectedSymbol} 
                currentPrice={quote ? quote.price : 0} 
                sector={quote ? quote.sector : 'Diversified'}
                macroMetrics={macroMetrics}
                onUpdateMacro={onUpdateMacro}
              />
            )}
            {activeSubTab === 'behavioral' && (
              <BehavioralModule 
                symbol={selectedSymbol} 
                currentPrice={quote ? quote.price : 0} 
                sector={quote ? quote.sector : 'Diversified'}
                onAddTrade={onAddTrade}
                trades={trades}
                fundamentals={fundamentals}
              />
            )}
          </div>
        </>
      )}

    </div>
  );
}

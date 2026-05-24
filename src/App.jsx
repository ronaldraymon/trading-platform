import React, { useState, useEffect } from 'react';
import { LayoutGrid, SearchCode, Book, Activity, Sparkles, TrendingUp, TrendingDown } from 'lucide-react';
import MarketDashboard from './components/MarketDashboard';
import StockAnalyzer from './components/StockAnalyzer';

export default function App() {
  const [activeTab, setActiveTab] = useState('market'); // market, analyzer
  const [selectedSymbol, setSelectedSymbol] = useState('RELIANCE');
  const [tickerPrices, setTickerPrices] = useState([]);
  
  // Global Macro Engine state (loaded from server, synchronizable via sliders)
  const [macroMetrics, setMacroMetrics] = useState({
    dxy: 103.85,
    crudeOil: 82.40,
    us10Y: 4.35,
    rbiRate: 6.50,
    fedRate: 5.25
  });

  // Virtual Portfolio state (Trade Journal logs)
  const [trades, setTrades] = useState([
    {
      id: 1,
      symbol: 'TCS',
      price: 3620.00,
      currentPrice: 3820.10,
      date: '2026-05-10',
      emotionalState: 'Calm',
      thesis: 'Q4 numbers showed 22% operating margin, strong deal pipeline. RSI was near oversold 32.',
      checklist: { growthMatch: true, stopLossDefined: true, mosConfirmed: true }
    },
    {
      id: 2,
      symbol: 'HDFCBANK',
      price: 1540.00,
      currentPrice: 1485.50,
      date: '2026-05-18',
      emotionalState: 'FOMO',
      thesis: 'Chased the bank-nifty breakout rally without checking valuation safety.',
      checklist: { growthMatch: false, stopLossDefined: true, mosConfirmed: false }
    }
  ]);

  // Fetch index prices for ticker ribbon
  useEffect(() => {
    const fetchTickerData = async () => {
      try {
        const res = await fetch('/api/indices');
        const data = await res.json();
        if (data.data) {
          setTickerPrices(data.data);
        }
      } catch (err) {
        console.error("Ticker fetch error:", err);
      }
    };
    fetchTickerData();
    const interval = setInterval(fetchTickerData, 45000);
    return () => clearInterval(interval);
  }, []);

  // Fetch initial global macro metrics
  useEffect(() => {
    const fetchMacroData = async () => {
      try {
        const res = await fetch('/api/macro-metrics');
        const data = await res.json();
        if (data.data) {
          setMacroMetrics(data.data);
        }
      } catch (err) {
        console.error("Macro metrics fetch error:", err);
      }
    };
    fetchMacroData();
  }, []);

  // Update macro state on client and sync to backend memory
  const handleUpdateMacro = async (key, val) => {
    const updated = { ...macroMetrics, [key]: parseFloat(val) };
    setMacroMetrics(updated);

    try {
      await fetch('/api/macro-metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
    } catch (err) {
      console.error("Error syncing macro update:", err);
    }
  };

  const handleAddTrade = (newTrade) => {
    setTrades([
      { ...newTrade, currentPrice: newTrade.price },
      ...trades
    ]);
  };

  const handleSelectSymbol = (symbol) => {
    setSelectedSymbol(symbol);
    setActiveTab('analyzer');
  };

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val).replace('INR', '₹');
  };

  return (
    <div className="app-container">
      
      {/* Ticker Tape Ribbon */}
      <div style={{ 
        background: 'rgba(16, 21, 36, 0.9)', 
        borderBottom: '1px solid var(--glass-border)', 
        padding: '0.4rem 1rem', 
        fontSize: '0.75rem', 
        display: 'flex', 
        gap: '2rem', 
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        scrollbarWidth: 'none'
      }}>
        {tickerPrices.length === 0 ? (
          <span style={{ color: 'var(--text-muted)' }}>Loading NSE India Live Ticker...</span>
        ) : (
          tickerPrices.map(idx => {
            const isUp = idx.percentChange >= 0;
            return (
              <span key={idx.index} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }} onClick={() => handleSelectSymbol(idx.indexSymbol === 'NIFTY 50' ? 'RELIANCE' : idx.indexSymbol)}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{idx.index}:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{idx.last?.toLocaleString('en-IN', { minimumFractionDigits: 1 })}</strong>
                <span style={{ color: isUp ? 'var(--success)' : 'var(--danger)', display: 'inline-flex', alignItems: 'center', gap: '2px', fontWeight: 600 }}>
                  {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {isUp ? '+' : ''}{idx.percentChange}%
                </span>
              </span>
            );
          })
        )}
      </div>

      {/* Main Terminal Header */}
      <header style={{ 
        padding: '1.5rem 2rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        borderBottom: '1px solid var(--glass-border)',
        background: 'radial-gradient(ellipse at top, rgba(99, 102, 241, 0.08), transparent)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, var(--primary), var(--success))',
            padding: '0.5rem',
            borderRadius: '10px',
            color: '#fff',
            boxShadow: '0 0 15px var(--primary-glow)'
          }}>
            <Sparkles size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(to right, #fff, #9CA3AF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              QUANTUM TRADE
            </h1>
            <span style={{ fontSize: '0.65rem', color: 'var(--success)', letterSpacing: '0.1em', fontWeight: 600, textTransform: 'uppercase' }}>
              NSE India Trading Terminal
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', padding: '3px' }}>
          <button 
            className="btn" 
            style={{ 
              padding: '0.5rem 1rem', 
              fontSize: '0.8125rem', 
              border: 'none', 
              background: activeTab === 'market' ? 'var(--bg-tertiary)' : 'transparent',
              color: activeTab === 'market' ? 'var(--text-primary)' : 'var(--text-secondary)'
            }}
            onClick={() => setActiveTab('market')}
          >
            <LayoutGrid size={14} />
            Market Dashboard
          </button>
          <button 
            className="btn" 
            style={{ 
              padding: '0.5rem 1rem', 
              fontSize: '0.8125rem', 
              border: 'none', 
              background: activeTab === 'analyzer' ? 'var(--bg-tertiary)' : 'transparent',
              color: activeTab === 'analyzer' ? 'var(--text-primary)' : 'var(--text-secondary)'
            }}
            onClick={() => setActiveTab('analyzer')}
          >
            <SearchCode size={14} />
            Stock Analyzer
          </button>
        </div>
      </header>

      {/* Main Pages Container */}
      <main style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '2rem 1.5rem', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {activeTab === 'market' ? (
          <>
            <MarketDashboard onSearchSymbol={handleSelectSymbol} />
            
            {/* Virtual Portfolio Holdings Section on Dashboard */}
            <div className="glass-panel" style={{ marginTop: '1rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                <Book size={18} style={{ color: 'var(--primary)' }} />
                My Trade Journal &amp; Virtual Holdings
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Reflecting on entry states, checklists, and initial thesis conditions vs live stock changes
              </p>

              {trades.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  No active holdings. Go to the Stock Analyzer, select a stock, and write your thesis in the Behavioral tab to log a trade!
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Symbol</th>
                        <th>Buy Date</th>
                        <th>Emotional State</th>
                        <th style={{ textAlign: 'right' }}>Buy Price</th>
                        <th style={{ textAlign: 'right' }}>Current Price</th>
                        <th style={{ textAlign: 'right' }}>Profit / Loss</th>
                        <th>Core Investment Thesis</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trades.map((t) => {
                        const gainLoss = ((t.currentPrice - t.price) / t.price) * 100;
                        const isGain = gainLoss >= 0;
                        return (
                          <tr key={t.id}>
                            <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{t.symbol}</td>
                            <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{t.date}</td>
                            <td>
                              <span className={`badge ${
                                t.emotionalState === 'Calm' || t.emotionalState === 'Neutral' ? 'badge-success' : 
                                t.emotionalState === 'FOMO' ? 'badge-danger' : 'badge-warning'
                              }`}>
                                {t.emotionalState}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right', fontFamily: 'var(--font-display)' }}>{formatINR(t.price)}</td>
                            <td style={{ textAlign: 'right', fontFamily: 'var(--font-display)', fontWeight: 500 }}>{formatINR(t.currentPrice)}</td>
                            <td style={{ textAlign: 'right', fontWeight: 600, color: isGain ? 'var(--success)' : 'var(--danger)' }}>
                              {isGain ? '+' : ''}{gainLoss.toFixed(1)}%
                            </td>
                            <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', maxWidth: '280px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={t.thesis}>
                              {t.thesis}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : (
          <StockAnalyzer 
            initialSymbol={selectedSymbol} 
            onAddTrade={handleAddTrade}
            trades={trades}
            macroMetrics={macroMetrics}
            onUpdateMacro={handleUpdateMacro}
          />
        )}
      </main>

      {/* Modern Terminal Footer */}
      <footer style={{ 
        borderTop: '1px solid var(--glass-border)', 
        padding: '1.25rem', 
        textAlign: 'center', 
        fontSize: '0.75rem', 
        color: 'var(--text-muted)',
        marginTop: 'auto'
      }}>
        <div>QUANTUM TRADE TERMINAL © 2026. Data sourced from NSE India. Developed for educational trading compliance.</div>
      </footer>

    </div>
  );
}

'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, Select, SelectTrigger, SelectValue, SelectIndicator, SelectPopover, Button, Link, Chip, Avatar, AvatarImage, AvatarFallback, Accordion, AccordionItem, AccordionHeading, AccordionTrigger, AccordionPanel, ListBox, ListBoxItem } from "@heroui/react";
import { KPICard } from '@/components/KPICard';
import { TradingViewChart } from '@/components/TradingViewChart';
import { SentimentBoard } from '@/components/SentimentBoard';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { Activity, LayoutDashboard, History, Settings, LogOut, RefreshCw, Play, TrendingUp } from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

const ASSETS = ["EURUSD", "GBPJPY", "XAUUSD", "USOIL", "US500", "USTECH", "AAPL", "MSFT"];

export default function DashboardPage() {
  const [selectedAsset, setSelectedAsset] = useState("EURUSD");
  const [candles, setCandles] = useState<any[]>([]);
  const [quote, setQuote] = useState<any>(null);
  const [sentiments, setSentiments] = useState<any[]>([]);
  const [techSignals, setTechSignals] = useState<any>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [resolution, setResolution] = useState("15");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const resDays = resolution === "1" ? 1 : (resolution === "5" ? 2 : (resolution === "60" ? 30 : (resolution === "D" ? 365 : 7)));
      // Fetch Candles
      const candleRes = await fetch(`${API_BASE}/candles?symbol=${selectedAsset}&resolution=${resolution}&days=${resDays}`);
      const candleData = await candleRes.json();
      setCandles(candleData);

      // Fetch Quote
      const quoteRes = await fetch(`${API_BASE}/quote?symbol=${selectedAsset}`);
      const quoteData = await quoteRes.json();
      setQuote(quoteData);

      // Fetch Bulk Sentiments for the board
      const bulkSymbols = ["EURUSD", "XAUUSD", "AAPL", "MSFT"];
      const sentimentPromises = bulkSymbols.map(async (s) => {
        const res = await fetch(`${API_BASE}/sentiment?symbol=${s}`);
        return await res.json();
      });
      const sentimentData = await Promise.all(sentimentPromises);
      setSentiments(sentimentData);

      // Fetch Technical Signals
      const techRes = await fetch(`${API_BASE}/technical-signals?symbol=${selectedAsset}`);
      const techData = await techRes.json();
      setTechSignals(techData);

      // Fetch ML Prediction
      const predRes = await fetch(`${API_BASE}/prediction?symbol=${selectedAsset}`);
      const predData = await predRes.json();
      setPrediction(predData);

    } catch (e) {
      console.error("Fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // 1 min refresh for high-level data
    return () => clearInterval(interval);
  }, [selectedAsset, resolution]);

  // WebSocket for Real-time Price
  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8000/ws/${selectedAsset}`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'trade') {
        setQuote((prev: any) => ({
          ...prev,
          price: data.price,
        }));
      }
    };

    ws.onclose = () => console.log("WS Disconnected");
    ws.onerror = (err) => console.error("WS Error:", err);

    return () => {
      ws.close();
    };
  }, [selectedAsset]);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-divider bg-default-100/5 backdrop-blur-3xl flex flex-col p-6 gap-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary">
            <Activity className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tighter">FXWIZARD PRO</h1>
        </div>

        <nav className="flex flex-col gap-2">
          <Button variant="secondary" className="justify-start">
            <LayoutDashboard size={18} />
            Dashboard
          </Button>
          <Button variant="ghost" className="justify-start opacity-70">
            <History size={18} />
            Backtest History
          </Button>
          <Button variant="ghost" className="justify-start opacity-70">
            <Settings size={18} />
            Settings
          </Button>
        </nav>

        <Card className="mt-8 bg-default-100/10 border-none">
          <CardContent className="p-4 flex flex-col gap-3">
            <p className="text-tiny font-bold uppercase text-default-500">Live Status</p>
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
              </span>
              <p className="text-small font-semibold">Bot IDLE</p>
            </div>
            <Button size="sm" variant="primary" className="font-bold gap-2">
              <Play size={14} fill="currentColor" />
              Start Bot
            </Button>
          </CardContent>
        </Card>

        <div className="mt-auto flex items-center gap-3 p-3 rounded-xl bg-default-200/10">
          <Avatar size="sm">
            <AvatarImage src="https://i.pravatar.cc/150?u=antigravity" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden">
            <p className="text-small font-bold truncate">Premium User</p>
            <p className="text-tiny text-default-500 truncate">$10,000.00</p>
          </div>
          <Button isIconOnly variant="ghost" size="sm" className="ml-auto" aria-label="Log out"><LogOut size={16} /></Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto flex flex-col custom-scrollbar">
        {/* Header */}
        <header className="h-16 border-b border-divider bg-background/40 backdrop-blur-md flex items-center px-8 sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <TrendingUp size={20} className="text-white" />
            </div>
            <p className="font-bold text-xl tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
              FX<span className="text-primary italic">Wizard</span>
            </p>
          </div>

          <nav className="ml-10 flex items-center gap-6">
            <Link href="#" className="text-sm font-medium hover:text-primary transition-colors">Market</Link>
            <Link href="#" className="text-sm font-medium opacity-50 cursor-not-allowed">Strategies</Link>
            <Link href="#" className="text-sm font-medium opacity-50 cursor-not-allowed">Portfolio</Link>
          </nav>

          <div className="ml-auto flex items-center gap-4">
            <ThemeSwitcher />
            <div className="flex flex-col items-end">
              <p className="text-xs font-medium text-success">Active Connection</p>
              <p className="text-[10px] opacity-40">UTC+1 14:45:22</p>
            </div>
          </div>
        </header>

        <div className="p-8 flex flex-col gap-8">
          <header className="flex justify-between items-center">
            <div className="flex flex-col">
              <h2 className="text-3xl font-bold">Quantitative Intelligence</h2>
              <p className="text-default-500">Real-time market analysis and prediction engine.</p>
            </div>
            <div className="flex items-center gap-4">
              <Select
                selectedKey={selectedAsset}
                onSelectionChange={(key) => setSelectedAsset(key as string)}
                aria-label="Select asset"
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                  <SelectIndicator />
                </SelectTrigger>
                <SelectPopover>
                  <ListBox items={ASSETS.map(asset => ({ id: asset, name: asset }))}>
                    {(item) => <ListBoxItem id={item.id}>{item.name}</ListBoxItem>}
                  </ListBox>
                </SelectPopover>
              </Select>
              <Button isIconOnly variant="secondary" onClick={fetchData} className="border border-white/10" aria-label="Refresh data"><RefreshCw size={18} /></Button>
            </div>
          </header>

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title={`${selectedAsset} Price`}
              value={`$${quote?.price?.toLocaleString() || '---'}`}
              change={`${quote?.change >= 0 ? '+' : ''}${quote?.change?.toFixed(2)} (${quote?.change_pct?.toFixed(2)}%)`}
              isPositive={quote?.change >= 0}
              icon="price"
            />
            <KPICard title="Sharpe Ratio" value="2.41" change="+0.12" isPositive={true} icon="sharpe" />
            <KPICard title="Max Drawdown" value="7.2%" change="-1.5%" isPositive={false} icon="drawdown" />
            <KPICard title="Projected Acc" value="84.2%" change="stable" isPositive={true} icon="winrate" />
          </div>

          {/* Chart Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-default-100/5 backdrop-blur-3xl border border-divider">
              <CardContent className="p-0">
                <div className="p-6 border-b border-divider flex justify-between items-center">
                  <h3 className="text-lg font-bold">Candlestick Terminal</h3>
                  <div className="flex gap-2">
                    {[
                      { label: "1M", value: "1" },
                      { label: "5M", value: "5" },
                      { label: "15M", value: "15" },
                      { label: "1H", value: "60" },
                      { label: "4H", value: "240" },
                      { label: "1D", value: "D" },
                    ].map((iv) => (
                      <Chip
                        key={iv.value}
                        variant={resolution === iv.value ? "primary" : "soft"}
                        color={resolution === iv.value ? "accent" : "default"}
                        size="sm"
                        className="cursor-pointer font-bold transition-all hover:scale-105"
                        onClick={() => setResolution(iv.value)}
                      >
                        {iv.label}
                      </Chip>
                    ))}
                    <Chip variant="soft" color={techSignals?.macd?.trend === 'Bullish' ? 'success' : 'danger'} size="sm" className="font-bold ml-4">
                      Trend: {techSignals?.macd?.trend || 'Calculating...'}
                    </Chip>
                  </div>
                </div>
                <div className="p-4">
                  {loading && !candles.length ? (
                    <div className="h-[400px] flex items-center justify-center opacity-50 italic">Loading market data...</div>
                  ) : (
                    <TradingViewChart data={candles} />
                  )}
                </div>
              </CardContent>
            </Card>

            <SentimentBoard sentiments={sentiments} />
          </div>

          {/* Advanced Section */}
          <Accordion variant="surface" className="p-0">
            <AccordionItem key="1" className="bg-default-100/10 border-divider">
              <AccordionHeading>
                <AccordionTrigger className="flex flex-col items-start text-left w-full py-2">
                  <span className="text-lg font-bold">Strategy Performance & Parameters</span>
                  <span className="text-sm opacity-50">View technical signals and risk config</span>
                </AccordionTrigger>
              </AccordionHeading>
              <AccordionPanel>
                <div className="p-4 grid grid-cols-3 gap-8">
                  <div className="flex flex-col gap-2">
                    <span className="text-tiny uppercase text-default-500 font-bold">Risk Management</span>
                    <p className="text-small">ATR (14): <span className="text-primary font-bold">{techSignals?.atr || '---'}</span></p>
                    <p className="text-small">Risk Per Trade: <span className="text-primary font-bold">1.0%</span></p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-tiny uppercase text-default-500 font-bold">Technical Signals</span>
                    <p className="text-small">RSI (14): <span className={`${techSignals?.rsi?.status === 'Neutral' ? 'text-primary' : (techSignals?.rsi?.status === 'Oversold' ? 'text-success' : 'text-danger')} font-bold`}>{techSignals?.rsi?.value || '---'} ({techSignals?.rsi?.status || '---'})</span></p>
                    <p className="text-small">MACD: <span className="text-success font-bold">{techSignals?.macd?.trend || '---'} Trend</span></p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-tiny uppercase text-default-500 font-bold">ML Prediction</span>
                    <p className="text-small">Probability: <span className="text-primary font-bold">{prediction?.probability || '---'}% {prediction?.direction || ''}</span></p>
                    <p className="text-small">Confidence: <span className="text-primary font-bold">{prediction?.confidence || '---'}</span></p>
                  </div>
                </div>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>

        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: color-mix(in srgb, var(--foreground), transparent 90%);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: color-mix(in srgb, var(--foreground), transparent 80%);
        }
      `}</style>
    </div>
  );
}

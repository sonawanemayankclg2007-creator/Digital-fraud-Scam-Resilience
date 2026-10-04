import React, { useState, useEffect } from 'react';
import { ArrowLeftRight, Search, AlertOctagon, CheckCircle2, ShieldAlert, History, IndianRupee } from 'lucide-react';
import { api } from '../services/api';
import { RiskBadge } from '../components/RiskBadge';
import { RiskScoreGauge } from '../components/RiskScoreGauge';
import { VoiceReader } from '../components/VoiceReader';

export const TransactionAnalysis: React.FC = () => {
  const [sender, setSender] = useState('');
  const [receiver, setReceiver] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [recentTxs, setRecentTxs] = useState<any[]>([]);

  const fetchRecent = async () => {
    try {
      const res = await api.getTransactions(10);
      setRecentTxs(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchRecent();
  }, []);

  const handleAnalyze = async () => {
    if (!sender || !receiver || !amount) return;
    setLoading(true);
    try {
      const res = await api.analyzeTransaction({
        sender_account: sender.trim(),
        receiver_account: receiver.trim(),
        amount: parseFloat(amount)
      });
      setResult(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadScenario = (s: string, r: string, a: number) => {
    setSender(s);
    setReceiver(r);
    setAmount(a.toString());
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <ArrowLeftRight className="text-blue-400 w-6 h-6" />
          Transaction Risk Analyzer
        </h1>
        <p className="text-xs text-slate-400">
          Simulate a proposed fund transfer against real-time velocity heuristics, circular flow cycles, and pass-through patterns.
        </p>
      </div>

      {/* Preset Scenarios */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Quick Test Scenarios:
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => loadScenario('ramesh.investor@okhdfcbank', 'paytm-invest99@okhdfcbank', 10000)}
            className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 font-mono transition-all hover:border-red-500/40 cursor-pointer"
          >
            Scenario 1: Victim → Fake Investment Mule (₹10,000)
          </button>
          <button
            type="button"
            onClick={() => loadScenario('circle_layer_c@pnb', 'circle_layer_a@sbi', 49000)}
            className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 font-mono transition-all hover:border-orange-500/40 cursor-pointer"
          >
            Scenario 2: Circular Laundering Loop (₹49,000)
          </button>
          <button
            type="button"
            onClick={() => loadScenario('ramesh.investor@okhdfcbank', 'kavita.store@sbi', 1500)}
            className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 font-mono transition-all hover:border-emerald-500/40 cursor-pointer"
          >
            Scenario 3: Normal Grocery Merchant (₹1,500)
          </button>
        </div>
      </div>

      {/* Inputs */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Sender Account</label>
            <input
              type="text"
              value={sender}
              onChange={(e) => setSender(e.target.value)}
              placeholder="e.g. ramesh.investor@okhdfcbank"
              className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500/60"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Receiver Account</label>
            <input
              type="text"
              value={receiver}
              onChange={(e) => setReceiver(e.target.value)}
              placeholder="e.g. paytm-invest99@okhdfcbank"
              className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500/60"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Amount (₹)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="10000"
              className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500/60"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={loading || !sender || !receiver || !amount}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? <span>Analyzing Flow...</span> : <><Search size={14} /><span>Analyze Transaction</span></>}
          </button>
        </div>
      </div>

      {/* Analysis Result */}
      {result && (
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div className="flex items-center gap-4">
              <RiskScoreGauge score={result.risk_score} level={result.risk_level} size={100} />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                  TRANSACTION RISK EVALUATION
                </span>
                <div className="flex items-center gap-2 mb-1">
                  <RiskBadge level={result.risk_level} size="lg" />
                  <span className="text-sm font-bold text-cyan-400 font-mono">
                    ₹{result.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
            <VoiceReader
              textToRead={`${result.risk_level}. Transfer of rupees ${result.amount}. ${result.explanation}. ${result.recommendation}`}
            />
          </div>

          {/* Anomaly Check Flags */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className={`p-3 rounded-xl border text-center ${result.rapid_transfer_detected ? 'bg-red-950/20 border-red-500/40 text-red-300' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
              <div className="font-bold">{result.rapid_transfer_detected ? 'DETECTED' : 'CLEAR'}</div>
              <div className="text-[10px]">Rapid Pass-Through</div>
            </div>
            <div className={`p-3 rounded-xl border text-center ${result.unusual_amount_detected ? 'bg-orange-950/20 border-orange-500/40 text-orange-300' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
              <div className="font-bold">{result.unusual_amount_detected ? 'DETECTED' : 'CLEAR'}</div>
              <div className="text-[10px]">Unusual Amount</div>
            </div>
            <div className={`p-3 rounded-xl border text-center ${result.circular_flow_detected ? 'bg-purple-950/20 border-purple-500/40 text-purple-300' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
              <div className="font-bold">{result.circular_flow_detected ? 'DETECTED' : 'CLEAR'}</div>
              <div className="text-[10px]">Circular Money Cycle</div>
            </div>
            <div className={`p-3 rounded-xl border text-center ${result.potential_mule_involved ? 'bg-red-950/20 border-red-500/40 text-red-300' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
              <div className="font-bold">{result.potential_mule_involved ? 'DETECTED' : 'CLEAR'}</div>
              <div className="text-[10px]">Potential Mule Link</div>
            </div>
          </div>

          {/* Signals */}
          <div className="space-y-2">
            <h4 className="text-xs uppercase font-bold text-slate-400">Triggered Heuristics</h4>
            <div className="space-y-1.5">
              {(result.signals || []).map((s: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200">
                  <CheckCircle2 size={15} className="text-red-400 shrink-0" />
                  <span>{s.replace(/_/g, ' ').toUpperCase()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Explanation */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            <strong className="text-slate-100 font-semibold block mb-1">Behavioral Explanation:</strong>
            {result.explanation}
          </div>

          {/* Recommendation */}
          <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/30 text-xs text-blue-200">
            <strong className="block mb-1 text-blue-300 font-bold uppercase tracking-wider">Recommended Safety Action:</strong>
            {result.recommendation}
          </div>
        </div>
      )}

      {/* Live Recent Ledger Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <History size={16} className="text-slate-400" />
          Recent Ingested Transactions
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] font-bold">
              <tr>
                <th className="py-2.5 px-3">Sender</th>
                <th className="py-2.5 px-3">Receiver</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Risk</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {recentTxs.map((t) => (
                <tr key={t.id} className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 text-slate-300">{t.sender_account}</td>
                  <td className="py-2.5 px-3 text-slate-300">{t.receiver_account}</td>
                  <td className="py-2.5 px-3 text-cyan-400 font-bold">₹{t.amount.toLocaleString('en-IN')}</td>
                  <td className="py-2.5 px-3">
                    <RiskBadge level={t.risk_score >= 80 ? 'HIGH_RISK' : t.risk_score >= 50 ? 'CAUTION' : 'SAFE'} size="sm" />
                  </td>
                  <td className="py-2.5 px-3 text-[11px] text-slate-400">{t.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

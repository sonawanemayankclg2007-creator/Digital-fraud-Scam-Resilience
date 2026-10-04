import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ReactFlow, Background, Controls, MiniMap,
  useNodesState, useEdgesState, MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Share2, Filter, AlertTriangle, ShieldCheck,
  CheckCircle2, X, Info, ArrowRight, Layers
} from 'lucide-react';
import { api } from '../services/api';
import { RiskBadge } from '../components/RiskBadge';

export const FraudNetwork: React.FC = () => {
  const [searchParams] = useSearchParams();
  const focalFromUrl = searchParams.get('focal') || '';

  const [graphData, setGraphData] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [minAmount, setMinAmount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);

  const fetchGraph = async (amt = 0) => {
    setLoading(true);
    try {
      let res;
      if (focalFromUrl) {
        res = await api.getAccountGraph(focalFromUrl, 2);
      } else {
        res = await api.getFullGraph(amt);
      }
      setGraphData(res.data);
      buildFlowElements(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraph(minAmount);
  }, [focalFromUrl, minAmount]);

  const buildFlowElements = (data: any) => {
    if (!data || !data.nodes) return;

    // Layout nodes in a clean multi-tiered structure
    const totalNodes = data.nodes.length;
    const cols = Math.max(3, Math.ceil(Math.sqrt(totalNodes)));

    const flowNodes = data.nodes.map((n: any, idx: number) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);

      // Color coding based on risk and mule status
      let borderColor = '#334155';
      let bgColor = '#0f172a';
      let glowClass = '';

      if (n.is_mule || n.risk_level === 'HIGH_RISK') {
        borderColor = '#ef4444';
        bgColor = 'rgba(239, 68, 68, 0.15)';
        glowClass = 'shadow-lg shadow-red-500/20';
      } else if (n.is_cyclic || n.risk_level === 'SUSPICIOUS') {
        borderColor = '#f97316';
        bgColor = 'rgba(249, 115, 22, 0.15)';
      } else if (n.risk_level === 'CAUTION') {
        borderColor = '#f59e0b';
        bgColor = 'rgba(245, 158, 11, 0.15)';
      } else {
        borderColor = '#22c55e';
        bgColor = 'rgba(34, 197, 94, 0.10)';
      }

      if (n.id === focalFromUrl) {
        borderColor = '#3b82f6';
        bgColor = 'rgba(59, 130, 246, 0.25)';
        glowClass = 'shadow-xl shadow-blue-500/40 ring-2 ring-blue-400';
      }

      return {
        id: n.id,
        position: { x: col * 260 + 50, y: row * 180 + 50 },
        data: {
          label: (
            <div className={`p-3 rounded-xl border font-sans text-left transition-all ${glowClass}`} style={{ borderColor, backgroundColor: bgColor }}>
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-mono text-xs font-bold text-white truncate max-w-[130px]">
                  {n.id.includes('@') ? n.id.split('@')[0] : n.id.slice(0, 10)}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700 text-slate-300">
                  {n.risk_score}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {n.id.includes('@') ? `@${n.id.split('@')[1]}` : 'Bank Acc'}
              </div>
              {n.is_mule && (
                <div className="mt-1 text-[9px] font-bold text-red-400 bg-red-950/60 px-1 py-0.5 rounded border border-red-500/30 flex items-center gap-1">
                  <span>POTENTIAL MULE</span>
                </div>
              )}
              {n.is_cyclic && (
                <div className="mt-1 text-[9px] font-bold text-purple-400 bg-purple-950/60 px-1 py-0.5 rounded border border-purple-500/30">
                  CIRCULAR FLOW
                </div>
              )}
            </div>
          ),
          rawNode: n
        }
      };
    });

    const flowEdges = (data.edges || []).map((e: any) => {
      const isCyclic = e.is_cyclic;
      return {
        id: e.id,
        source: e.source,
        target: e.target,
        animated: isCyclic || e.amount > 20000,
        label: `₹${(e.amount || 0).toLocaleString('en-IN')}`,
        style: {
          stroke: isCyclic ? '#c084fc' : e.amount > 20000 ? '#f87171' : '#64748b',
          strokeWidth: Math.min(4, Math.max(1.5, Math.log10(e.amount || 1000))),
        },
        labelStyle: { fill: '#cbd5e1', fontSize: 10, fontWeight: 700, fontFamily: 'monospace' },
        labelBgStyle: { fill: '#0f172a', fillOpacity: 0.85 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isCyclic ? '#c084fc' : e.amount > 20000 ? '#f87171' : '#64748b',
          width: 14,
          height: 14
        }
      };
    });

    setNodes(flowNodes);
    setEdges(flowEdges);
  };

  const onNodeClick = (_: any, node: any) => {
    setSelectedNode(node.data.rawNode);
  };

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Share2 className="text-blue-400 w-6 h-6" />
            Fraud Network & Directed Fund Flow Graph
          </h1>
          <p className="text-xs text-slate-400">
            Interactive NetworkX topology showing multi-hop layering, circular money loops, and mule pass-throughs.
          </p>
        </div>

        {/* Filter by Amount */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900 text-xs text-slate-300">
            <Filter size={13} className="text-blue-400" />
            <span>Min Amount:</span>
            <select
              value={minAmount}
              onChange={(e) => setMinAmount(Number(e.target.value))}
              className="bg-transparent border-none text-slate-200 text-xs font-mono font-bold focus:outline-none cursor-pointer"
            >
              <option value="0" className="bg-slate-900">All (₹0+)</option>
              <option value="5000" className="bg-slate-900">₹5,000+</option>
              <option value="15000" className="bg-slate-900">₹15,000+</option>
              <option value="30000" className="bg-slate-900">₹30,000+</option>
            </select>
          </div>

          {focalFromUrl && (
            <button
              onClick={() => {
                window.location.href = '/fraud-network';
              }}
              className="px-2.5 py-1.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 transition-all"
            >
              Reset Ego Filter
            </button>
          )}
        </div>
      </div>

      {/* Network Stats Bar */}
      {graphData && (
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono bg-slate-900/60 border border-slate-800 p-2.5 rounded-xl">
          <div className="text-slate-300">
            Accounts: <strong className="text-white">{graphData.total_nodes}</strong>
          </div>
          <div className="text-slate-300">
            Directed Transfers: <strong className="text-cyan-400">{graphData.total_edges}</strong>
          </div>
          <div className="text-red-400 font-bold">
            Potential Mules: {graphData.mules_detected}
          </div>
          <div className="text-purple-400 font-bold">
            Circular Cycles: {graphData.cycles_detected}
          </div>
          <div className="ml-auto text-[11px] text-slate-400 italic">
            Click any account node to inspect full counterparty details
          </div>
        </div>
      )}

      {/* React Flow Container + Inspection Panel */}
      <div className="relative w-full h-[600px] rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          fitView
          minZoom={0.2}
          maxZoom={2.0}
        >
          <Background color="#1e293b" gap={20} size={1} />
          <Controls className="!bg-slate-900 !border-slate-800 !fill-slate-200" />
          <MiniMap
            nodeColor={(n: any) => {
              const raw = n.data?.rawNode;
              if (raw?.is_mule) return '#ef4444';
              if (raw?.is_cyclic) return '#c084fc';
              return '#3b82f6';
            }}
            maskColor="rgba(15, 23, 42, 0.75)"
            className="!bg-slate-950 !border-slate-800 !rounded-xl"
          />
        </ReactFlow>

        {/* Selected Account Inspection Drawer */}
        {selectedNode && (
          <div className="absolute right-4 top-4 bottom-4 w-80 rounded-2xl bg-slate-900/95 border border-slate-700/80 p-5 shadow-2xl backdrop-blur-md overflow-y-auto space-y-4 animate-slideIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Account Inspection</span>
                <h4 className="text-xs font-bold text-white font-mono break-all">{selectedNode.id}</h4>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Risk Assessment:</span>
                <RiskBadge level={selectedNode.risk_level} size="sm" />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Calculated Score:</span>
                <span className="font-bold text-white">{selectedNode.risk_score} / 100</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-center">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-sm font-bold text-emerald-400">{selectedNode.in_degree}</div>
                <div className="text-[10px] text-slate-400">Incoming Links</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-sm font-bold text-orange-400">{selectedNode.out_degree}</div>
                <div className="text-[10px] text-slate-400">Outgoing Links</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 col-span-2">
                <div className="text-xs font-mono font-bold text-cyan-400">
                  In: ₹{selectedNode.in_volume.toLocaleString('en-IN')} | Out: ₹{selectedNode.out_volume.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {selectedNode.is_mule && (
              <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/40 text-xs text-red-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle size={14} className="text-red-400" />
                  Potential Mule Behavior
                </div>
                <p className="text-[11px] text-red-200/90 leading-tight">
                  Funds received from disparate sources are rapidly routed out to secondary intermediaries.
                </p>
              </div>
            )}

            {selectedNode.is_cyclic && (
              <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/40 text-xs text-purple-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Layers size={14} className="text-purple-400" />
                  Circular Money Cycle
                </div>
                <p className="text-[11px] text-purple-200/90 leading-tight">
                  Participates in a closed directed transfer cycle (A → B → C → A).
                </p>
              </div>
            )}

            <div className="pt-2 border-t border-slate-800">
              <a
                href={`/account-checker`}
                className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all block text-center"
              >
                <span>Deep Account Profile</span>
                <ArrowRight size={13} />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

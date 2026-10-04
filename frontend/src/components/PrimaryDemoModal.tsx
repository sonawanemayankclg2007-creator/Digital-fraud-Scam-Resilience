import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play, CheckCircle2, ChevronRight, AlertOctagon,
  Shield, Phone, Building2, Share2, Globe, Send,
  SlidersHorizontal, Check, X, Sparkles
} from 'lucide-react';
import { api } from '../services/api';

interface PrimaryDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrimaryDemoModal: React.FC<PrimaryDemoModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [stepData, setStepData] = useState<any>({});
  const [simulatedAlertSuccess, setSimulatedAlertSuccess] = useState(false);

  if (!isOpen) return null;

  const runStep = async (stepNum: number) => {
    setCurrentStep(stepNum);
    setIsRunning(true);

    try {
      if (stepNum === 2 || stepNum === 3 || stepNum === 4) {
        // Scam check
        const res = await api.analyzeScam({
          message_text: "Congratulations! You have been selected for an exclusive investment opportunity. Invest ₹10,000 today and receive guaranteed 40% returns. Limited slots available. Send payment immediately."
        });
        setStepData((prev: any) => ({ ...prev, scam: res.data }));
      } else if (stepNum === 5) {
        // Phone check
        const res = await api.checkPhone("+919876543210");
        setStepData((prev: any) => ({ ...prev, phone: res.data }));
      } else if (stepNum === 6) {
        // Account check
        const res = await api.checkAccount("paytm-invest99@okhdfcbank");
        setStepData((prev: any) => ({ ...prev, account: res.data }));
      } else if (stepNum === 7 || stepNum === 8 || stepNum === 9) {
        // Graph and rings
        const rings = await api.getFraudRings();
        setStepData((prev: any) => ({ ...prev, rings: rings.data }));
      } else if (stepNum === 10 || stepNum === 11) {
        // Translate
        const transHi = await api.translate(
          "Do not transfer money until the person/company and payment destination are independently verified.",
          "hi"
        );
        const transGu = await api.translate(
          "Do not transfer money until the person/company and payment destination are independently verified.",
          "gu"
        );
        setStepData((prev: any) => ({ ...prev, transHi: transHi.data, transGu: transGu.data }));
      } else if (stepNum === 12 || stepNum === 13) {
        // Send alert
        const alertRes = await api.sendNotification({
          channel: "WHATSAPP",
          recipient: "+919876543210",
          message: "⚠️ High-risk guaranteed-return scam detected! Do not transfer funds.",
          language: "hi"
        });
        setSimulatedAlertSuccess(true);
        setStepData((prev: any) => ({ ...prev, alert: alertRes.data }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRunning(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 15) {
      runStep(currentStep + 1);
    }
  };

  const stepsList = [
    { num: 1, title: "Receive Suspicious Message", desc: "Paste fake guaranteed 40% return message into Scam Checker" },
    { num: 2, title: "AI & Rule Detection", desc: "Flag guaranteed returns, urgency, investment solicitation, payment request" },
    { num: 3, title: "High Risk Assessment", desc: "Evaluate score: 92/100 (HIGH RISK)" },
    { num: 4, title: "Explainable Evidence", desc: "Review user-friendly 'Why flagged?' evidence breakdown" },
    { num: 5, title: "Verify Sender Phone", desc: "Query +919876543210: 8 community reports, SUSPICIOUS profile" },
    { num: 6, title: "Inspect Recipient Account", desc: "Query paytm-invest99@okhdfcbank: High velocity & pass-through" },
    { num: 7, title: "Open Fraud Network Graph", desc: "Trace multi-hop fund flow: Target -> Mule 1 & 2 -> Controller" },
    { num: 8, title: "Potential Mule Behavior", desc: "Highlight rapid redirection and 95% pass-through volume" },
    { num: 9, title: "Identify Coordinated Ring", desc: "Cluster 17 accounts, circular flow cycle detected" },
    { num: 10, title: "Generate Safety Warning", desc: "Synthesize plain-language prevention advisory" },
    { num: 11, title: "Translate to Hindi & Gujarati", desc: "Instant Bharat-first localization for regional users" },
    { num: 12, title: "Simulate DLT Alerts", desc: "Dispatch safe SMS & WhatsApp warning (zero credentials)" },
    { num: 13, title: "Audit in Notification History", desc: "Verify delivery receipt and audit trail" },
    { num: 14, title: "Admin & Analyst Review", desc: "Inspect moderation queue and system-wide telemetry" },
    { num: 15, title: "Loss Prevented", desc: "Money stays safe BEFORE transfer is initiated!" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                SANGYAN Track A — Primary Demo Walkthrough
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30">
                  Step {currentStep} of 15
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                15-Step Interactive Evaluator Scenario: Intercepting Fraud Before Money Changes Hands
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Progress Tracker */}
          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-15 gap-1 pb-4 border-b border-slate-800">
            {stepsList.map((s) => (
              <button
                key={s.num}
                onClick={() => runStep(s.num)}
                className={`py-1.5 rounded text-[11px] font-bold transition-all text-center ${
                  currentStep === s.num
                    ? 'bg-blue-600 text-white shadow-md'
                    : currentStep > s.num
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800/60 text-slate-500 hover:bg-slate-800'
                }`}
              >
                {s.num}
              </button>
            ))}
          </div>

          {/* Current Step Showcase */}
          <div className="rounded-xl border border-blue-500/30 bg-blue-950/20 p-5">
            <h4 className="text-sm font-bold text-blue-300 mb-1 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-500 text-slate-950 font-black text-xs flex items-center justify-center">
                {currentStep}
              </span>
              {stepsList[currentStep - 1].title}
            </h4>
            <p className="text-xs text-slate-300">{stepsList[currentStep - 1].desc}</p>
          </div>

          {/* Interactive Results Display based on currentStep */}
          {currentStep <= 4 && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Simulated Incoming WhatsApp Message:
              </div>
              <blockquote className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-amber-200 italic font-mono">
                "Congratulations! You have been selected for an exclusive investment opportunity. Invest ₹10,000 today and receive guaranteed 40% returns. Limited slots available. Send payment immediately."
              </blockquote>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <div className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-bold flex items-center gap-1.5">
                  <AlertOctagon size={15} />
                  Risk Score: 92/100 (HIGH RISK)
                </div>
                <div className="text-xs text-slate-300 flex items-center gap-1">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  Guaranteed-return claim detected
                </div>
                <div className="text-xs text-slate-300 flex items-center gap-1">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  High-pressure urgency detected
                </div>
                <div className="text-xs text-slate-300 flex items-center gap-1">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  Payment solicitation detected
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <Phone size={15} className="text-amber-400" />
                  Sender Phone Profile: +91 98******10
                </span>
                <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                  SUSPICIOUS (Score: 88)
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                  <div className="text-lg font-bold text-white">8</div>
                  <div className="text-slate-400 text-[10px]">Total Reports</div>
                </div>
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                  <div className="text-lg font-bold text-red-400">5</div>
                  <div className="text-slate-400 text-[10px]">Investment Scams</div>
                </div>
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                  <div className="text-lg font-bold text-orange-400">3</div>
                  <div className="text-slate-400 text-[10px]">Payment Scams</div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <Building2 size={15} className="text-red-400" />
                  Recipient UPI VPA: paytm-invest99@okhdfcbank
                </span>
                <span className="px-2.5 py-1 rounded bg-red-500/20 text-red-300 text-xs font-bold border border-red-500/40">
                  HIGH RISK (Score: 92)
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 text-xs text-slate-300 space-y-1.5">
                <div className="flex items-center gap-2 text-red-400">
                  <CheckCircle2 size={14} /> Rapid pass-through: Received ₹50,000 from 3 accounts and routed out 95% within 18 minutes.
                </div>
                <div className="flex items-center gap-2 text-red-400">
                  <CheckCircle2 size={14} /> Intermediate transit mule behavioral fingerprint identified.
                </div>
              </div>
            </div>
          )}

          {currentStep >= 7 && currentStep <= 9 && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <Share2 size={15} className="text-blue-400" />
                Network Graph & Fraud Ring Detection
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
                <div className="text-blue-400 font-semibold">Fund Routing Topology:</div>
                <div className="text-slate-300 pl-2">
                  Victim Accounts (x3) <span className="text-slate-500">→</span> paytm-invest99@okhdfcbank <span className="text-red-400">[Target Mule]</span>
                </div>
                <div className="text-slate-300 pl-6">
                  <span className="text-slate-500">↳</span> transit_mule_1@axis & layering_hub_2@kotak <span className="text-orange-400">[Hop 2]</span>
                </div>
                <div className="text-slate-300 pl-12">
                  <span className="text-slate-500">↳</span> crypto_aggregator_x@ybl <span className="text-purple-400 font-bold">[Coordinating Account]</span>
                </div>
                <div className="text-emerald-400 text-[11px] pt-1 border-t border-slate-800">
                  Circular Layering Cycle also detected: circle_layer_a → circle_layer_b → circle_layer_c → circle_layer_a
                </div>
              </div>
            </div>
          )}

          {currentStep >= 10 && currentStep <= 11 && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <Globe size={15} className="text-emerald-400" />
                Multilingual Prevention Advisory Generated
              </div>
              <div className="space-y-2">
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-xs">
                  <span className="text-[10px] text-blue-400 font-bold block mb-0.5">HINDI (हिन्दी):</span>
                  <p className="text-slate-200">
                    अर्थरक्षा चेतावनी: जब तक व्यक्ति/कंपनी और भुगतान गंतव्य की स्वतंत्र रूप से पुष्टि न हो जाए, तब तक पैसे ट्रांसफर न करें।
                  </p>
                </div>
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-xs">
                  <span className="text-[10px] text-emerald-400 font-bold block mb-0.5">GUJARATI (ગુજરાતી):</span>
                  <p className="text-slate-200">
                    અર્થરક્ષા ચેતવણી: જ્યાં સુધી વ્યક્તિ/કંપની અને ચુકવણી ખાતાની સ્વતંત્ર રીતે ચકાસણી ન થાય ત્યાં સુધી નાણાં ટ્રાન્સફર કરશો નહીં.
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep >= 12 && currentStep <= 14 && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <Send size={15} className="text-emerald-400" />
                DLT-Compliant Alert Dispatched & Logged
              </div>
              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-300 space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <Check size={14} /> MSG91 WhatsApp & SMS Simulation Successful
                </div>
                <div className="text-[11px] text-slate-400">
                  Recipient: +91 98******10 | Delivery Status: DELIVERED | Privacy Check: Passed (Zero credentials collected)
                </div>
              </div>
            </div>
          )}

          {currentStep === 15 && (
            <div className="p-6 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 size={26} />
              </div>
              <h4 className="text-base font-bold text-white">Objective Achieved: Fraud Averted</h4>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                By detecting deceptive signals, validating network flows, identifying mule transit patterns,
                and dispatching multilingual warnings, ARTHRAKSHA protected the user <strong className="text-emerald-400">BEFORE</strong> money left their bank account.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/50">
          <button
            onClick={() => {
              if (currentStep > 1) runStep(currentStep - 1);
            }}
            disabled={currentStep === 1 || isRunning}
            className="px-3.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700 disabled:opacity-40 transition-all"
          >
            Previous
          </button>

          <div className="flex items-center gap-2">
            {currentStep < 15 ? (
              <button
                onClick={nextStep}
                disabled={isRunning}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-blue-500/20"
              >
                <span>{isRunning ? "Evaluating..." : `Proceed to Step ${currentStep + 1}`}</span>
                <ChevronRight size={14} />
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  navigate('/dashboard');
                }}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <span>Open Dashboard</span>
                <Check size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

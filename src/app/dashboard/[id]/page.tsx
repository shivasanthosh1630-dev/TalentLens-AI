"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";

type Insight = { label: string; value: string; desc: string; };
type Agent = { role: string; name: string; verdict: string; color: string; reasoning: string; };
type DashboardData = { score: number; decision: string; insights: Insight[]; agents: Agent[]; };

const getAgentStyles = (color: string) => {
  switch (color) {
    case 'blue': return { bgLight: 'bg-blue-50 hover:bg-blue-100', text: 'text-blue-700', bg: 'bg-blue-600', shadow: 'shadow-blue-500/20', border: 'border-blue-100' };
    case 'purple': return { bgLight: 'bg-purple-50 hover:bg-purple-100', text: 'text-purple-700', bg: 'bg-purple-600', shadow: 'shadow-purple-500/20', border: 'border-purple-100' };
    case 'amber': return { bgLight: 'bg-amber-50 hover:bg-amber-100', text: 'text-amber-700', bg: 'bg-amber-500', shadow: 'shadow-amber-500/20', border: 'border-amber-100' };
    default: return { bgLight: 'bg-slate-50 hover:bg-slate-100', text: 'text-slate-700', bg: 'bg-slate-600', shadow: 'shadow-slate-500/20', border: 'border-slate-200' };
  }
};

export default function DashboardPage() {
  const params = useParams();
  const candidateId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    
    const fetchDecision = async () => {
      try {
        let transcript = [];
        let profile = "";
        if (typeof window !== "undefined") {
          const locallySaved = window.localStorage.getItem('candidateTranscript');
          if (locallySaved) transcript = JSON.parse(locallySaved);
          profile = window.localStorage.getItem('candidateProfile') || "No profile available.";
        }
        const res = await fetch(`/api/decision?id=${candidateId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transcript, profile })
        });
        const result = await res.json();
        if (result.success) setData(result.data);
      } catch (error) {
        console.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchDecision();
  }, [candidateId]);

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 animate-pulse duration-1000">
        <div className="relative w-24 h-24 mb-6">
          <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-widest uppercase mb-2">Simulating Panel</h2>
        <p className="text-slate-500 font-mono text-sm">Aggregating multi-agent independent evaluations...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 pb-20 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold tracking-widest uppercase border border-green-200">Evaluation Complete</span>
            <span className="text-slate-500 font-mono text-xs">ID: {candidateId}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Panel <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Decision</span></h1>
        </div>

        <div className="flex items-center gap-6 bg-white px-8 py-5 rounded-3xl premium-shadow border border-slate-200">
          <div className="text-center">
            <p className="text-sm text-slate-500 uppercase tracking-widest font-semibold mb-1">Score</p>
            <p className="text-5xl font-black text-slate-900">{data.score}<span className="text-xl text-slate-400">/100</span></p>
          </div>
          <div className="h-16 w-px bg-slate-200"></div>
          <div className="text-center">
            <p className="text-sm text-slate-500 uppercase tracking-widest font-semibold mb-1">Verdict</p>
            <p className="text-2xl font-black text-green-600 uppercase tracking-widest">{data.decision}</p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-slate-900 mb-6 border-b border-slate-200 pb-4 relative z-10">Discovery Engine Insights</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 relative z-10">
        {data.insights.map((insight, i) => (
          <div key={i} className="bg-white rounded-3xl p-6 border border-slate-200 premium-shadow">
            <h3 className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-2">{insight.label}</h3>
            <p className="text-3xl font-black text-slate-900 mb-3 tracking-tight">{insight.value}</p>
            <p className="text-sm text-slate-600 leading-relaxed">{insight.desc}</p>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-bold text-slate-900 mb-6 border-b border-slate-200 pb-4 flex items-center gap-3 relative z-10">
        Multi-Agent Evaluation
        <span className="text-xs font-bold tracking-widest uppercase text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">Simulated Panel</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        {data.agents.map((agent, i) => {
          const styles = getAgentStyles(agent.color);
          return (
            <div key={i} className={`bg-white rounded-3xl p-6 md:p-8 flex flex-col h-full border ${styles.border} premium-shadow relative overflow-hidden`}>
              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className={`w-14 h-14 rounded-2xl ${styles.bg} flex items-center justify-center shadow-lg ${styles.shadow} text-white font-black text-xl`}>
                  {agent.name.split(' ')[1].charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">{agent.name}</h3>
                  <p className={`text-xs uppercase tracking-widest ${styles.text} font-bold mt-1`}>{agent.role}</p>
                </div>
              </div>

              <div className="mb-6 relative z-10">
                <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border ${styles.bgLight} ${styles.text} ${styles.border}`}>
                  {agent.verdict}
                </span>
              </div>

              <div className="flex-1 relative z-10">
                <p className="text-slate-600 leading-relaxed text-[15px] font-medium">"{agent.reasoning}"</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-20 text-center relative z-10 border-t border-slate-200 pt-10">
        <Link href="/" className="inline-flex px-10 py-4 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all premium-shadow">
           New Evaluation
        </Link>
      </div>
    </div>
  );
}

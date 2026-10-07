import React from 'react';
import { CheckCircle2, Loader2, Circle } from 'lucide-react';

const STAGES = [
  { id: 'pending', label: 'Research topic received' },
  { id: 'planning', label: 'Generating search queries' },
  { id: 'searching', label: 'Searching sources' },
  { id: 'processing', label: 'Extracting information' },
  { id: 'analyzing', label: 'Analyzing source content' },
  { id: 'comparing', label: 'Comparing sources & contradictions' },
  { id: 'generating', label: 'Generating report & citations' },
];

export default function ProgressTracker({ currentStatus, message }) {
  const getStageIndex = (status) => STAGES.findIndex((s) => s.id === status);
  const activeIndex = getStageIndex(currentStatus);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" /> Autonomous Agent Active
      </h3>
      <p className="text-sm text-slate-400 italic bg-slate-950 p-3 rounded-md border border-slate-800">
        "{message || 'Agent is executing research tasks...'}"
      </p>
      <div className="space-y-3">
        {STAGES.map((stage, idx) => {
          const isDone = currentStatus === 'completed' || (activeIndex > -1 && idx < activeIndex);
          const isCurrent = activeIndex === idx;

          return (
            <div key={stage.id} className="flex items-center gap-3 text-sm">
              {isDone ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : isCurrent ? (
                <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
              ) : (
                <Circle className="w-5 h-5 text-slate-600" />
              )}
              <span className={isDone ? 'text-slate-200' : isCurrent ? 'text-indigo-400 font-medium' : 'text-slate-500'}>
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
import React from 'react';
import { X, ExternalLink, ShieldCheck } from 'lucide-react';

export default function CitationModal({ citation, onClose }) {
  if (!citation) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
        <div className="flex justify-between items-start">
          <h4 className="text-lg font-semibold text-white pr-4">{citation.source_title}</h4>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-400 border-y border-slate-800 py-2">
          <span>Domain: <strong className="text-slate-200">{citation.domain}</strong></span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Score: {citation.credibility_score}
          </span>
        </div>
        <div>
          <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Referenced Summary</h5>
          <p className="text-sm text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800">
            {citation.source_summary || 'No detailed snippet extracted.'}
          </p>
        </div>
        <div className="pt-2 flex justify-end">
          <a
            href={citation.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            Visit Source <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
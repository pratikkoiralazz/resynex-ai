import React, { useState } from 'react';
import CitationModal from './CitationModal';

export default function ReportViewer({ report }) {
  const [activeCitation, setActiveCitation] = useState(null);

  if (!report) return null;

  const content = typeof report.report_content === 'string' 
    ? JSON.parse(report.report_content) 
    : report.report_content;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 space-y-8 max-w-4xl mx-auto">
      <header className="border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-bold text-white mb-2">{report.title}</h1>
        <p className="text-xs text-slate-400">Generated on {new Date(report.created_at).toLocaleString()}</p>
      </header>

      {/* Executive Summary */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-indigo-400">Executive Summary</h2>
        <p className="text-slate-300 leading-relaxed bg-slate-950/50 p-4 rounded-lg border border-slate-800/80">
          {report.executive_summary}
        </p>
      </section>

      {/* Key Findings */}
      {content.key_findings && (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-indigo-400">Key Findings</h2>
          <ul className="list-disc list-inside space-y-2 text-slate-300">
            {content.key_findings.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Detailed Analysis */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-indigo-400">Detailed Analysis</h2>
        <p className="text-slate-300 leading-relaxed whitespace-pre-line">{content.detailed_analysis}</p>
      </section>

      {/* Contradictions & Gaps */}
      {content.contradictions && content.contradictions.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-amber-400">Identified Contradictions</h2>
          <ul className="list-disc list-inside space-y-1 text-slate-300">
            {content.contradictions.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Conclusion */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-indigo-400">Conclusion</h2>
        <p className="text-slate-300 leading-relaxed">{content.conclusion}</p>
      </section>

      {/* References Section */}
      <section className="border-t border-slate-800 pt-6 space-y-4">
        <h2 className="text-xl font-semibold text-white">References & Citations</h2>
        <div className="space-y-2">
          {report.citations?.map((cit) => (
            <div
              key={cit.id}
              onClick={() => setActiveCitation(cit)}
              className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between cursor-pointer hover:border-indigo-500 transition"
            >
              <div className="flex items-center gap-3">
                <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded">
                  [{cit.citation_number}]
                </span>
                <span className="text-sm font-medium text-slate-200">{cit.source_title}</span>
              </div>
              <span className="text-xs text-slate-500">{cit.domain}</span>
            </div>
          ))}
        </div>
      </section>

      <CitationModal citation={activeCitation} onClose={() => setActiveCitation(null)} />
    </div>
  );
}
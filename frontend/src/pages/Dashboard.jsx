import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getResearchSessions } from '../services/api';
import { PlusCircle, Search, FileText, ArrowRight } from 'lucide-react';

export default function Dashboard() {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    getResearchSessions({ sort: 'desc' }).then((res) => setSessions(res.data));
  }, []);

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Research Dashboard</h1>
          <p className="text-sm text-slate-400">Monitor and launch autonomous research workflows</p>
        </div>
        <Link
          to="/new"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition"
        >
          <PlusCircle className="w-4 h-4" /> Start New Research
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <p className="text-xs text-slate-400">Total Research Projects</p>
          <p className="text-2xl font-bold text-white mt-1">{sessions.length}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <p className="text-xs text-slate-400">Completed Reports</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">
            {sessions.filter((s) => s.status === 'completed').length}
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <p className="text-xs text-slate-400">Active Pipelines</p>
          <p className="text-2xl font-bold text-indigo-400 mt-1">
            {sessions.filter((s) => s.status !== 'completed' && s.status !== 'failed').length}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Recent Research Sessions</h2>
        <div className="bg-slate-900 border border-slate-800 rounded-xl divide-y divide-slate-800">
          {sessions.slice(0, 5).map((session) => (
            <div key={session.id} className="p-4 flex items-center justify-between hover:bg-slate-800/50 transition">
              <div className="space-y-1">
                <Link to={`/research/${session.id}`} className="font-medium text-white hover:text-indigo-400 transition">
                  {session.topic}
                </Link>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span>Depth: <strong className="uppercase">{session.depth}</strong></span>
                  <span>Sources: {session.source_count || 0}</span>
                  <span>{new Date(session.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <Link
                to={`/research/${session.id}`}
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
              >
                View <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
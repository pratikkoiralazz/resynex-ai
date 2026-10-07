import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getResearchSessions, deleteResearchSession } from '../services/api';
import { Trash2, ExternalLink } from 'lucide-react';

export default function History() {
  const [sessions, setSessions] = useState([]);
  const [search, setSearch] = useState('');

  const loadSessions = () => {
    getResearchSessions({ search }).then((res) => setSessions(res.data));
  };

  useEffect(() => {
    loadSessions();
  }, [search]);

  const handleDelete = async (id) => {
    if (confirm('Delete this research session permanently?')) {
      await deleteResearchSession(id);
      loadSessions();
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Research History</h1>
        <input
          type="text"
          placeholder="Filter by topic..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
        />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950 text-xs text-slate-400 uppercase border-b border-slate-800">
            <tr>
              <th className="p-4">Topic</th>
              <th className="p-4">Status</th>
              <th className="p-4">Created</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {sessions.map((session) => (
              <tr key={session.id} className="hover:bg-slate-800/50 transition">
                <td className="p-4 font-medium text-white">{session.topic}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs uppercase font-bold ${
                    session.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {session.status}
                  </span>
                </td>
                <td className="p-4 text-xs text-slate-400">{new Date(session.created_at).toLocaleDateString()}</td>
                <td className="p-4 text-right space-x-3">
                  <Link to={`/research/${session.id}`} className="inline-block text-indigo-400 hover:text-indigo-300">
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                  <button onClick={() => handleDelete(session.id)} className="text-rose-400 hover:text-rose-300">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
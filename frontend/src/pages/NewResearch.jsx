import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createResearch } from '../services/api';
import { Sparkles } from 'lucide-react';

export default function NewResearch() {
  const [topic, setTopic] = useState('');
  const [instructions, setInstructions] = useState('');
  const [depth, setDepth] = useState('standard');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    try {
      const res = await createResearch({ topic, instructions, depth });
      navigate(`/research/${res.data.id}`);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Initiate Autonomous Research</h1>
        <p className="text-sm text-slate-400">Provide a topic and let the AI agent execute multi-source analysis.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">Research Topic</label>
          <textarea
            rows={3}
            required
            placeholder="e.g., Impact of artificial intelligence on education"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">Optional Focus Instructions</label>
          <input
            type="text"
            placeholder="e.g., Focus on primary education and student outcomes"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">Research Depth</label>
          <div className="grid grid-cols-3 gap-3">
            {['quick', 'standard', 'deep'].map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setDepth(mode)}
                className={`py-2.5 rounded-lg text-xs font-semibold capitalize border transition ${
                  depth === mode
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" /> {loading ? 'Launching Agent...' : 'Start Autonomous Research'}
        </button>
      </form>
    </div>
  );
}
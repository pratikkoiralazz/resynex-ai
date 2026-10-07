import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, History, Bot } from 'lucide-react';

export default function Navigation() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3 p-6 border-b border-slate-800">
          <Bot className="w-8 h-8 text-indigo-400" />
          <span className="font-bold text-lg tracking-wide text-white">Research AI</span>
        </div>
        <nav className="p-4 space-y-1">
          <Link
            to="/"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
              isActive('/') ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </Link>
          <Link
            to="/new"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
              isActive('/new') ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <PlusCircle className="w-4 h-4" /> New Research
          </Link>
          <Link
            to="/history"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
              isActive('/history') ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <History className="w-4 h-4" /> History
          </Link>
        </nav>
      </div>
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
        PERN Autonomous Agent v1.0
      </div>
    </aside>
  );
}
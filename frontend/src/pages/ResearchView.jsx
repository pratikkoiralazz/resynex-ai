import React, { useEffect, useState } from 'react';
import { useParams } from 'react me-react-router-dom';
import { getResearchSession, getResearchStatus, getResearchReport } from '../services/api';
import ProgressTracker from '../components/ProgressTracker';
import ReportViewer from '../components/ReportViewer';

export default function ResearchView() {
  const { id } = useParams();
  const [sessionData, setSessionData] = useState(null);
  const [statusData, setStatusData] = useState(null);
  const [report, setReport] = useState(null);

  useEffect(() => {
    getResearchSession(id).then((res) => setSessionData(res.data));

    const pollStatus = async () => {
      try {
        const res = await getResearchStatus(id);
        setStatusData(res.data);

        if (res.data.status === 'completed') {
          const repRes = await getResearchReport(id);
          setReport(repRes.data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    pollStatus();
    const interval = setInterval(() => {
      if (statusData?.status !== 'completed' && statusData?.status !== 'failed') {
        pollStatus();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [id, statusData?.status]);

  if (!sessionData || !statusData) {
    return <div className="p-8 text-center text-slate-400">Loading session pipeline...</div>;
  }

  return (
    <div className="p-8 space-y-8">
      <header className="border-b border-slate-800 pb-4">
        <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
          {sessionData.session.depth} Research
        </span>
        <h1 className="text-2xl font-bold text-white">{sessionData.session.topic}</h1>
      </header>

      {statusData.status !== 'completed' ? (
        <ProgressTracker currentStatus={statusData.status} message={statusData.progress_message} />
      ) : (
        <ReportViewer report={report} />
      )}
    </div>
  );
}
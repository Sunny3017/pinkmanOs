import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Activity, Search, ShieldAlert, CheckCircle2, XCircle, Clock, User, Phone, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLogs = async () => {
    try {
      const response = await api.get('/admin/logs');
      setLogs(response.data);
    } catch (err) {
      setError('Failed to fetch system logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const LogItem = ({ log }) => (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`p-3 md:p-4 border-l-4 rounded-r-lg bg-cyber-dark/40 mb-3 flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 transition-all hover:bg-cyber-gray/40 ${
        log.status === 'success' ? 'border-green-500/50' : 'border-red-500/50'
      }`}
    >
      <div className="flex items-start space-x-3 md:space-x-4">
        <div className={`p-1.5 md:p-2 rounded-full border flex-shrink-0 ${log.status === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
          {log.status === 'success' ? <CheckCircle2 size={14} md:size={16} /> : <ShieldAlert size={14} md:size={16} />}
        </div>
        
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-cyber-cyan truncate">{log.username}</span>
            <span className="text-[8px] md:text-[10px] text-gray-500 font-mono">ID: {log.userId.substring(18)}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-1">
            <div className="flex items-center text-xs md:text-sm font-bold text-white tracking-widest">
              <Phone size={12} md:size={14} className="mr-1.5 text-gray-500" />
              {log.phoneNumber}
            </div>
            {log.error && (
              <span className="text-[8px] md:text-[10px] text-red-400 font-bold uppercase tracking-wider bg-red-900/10 px-2 py-0.5 rounded border border-red-500/20 truncate max-w-[150px] md:max-w-none">
                {log.error}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start border-t border-cyber-cyan/5 pt-2 md:border-t-0 md:pt-0">
        <div className="flex items-center text-[8px] md:text-[10px] text-gray-400 font-mono uppercase tracking-widest">
          <Clock size={10} className="mr-1 text-cyber-magenta" />
          {format(new Date(log.timestamp), 'MMM dd, HH:mm:ss')}
        </div>
        <div className={`text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] mt-1 ${log.status === 'success' ? 'text-green-500/60' : 'text-red-500/60'}`}>
          {log.status === 'success' ? 'SUCCESS' : 'FAILURE'}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter neon-text-cyan uppercase">
            SYSTEM_<span className="text-cyber-magenta">LOGS</span>
          </h2>
          <p className="text-gray-400 font-mono text-[10px] md:text-xs mt-1 uppercase tracking-widest">
            Real-time Activity Stream and Audit Trail
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="p-2.5 md:p-3 text-cyber-cyan border border-cyber-cyan/30 rounded-lg hover:bg-cyber-cyan/10 transition-all shadow-neon-cyan/10"
        >
          <Activity size={20} md:size={24} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        <div className="bg-cyber-dark/40 border border-cyber-cyan/20 p-3 md:p-4 rounded-xl">
          <p className="text-[8px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Intercepts</p>
          <p className="text-xl md:text-2xl font-black text-white italic">{logs.length}</p>
        </div>
        <div className="bg-cyber-dark/40 border border-cyber-cyan/20 p-3 md:p-4 rounded-xl">
          <p className="text-[8px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Success Rate</p>
          <p className="text-xl md:text-2xl font-black text-green-400 italic">
            {logs.length > 0 ? Math.round((logs.filter(l => l.status === 'success').length / logs.length) * 100) : 0}%
          </p>
        </div>
        <div className="bg-cyber-dark/40 border border-cyber-cyan/20 p-3 md:p-4 rounded-xl col-span-2 md:col-span-1">
          <p className="text-[8px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Failure Alerts</p>
          <p className="text-xl md:text-2xl font-black text-red-400 italic">
            {logs.filter(l => l.status === 'failure').length}
          </p>
        </div>
      </div>


      {/* Logs List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="animate-spin mx-auto text-cyber-cyan" size={32} />
            <p className="mt-4 text-xs font-mono uppercase tracking-widest text-cyber-cyan">Accessing System Audit Files...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-20 text-center text-gray-600 uppercase font-black tracking-widest italic border-2 border-dashed border-cyber-cyan/10 rounded-3xl">
            Audit Stream is Empty
          </div>
        ) : (
          logs.map(log => <LogItem key={log._id} log={log} />)
        )}
      </div>
    </div>
  );
};

export default Logs;

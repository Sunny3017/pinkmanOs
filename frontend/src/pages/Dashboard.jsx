import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Search, Phone, User, Home, MapPin, Mail, CreditCard, Shield, AlertTriangle, Loader2, CheckCircle2, Code, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const { user, fetchUser } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('formatted'); // 'formatted' or 'json'

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(phoneNumber)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    setError('');
    setResults([]);

    try {
      const response = await api.post('/search', { phoneNumber });
      const data = response.data.result;
      // Handle both array and single object
      if (Array.isArray(data)) {
        setResults(data);
      } else if (data) {
        setResults([data]);
      } else {
        setResults([]);
        setError('No records found for this number');
      }
      // Refresh user usage info
      fetchUser();
    } catch (err) {
      setError(err.response?.data?.error || 'Search failed, please try again');
    } finally {
      setLoading(false);
    }
  };

  const ResultCard = ({ icon: Icon, label, value, colorClass = 'text-cyber-cyan' }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-cyber-gray/40 border border-cyber-cyan/10 p-3 md:p-4 rounded-xl flex items-start space-x-3 md:space-x-4 hover:border-cyber-cyan/30 transition-all duration-300"
    >
      <div className={`p-2 md:p-3 rounded-lg bg-cyber-black border border-cyber-cyan/20 ${colorClass}`}>
        {Icon ? <Icon size={18} /> : <Shield size={18} />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 truncate">{label}</p>
        <p className={`font-mono text-xs md:text-sm tracking-tight break-words text-white`}>
          {typeof value === 'object' ? JSON.stringify(value) : (value || 'N/A')}
        </p>
      </div>
    </motion.div>
  );

  const JsonView = ({ data }) => (
    <div className="bg-cyber-black/80 border border-cyber-cyan/30 rounded-xl p-4 md:p-6 font-mono text-xs md:text-sm overflow-x-auto shadow-inner">
      <div className="flex items-center justify-between mb-4 border-b border-cyber-cyan/10 pb-2">
        <span className="text-cyber-cyan font-bold uppercase tracking-widest flex items-center gap-2">
          <Code size={14} /> RAW_DATA.JSON
        </span>
        <span className="text-gray-500 text-[10px]">SIZE: {JSON.stringify(data).length} bytes</span>
      </div>
      <pre className="text-cyber-cyan/90 leading-relaxed">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );

  const renderDynamicFields = (result) => {
    // Standard fields we already have specific cards for
    const standardFields = ['name', 'father_name', 'address', 'circle', 'alternate_number', 'email', 'aadhaar', 'mobile'];
    
    // Icon mapping for standard fields
    const iconMap = {
      name: User,
      father_name: Shield,
      address: MapPin,
      circle: Home,
      alternate_number: Phone,
      email: Mail,
      aadhaar: CreditCard,
      mobile: Phone
    };

    // Label mapping for standard fields
    const labelMap = {
      name: "Primary Subscriber",
      father_name: "Guardian/Relation",
      address: "Registered Address",
      circle: "Service Circle",
      alternate_number: "Secondary Contact",
      email: "Email Address",
      aadhaar: "Aadhaar / Identity",
      mobile: "Mobile Number"
    };

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        {/* Render standard fields first for consistent layout */}
        {standardFields.map(field => {
          if (result[field] || field === 'mobile') {
            return (
              <ResultCard 
                key={field}
                icon={iconMap[field]} 
                label={labelMap[field]} 
                value={field === 'mobile' ? (result.mobile || phoneNumber) : result[field]} 
              />
            );
          }
          return null;
        })}

        {/* Render any additional fields dynamically from API */}
        {Object.entries(result).map(([key, value]) => {
          if (!standardFields.includes(key) && value !== null && value !== undefined) {
            // Convert snake_case or camelCase to readable labels
            const dynamicLabel = key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').toUpperCase();
            return (
              <ResultCard 
                key={key}
                icon={Shield} 
                label={dynamicLabel} 
                value={value}
                colorClass="text-cyber-magenta" 
              />
            );
          }
          return null;
        })}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 bg-cyber-dark/40 p-6 md:p-8 rounded-2xl border border-cyber-cyan/20 backdrop-blur-md">
        <div>
          <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter neon-text-cyan">
            TERMINAL_<span className="text-cyber-magenta">SEARCH</span>
          </h2>
          <p className="text-gray-400 font-mono text-[10px] md:text-xs mt-1 uppercase tracking-widest">
            Cross-Network Lookup Interface v4.0.1
          </p>
        </div>

        <div className="flex items-center justify-between md:justify-end space-x-4 border-t border-cyber-cyan/10 pt-4 md:border-t-0 md:pt-0">
          <div className="text-left md:text-right">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Credits Available</p>
            <p className="text-lg md:text-xl font-black text-cyber-cyan font-mono">
              {user?.allowedSearchLimit - user?.totalSearchUsed}
            </p>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-cyber-cyan/30 flex items-center justify-center bg-cyber-black shadow-neon-cyan/20">
            <CreditCard size={18} className="text-cyber-cyan" />
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-cyber-dark/60 p-1 rounded-2xl border border-cyber-cyan/20 shadow-2xl">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-1 md:gap-2">
          <div className="flex-1 relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-cyber-cyan/50">
              <Phone size={20} />
            </div>
            <input
              type="text"
              maxLength={10}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
              placeholder="ENTER 10-DIGIT MOBILE NUMBER"
              className="w-full bg-cyber-black/80 border-0 border-b-2 border-cyber-cyan/30 text-white px-12 py-4 md:py-5 text-lg md:text-xl font-mono tracking-widest focus:ring-0 focus:border-cyber-cyan transition-all duration-300 rounded-t-xl md:rounded-l-xl md:rounded-tr-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-cyber-cyan text-cyber-black px-8 md:px-10 py-4 md:py-5 font-black text-lg md:text-xl flex items-center justify-center space-x-3 transition-all duration-300 hover:bg-cyber-magenta hover:text-white shadow-neon-cyan hover:shadow-neon-magenta disabled:opacity-50 disabled:cursor-not-allowed rounded-b-xl md:rounded-r-xl md:rounded-bl-none"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <>
                <Search size={24} />
                <span>EXECUTE</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-red-900/20 border border-red-500/40 p-4 rounded-xl flex items-center space-x-3 text-red-400 font-bold uppercase tracking-widest text-xs md:text-sm shadow-lg shadow-red-500/10">
              <AlertTriangle size={20} className="animate-pulse flex-shrink-0" />
              <span>{error}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Section */}
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center space-x-3 text-cyber-cyan">
                <CheckCircle2 size={24} className="neon-text-cyan flex-shrink-0" />
                <h3 className="text-xl font-black italic tracking-tighter uppercase">Query Results ({results.length})</h3>
              </div>

              {/* View Mode Toggle */}
              <div className="flex bg-cyber-dark/60 p-1 rounded-lg border border-cyber-cyan/20 self-start sm:self-auto">
                <button
                  onClick={() => setViewMode('formatted')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] font-bold tracking-widest transition-all duration-300 ${
                    viewMode === 'formatted' 
                    ? 'bg-cyber-cyan text-cyber-black shadow-neon-cyan' 
                    : 'text-gray-500 hover:text-cyber-cyan'
                  }`}
                >
                  <LayoutGrid size={14} /> FORMATTED
                </button>
                <button
                  onClick={() => setViewMode('json')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] font-bold tracking-widest transition-all duration-300 ${
                    viewMode === 'json' 
                    ? 'bg-cyber-magenta text-white shadow-neon-magenta' 
                    : 'text-gray-500 hover:text-cyber-magenta'
                  }`}
                >
                  <Code size={14} /> RAW JSON
                </button>
              </div>
            </div>

            {results.map((result, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="space-y-4 relative"
              >
                {results.length > 1 && (
                  <div className="absolute -left-2 top-0 bottom-0 w-1 bg-gradient-to-b from-cyber-cyan to-transparent rounded-full opacity-50 hidden md:block" />
                )}
                
                {viewMode === 'formatted' ? renderDynamicFields(result) : <JsonView data={result} />}
                
                {index < results.length - 1 && (
                  <div className="border-b border-cyber-cyan/10 my-8"></div>
                )}
              </motion.div>
            ))}

            <div className="p-4 md:p-6 bg-cyber-dark/40 border border-cyber-magenta/20 rounded-2xl border-dashed">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                <span>Verification ID: {Math.random().toString(36).substring(7).toUpperCase()}</span>
                <span>Role: {user?.role}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State / Welcome */}
      {results.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 md:py-20 opacity-30 border-2 border-dashed border-cyber-cyan/10 rounded-3xl"
        >
          <Search size={48} className="md:size-64 mb-4 text-cyber-cyan" />
          <p className="text-lg md:text-xl font-black italic tracking-widest uppercase">Awaiting System Input</p>
          <p className="text-xs md:text-sm font-mono mt-2 text-center px-4">Ready to intercept and analyze data packets</p>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;

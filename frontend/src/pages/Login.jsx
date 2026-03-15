import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff, Loader2, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, login } = useAuth();
  const navigate = useNavigate();

  // WhatsApp configuration
  const WHATSAPP_NUMBER = "918826943792"; // Updated with provided number
  const WHATSAPP_MESSAGE = encodeURIComponent("I want to buy credits");
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-black text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="scanlines"></div>
      <div className="bg-grid absolute inset-0 opacity-20"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-cyber-dark/90 backdrop-blur-xl border-2 border-cyber-cyan/30 rounded-2xl p-10 shadow-2xl transition-all duration-300 hover:border-cyber-cyan/60 hover:shadow-neon-cyan">
          <div className="text-center mb-10">
            <div className="flex justify-center mb-4">
              <ShieldCheck className="text-cyber-cyan w-16 h-16 neon-text-cyan animate-pulse" />
            </div>
            <h1 className="text-4xl font-black italic tracking-tighter neon-text-cyan">
              PINKMAN<span className="text-cyber-magenta">OS</span>
            </h1>
            <p className="text-gray-400 mt-2 font-mono text-sm tracking-widest uppercase">
              Secure Lookup Terminal
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-cyber-cyan uppercase tracking-widest mb-2 ml-1">
                System Email
              </label>
              <input
                type="email"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full cyber-input text-lg"
                placeholder="EMAIL@EXAMPLE.COM"
              />
            </div>

            <div className="relative">
              <label className="block text-xs font-bold text-cyber-cyan uppercase tracking-widest mb-2 ml-1">
                Access Key
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full cyber-input text-lg"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 bottom-3 text-gray-400 hover:text-cyber-cyan transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3 bg-red-900/30 border border-red-500/50 rounded text-red-400 text-sm font-bold uppercase tracking-widest flex items-center space-x-2"
              >
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                <span>Error: {error}</span>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full cyber-button-primary py-4 text-xl font-black flex items-center justify-center space-x-3 group"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  <span>AUTHENTICATE</span>
                  <div className="w-2 h-2 bg-cyber-black rounded-full group-hover:bg-white transition-colors shadow-sm" />
                </>
              )}
            </button>
          </form>

          {/* WhatsApp Support Section */}
          <div className="mt-8 pt-8 border-t border-cyber-cyan/10">
            <div className="text-center">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
                Don't have login credentials?
              </p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-3 px-6 py-3 bg-[#25D366]/10 border border-[#25D366]/50 rounded-lg text-[#25D366] hover:bg-[#25D366]/20 transition-all duration-300 shadow-[0_0_15px_rgba(37,211,102,0.1)] hover:shadow-[0_0_20px_rgba(37,211,102,0.3)] group"
              >
                <MessageCircle size={20} className="group-hover:scale-110 transition-transform" />
                <span className="font-bold tracking-wider">CONTACT VIA WHATSAPP</span>
              </a>
            </div>
          </div>

          <div className="mt-8 text-center border-t border-cyber-cyan/10 pt-6">
            <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-mono leading-relaxed">
              UNAUTHORIZED ACCESS IS PROHIBITED.
              <br />
              ALL SYSTEM ACTIVITIES ARE MONITORED AND LOGGED.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

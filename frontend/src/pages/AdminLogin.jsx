import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminLogin = () => {
  const { user, login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(username, password);
      navigate('/admin');
    } catch (err) {
      setError('Invalid credentials or admin access required.');
      setLoading(false);
    }
  };

  if (user && user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-screen bg-cyber-black flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-20"></div>
      <div className="scanlines"></div>

      <motion.div 
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, type: 'spring', stiffness: 50 }}
        className="w-full max-w-md z-10"
      >
        <div className="cyber-card p-8">
          <div className="text-center mb-8">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, duration: 0.5 }}>
              <ShieldCheck className="mx-auto h-16 w-16 text-cyber-cyan neon-text-cyan" />
            </motion.div>
            <h1 className="text-4xl font-black italic tracking-tighter text-cyber-cyan uppercase mt-4 neon-text-cyan">
              Admin Access
            </h1>
            <p className="text-gray-400 mt-2 font-mono text-sm tracking-widest uppercase">
              Secure Control Panel
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-cyber-cyan uppercase tracking-widest mb-2 ml-1">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full cyber-input text-lg"
                placeholder="ADMIN@EXAMPLE.COM"
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
                className="w-full cyber-input text-lg pr-10"
                placeholder="●●●●●●●●"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-9 text-gray-500 hover:text-cyber-cyan transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {error && (
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-cyber-magenta text-sm font-bold text-center neon-text-magenta"
              >
                {error}
              </motion.p>
            )}

            <motion.button 
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px #00f3ff' }}
              whileTap={{ scale: 0.95 }}
              type="submit" 
              disabled={loading}
              className="w-full cyber-button-primary py-3 flex items-center justify-center"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Authenticate'}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;

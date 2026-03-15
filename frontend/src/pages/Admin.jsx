import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Users, UserPlus, Trash2, RefreshCw, CheckCircle, XCircle, Clock, Calendar, Search, Loader2, MoreVertical, Edit2, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'user',
    allowedSearchLimit: 20,
    expiryDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
  });

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setError('');

    try {
      await api.post('/admin/users', formData);
      setShowModal(false);
      setSuccess('User created successfully');
      fetchUsers();
      setFormData({
        username: '',
        password: '',
        role: 'user',
        allowedSearchLimit: 20,
        expiryDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create user');
    } finally {
      setModalLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await api.put(`/admin/users/${user._id}`, { isActive: !user.isActive });
      setSuccess(`User ${user.isActive ? 'deactivated' : 'activated'} successfully`);
      fetchUsers();
    } catch (err) {
      setError('Failed to update status');
    }
  };

  const handleResetUsage = async (userId) => {
    try {
      await api.patch(`/admin/users/${userId}/reset`);
      setSuccess('User usage reset successfully');
      fetchUsers();
    } catch (err) {
      setError('Failed to reset usage');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setSuccess('User deleted successfully');
      fetchUsers();
    } catch (err) {
      setError('Failed to delete user');
    }
  };

  const UserRow = ({ user }) => (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="border-b border-cyber-cyan/10 hover:bg-cyber-cyan/5 transition-all group block md:table-row"
    >
      <td className="px-4 md:px-6 py-4 block md:table-cell">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded bg-cyber-black border ${user.role === 'admin' ? 'border-cyber-magenta text-cyber-magenta' : 'border-cyber-cyan text-cyber-cyan'}`}>
            <Users size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-black uppercase tracking-wider truncate">{user.username}</div>
            <div className={`text-[10px] font-bold uppercase ${user.role === 'admin' ? 'text-cyber-magenta' : 'text-cyber-cyan'}`}>
              {user.role}
            </div>
          </div>
          <div className="md:hidden">
            <span className={`px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center space-x-1 ${
              user.isActive && new Date(user.expiryDate) > new Date()
                ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                : 'bg-red-500/10 text-red-400 border border-red-500/30'
            }`}>
              {user.isActive && new Date(user.expiryDate) > new Date() ? 'ACTIVE' : 'INACTIVE'}
            </span>
          </div>
        </div>
      </td>
      <td className="px-4 md:px-6 py-2 md:py-4 block md:table-cell">
        <div className="flex flex-row md:flex-col items-center md:items-start justify-between md:justify-start">
          <span className="md:hidden text-[9px] font-black text-gray-500 uppercase tracking-widest mr-2">Usage:</span>
          <div className="flex flex-col flex-1 max-w-[150px] md:max-w-none">
            <div className="text-[10px] md:text-xs font-mono text-right md:text-left">
              {user.totalSearchUsed} / {user.allowedSearchLimit}
            </div>
            <div className="w-full h-1 md:h-1.5 bg-cyber-gray rounded-full mt-1 overflow-hidden">
              <div
                className={`h-full ${user.totalSearchUsed >= user.allowedSearchLimit ? 'bg-red-500' : 'bg-cyber-cyan'}`}
                style={{ width: `${Math.min((user.totalSearchUsed / user.allowedSearchLimit) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 md:px-6 py-2 md:py-4 block md:table-cell">
        <div className="flex items-center justify-between md:justify-start text-[10px] md:text-xs text-gray-400">
          <span className="md:hidden font-black text-gray-500 uppercase tracking-widest">Expiry:</span>
          <div className="flex items-center font-mono">
            <Calendar size={10} className="mr-1 text-cyber-cyan" />
            {format(new Date(user.expiryDate), 'MMM dd, yyyy')}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
        <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center w-fit space-x-1.5 ${
          user.isActive && new Date(user.expiryDate) > new Date()
            ? 'bg-green-500/10 text-green-400 border border-green-500/30'
            : 'bg-red-500/10 text-red-400 border border-red-500/30'
        }`}>
          {user.isActive && new Date(user.expiryDate) > new Date() ? (
            <><CheckCircle size={10} /> <span>ACTIVE</span></>
          ) : (
            <><XCircle size={10} /> <span>INACTIVE</span></>
          )}
        </span>
      </td>
      <td className="px-4 md:px-6 py-4 block md:table-cell text-right text-sm font-medium border-t border-cyber-cyan/5 md:border-t-0">
        <div className="flex items-center justify-end space-x-1 md:space-x-2">
          <button
            onClick={() => handleResetUsage(user._id)}
            title="Reset Usage"
            className="p-2 text-gray-400 hover:text-cyber-cyan hover:bg-cyber-cyan/10 rounded transition-all"
          >
            <RefreshCw size={14} md:size={16} />
          </button>
          <button
            onClick={() => handleToggleStatus(user)}
            title={user.isActive ? 'Deactivate' : 'Activate'}
            className={`p-2 rounded transition-all ${user.isActive ? 'text-gray-400 hover:text-red-400 hover:bg-red-400/10' : 'text-gray-400 hover:text-green-400 hover:bg-green-400/10'}`}
          >
            {user.isActive ? <XCircle size={14} md:size={16} /> : <CheckCircle size={14} md:size={16} />}
          </button>
          <button
            onClick={() => handleDeleteUser(user._id)}
            title="Delete User"
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-all"
          >
            <Trash2 size={14} md:size={16} />
          </button>
        </div>
      </td>
    </motion.tr>
  );

  return (
    <div className="space-y-6 md:space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter neon-text-magenta uppercase">
            USER_<span className="text-cyber-cyan">MANAGEMENT</span>
          </h2>
          <p className="text-gray-400 font-mono text-[10px] md:text-xs mt-1 uppercase tracking-widest">
            Identity and Access Control Subsystem
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="cyber-button-primary px-4 md:px-6 py-3 text-xs md:text-sm flex items-center justify-center space-x-2"
        >
          <UserPlus size={18} />
          <span>CREATE NEW AGENT</span>
        </button>
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-green-900/20 border border-green-500/40 p-3 md:p-4 rounded-xl flex items-center justify-between text-green-400 font-bold uppercase tracking-widest text-[10px] md:text-sm"
          >
            <div className="flex items-center space-x-3">
              <CheckCircle size={18} />
              <span>{success}</span>
            </div>
            <button onClick={() => setSuccess('')}><XCircle size={16} /></button>
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-900/20 border border-red-500/40 p-3 md:p-4 rounded-xl flex items-center justify-between text-red-400 font-bold uppercase tracking-widest text-[10px] md:text-sm"
          >
            <div className="flex items-center space-x-3">
              <ShieldAlert size={18} />
              <span>{error}</span>
            </div>
            <button onClick={() => setError('')}><XCircle size={16} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Users Table */}
      <div className="bg-cyber-dark/40 border border-cyber-cyan/20 rounded-2xl overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="hidden md:table-header-group">
              <tr className="bg-cyber-black/80 border-b border-cyber-cyan/30">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Agent Identity</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Usage Quota</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Access Expiry</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-cyan/10 block md:table-row-group">
              {loading ? (
                <tr className="block md:table-row">
                  <td colSpan="5" className="px-6 py-20 text-center block md:table-cell">
                    <Loader2 className="animate-spin mx-auto text-cyber-cyan" size={32} />
                    <p className="mt-4 text-[10px] md:text-xs font-mono uppercase tracking-widest text-cyber-cyan">Synchronizing Agent Data...</p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr className="block md:table-row">
                  <td colSpan="5" className="px-6 py-20 text-center text-gray-600 uppercase font-black tracking-widest italic block md:table-cell">
                    No Agents Registered in Subsystem
                  </td>
                </tr>
              ) : (
                users.map(user => <UserRow key={user._id} user={user} />)
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-cyber-black/95 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-cyber-dark border-2 border-cyber-magenta/50 rounded-2xl w-full max-w-lg p-6 md:p-8 shadow-neon-magenta/20 overflow-y-auto max-h-[95vh]"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyber-magenta/5 blur-3xl -z-10" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-cyber-cyan/5 blur-3xl -z-10" />

              <div className="flex items-center justify-between mb-6 md:mb-8">
                <h3 className="text-xl md:text-2xl font-black italic tracking-tighter text-cyber-magenta uppercase">Register_Agent</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white transition-colors p-2"><XCircle /></button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-cyber-magenta uppercase tracking-widest mb-1.5">Email Address</label>
                    <input
                      type="email"
                      required
                      className="w-full cyber-input text-sm"
                      placeholder="EMAIL@EXAMPLE.COM"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-cyber-magenta uppercase tracking-widest mb-1.5">Access Key</label>
                    <input
                      type="password"
                      required
                      className="w-full cyber-input text-sm"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-cyber-magenta uppercase tracking-widest mb-1.5">Search Limit</label>
                    <input
                      type="number"
                      required
                      className="w-full cyber-input text-sm"
                      value={formData.allowedSearchLimit}
                      onChange={(e) => setFormData({ ...formData, allowedSearchLimit: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-cyber-magenta uppercase tracking-widest mb-1.5">Expiry Date</label>
                    <input
                      type="date"
                      required
                      className="w-full cyber-input text-sm"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-cyber-magenta uppercase tracking-widest mb-1.5">Agent Role</label>
                  <select
                    className="w-full bg-cyber-gray border-b-2 border-cyber-cyan/50 text-white px-4 py-2 outline-none transition-all duration-300 focus:border-cyber-magenta text-sm"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="user">STANDARD USER</option>
                    <option value="admin">SYSTEM ADMINISTRATOR</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={modalLoading}
                  className="w-full bg-cyber-magenta text-white py-4 font-black text-lg tracking-widest uppercase flex items-center justify-center space-x-3 shadow-neon-magenta transition-all hover:brightness-125 mt-2"
                >
                  {modalLoading ? <Loader2 className="animate-spin" size={24} /> : <span>INITIATE PROTOCOL</span>}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Admin;

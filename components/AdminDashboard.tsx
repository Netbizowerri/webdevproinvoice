import React, { useState, useEffect } from 'react';
import { Shield, Trash2, ToggleLeft, ToggleRight, UserCog, Mail, Calendar, Crown, User as UserIcon } from 'lucide-react';
import { adminService, AppUser } from '../services/adminService';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboard: React.FC = () => {
  const { appUser } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);

  useEffect(() => {
    const unsub = adminService.onUsersChanged(setUsers);
    return unsub;
  }, []);

  const handleToggleRole = async (uid: string, currentRole: 'admin' | 'user') => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    await adminService.updateUserRole(uid, newRole);
  };

  const handleToggleDisabled = async (uid: string, disabled: boolean) => {
    await adminService.toggleUserDisabled(uid, !disabled);
  };

  const handleDeleteUser = async (uid: string) => {
    if (confirm('Delete this user record? This cannot be undone.')) {
      await adminService.deleteUser(uid);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Admin Dashboard</h2>
          <p className="text-slate-500">Manage all registered users of the application.</p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 p-3 rounded-xl shadow-sm">
          <Shield size={18} className="text-indigo-600" />
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Super Admin</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <p className="text-sm font-medium text-slate-600">
            <span className="font-bold text-slate-800">{users.length}</span> total user{users.length !== 1 ? 's' : ''}
            {' — '}
            <span className="font-bold text-indigo-600">{users.filter(u => u.role === 'admin').length}</span> admin
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">User</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Email</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Joined</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(u => (
                <tr key={u.uid} className={`hover:bg-slate-50/80 transition-colors ${u.disabled ? 'opacity-50' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm ${
                        u.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {u.displayName.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-semibold text-slate-800">{u.displayName}</span>
                      {u.uid === appUser?.uid && (
                        <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold uppercase px-2 py-0.5 rounded-full">You</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      u.role === 'admin'
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-100'
                        : 'bg-slate-50 text-slate-600 border-slate-100'
                    }`}>
                      {u.role === 'admin' ? <Crown size={12} /> : <UserIcon size={12} />}
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      u.disabled
                        ? 'bg-red-50 text-red-600 border-red-100'
                        : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                    }`}>
                      {u.disabled ? 'Disabled' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleToggleRole(u.uid, u.role)}
                        disabled={u.uid === appUser?.uid}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        title={u.role === 'admin' ? 'Demote to user' : 'Promote to admin'}
                      >
                        <UserCog size={16} />
                      </button>
                      <button
                        onClick={() => handleToggleDisabled(u.uid, u.disabled ?? false)}
                        disabled={u.uid === appUser?.uid}
                        className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        title={u.disabled ? 'Enable user' : 'Disable user'}
                      >
                        {u.disabled ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.uid)}
                        disabled={u.uid === appUser?.uid}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Delete user"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-slate-400">
                    <p className="text-lg font-medium">No users registered yet</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6">
        <h4 className="text-sm font-bold text-amber-800 mb-2">Important: Firebase Console Setup</h4>
        <ol className="text-xs text-amber-700 space-y-1 list-decimal list-inside">
          <li>Go to <strong>Firebase Console → Authentication → Sign-in method</strong></li>
          <li>Enable the <strong>Email/Password</strong> provider</li>
          <li>Go to <strong>Firestore Database → Rules</strong> and deploy the rules from &nbsp;<code>firestore.rules</code></li>
          <li>The first user to sign up must be manually set as admin in the Firestore <code>app_users</code> collection</li>
        </ol>
      </div>
    </div>
  );
};

export default AdminDashboard;

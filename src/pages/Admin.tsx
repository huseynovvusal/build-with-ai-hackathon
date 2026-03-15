import { useState, useEffect } from 'react';
import { Loader2, Users, FolderKanban, Mail, ShieldAlert, Activity } from 'lucide-react';
import { format } from 'date-fns';

export default function Admin() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const res = await fetch('/api/admin/metrics');
      if (!res.ok) throw new Error('Failed to fetch metrics');
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      fetchMetrics();
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDisabled: !currentStatus })
      });
      fetchMetrics();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>;
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-text-secondary">Manage community members and monitor platform activity.</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-surface border border-border rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="bg-accent/10 p-3 rounded-lg text-accent">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-text-secondary font-medium uppercase tracking-wider">Total Users</p>
              <p className="text-3xl font-bold">{data.metrics.usersCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-500/10 p-3 rounded-lg text-emerald-500">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-text-secondary font-medium uppercase tracking-wider">Active Users</p>
              <p className="text-3xl font-bold">{data.metrics.activeUsersCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="bg-blue-500/10 p-3 rounded-lg text-blue-500">
              <FolderKanban className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-text-secondary font-medium uppercase tracking-wider">Projects</p>
              <p className="text-3xl font-bold">{data.metrics.projectsCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="bg-purple-500/10 p-3 rounded-lg text-purple-500">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-text-secondary font-medium uppercase tracking-wider">Invites Sent</p>
              <p className="text-3xl font-bold">{data.metrics.invitesCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Users Table */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold">User Management</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-bg text-text-secondary uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Role</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Joined</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.users.map((user: any) => (
                  <tr key={user.id} className="hover:bg-bg/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-text-primary">{user.name}</div>
                      <div className="text-text-secondary">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="bg-bg border border-border rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-accent outline-none"
                      >
                        <option value="member">Member</option>
                        <option value="organizer">Organizer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.isDisabled ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'
                      }`}>
                        {user.isDisabled ? 'Disabled' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      {format(new Date(user.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(user.id, user.isDisabled)}
                        className={`text-sm font-medium ${user.isDisabled ? 'text-emerald-500 hover:text-emerald-400' : 'text-red-500 hover:text-red-400'}`}
                      >
                        {user.isDisabled ? 'Enable' : 'Disable'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Logs */}
        <div className="bg-surface border border-border rounded-2xl overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-border flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-text-secondary" />
            <h2 className="text-lg font-semibold">Audit Logs</h2>
          </div>
          <div className="p-6 overflow-y-auto max-h-[600px] space-y-4">
            {data.auditLogs.length === 0 ? (
              <p className="text-text-secondary text-sm text-center">No audit logs found.</p>
            ) : (
              data.auditLogs.map((log: any) => (
                <div key={log.id} className="border-l-2 border-accent pl-4 py-1">
                  <p className="text-sm font-medium text-text-primary">
                    {log.actorUser?.name || 'System'} <span className="text-text-secondary font-normal">performed</span> {log.action}
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    {format(new Date(log.createdAt), 'MMM d, yyyy HH:mm')}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

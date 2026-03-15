import React, { useMemo, useState } from 'react';
import { Plus, X, Save, Settings2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/auth';
import { membersApi } from '../api/members';

interface SettingsPanelProps {
  onShowToast: (msg: string) => void;
}

export function SettingsPanel({ onShowToast }: SettingsPanelProps) {
  const { user, updateUser } = useAuth();

  const [skills, setSkills] = useState<string[]>(user?.top_skills || []);
  const [roles, setRoles] = useState<string[]>(user?.roles || (user?.role ? [user.role] : []));
  const [newSkill, setNewSkill] = useState('');
  const [newRole, setNewRole] = useState('');
  const [organizationLogin, setOrganizationLogin] = useState(user?.organization_login || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncingOrg, setIsSyncingOrg] = useState(false);

  const normalizedSkills = useMemo(
    () => skills.map((s) => s.trim()).filter(Boolean),
    [skills],
  );
  const normalizedRoles = useMemo(
    () => roles.map((r) => r.trim()).filter(Boolean),
    [roles],
  );

  const addSkill = () => {
    const next = newSkill.trim();
    if (!next) return;
    if (skills.some((s) => s.toLowerCase() === next.toLowerCase())) return;
    setSkills((prev) => [...prev, next]);
    setNewSkill('');
  };

  const removeSkill = (skill: string) => {
    setSkills((prev) => prev.filter((s) => s !== skill));
  };

  const addRole = () => {
    const next = newRole.trim();
    if (!next) return;
    if (roles.some((r) => r.toLowerCase() === next.toLowerCase())) return;
    setRoles((prev) => [...prev, next]);
    setNewRole('');
  };

  const removeRole = (role: string) => {
    setRoles((prev) => prev.filter((r) => r !== role));
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const updated = await authApi.updateMe({
        top_skills: normalizedSkills,
        roles: normalizedRoles,
        role: normalizedRoles[0] || '',
        organization_login: organizationLogin.trim(),
      });
      updateUser(updated);
      onShowToast('Settings saved successfully.');
    } catch (err) {
      console.error(err);
      onShowToast('Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOrganizationSync = async () => {
    const org = organizationLogin.trim();
    if (!org) {
      onShowToast('Please enter organization login first.');
      return;
    }

    setIsSyncingOrg(true);
    try {
      const updated = await authApi.updateMe({ organization_login: org });
      updateUser(updated);

      const result = await membersApi.syncOrganization(org);
      onShowToast(`Synced ${result.members_synced || 0} members from ${org}.`);
    } catch (err) {
      console.error(err);
      onShowToast((err as Error)?.message || 'Organization sync failed. Check org login and access.');
    } finally {
      setIsSyncingOrg(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8 border-b-2 border-slate-900 pb-4">
        <h2 className="text-3xl font-bold uppercase tracking-tight flex items-center gap-3">
          <Settings2 className="w-8 h-8 text-blue-600" />
          Settings
        </h2>
        <p className="text-slate-500 font-mono text-sm mt-2">Manage your profile skills and project roles.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border-2 border-slate-900 bg-white p-5 lg:col-span-2">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Organization</h3>
          <div className="flex flex-col md:flex-row gap-2">
            <input
              value={organizationLogin}
              onChange={(e) => setOrganizationLogin(e.target.value)}
              className="flex-1 border-2 border-slate-900 px-3 py-2 text-sm"
              placeholder="GitHub org login (e.g. microsoft)"
            />
            <button
              onClick={handleOrganizationSync}
              disabled={isSyncingOrg}
              className="px-4 py-2 border-2 border-slate-900 bg-blue-600 text-white font-bold uppercase text-xs disabled:opacity-50"
              type="button"
            >
              {isSyncingOrg ? 'Syncing...' : 'Sync Members'}
            </button>
          </div>
          <p className="text-xs font-mono text-slate-500 mt-2">
            If auto-detection is empty, set org login manually and sync all members.
          </p>
        </div>

        <div className="border-2 border-slate-900 bg-white p-5">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Skills</h3>
          <div className="flex gap-2 mb-4">
            <input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addSkill()}
              className="flex-1 border-2 border-slate-900 px-3 py-2 text-sm"
              placeholder="Add a skill (e.g. Django)"
            />
            <button
              onClick={addSkill}
              className="px-3 py-2 border-2 border-slate-900 bg-slate-900 text-white"
              type="button"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {skills.length === 0 ? (
              <span className="text-xs font-mono text-slate-400">No skills yet.</span>
            ) : (
              skills.map((skill) => (
                <span key={skill} className="inline-flex items-center gap-1 px-2 py-1 border border-slate-900 bg-slate-100 text-xs font-mono">
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))
            )}
          </div>
        </div>

        <div className="border-2 border-slate-900 bg-white p-5">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Roles</h3>
          <div className="flex gap-2 mb-4">
            <input
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addRole()}
              className="flex-1 border-2 border-slate-900 px-3 py-2 text-sm"
              placeholder="Add a role (e.g. Backend Engineer)"
            />
            <button
              onClick={addRole}
              className="px-3 py-2 border-2 border-slate-900 bg-slate-900 text-white"
              type="button"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {roles.length === 0 ? (
              <span className="text-xs font-mono text-slate-400">No roles yet.</span>
            ) : (
              roles.map((role) => (
                <span key={role} className="inline-flex items-center gap-1 px-2 py-1 border border-slate-900 bg-slate-100 text-xs font-mono">
                  {role}
                  <button type="button" onClick={() => removeRole(role)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-4 py-2 border-2 border-slate-900 bg-slate-900 text-white font-bold uppercase text-sm disabled:opacity-50"
          type="button"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}

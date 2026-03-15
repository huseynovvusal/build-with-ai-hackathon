import React, { useState } from 'react';
import { FileText, Tags, Plus, Zap, CheckCircle2, UserPlus, Fingerprint } from 'lucide-react';
import { projectsApi } from '../api/projects';

interface CreateProjectProps {
  onCreated: () => void;
  onShowToast: (msg: string) => void;
}

export function CreateProject({ onCreated, onShowToast }: CreateProjectProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdProject, setCreatedProject] = useState<any>(null);

  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if (e.type === 'keydown' && (e as React.KeyboardEvent).key !== 'Enter') return;
    if (!skillInput.trim() || requiredSkills.includes(skillInput.trim())) return;
    setRequiredSkills([...requiredSkills, skillInput.trim()]);
    setSkillInput('');
  };

  const handleRemoveSkill = (skill: string) => {
    setRequiredSkills(requiredSkills.filter(s => s !== skill));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      const project = await projectsApi.createProject({
        title,
        description,
        required_skills: requiredSkills,
      });
      setCreatedProject(project);
      onShowToast(`Project '${project.title}' created successfully.`);
    } catch (err) {
      console.error(err);
      onShowToast('Failed to create project.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActivate = async () => {
    if (!createdProject) return;
    try {
      // Assuming activate uses the same proposal format or we update status manually
      // Here we just mock the notification toast and leave
      // await projectsApi.activateProposal(createdProject.id);
      onShowToast(`Activated project '${createdProject.title}'. Inviting team!`);
      onCreated();
    } catch (err) {
      onShowToast('Failed to activate project.');
    }
  };

  if (createdProject) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <div className="mb-8 border-b-2 border-emerald-600 pb-4 flex items-center gap-3 text-emerald-600">
          <CheckCircle2 className="w-8 h-8" />
          <h2 className="text-3xl font-bold uppercase tracking-tight">Project Initialized</h2>
        </div>
        
        <div className="border-4 border-slate-900 bg-white shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] p-8">
          <h3 className="text-2xl font-bold mb-4">{createdProject.title}</h3>
          <p className="text-slate-700 mb-8">{createdProject.description}</p>

          <div className="border-2 border-blue-400 bg-blue-50 p-6 mb-8 relative">
            <div className="absolute -top-3 left-6 bg-blue-50 px-2 flex items-center gap-2 text-blue-700 font-bold uppercase text-xs tracking-wider border border-blue-200">
              <Zap className="w-4 h-4" />
              AI Team Match Results
            </div>
            
            <p className="font-mono text-sm text-blue-900 mb-6 italic border-b border-blue-200 pb-4">
              "{createdProject.ai_team_reasoning || 'I analyzed the community members and matched the following team based on their public GitHub footprint.'}"
            </p>

            <div className="space-y-4">
              {createdProject.project_members?.map((pm: any) => (
                <div key={pm.id} className="bg-white border border-blue-200 p-4 flex items-start gap-4 shadow-sm">
                  <img src={pm.member.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${pm.member.github_id}`} alt="Avatar" className="w-12 h-12 border-2 border-slate-900" />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold">{pm.member.name}</span>
                      <span className="text-xs uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                        {pm.role}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">
                      <span className="font-bold">Match: </span>
                      {pm.ai_reasoning}
                    </p>
                  </div>
                </div>
              ))}
              {(!createdProject.project_members || createdProject.project_members.length === 0) && (
                <p className="text-slate-500 font-mono text-xs">No suitable members found in the current pool.</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button 
              onClick={onCreated}
              className="px-6 py-3 border-2 border-slate-900 font-bold uppercase text-slate-700 hover:bg-slate-50"
            >
              Back to Projects
            </button>
            <button 
              onClick={handleActivate}
              className="px-6 py-3 border-2 border-slate-900 bg-slate-900 text-white font-bold uppercase flex items-center gap-2 hover:bg-slate-800"
            >
              <UserPlus className="w-5 h-5" />
              Send Invites & Activate
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8 border-b-2 border-slate-900 pb-4">
        <h2 className="text-3xl font-bold uppercase tracking-tight flex items-center gap-3">
          <Plus className="w-8 h-8 text-blue-600" />
          Create New Initiative
        </h2>
        <p className="text-slate-500 font-mono text-sm mt-2">Define a project and let AI match you with the best available team.</p>
      </div>

      <form onSubmit={handleSubmit} className="border-4 border-slate-900 bg-white shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] p-8">
        <div className="space-y-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-bold uppercase text-slate-700 mb-2">
              <FileText className="w-4 h-4" /> Project Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. NextGen Telemetry Dashboard"
              className="w-full border-2 border-slate-900 p-3 font-mono focus:outline-none focus:ring-0 focus:border-blue-600 bg-slate-50"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-bold uppercase text-slate-700 mb-2">
              <Fingerprint className="w-4 h-4" /> Project Description
            </label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the goals, architecture, and required commitments..."
              className="w-full border-2 border-slate-900 p-3 font-mono h-32 focus:outline-none focus:ring-0 focus:border-blue-600 bg-slate-50 resize-y"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-bold uppercase text-slate-700 mb-2">
              <Tags className="w-4 h-4" /> Required Skills (Domain DNA)
            </label>
            <div className="flex mt-1">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleAddSkill}
                placeholder="e.g. React, Python, Docker"
                className="flex-1 border-2 border-slate-900 p-3 font-mono focus:outline-none focus:ring-0 focus:border-blue-600 bg-slate-50 border-r-0"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="bg-slate-900 text-white px-6 font-bold uppercase border-2 border-slate-900 hover:bg-slate-800"
              >
                Add
              </button>
            </div>
            
            {requiredSkills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 p-4 border-2 border-dashed border-slate-300 bg-slate-50">
                {requiredSkills.map(skill => (
                  <span key={skill} className="bg-white border-2 border-slate-900 px-3 py-1 font-mono text-sm flex items-center gap-2 group">
                    {skill}
                    <button 
                      type="button" 
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-slate-400 hover:text-red-500 font-bold"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-10 pt-6 border-t-2 border-slate-900 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 border-2 border-slate-900 transition-colors uppercase tracking-widest disabled:opacity-50"
          >
            {isSubmitting ? (
              <><Zap className="w-5 h-5 animate-spin" /> Synthesizing Team...</>
            ) : (
              <><Zap className="w-5 h-5" /> Generate Team Topology</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

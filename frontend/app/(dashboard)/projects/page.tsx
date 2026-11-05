'use client';

import { useEffect, useState } from 'react';
import {
  FolderGit2, Plus, GitBranch, Shield, Trash2,
  ExternalLink, Zap, RefreshCw, AlertCircle, CheckCircle2
} from 'lucide-react';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function ProjectsPage() {
  const [repos, setRepos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [repoName, setRepoName] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [ecosystem, setEcosystem] = useState('npm');
  const [submitting, setSubmitting] = useState(false);

  const fetchRepos = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/repositories');
      setRepos(res.data);
    } catch {
      toast.error('Failed to load repositories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepos();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl) {
      toast.error('Please enter a valid repository URL');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/api/repositories', {
        name: repoName || 'custom-app',
        url: repoUrl,
        ecosystem
      });
      toast.success('Repository registered successfully!');
      setModalOpen(false);
      setRepoName('');
      setRepoUrl('');
      fetchRepos();
    } catch (err) {
      toast.error('Failed to create repository');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSeedDemo = async () => {
    setLoading(true);
    try {
      await api.post('/api/repositories/demo/seed');
      toast.success('Hackathon Demo Repository loaded!');
      fetchRepos();
    } catch {
      toast.error('Error seeding demo repository');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to remove this repository?')) return;
    try {
      await api.delete(`/api/repositories/${id}`);
      toast.success('Repository removed');
      setRepos(repos.filter(r => r.id !== id));
    } catch {
      toast.error('Failed to delete repository');
    }
  };

  const handleTriggerScan = async (id: number) => {
    toast.loading('Initiating deep security scan...', { id: 'scan-toast' });
    try {
      await api.post(`/api/scans/run/${id}`);
      toast.success('Scan completed successfully!', { id: 'scan-toast' });
      fetchRepos();
    } catch {
      toast.error('Scan encountered an issue', { id: 'scan-toast' });
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A3A48] pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan/10 border border-cyan/30 text-cyan text-xs font-semibold mb-1">
            <FolderGit2 size={13} />
            <span>Repository Workspace</span>
          </div>
          <h1 className="text-2xl font-bold text-[#F4F7FA]">My Monitored Projects</h1>
          <p className="text-xs text-[#9BA9B7]">
            Manage monitored source repositories, trigger on-demand scans, and inspect security health scores.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Zap size={14} className="text-emerald" />}
            onClick={handleSeedDemo}
          >
            Load Demo Project
          </Button>
          <Button
            size="sm"
            variant="primary"
            leftIcon={<Plus size={14} />}
            onClick={() => setModalOpen(true)}
          >
            Add Repository
          </Button>
        </div>
      </div>

      {/* Projects List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-44 bg-[#18232D] rounded-xl animate-pulse" />
          <div className="h-44 bg-[#18232D] rounded-xl animate-pulse" />
        </div>
      ) : repos.length === 0 ? (
        <Card className="p-12 text-center bg-[#18232D]/50 border-dashed border-[#2A3A48]">
          <FolderGit2 size={40} className="mx-auto text-[#6B7C8E] mb-3" />
          <h3 className="text-lg font-bold text-[#F4F7FA]">No repositories connected yet</h3>
          <p className="text-xs text-[#9BA9B7] max-w-md mx-auto mt-1 mb-6">
            Connect a GitHub repository, upload dependency manifests, or load our pre-configured Hackathon demo repository.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button size="sm" variant="primary" leftIcon={<Zap size={14} />} onClick={handleSeedDemo}>
              Load Hackathon Showcase
            </Button>
            <Button size="sm" variant="outline" leftIcon={<Plus size={14} />} onClick={() => setModalOpen(true)}>
              Add Custom Repo
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {repos.map((repo) => {
            const score = repo.risk_score || 100.0;
            const scoreColor = score >= 80 ? 'text-emerald' : score >= 50 ? 'text-orange-400' : 'text-red-400';
            return (
              <Card key={repo.id} className="p-5 hover:border-emerald/40 transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#202C37] border border-[#2A3A48] flex items-center justify-center flex-shrink-0">
                      <GitBranch size={20} className="text-emerald" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-[#F4F7FA] truncate">{repo.name}</h3>
                        {repo.is_demo && (
                          <span className="text-[10px] bg-emerald/10 text-emerald border border-emerald/30 px-1.5 py-0.2 rounded font-bold">
                            DEMO
                          </span>
                        )}
                      </div>
                      <a
                        href={repo.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[#9BA9B7] hover:text-cyan flex items-center gap-1 mt-0.5 truncate"
                      >
                        <span className="truncate">{repo.url}</span>
                        <ExternalLink size={10} className="flex-shrink-0" />
                      </a>
                    </div>
                  </div>

                  {/* Score badge */}
                  <div className="text-right flex-shrink-0">
                    <span className={`text-xl font-extrabold ${scoreColor}`}>{Math.round(score)}</span>
                    <span className="text-xs text-[#9BA9B7]">/100</span>
                    <p className="text-[10px] text-[#6B7C8E]">Security Score</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#2A3A48] flex items-center justify-between text-xs text-[#9BA9B7]">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" size="sm">{repo.ecosystem}</Badge>
                    <span>Branch: <strong className="text-[#F4F7FA]">{repo.default_branch}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTriggerScan(repo.id)}
                    >
                      Run Scan
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => window.location.href = `/scanner?repo=${repo.id}`}
                    >
                      Inspect
                    </Button>
                    <button
                      onClick={() => handleDelete(repo.id)}
                      className="p-1.5 text-[#6B7C8E] hover:text-red-400 rounded transition-colors"
                      title="Delete repository"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Repository Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Register Repository for Continuous Auditing">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Repository Name"
            placeholder="e.g. backend-api"
            value={repoName}
            onChange={(e) => setRepoName(e.target.value)}
          />
          <Input
            label="GitHub Repository URL"
            placeholder="https://github.com/org/repo"
            required
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
          />
          <div>
            <label className="block text-xs font-semibold text-[#9BA9B7] uppercase tracking-wider mb-1.5">
              Primary Package Ecosystem
            </label>
            <select
              value={ecosystem}
              onChange={(e) => setEcosystem(e.target.value)}
              className="w-full bg-[#18232D] border border-[#2A3A48] rounded-lg px-3 py-2 text-sm text-[#F4F7FA] focus:outline-none focus:border-emerald"
            >
              <option value="npm">npm (Node.js)</option>
              <option value="PyPI">PyPI (Python)</option>
              <option value="Maven">Maven (Java)</option>
              <option value="Cargo">crates.io (Rust)</option>
              <option value="Packagist">Packagist (PHP)</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={submitting}>
              Start Monitoring
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

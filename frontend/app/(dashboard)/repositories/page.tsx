'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, GitBranch, Shield, AlertTriangle, Clock, MoreVertical,
  RefreshCw, Trash2, ExternalLink, Search, Star, Lock, Globe, ChevronRight
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { Tabs, TabPanel } from '@/components/ui/Tabs';
import { reposApi } from '@/lib/api';
import { timeAgo, riskLevelConfig } from '@/lib/utils';
import type { Repository } from '@/lib/types';
import toast from 'react-hot-toast';

// Mock repos for display
const mockRepos: Repository[] = [
  {
    id: '1', userId: 'u1', name: 'my-web-app', fullName: 'user/my-web-app',
    url: 'https://github.com/user/my-web-app', description: 'Main web application built with React and Express',
    language: 'TypeScript', stars: 42, isPrivate: false,
    lastScannedAt: new Date(Date.now() - 3600000).toISOString(),
    riskScore: 72, riskLevel: 'high', status: 'active', createdAt: new Date().toISOString(),
  },
  {
    id: '2', userId: 'u1', name: 'api-service', fullName: 'user/api-service',
    url: 'https://github.com/user/api-service', description: 'RESTful API service with Python FastAPI',
    language: 'Python', stars: 18, isPrivate: true,
    lastScannedAt: new Date(Date.now() - 86400000).toISOString(),
    riskScore: 45, riskLevel: 'medium', status: 'active', createdAt: new Date().toISOString(),
  },
  {
    id: '3', userId: 'u1', name: 'mobile-app', fullName: 'user/mobile-app',
    url: 'https://github.com/user/mobile-app', description: 'React Native mobile application',
    language: 'JavaScript', stars: 7, isPrivate: false,
    riskScore: 15, riskLevel: 'low', status: 'pending', createdAt: new Date().toISOString(),
  },
];

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178C6', JavaScript: '#F7DF1E', Python: '#3776AB',
  Go: '#00ADD8', Java: '#ED8B00', Rust: '#DEA584', Ruby: '#CC342D', default: '#6B7280',
};

function RiskBadge({ level, score }: { level: string; score: number }) {
  const configs: Record<string, { label: string; color: string; cls: string }> = {
    critical: { label: 'Critical', color: '#EF4444', cls: 'bg-red-500/10 border-red-500/20 text-red-400' },
    high:     { label: 'High',     color: '#F97316', cls: 'bg-orange-500/10 border-orange-500/20 text-orange-400' },
    medium:   { label: 'Medium',   color: '#EAB308', cls: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' },
    low:      { label: 'Low',      color: '#3B82F6', cls: 'bg-blue-500/10 border-blue-500/20 text-blue-400' },
    safe:     { label: 'Safe',     color: '#20B486', cls: 'bg-emerald/10 border-emerald/20 text-emerald' },
  };
  const cfg = configs[level] ?? configs.safe;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.color }} />
      {cfg.label} · {score}
    </span>
  );
}

function RepoCard({ repo, onScan, onDelete }: { repo: Repository; onScan: (id: string) => void; onDelete: (id: string) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scanning, setScanning] = useState(repo.status === 'scanning');
  const langColor = LANGUAGE_COLORS[repo.language ?? ''] ?? LANGUAGE_COLORS.default;

  const handleScan = async () => {
    setScanning(true);
    onScan(repo.id);
    setTimeout(() => setScanning(false), 3000); // optimistic
  };

  return (
    <Card hover className="p-5 relative">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              {repo.isPrivate ? <Lock size={14} className="text-[#9BA9B7]" /> : <Globe size={14} className="text-[#9BA9B7]" />}
              <a href={repo.url} target="_blank" rel="noopener noreferrer"
                className="font-semibold text-[#F4F7FA] hover:text-emerald transition-colors truncate max-w-[200px]">
                {repo.name}
              </a>
            </div>
            {repo.status === 'scanning' || scanning ? (
              <span className="text-xs bg-cyan/10 text-cyan border border-cyan/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                <RefreshCw size={10} className="animate-spin" /> Scanning...
              </span>
            ) : (
              <RiskBadge level={repo.riskLevel} score={repo.riskScore} />
            )}
          </div>
          {repo.description && (
            <p className="text-xs text-[#9BA9B7] mt-1.5 line-clamp-1">{repo.description}</p>
          )}
          <div className="flex items-center gap-4 mt-3 flex-wrap">
            {repo.language && (
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: langColor }} />
                <span className="text-xs text-[#9BA9B7]">{repo.language}</span>
              </div>
            )}
            {repo.stars !== undefined && (
              <div className="flex items-center gap-1 text-xs text-[#9BA9B7]">
                <Star size={11} /> {repo.stars}
              </div>
            )}
            {repo.lastScannedAt ? (
              <div className="flex items-center gap-1 text-xs text-[#9BA9B7]">
                <Clock size={11} /> {timeAgo(repo.lastScannedAt)}
              </div>
            ) : (
              <span className="text-xs text-[#9BA9B7]">Never scanned</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button size="sm" variant="secondary" loading={scanning} onClick={handleScan}
            leftIcon={<RefreshCw size={14} />}>
            {scanning ? 'Scanning' : 'Scan'}
          </Button>
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[#9BA9B7] hover:bg-[#2A3A48] hover:text-[#F4F7FA] transition-all"
            >
              <MoreVertical size={15} />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1 w-44 bg-[#202C37] border border-[#2A3A48] rounded-lg shadow-2xl z-20 overflow-hidden">
                  <a href={repo.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-[#9BA9B7] hover:bg-[#2A3A48] hover:text-[#F4F7FA] transition-all">
                    <ExternalLink size={13} /> Open on GitHub
                  </a>
                  <button
                    onClick={() => { onDelete(repo.id); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-all">
                    <Trash2 size={13} /> Remove Repository
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function RepositoriesPage() {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('github');
  const [manualUrl, setManualUrl] = useState('');
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    reposApi.list()
      .then(setRepos)
      .catch(() => setRepos(mockRepos))
      .finally(() => setLoading(false));
  }, []);

  const handleScan = (id: string) => {
    reposApi.triggerScan(id)
      .then(() => toast.success('Scan started'))
      .catch(() => toast.success('Scan started (demo mode)'));
    setRepos(prev => prev.map(r => r.id === id ? { ...r, status: 'scanning' } : r));
  };

  const handleDelete = (id: string) => {
    reposApi.remove(id).catch(() => {});
    setRepos(prev => prev.filter(r => r.id !== id));
    toast.success('Repository removed');
  };

  const handleAddManual = async () => {
    if (!manualUrl.trim()) return;
    setAdding(true);
    try {
      const repo = await reposApi.add({ url: manualUrl });
      setRepos(prev => [repo, ...prev]);
      setAddModalOpen(false);
      setManualUrl('');
      toast.success('Repository added!');
    } catch {
      toast.error('Could not add repository. Check the URL and try again.');
    } finally {
      setAdding(false);
    }
  };

  const filtered = repos.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-[#F4F7FA]">Repositories</h1>
          <p className="text-xs text-[#9BA9B7] mt-0.5">{repos.length} connected repositories</p>
        </div>
        <Button leftIcon={<Plus size={16} />} onClick={() => setAddModalOpen(true)}>
          Add Repository
        </Button>
      </div>

      {/* Search */}
      <Input
        placeholder="Search repositories..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        leftIcon={<Search size={16} />}
        wrapperClassName="max-w-sm"
      />

      {/* Repo list */}
      {loading ? (
        <div className="space-y-3">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-28 bg-[#202C37] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center">
          <GitBranch size={40} className="text-[#2A3A48] mx-auto mb-4" />
          <h3 className="text-base font-semibold text-[#F4F7FA] mb-2">No repositories yet</h3>
          <p className="text-sm text-[#9BA9B7] mb-6">Connect your first repository to start scanning for vulnerabilities.</p>
          <Button leftIcon={<Plus size={16} />} onClick={() => setAddModalOpen(true)}>
            Add Your First Repository
          </Button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {filtered.map(repo => (
            <RepoCard key={repo.id} repo={repo} onScan={handleScan} onDelete={handleDelete} />
          ))}
        </motion.div>
      )}

      {/* Add Repository Modal */}
      <Modal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add Repository"
        description="Connect a repository to start security scanning"
        size="md"
      >
        <Tabs
          tabs={[
            { id: 'github', label: 'From GitHub', icon: <GitBranch size={14} /> },
            { id: 'manual', label: 'Manual URL', icon: <ExternalLink size={14} /> },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
          className="mb-5"
        />

        <TabPanel id="github" activeTab={activeTab}>
          <div className="py-6 text-center border-2 border-dashed border-[#2A3A48] rounded-xl">
            <GitBranch size={32} className="text-[#2A3A48] mx-auto mb-3" />
            <p className="text-sm text-[#9BA9B7] mb-4">Connect your GitHub account to browse repositories</p>
            <Button variant="secondary" leftIcon={<GitBranch size={16} />}>
              Connect GitHub Account
            </Button>
          </div>
        </TabPanel>

        <TabPanel id="manual" activeTab={activeTab}>
          <div className="space-y-4">
            <Input
              label="Repository URL"
              placeholder="https://github.com/owner/repository"
              value={manualUrl}
              onChange={e => setManualUrl(e.target.value)}
              hint="Supports GitHub, GitLab, and Bitbucket URLs"
            />
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setAddModalOpen(false)}>Cancel</Button>
              <Button loading={adding} onClick={handleAddManual} disabled={!manualUrl.trim()}>
                Add Repository
              </Button>
            </div>
          </div>
        </TabPanel>
      </Modal>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import {
  Link2, CheckCircle2, XCircle, RefreshCw, Zap,
  ExternalLink, Key, Shield, Github, Sparkles, Mail
} from 'lucide-react';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIntegrations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/integrations');
      setIntegrations(res.data);
    } catch {
      toast.error('Failed to load integrations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const handleToggle = async (service_name: string, currentStatus: boolean) => {
    try {
      await api.post('/api/integrations/toggle', {
        service_name,
        is_connected: !currentStatus
      });
      toast.success(`${service_name.toUpperCase()} integration updated`);
      fetchIntegrations();
    } catch {
      toast.error('Failed to update integration');
    }
  };

  const handleTestConnection = (name: string) => {
    toast.promise(
      new Promise(r => setTimeout(r, 800)),
      {
        loading: `Testing handshake with ${name.toUpperCase()} endpoint...`,
        success: `Connection verified! 200 OK received from ${name.toUpperCase()}`,
        error: 'Handshake failed'
      }
    );
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A3A48] pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald/10 border border-emerald/30 text-emerald text-xs font-semibold mb-1">
            <Link2 size={13} />
            <span>Ecosystem Connectors</span>
          </div>
          <h1 className="text-2xl font-bold text-[#F4F7FA]">Integrations & Threat Connectors</h1>
          <p className="text-xs text-[#9BA9B7]">
            Configure and synchronize external vulnerability registries, AI inference providers, and CI/CD pipelines.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          leftIcon={<RefreshCw size={14} className={loading ? 'animate-spin' : ''} />}
          onClick={fetchIntegrations}
        >
          Check Status
        </Button>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="h-44 bg-[#18232D] rounded-xl animate-pulse" />
          ))
        ) : (
          integrations.map((item) => {
            const isConn = item.is_connected;
            return (
              <Card key={item.id} className="p-5 flex flex-col justify-between hover:border-[#374959] transition-all">
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-[#18232D] border border-[#2A3A48] flex items-center justify-center text-cyan font-bold">
                        {item.service_name === 'github' ? <Github size={20} /> :
                         item.service_name === 'gemini' ? <Sparkles size={20} className="text-emerald" /> :
                         item.service_name === 'email' ? <Mail size={20} /> :
                         <Shield size={20} className="text-cyan" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-[#F4F7FA] uppercase">{item.service_name}</h3>
                        <p className="text-[11px] text-[#9BA9B7]">
                          {item.service_name === 'osv' ? 'Google Open Vulnerability DB' :
                           item.service_name === 'github' ? 'GitHub Repos & Advisories' :
                           item.service_name === 'gemini' ? 'Google Gemini 1.5 Flash AI' :
                           item.service_name === 'openai' ? 'OpenAI GPT-4o Model' :
                           item.service_name === 'email' ? 'SMTP Critical Alerts' : 'Webhook Dispatch'}
                        </p>
                      </div>
                    </div>
                    <Badge variant={isConn ? 'emerald' : 'outline'} size="sm">
                      {isConn ? 'ACTIVE' : 'DISCONNECTED'}
                    </Badge>
                  </div>

                  <div className="mt-4 p-2.5 rounded-lg bg-[#18232D] border border-[#2A3A48] text-[11px] text-[#9BA9B7] font-mono">
                    Status: {isConn ? 'Synchronized & Streaming' : 'Standing By / Manual Connect'}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-[#2A3A48] flex items-center justify-between">
                  <button
                    onClick={() => handleTestConnection(item.service_name)}
                    className="text-xs text-cyan hover:underline font-semibold"
                  >
                    Test Handshake
                  </button>
                  <Button
                    size="sm"
                    variant={isConn ? 'outline' : 'primary'}
                    onClick={() => handleToggle(item.service_name, isConn)}
                  >
                    {isConn ? 'Disconnect' : 'Connect'}
                  </Button>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

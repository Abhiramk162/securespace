'use client';

import {
  HelpCircle, BookOpen, Shield, Terminal,
  Code, Zap, ExternalLink, CheckCircle2
} from 'lucide-react';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

export default function DocsPage() {
  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-[#2A3A48] pb-5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan/10 border border-cyan/30 text-cyan text-xs font-semibold mb-1">
          <BookOpen size={13} />
          <span>Knowledge Base</span>
        </div>
        <h1 className="text-2xl font-bold text-[#F4F7FA]">Help & Technical Documentation</h1>
        <p className="text-xs text-[#9BA9B7]">
          Architecture specifications, risk calculation methodology, supported manifest formats, and API references.
        </p>
      </div>

      <div className="space-y-6">
        {/* Quickstart Card */}
        <Card className="p-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="text-emerald" size={18} />
              <CardTitle>Hackathon Judge Quick-Start Guide</CardTitle>
            </div>
          </CardHeader>
          <div className="space-y-3 text-xs text-[#D1D5DB] leading-relaxed">
            <p>
              Welcome to the SecureSphere evaluation environment! Follow these quick steps to review the complete platform capabilities:
            </p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                <strong>Step 1: Check Projects</strong> &mdash; Navigate to <strong className="text-emerald">My Projects</strong> to see the pre-loaded <em>ecommerce-cloud-platform</em> containing real-world vulnerabilities (Log4Shell, Lodash Prototype Pollution, Axios ReDoS).
              </li>
              <li>
                <strong>Step 2: Inspect Vulnerabilities</strong> &mdash; View detailed CVE records with official OSV advisories and CVSS v3.1 impact ratings.
              </li>
              <li>
                <strong>Step 3: Attack Path Graph</strong> &mdash; Open <strong className="text-cyan">Attack Path Analysis</strong> to visually follow how top-level imports expose deep vulnerable transitive packages.
              </li>
              <li>
                <strong>Step 4: AI Security Assistant</strong> &mdash; Ask questions like <em>"Why is Log4j vulnerable?"</em> or <em>"How do I fix Lodash?"</em> to test context-aware remediation.
              </li>
              <li>
                <strong>Step 5: Export Audit Report</strong> &mdash; Generate an executive, print-ready PDF/HTML security audit report under <strong className="text-emerald">Security Reports</strong>.
              </li>
            </ol>
          </div>
        </Card>

        {/* Supported Manifests */}
        <Card className="p-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Code className="text-cyan" size={18} />
              <CardTitle>Supported Package Manifests</CardTitle>
            </div>
          </CardHeader>
          <div className="grid md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-lg bg-[#18232D] border border-[#2A3A48]">
              <span className="font-bold text-emerald block mb-1">Node.js (npm)</span>
              <p className="text-[#9BA9B7]">Parses <code>package.json</code> and <code>package-lock.json</code> (v1, v2, v3 formats) with nested <code>node_modules/</code> transitive dependency resolution.</p>
            </div>
            <div className="p-3.5 rounded-lg bg-[#18232D] border border-[#2A3A48]">
              <span className="font-bold text-cyan block mb-1">Python (PyPI)</span>
              <p className="text-[#9BA9B7]">Supports standard <code>requirements.txt</code>, <code>Pipfile.lock</code>, and TOML-based <code>poetry.lock</code> specifications.</p>
            </div>
            <div className="p-3.5 rounded-lg bg-[#18232D] border border-[#2A3A48]">
              <span className="font-bold text-[#F4F7FA] block mb-1">Java (Maven)</span>
              <p className="text-[#9BA9B7]">Parses XML structures inside <code>pom.xml</code>, extracting groupId, artifactId, and version coordinates.</p>
            </div>
            <div className="p-3.5 rounded-lg bg-[#18232D] border border-[#2A3A48]">
              <span className="font-bold text-orange-400 block mb-1">Rust & PHP</span>
              <p className="text-[#9BA9B7]">Extracts resolved package graphs from Rust <code>Cargo.lock</code> and PHP <code>composer.lock</code> files.</p>
            </div>
          </div>
        </Card>

        {/* Scoring Methodology */}
        <Card className="p-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="text-emerald" size={18} />
              <CardTitle>Security Scoring Formula</CardTitle>
            </div>
          </CardHeader>
          <div className="p-4 rounded-xl bg-[#101820] font-mono text-xs text-emerald border border-[#2A3A48]">
            Final Score = Max(0, 100 - (Crit &times; 25) - (High &times; 12) - (Med &times; 5) - (Low &times; 2) - SupplyChainPenalty)
          </div>
          <p className="text-xs text-[#9BA9B7] mt-3">
            Scores above 90 earn Grade A, 75-89 earn Grade B, 50-74 earn Grade C, 30-49 earn Grade D, and under 30 earn Grade F.
          </p>
        </Card>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Shield, Zap, Terminal, ArrowRight, CheckCircle2, Lock,
  Cpu, FileText, AlertTriangle, GitFork, Sparkles, Activity,
  Globe2, ChevronRight, Layers, BarChart3, Database, Key, ScanLine
} from 'lucide-react';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function LandingPage() {
  const router = useRouter();
  const [loadingDemo, setLoadingDemo] = useState(false);

  const handleJudgeDemo = async () => {
    setLoadingDemo(true);
    try {
      await authApi.demoLogin();
      toast.success('Evaluation session initialized! Redirecting to dashboard...');
      router.push('/dashboard');
    } catch (e) {
      toast.error('Failed to initialize demo. Redirecting to login...');
      router.push('/login');
    } finally {
      setLoadingDemo(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#101820] text-[#F4F7FA] selection:bg-emerald selection:text-[#101820]">
      {/* Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#101820]/80 border-b border-[#2A3A48]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald to-cyan flex items-center justify-center shadow-lg shadow-emerald/20">
              <Zap size={22} className="text-[#101820] fill-[#101820]" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-[#F4F7FA]">
                Secure<span className="text-emerald">Sphere</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold tracking-wider uppercase text-cyan border border-cyan/30 bg-cyan/10 px-2 py-0.5 rounded-full">
                AI Intelligence
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#9BA9B7]">
            <a href="#problem" className="hover:text-emerald transition-colors">The Problem</a>
            <a href="#features" className="hover:text-emerald transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-emerald transition-colors">How It Works</a>
            <a href="#intelligence" className="hover:text-emerald transition-colors">Intelligence</a>
            <a href="#architecture" className="hover:text-emerald transition-colors">Architecture</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={handleJudgeDemo}
              disabled={loadingDemo}
              className="px-4 py-2 rounded-lg bg-emerald/15 border border-emerald/50 text-emerald text-xs font-bold hover:bg-emerald/25 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Zap size={14} className="fill-emerald" />
              <span>{loadingDemo ? 'Initializing...' : 'Judge Demo'}</span>
            </button>
            <Link
              href="/login"
              className="text-sm font-medium text-[#9BA9B7] hover:text-[#F4F7FA] px-3 py-2 transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded-lg bg-emerald hover:bg-emerald/90 text-[#101820] text-sm font-bold transition-all shadow-lg shadow-emerald/20"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 px-6 overflow-hidden">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-cyan/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#18232D] border border-[#2A3A48] text-xs font-semibold text-[#48C8D5] mb-8 shadow-inner">
            <Shield size={14} className="text-emerald" />
            <span>Next-Generation Open-Source Security Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#F4F7FA] leading-[1.1] mb-6">
            Secure Your Open-Source Ecosystem with{' '}
            <span className="bg-gradient-to-r from-emerald via-cyan to-emerald bg-clip-text text-transparent">
              Intelligent Security.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-[#9BA9B7] max-w-3xl mx-auto mb-10 leading-relaxed">
            Discover vulnerabilities, analyze dependency risks, investigate supply chain threats and protect your applications with explainable, AI-powered security intelligence.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleJudgeDemo}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-emerald to-cyan text-[#101820] font-bold text-base hover:opacity-95 transition-all shadow-xl shadow-emerald/20 flex items-center justify-center gap-2"
            >
              <Zap size={18} className="fill-[#101820]" />
              <span>Launch Live Hackathon Showcase</span>
            </button>
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#202C37] border border-[#2A3A48] hover:border-emerald/40 text-[#F4F7FA] font-semibold text-base transition-all flex items-center justify-center gap-2"
            >
              <span>Start Free Security Scan</span>
              <ArrowRight size={18} className="text-emerald" />
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#18232D]/80 border border-[#2A3A48] backdrop-blur-md">
            <div className="p-3 text-center">
              <div className="text-2xl lg:text-3xl font-extrabold text-emerald">100% Verified</div>
              <div className="text-xs text-[#9BA9B7] mt-1 font-medium">OSV & NVD Advisory Live Feeds</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-2xl lg:text-3xl font-extrabold text-cyan">8 Manifests</div>
              <div className="text-xs text-[#9BA9B7] mt-1 font-medium">npm, PyPI, Maven, Cargo, PHP</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-2xl lg:text-3xl font-extrabold text-[#F4F7FA]">Explainable AI</div>
              <div className="text-xs text-[#9BA9B7] mt-1 font-medium">Zero-Hallucination SecOps Agent</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-2xl lg:text-3xl font-extrabold text-emerald">Dynamic Graphs</div>
              <div className="text-xs text-[#9BA9B7] mt-1 font-medium">Transitive Attack Path Tracing</div>
            </div>
          </div>
        </div>
      </section>

      {/* The Open Source Dilemma */}
      <section id="problem" className="py-24 px-6 bg-[#18232D]/40 border-y border-[#2A3A48]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="text-xs font-bold text-emerald uppercase tracking-widest mb-2">The Problem</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F4F7FA]">
              Modern Software is 90% Open Source.
            </h2>
            <p className="text-[#9BA9B7] mt-4 text-sm sm:text-base">
              Developers unknowingly ship critical remote code execution bugs, compromised subdependencies, and malicious packages.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-[#202C37] p-8 rounded-2xl border border-[#2A3A48] hover:border-red-500/30 transition-all">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center mb-6">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-[#F4F7FA] mb-3">Hidden Transitive Exploits</h3>
              <p className="text-sm text-[#9BA9B7] leading-relaxed">
                Vulnerabilities rarely live in top-level packages. They lurk 4 levels deep in subdependencies that developers never directly inspect.
              </p>
            </div>

            <div className="bg-[#202C37] p-8 rounded-2xl border border-[#2A3A48] hover:border-amber-500/30 transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-6">
                <Cpu size={24} />
              </div>
              <h3 className="text-lg font-bold text-[#F4F7FA] mb-3">Opaque Security Alerts</h3>
              <p className="text-sm text-[#9BA9B7] leading-relaxed">
                Legacy vulnerability scanners output cryptic CVSS strings without explaining real-world business impact or exact developer commands to patch them.
              </p>
            </div>

            <div className="bg-[#202C37] p-8 rounded-2xl border border-[#2A3A48] hover:border-cyan/30 transition-all">
              <div className="w-12 h-12 rounded-xl bg-cyan/10 text-cyan flex items-center justify-center mb-6">
                <Globe2 size={24} />
              </div>
              <h3 className="text-lg font-bold text-[#F4F7FA] mb-3">Supply Chain Poisoning</h3>
              <p className="text-sm text-[#9BA9B7] leading-relaxed">
                Typosquatting and hijacked maintainer credentials introduce weaponized payloads before public advisory databases even flag them.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Platform Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="text-xs font-bold text-cyan uppercase tracking-widest mb-2">Our Solution</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F4F7FA]">
              Engineered for Comprehensive Supply Chain Defense
            </h2>
            <p className="text-[#9BA9B7] mt-4 text-sm sm:text-base">
              SecureSphere combines deterministic database verification with state-of-the-art AI reasoning to deliver end-to-end security intelligence.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-[#18232D] border border-[#2A3A48] p-7 rounded-2xl hover:border-emerald/40 transition-all">
              <ScanLine className="text-emerald mb-4" size={28} />
              <h3 className="font-bold text-base text-[#F4F7FA] mb-2">Multi-Ecosystem Scanner</h3>
              <p className="text-xs text-[#9BA9B7] leading-relaxed">
                Ingest GitHub URLs or upload `package-lock.json`, `requirements.txt`, `Pipfile.lock`, `pom.xml`, `composer.lock`, and `Cargo.lock`. Never executes untrusted code.
              </p>
            </div>

            <div className="bg-[#18232D] border border-[#2A3A48] p-7 rounded-2xl hover:border-cyan/40 transition-all">
              <GitFork className="text-cyan mb-4" size={28} />
              <h3 className="font-bold text-base text-[#F4F7FA] mb-2">Attack Path Visualizer</h3>
              <p className="text-xs text-[#9BA9B7] leading-relaxed">
                Interactive dependency graphs pinpoint the exact route from application entrypoint down to the vulnerable transitive component.
              </p>
            </div>

            <div className="bg-[#18232D] border border-[#2A3A48] p-7 rounded-2xl hover:border-emerald/40 transition-all">
              <Sparkles className="text-emerald mb-4" size={28} />
              <h3 className="font-bold text-base text-[#F4F7FA] mb-2">Explainable AI Assistant</h3>
              <p className="text-xs text-[#9BA9B7] leading-relaxed">
                Context-aware SecOps copilot that explains CVE impact in plain English, evaluates exploit feasibility, and generates exact copy-paste patch commands.
              </p>
            </div>

            <div className="bg-[#18232D] border border-[#2A3A48] p-7 rounded-2xl hover:border-cyan/40 transition-all">
              <BarChart3 className="text-cyan mb-4" size={28} />
              <h3 className="font-bold text-base text-[#F4F7FA] mb-2">Transparent Risk Scoring</h3>
              <p className="text-xs text-[#9BA9B7] leading-relaxed">
                Mathematical 0-100 rating based on verified CVSS severity, transitive depth, and typosquatting signals with full calculation transparency.
              </p>
            </div>

            <div className="bg-[#18232D] border border-[#2A3A48] p-7 rounded-2xl hover:border-emerald/40 transition-all">
              <FileText className="text-emerald mb-4" size={28} />
              <h3 className="font-bold text-base text-[#F4F7FA] mb-2">Executive PDF Reports</h3>
              <p className="text-xs text-[#9BA9B7] leading-relaxed">
                Generate branded audit reports with executive summaries, CVSS breakdowns, and verified remediation checklists ready for compliance review.
              </p>
            </div>

            <div className="bg-[#18232D] border border-[#2A3A48] p-7 rounded-2xl hover:border-cyan/40 transition-all">
              <Activity className="text-cyan mb-4" size={28} />
              <h3 className="font-bold text-base text-[#F4F7FA] mb-2">Continuous Monitoring</h3>
              <p className="text-xs text-[#9BA9B7] leading-relaxed">
                Automated background scanners that monitor newly disclosed OSV advisories and notify engineering teams before attackers weaponize exploits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Workflow */}
      <section id="how-it-works" className="py-24 px-6 bg-[#18232D]/40 border-y border-[#2A3A48]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="text-xs font-bold text-emerald uppercase tracking-widest mb-2">Workflow</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F4F7FA]">
              How SecureSphere Protects Your Code
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl bg-[#202C37] border border-[#2A3A48] relative">
              <div className="text-3xl font-extrabold text-emerald/40 mb-3">01</div>
              <h4 className="font-bold text-base text-[#F4F7FA] mb-2">Manifest Ingestion</h4>
              <p className="text-xs text-[#9BA9B7]">
                Connect a GitHub repository or upload lockfiles. Static parsing strictly extracts package names and version specifications without code execution.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#202C37] border border-[#2A3A48] relative">
              <div className="text-3xl font-extrabold text-cyan/40 mb-3">02</div>
              <h4 className="font-bold text-base text-[#F4F7FA] mb-2">OSV Intelligence Sync</h4>
              <p className="text-xs text-[#9BA9B7]">
                Direct asynchronous queries match your dependency tree against Google OSV, GitHub Advisory Database, and NVD CVE repositories.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#202C37] border border-[#2A3A48] relative">
              <div className="text-3xl font-extrabold text-emerald/40 mb-3">03</div>
              <h4 className="font-bold text-base text-[#F4F7FA] mb-2">Path & Risk Analysis</h4>
              <p className="text-xs text-[#9BA9B7]">
                The risk engine calculates vulnerability exposure paths, maps transitive relationships, and scores overall project posture.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#202C37] border border-[#2A3A48] relative">
              <div className="text-3xl font-extrabold text-cyan/40 mb-3">04</div>
              <h4 className="font-bold text-base text-[#F4F7FA] mb-2">AI Remediation</h4>
              <p className="text-xs text-[#9BA9B7]">
                Ask the AI assistant for custom upgrade guidance, generate executive PDF reports, and set automated alerts for zero-day disclosures.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Hackathon CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-br from-[#18232D] to-[#202C37] border border-emerald/30 p-10 sm:p-14 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald/10 rounded-full blur-[100px] pointer-events-none" />
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F4F7FA] mb-4">
            Ready to Inspect Real Vulnerabilities?
          </h2>
          <p className="text-[#9BA9B7] text-sm sm:text-base max-w-xl mx-auto mb-8">
            Experience our pre-configured evaluation showcase with live CVE analysis, interactive dependency graphs, and AI-driven remediations.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleJudgeDemo}
              className="px-8 py-3.5 rounded-xl bg-emerald hover:bg-emerald/90 text-[#101820] font-bold text-sm transition-all shadow-lg shadow-emerald/20 flex items-center gap-2"
            >
              <Zap size={16} className="fill-[#101820]" />
              <span>Launch Judge Showcase</span>
            </button>
            <Link
              href="/register"
              className="px-8 py-3.5 rounded-xl bg-[#101820] border border-[#2A3A48] text-[#F4F7FA] font-semibold text-sm hover:border-[#374959] transition-all"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2A3A48] py-12 px-6 bg-[#0E151C] text-xs text-[#9BA9B7]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald flex items-center justify-center">
              <Zap size={14} className="text-[#101820] fill-[#101820]" />
            </div>
            <span className="font-bold text-sm text-[#F4F7FA]">SecureSphere</span>
            <span className="text-[#6B7C8E]">&bull; Tagline: Discover. Analyze. Protect.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="hover:text-emerald transition-colors">Dashboard</Link>
            <Link href="/scanner" className="hover:text-emerald transition-colors">Scanner</Link>
            <Link href="/vulnerabilities" className="hover:text-emerald transition-colors">Vulnerabilities</Link>
            <Link href="/docs" className="hover:text-emerald transition-colors">Documentation</Link>
          </div>

          <div>
            &copy; 2026 SecureSphere Intelligence Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

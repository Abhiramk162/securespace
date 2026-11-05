'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Mail, Lock, User, Zap, ArrowRight, Github, Shield, Package, Bot, CheckCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { authApi } from '@/lib/api';
import { checkPasswordStrength } from '@/lib/auth';
import toast from 'react-hot-toast';

const schema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters').regex(/^[a-zA-Z0-9_-]+$/, 'Only letters, numbers, hyphens and underscores'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  terms: z.boolean().refine(v => v, 'You must accept the terms'),
}).refine(d => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

type FormData = z.infer<typeof schema>;

const FEATURES = [
  { icon: <Shield size={16} className="text-emerald" />, text: 'AI-powered vulnerability analysis' },
  { icon: <Package size={16} className="text-cyan" />, text: 'Dependency intelligence & monitoring' },
  { icon: <Bot size={16} className="text-emerald" />, text: 'Natural language security assistant' },
  { icon: <CheckCircle size={16} className="text-cyan" />, text: 'Free for open-source projects' },
];

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const strength = checkPasswordStrength(password);
  const { register, handleSubmit, formState: { errors }, watch } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await authApi.register({ fullName: data.fullName, username: data.username, email: data.email, password: data.password });
      toast.success('Account created! Welcome to SecureSphere.');
      router.push('/onboarding');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#101820] bg-grid flex">
      {/* Left panel — features */}
      <div className="hidden lg:flex flex-col justify-center p-16 w-[42%] flex-shrink-0 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald/5 to-cyan/5" />
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 mb-12">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald to-cyan flex items-center justify-center">
              <Zap size={18} className="text-white" />
            </div>
            <span className="font-bold text-[#F4F7FA] text-lg">SecureSphere</span>
          </Link>
          <h2 className="text-3xl font-bold text-[#F4F7FA] mb-4 leading-tight">
            Protect your code from<br />
            <span className="text-gradient-emerald">day one.</span>
          </h2>
          <p className="text-[#9BA9B7] mb-10 leading-relaxed">
            Join thousands of developers who trust SecureSphere to keep their open-source dependencies safe and secure.
          </p>
          <div className="space-y-4">
            {FEATURES.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#202C37] border border-[#2A3A48] flex items-center justify-center flex-shrink-0">
                  {f.icon}
                </div>
                <span className="text-sm text-[#F4F7FA]">{f.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="bg-[#202C37] border border-[#2A3A48] rounded-2xl p-8 shadow-2xl">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-[#F4F7FA] mb-1">Create your account</h1>
              <p className="text-sm text-[#9BA9B7]">Start your free security analysis today</p>
            </div>

            {/* GitHub OAuth */}
            <button onClick={() => authApi.githubOAuth()}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 mb-5 bg-[#18232D] border border-[#2A3A48] rounded-lg text-sm text-[#F4F7FA] hover:border-emerald/50 hover:bg-[#1E2D3A] transition-all">
              <Github size={18} />
              Sign up with GitHub
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-[#2A3A48]" />
              <span className="text-xs text-[#9BA9B7]">or with email</span>
              <div className="flex-1 h-px bg-[#2A3A48]" />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input label="Full Name" placeholder="Jane Smith" leftIcon={<User size={14} />}
                  error={errors.fullName?.message} {...register('fullName')} />
                <Input label="Username" placeholder="janesmith" leftIcon={<span className="text-xs text-[#9BA9B7]">@</span>}
                  error={errors.username?.message} {...register('username')} />
              </div>
              <Input label="Email" type="email" placeholder="jane@example.com" leftIcon={<Mail size={14} />}
                error={errors.email?.message} {...register('email')} />
              <div>
                <Input label="Password" type="password" placeholder="Create a strong password" leftIcon={<Lock size={14} />}
                  error={errors.password?.message}
                  {...register('password', { onChange: e => setPassword(e.target.value) })} />
                {/* Strength bar */}
                {password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[0,1,2,3,4].map(i => (
                        <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
                          style={{ background: i <= strength.score ? strength.color : '#2A3A48' }} />
                      ))}
                    </div>
                    <p className="text-xs" style={{ color: strength.color }}>{strength.label}</p>
                  </div>
                )}
              </div>
              <Input label="Confirm Password" type="password" placeholder="Repeat your password" leftIcon={<Lock size={14} />}
                error={errors.confirmPassword?.message} {...register('confirmPassword')} />
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" {...register('terms')} className="w-4 h-4 mt-0.5 rounded border-[#2A3A48] bg-[#18232D] accent-emerald" />
                <span className="text-xs text-[#9BA9B7]">
                  I agree to the <Link href="#" className="text-emerald hover:underline">Terms of Service</Link> and{' '}
                  <Link href="#" className="text-emerald hover:underline">Privacy Policy</Link>
                </span>
              </label>
              {errors.terms && <p className="text-xs text-red-400">{errors.terms.message}</p>}
              <Button type="submit" loading={loading} className="w-full mt-2" rightIcon={<ArrowRight size={16} />}>
                Create Account
              </Button>
            </form>

            <p className="text-center text-sm text-[#9BA9B7] mt-5">
              Already have an account?{' '}
              <Link href="/login" className="text-emerald hover:underline font-medium">Sign in</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

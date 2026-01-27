'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { COLORS } from '@/lib/design-tokens';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookOpen, Mail, Lock, Eye, EyeOff, Loader2, User } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });
        if (error) throw error;
      }
      
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4">
      {/* TOKENS: COLORS.primary, COLORS.danger, COLORS.neutral */}
      <div className="w-full max-w-md">
        <div className="bg-gray-900/80 backdrop-blur rounded-lg p-8 shadow-2xl border border-gray-800">
          <div className="text-center mb-8">
            <div className={cn("inline-flex items-center justify-center w-16 h-16 rounded-full mb-4", `bg-blue-600/20`)}>
              <BookOpen className={cn("w-8 h-8", `text-blue-400`)} />
            </div>
            <h1 className="text-2xl font-bold mb-2">Bible Graph</h1>
            <p className="text-gray-400 text-sm">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </p>
          </div>

          <div className="flex gap-2 mb-6 bg-gray-800/50 rounded-lg p-1">
            <button
              onClick={() => {
                setMode('login');
                setFullName('');
                setError('');
              }}
              className={mode === 'login' ? 'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors bg-blue-600 text-white' : 'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors text-gray-400 hover:text-white'}
            >
              Login
            </button>
            <button
              onClick={() => {
                setMode('signup');
                setFullName('');
                setError('');
              }}
              className={mode === 'signup' ? 'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors bg-blue-600 text-white' : 'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors text-gray-400 hover:text-white'}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-2">
                <label htmlFor="fullName" className="text-sm font-medium text-gray-300">
                  Nome Completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Seu nome completo"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    disabled={loading}
                    className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-300">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-300">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="pl-10 pr-10 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-md p-3">
                <p className={cn("text-sm", COLORS.danger.text)}>{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className={cn("w-full text-white font-medium py-2.5", COLORS.primary.default, `hover:${COLORS.primary.dark}`)}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {mode === 'login' ? 'Logging in...' : 'Creating account...'}
                </>
              ) : (
                mode === 'login' ? 'Log In' : 'Create Account'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            {mode === 'login' ? (
              <p>
                Don&apos;t have an account?{' '}
                <button
                  onClick={() => {
                    setMode('signup');
                    setFullName('');
                    setError('');
                  }}
                  className="text-blue-400 hover:text-blue-300 font-medium"
                >
                  Sign up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  onClick={() => {
                    setMode('login');
                    setFullName('');
                    setError('');
                  }}
                  className="text-blue-400 hover:text-blue-300 font-medium"
                >
                  Log in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

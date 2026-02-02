'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { PARCHMENT, TYPOGRAPHY, SHADOW_WARM, BORDER_RADIUS } from '@/lib/design-tokens';
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
      setError(err instanceof Error ? err.message : 'Ocorreu um erro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("min-h-screen flex items-center justify-center p-4", PARCHMENT.bg.page)}>
      <div className="w-full max-w-md">
        <div className={cn(
          "p-8 border",
          PARCHMENT.bg.card,
          PARCHMENT.border.default,
          BORDER_RADIUS.xl,
          SHADOW_WARM.lg
        )}>
          {/* Header */}
          <div className="text-center mb-8">
            <div className={cn(
              "inline-flex items-center justify-center w-16 h-16 rounded-full mb-4",
              PARCHMENT.accent.light
            )}>
              <BookOpen className={cn("w-8 h-8", PARCHMENT.accent.textDark)} />
            </div>
            <h1 className={cn(
              TYPOGRAPHY.sizes['2xl'],
              TYPOGRAPHY.weights.bold,
              TYPOGRAPHY.families.serif,
              PARCHMENT.text.heading,
              "mb-1"
            )}>
              Bible Study
            </h1>
            <p className={cn(TYPOGRAPHY.sizes.sm, PARCHMENT.text.secondary)}>
              {mode === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}
            </p>
          </div>

          {/* Mode Toggle */}
          <div className={cn(
            "flex gap-1 mb-6 p-1 border",
            PARCHMENT.bg.sidebar,
            PARCHMENT.border.default,
            BORDER_RADIUS.lg
          )}>
            <button
              onClick={() => { setMode('login'); setFullName(''); setError(''); }}
              className={cn(
                "flex-1 py-2 px-4 text-sm font-medium transition-all",
                BORDER_RADIUS.md,
                mode === 'login'
                  ? cn(PARCHMENT.accent.default, "text-white")
                  : cn("text-stone hover:text-espresso")
              )}
            >
              Entrar
            </button>
            <button
              onClick={() => { setMode('signup'); setFullName(''); setError(''); }}
              className={cn(
                "flex-1 py-2 px-4 text-sm font-medium transition-all",
                BORDER_RADIUS.md,
                mode === 'signup'
                  ? cn(PARCHMENT.accent.default, "text-white")
                  : cn("text-stone hover:text-espresso")
              )}
            >
              Cadastrar
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name (signup only) */}
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label htmlFor="fullName" className={cn(
                  TYPOGRAPHY.sizes.sm,
                  TYPOGRAPHY.weights.medium,
                  PARCHMENT.text.subheading
                )}>
                  Nome Completo
                </label>
                <div className="relative">
                  <User className={cn("absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4", PARCHMENT.text.muted)} />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Seu nome completo"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    disabled={loading}
                    className={cn(
                      "pl-10 border",
                      PARCHMENT.bg.input,
                      PARCHMENT.border.default,
                      PARCHMENT.text.primary,
                      "placeholder:text-sand",
                      "focus:border-amber focus:ring-1 focus:ring-amber/30"
                    )}
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className={cn(
                TYPOGRAPHY.sizes.sm,
                TYPOGRAPHY.weights.medium,
                PARCHMENT.text.subheading
              )}>
                Email
              </label>
              <div className="relative">
                <Mail className={cn("absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4", PARCHMENT.text.muted)} />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className={cn(
                    "pl-10 border",
                    PARCHMENT.bg.input,
                    PARCHMENT.border.default,
                    PARCHMENT.text.primary,
                    "placeholder:text-sand",
                    "focus:border-amber focus:ring-1 focus:ring-amber/30"
                  )}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className={cn(
                TYPOGRAPHY.sizes.sm,
                TYPOGRAPHY.weights.medium,
                PARCHMENT.text.subheading
              )}>
                Senha
              </label>
              <div className="relative">
                <Lock className={cn("absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4", PARCHMENT.text.muted)} />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className={cn(
                    "pl-10 pr-10 border",
                    PARCHMENT.bg.input,
                    PARCHMENT.border.default,
                    PARCHMENT.text.primary,
                    "placeholder:text-sand",
                    "focus:border-amber focus:ring-1 focus:ring-amber/30"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={cn(
                    "absolute right-3 top-1/2 -translate-y-1/2 transition-colors",
                    PARCHMENT.text.muted,
                    "hover:text-walnut"
                  )}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className={cn(
                "p-3 border rounded-md",
                "bg-red-50 border-red-200"
              )}>
                <p className={cn(TYPOGRAPHY.sizes.sm, "text-red-700")}>{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full font-medium py-2.5 text-white transition-all",
                PARCHMENT.accent.default,
                "hover:bg-amber-dark",
                SHADOW_WARM.sm
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {mode === 'login' ? 'Entrando...' : 'Criando conta...'}
                </>
              ) : (
                mode === 'login' ? 'Entrar' : 'Criar Conta'
              )}
            </Button>
          </form>

          {/* Footer Link */}
          <div className={cn("mt-6 text-center", TYPOGRAPHY.sizes.sm, PARCHMENT.text.secondary)}>
            {mode === 'login' ? (
              <p>
                Não tem uma conta?{' '}
                <button
                  onClick={() => { setMode('signup'); setFullName(''); setError(''); }}
                  className={cn(
                    TYPOGRAPHY.weights.medium,
                    PARCHMENT.accent.text,
                    "hover:text-amber-dark transition-colors"
                  )}
                >
                  Cadastre-se
                </button>
              </p>
            ) : (
              <p>
                Já tem uma conta?{' '}
                <button
                  onClick={() => { setMode('login'); setFullName(''); setError(''); }}
                  className={cn(
                    TYPOGRAPHY.weights.medium,
                    PARCHMENT.accent.text,
                    "hover:text-amber-dark transition-colors"
                  )}
                >
                  Entrar
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Subtle branding */}
        <p className={cn(
          "text-center mt-4",
          TYPOGRAPHY.sizes.xs,
          PARCHMENT.text.muted
        )}>
          Seu segundo cérebro bíblico
        </p>
      </div>
    </div>
  );
}

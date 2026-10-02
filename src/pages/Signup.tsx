import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Sprout, Mail, Lock, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { registerWithEmail, loginWithGoogle } from '@/services/firebase/auth';
import { isFirebaseConfigured } from '@/services/firebase/config';

interface FormData {
  name: string;
  email: string;
  password: string;
}

export default function Signup() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm<FormData>();

  async function onSubmit(data: FormData) {
    setError('');
    setLoading(true);
    try {
      if (!isFirebaseConfigured) {
        navigate('/app/dashboard');
        return;
      }
      await registerWithEmail(data.name, data.email, data.password);
      navigate('/app/dashboard');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create account');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    try {
      if (!isFirebaseConfigured) {
        navigate('/app/dashboard');
        return;
      }
      await loginWithGoogle();
      navigate('/app/dashboard');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream-100 dark:bg-canopy-950 leaf-vein-bg px-4 py-10">
      <Card strong className="w-full max-w-sm">
        <Link to="/" className="mb-6 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-canopy-700 text-cream-50">
            <Sprout size={18} />
          </div>
          <span className="font-display text-xl font-semibold text-canopy-900 dark:text-cream-100">AGRIYA</span>
        </Link>
        <h1 className="font-display text-2xl font-semibold text-canopy-950 dark:text-cream-50">Create your account</h1>
        <p className="mt-1 text-sm text-canopy-700/70 dark:text-cream-200/60">Free for every farmer, always.</p>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-3">
          <label className="flex items-center gap-2 rounded-xl border border-canopy-200 dark:border-canopy-700 bg-cream-50/60 dark:bg-canopy-900/40 px-3 py-2.5">
            <User size={16} className="text-canopy-500" />
            <input
              placeholder="Full name"
              className="w-full bg-transparent text-sm outline-none placeholder:text-canopy-400"
              {...register('name', { required: true })}
            />
          </label>
          <label className="flex items-center gap-2 rounded-xl border border-canopy-200 dark:border-canopy-700 bg-cream-50/60 dark:bg-canopy-900/40 px-3 py-2.5">
            <Mail size={16} className="text-canopy-500" />
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full bg-transparent text-sm outline-none placeholder:text-canopy-400"
              {...register('email', { required: true })}
            />
          </label>
          <label className="flex items-center gap-2 rounded-xl border border-canopy-200 dark:border-canopy-700 bg-cream-50/60 dark:bg-canopy-900/40 px-3 py-2.5">
            <Lock size={16} className="text-canopy-500" />
            <input
              type="password"
              placeholder="Password (min. 6 characters)"
              className="w-full bg-transparent text-sm outline-none placeholder:text-canopy-400"
              {...register('password', { required: true, minLength: 6 })}
            />
          </label>
          <Button type="submit" className="w-full" loading={loading}>Create account</Button>
        </form>

        <div className="my-4 flex items-center gap-3 text-xs text-canopy-500">
          <div className="h-px flex-1 bg-canopy-200 dark:bg-canopy-700" /> or <div className="h-px flex-1 bg-canopy-200 dark:bg-canopy-700" />
        </div>
        <Button variant="outline" className="w-full" onClick={handleGoogle} loading={loading}>
          Continue with Google
        </Button>

        <p className="mt-5 text-center text-sm text-canopy-700/70 dark:text-cream-200/60">
          Already have an account? <Link to="/login" className="font-medium text-canopy-700 dark:text-canopy-200 underline">Log in</Link>
        </p>
      </Card>
    </div>
  );
}

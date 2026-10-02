import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Sprout, Mail, Lock, Phone } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { loginWithEmail, loginWithGoogle, setupRecaptcha, sendOtp, confirmOtp } from '@/services/firebase/auth';
import { isFirebaseConfigured } from '@/services/firebase/config';
import type { ConfirmationResult } from 'firebase/auth';

type Mode = 'email' | 'phone';
type FormData = { email: string; password: string };

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('email');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm<FormData>();

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);

  async function onSubmit(data: FormData) {
    setError('');
    setLoading(true);
    try {
      if (!isFirebaseConfigured) {
        navigate('/app/dashboard');
        return;
      }
      await loginWithEmail(data.email, data.password);
      navigate('/app/dashboard');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not sign in');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError('');
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

  async function handleSendOtp() {
    setError('');
    setLoading(true);
    try {
      const verifier = setupRecaptcha();
      const result = await sendOtp(phone, verifier);
      setConfirmation(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send OTP');
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmOtp() {
    if (!confirmation) return;
    setLoading(true);
    try {
      await confirmOtp(confirmation, otp);
      navigate('/app/dashboard');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream-100 dark:bg-canopy-950 leaf-vein-bg px-4">
      <Card strong className="w-full max-w-sm">
        <Link to="/" className="mb-6 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-canopy-700 text-cream-50">
            <Sprout size={18} />
          </div>
          <span className="font-display text-xl font-semibold text-canopy-900 dark:text-cream-100">AGRIYA</span>
        </Link>
        <h1 className="font-display text-2xl font-semibold text-canopy-950 dark:text-cream-50">Welcome back</h1>
        <p className="mt-1 text-sm text-canopy-700/70 dark:text-cream-200/60">Log in to continue your farming journey.</p>

        <div className="mt-5 flex rounded-full bg-cream-50/70 dark:bg-canopy-800/60 p-1 text-sm">
          <button
            className={`flex-1 rounded-full py-1.5 font-medium transition-colors ${mode === 'email' ? 'bg-canopy-700 text-cream-50' : 'text-canopy-700 dark:text-cream-200'}`}
            onClick={() => setMode('email')}
          >
            Email
          </button>
          <button
            className={`flex-1 rounded-full py-1.5 font-medium transition-colors ${mode === 'phone' ? 'bg-canopy-700 text-cream-50' : 'text-canopy-700 dark:text-cream-200'}`}
            onClick={() => setMode('phone')}
          >
            Phone OTP
          </button>
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        {mode === 'email' ? (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-3">
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
                placeholder="Password"
                className="w-full bg-transparent text-sm outline-none placeholder:text-canopy-400"
                {...register('password', { required: true })}
              />
            </label>
            <Button type="submit" className="w-full" loading={loading}>Log in</Button>
          </form>
        ) : (
          <div className="mt-5 space-y-3">
            <label className="flex items-center gap-2 rounded-xl border border-canopy-200 dark:border-canopy-700 bg-cream-50/60 dark:bg-canopy-900/40 px-3 py-2.5">
              <Phone size={16} className="text-canopy-500" />
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-transparent text-sm outline-none placeholder:text-canopy-400"
              />
            </label>
            {!confirmation ? (
              <Button className="w-full" onClick={handleSendOtp} loading={loading}>Send OTP</Button>
            ) : (
              <>
                <input
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full rounded-xl border border-canopy-200 dark:border-canopy-700 bg-cream-50/60 dark:bg-canopy-900/40 px-3 py-2.5 text-sm outline-none"
                />
                <Button className="w-full" onClick={handleConfirmOtp} loading={loading}>Verify & log in</Button>
              </>
            )}
            <div id="recaptcha-container" />
          </div>
        )}

        <div className="my-4 flex items-center gap-3 text-xs text-canopy-500">
          <div className="h-px flex-1 bg-canopy-200 dark:bg-canopy-700" /> or <div className="h-px flex-1 bg-canopy-200 dark:bg-canopy-700" />
        </div>
        <Button variant="outline" className="w-full" onClick={handleGoogle} loading={loading}>
          Continue with Google
        </Button>

        <p className="mt-5 text-center text-sm text-canopy-700/70 dark:text-cream-200/60">
          New to AGRIYA? <Link to="/signup" className="font-medium text-canopy-700 dark:text-canopy-200 underline">Create an account</Link>
        </p>
      </Card>
    </div>
  );
}

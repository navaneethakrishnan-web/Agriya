import { useEffect, useState } from 'react';
import { LogOut, Moon, Type, Save } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { updateUserProfile, logout } from '@/services/firebase/auth';
import { useNavigate } from 'react-router-dom';
import { initials } from '@/lib/utils';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी (Hindi)' },
  { code: 'ta', label: 'தமிழ் (Tamil)' },
  { code: 'te', label: 'తెలుగు (Telugu)' },
  { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
  { code: 'ml', label: 'മലയാളം (Malayalam)' },
];

export default function Profile() {
  const { profile, firebaseUser, refreshProfile } = useAuth();
  const { dark, toggleDark, largeText, toggleLargeText } = useTheme();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', village: '', district: '', state: '', preferredLanguage: 'en', crops: '', farmSize: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name ?? '',
        village: profile.village ?? '',
        district: profile.district ?? '',
        state: profile.state ?? '',
        preferredLanguage: profile.preferredLanguage ?? 'en',
        crops: (profile.crops ?? []).join(', '),
        farmSize: profile.farmSize ?? '',
      });
    }
  }, [profile]);

  async function save() {
    if (!firebaseUser) return;
    setSaving(true);
    try {
      await updateUserProfile(firebaseUser.uid, {
        name: form.name,
        village: form.village,
        district: form.district,
        state: form.state,
        preferredLanguage: form.preferredLanguage,
        crops: form.crops.split(',').map((c) => c.trim()).filter(Boolean),
        farmSize: form.farmSize,
      });
      await refreshProfile();
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-canopy-700 text-xl font-semibold text-cream-50">
          {profile ? initials(profile.name) : 'F'}
        </span>
        <div>
          <h1 className="font-display text-2xl font-semibold text-canopy-950 dark:text-cream-50">{profile?.name ?? 'Farmer'}</h1>
          <p className="text-sm text-canopy-700/70 dark:text-cream-200/60">{profile?.email || firebaseUser?.phoneNumber}</p>
        </div>
      </div>

      <Card className="space-y-3">
        <h3 className="font-display text-lg font-semibold text-canopy-950 dark:text-cream-50">Personal details</h3>
        <Field label="Full name" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Village" value={form.village} onChange={(v) => setForm((f) => ({ ...f, village: v }))} />
          <Field label="District" value={form.district} onChange={(v) => setForm((f) => ({ ...f, district: v }))} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="State" value={form.state} onChange={(v) => setForm((f) => ({ ...f, state: v }))} />
          <Field label="Farm size (acres)" value={form.farmSize} onChange={(v) => setForm((f) => ({ ...f, farmSize: v }))} />
        </div>
        <Field label="Crops grown (comma separated)" value={form.crops} onChange={(v) => setForm((f) => ({ ...f, crops: v }))} />
        <label className="block text-sm">
          <span className="mb-1 block text-xs font-medium text-canopy-700 dark:text-canopy-300">Preferred language</span>
          <select
            value={form.preferredLanguage}
            onChange={(e) => setForm((f) => ({ ...f, preferredLanguage: e.target.value }))}
            className="w-full rounded-xl border border-canopy-200 dark:border-canopy-700 bg-cream-50/60 dark:bg-canopy-900/40 px-3 py-2.5 text-sm outline-none"
          >
            {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
        </label>
        <Button icon={<Save size={15} />} onClick={save} loading={saving}>Save changes</Button>
      </Card>

      <Card className="space-y-3">
        <h3 className="font-display text-lg font-semibold text-canopy-950 dark:text-cream-50">Accessibility</h3>
        <ToggleRow icon={<Moon size={16} />} label="Dark mode" checked={dark} onChange={toggleDark} />
        <ToggleRow icon={<Type size={16} />} label="Large text" checked={largeText} onChange={toggleLargeText} />
      </Card>

      <Button variant="outline" icon={<LogOut size={15} />} onClick={handleLogout} className="w-full">
        Log out
      </Button>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-xs font-medium text-canopy-700 dark:text-canopy-300">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-canopy-200 dark:border-canopy-700 bg-cream-50/60 dark:bg-canopy-900/40 px-3 py-2.5 text-sm outline-none"
      />
    </label>
  );
}

function ToggleRow({ icon, label, checked, onChange }: { icon: React.ReactNode; label: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-sm text-canopy-800 dark:text-cream-200">{icon} {label}</span>
      <button
        onClick={onChange}
        className={`h-6 w-11 rounded-full transition-colors ${checked ? 'bg-canopy-700' : 'bg-canopy-200 dark:bg-canopy-700'}`}
      >
        <span className={`block h-5 w-5 translate-y-0.5 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );
}

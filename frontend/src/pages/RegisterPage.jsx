import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GitBranch, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    const result = await register(form.username, form.email, form.password);
    if (result.success) {
      toast.success('Account created!');
      navigate('/dashboard');
    } else {
      toast.error(result.error);
    }
  };

  const fields = [
    { key: 'username', label: 'Username', type: 'text', placeholder: 'gitmaster' },
    { key: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
  ];

  return (
    <div className="min-h-screen bg-canvas-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm"
      >
        <div className="flex items-center justify-center gap-2 mb-8">
          <GitBranch className="text-accent-blue w-6 h-6" />
          <span className="font-semibold text-lg">Commit <span className="text-accent-blue">Canvas</span></span>
        </div>

        <div className="card">
          <h1 className="text-lg font-semibold text-canvas-text mb-1">Create account</h1>
          <p className="text-xs text-canvas-muted mb-6">Start learning Git visually</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {fields.map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="text-xs text-canvas-muted mb-1 block">{label}</label>
                <input
                  type={type}
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="input"
                  placeholder={placeholder}
                  required
                  autoFocus={key === 'username'}
                />
              </div>
            ))}

            <div>
              <label className="text-xs text-canvas-muted mb-1 block">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="input pr-10"
                  placeholder="Min. 6 characters"
                  required
                />
                <button type="button" onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-canvas-muted hover:text-canvas-text"
                  aria-label={showPwd ? 'Hide password' : 'Show password'}>
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs text-canvas-muted mb-1 block">Confirm password</label>
              <input
                type="password"
                value={form.confirm}
                onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
                className="input"
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="text-xs text-canvas-muted text-center mt-4">
            Have an account?{' '}
            <Link to="/login" className="text-accent-blue hover:underline">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

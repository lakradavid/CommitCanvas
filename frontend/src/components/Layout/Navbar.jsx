import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GitBranch, Sun, Moon, LogOut, User, Trophy, History, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const { theme, toggle } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/challenges', icon: Trophy, label: 'Challenges' },
    { to: '/history', icon: History, label: 'History' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-canvas-surface border-b border-canvas-border">
      <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 group">
          <motion.div whileHover={{ rotate: 15 }} transition={{ type: 'spring', stiffness: 300 }}>
            <GitBranch className="text-accent-blue w-6 h-6" />
          </motion.div>
          <span className="font-semibold text-canvas-text text-sm tracking-tight">
            Commit <span className="text-accent-blue">Canvas</span>
          </span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                location.pathname.startsWith(to)
                  ? 'bg-canvas-bg text-accent-blue'
                  : 'text-canvas-muted hover:text-canvas-text hover:bg-canvas-bg'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Stats */}
          {user && (
            <div className="hidden md:flex items-center gap-3 mr-2 text-xs text-canvas-muted">
              <span className="flex items-center gap-1">
                <span className="text-accent-green font-semibold">{user.stats?.commandsRun ?? 0}</span> cmds
              </span>
              <span className="flex items-center gap-1">
                <span className="text-accent-purple font-semibold">{user.stats?.challengesCompleted ?? 0}</span> solved
              </span>
            </div>
          )}

          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="p-1.5 rounded-md text-canvas-muted hover:text-canvas-text hover:bg-canvas-bg transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-canvas-bg text-xs text-canvas-muted">
            <User className="w-3.5 h-3.5" />
            <span>{user?.username}</span>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-md text-canvas-muted hover:text-accent-red hover:bg-canvas-bg transition-colors"
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
}

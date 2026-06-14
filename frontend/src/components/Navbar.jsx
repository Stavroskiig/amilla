import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { BarChartBig, Trophy, ClockFading, LogOut, Calendar, ShieldAlert, Award, Compass, User, PieChart, Info, Bell, TrendingUp, Palette } from 'lucide-react';

import wc26Logo from '../assets/wc26-logo.svg';
import { Avatar } from './Avatars';

export default function Navbar({ user, onLogout, theme, toggleTheme }) {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    onLogout();
    navigate('/auth');
  };

  const [notifPerm, setNotifPerm] = React.useState(
    'Notification' in window ? Notification.permission : 'denied'
  );

  const handleSubscribe = async () => {
    if (!('Notification' in window)) {
      alert('Οι ειδοποιήσεις δεν υποστηρίζονται. Αν είστε σε iPhone/iPad, προσθέστε την εφαρμογή στην Αρχική Οθόνη (Add to Home Screen).');
      return;
    }
    if (Notification.permission === 'denied') {
      alert('Έχετε μπλοκάρει τις ειδοποιήσεις. Παρακαλώ ελέγξτε τις ρυθμίσεις του browser σας.');
      return;
    }
    import('../utils/pushNotifications').then(async (module) => {
      await module.subscribeToPushNotifications();
      setNotifPerm(Notification.permission);
    });
  };

  if (!user) return null;

  const isAdmin = user.role === 'ROLE_ADMIN';
  const hasOddsAccess = isAdmin || user.role === 'ROLE_ODDS_MANAGER';

  return (
    <>
      <nav className="navbar glass">
        {/* Mobile-only Profile (Left) */}
        <div className="show-on-mobile" style={{ alignItems: 'center' }}>
          <NavLink to="/profile" className="user-badge" style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
            <Avatar id={user.avatar} size={20} />
            <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{user.totalPoints ?? 0} pts</span>
          </NavLink>
        </div>

        <div className="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'inherit' }}>
            <Compass size={24} style={theme === 'wc26' ? { color: '#000000' } : {}} className={theme !== 'wc26' ? 'text-indigo-400' : ''} />
            <span className={theme === 'wc26' ? "hide-on-mobile" : ""} style={theme === 'wc26' ? {
              background: 'linear-gradient(to right, #0f172a, #334155)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: '900',
              fontSize: '1.5rem',
              letterSpacing: '-0.5px'
            } : {}}>
              Amilla
            </span>
          </NavLink>

          {theme === 'wc26' && (
            <>
              <div className="hide-on-mobile" style={{ width: '2px', height: '28px', background: 'rgba(0,0,0,0.15)', borderRadius: '1px' }} />

              <img src={wc26Logo} alt="WC 2026" style={{ height: '36px', width: 'auto' }} />
            </>
          )}
        </div>

        <div className="nav-links">
          <NavLink
            to="/matches"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <Calendar size={18} />
            <span>Αγώνες</span>
          </NavLink>

          <NavLink
            to="/leaderboard"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <BarChartBig size={18} />
            <span>Κατάταξη</span>
          </NavLink>

          <NavLink
            to="/longterm"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <ClockFading size={18} />
            <span>Μακροχρόνια</span>
          </NavLink>

          <NavLink
            to="/stats"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <PieChart size={18} />
            <span>Στατιστικά</span>
          </NavLink>

          <NavLink
            to="/rules"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <Info size={18} />
            <span>Οδηγίες</span>
          </NavLink>

          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <ShieldAlert size={18} />
              <span>Admin</span>
            </NavLink>
          )}

          {hasOddsAccess && (
            <NavLink
              to="/odds-manager"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <TrendingUp size={18} />
              <span>Αποδόσεις</span>
            </NavLink>
          )}
        </div>

        <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="hide-on-mobile">
            <NavLink to="/profile" className="user-badge" style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
              <Avatar id={user.avatar} size={20} />
              <span>{user.username}</span>
              <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{user.totalPoints ?? 0} pts</span>
            </NavLink>
          </div>

          {(notifPerm === 'default' || notifPerm === 'denied') && (
            <button
              onClick={handleSubscribe}
              className="btn btn-secondary"
              style={{ padding: '8px 12px', fontSize: '0.85rem', opacity: notifPerm === 'denied' ? 0.6 : 1 }}
              title="Ενεργοποίηση ειδοποιήσεων"
            >
              <Bell size={16} />
            </button>
          )}

          <button
            onClick={toggleTheme}
            className="btn btn-secondary"
            style={{ padding: '8px 12px', fontSize: '0.85rem' }}
            title="Αλλαγή Θέματος (Theme)"
          >
            <Palette size={16} />
          </button>

          <button
            onClick={handleLogoutClick}
            className="btn btn-secondary"
            style={{ padding: '8px 12px', fontSize: '0.85rem' }}
            title="Αποσύνδεση"
          >
            <LogOut size={16} />
            <span style={{ display: 'none' }}>Logout</span>
          </button>
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar */}
      <div className="mobile-bottom-nav">
        <NavLink
          to="/matches"
          className={({ isActive }) => `mobile-bottom-link ${isActive ? 'active' : ''}`}
        >
          <Calendar size={20} />
          <span>Αγώνες</span>
        </NavLink>

        <NavLink
          to="/leaderboard"
          className={({ isActive }) => `mobile-bottom-link ${isActive ? 'active' : ''}`}
        >
          <BarChartBig size={20} />
          <span>Κατάταξη</span>
        </NavLink>

        <NavLink
          to="/longterm"
          className={({ isActive }) => `mobile-bottom-link ${isActive ? 'active' : ''}`}
        >
          <ClockFading size={20} />
          <span>Μακροχρόνια</span>
        </NavLink>

        <NavLink
          to="/stats"
          className={({ isActive }) => `mobile-bottom-link ${isActive ? 'active' : ''}`}
        >
          <PieChart size={20} />
          <span>Στατιστικά</span>
        </NavLink>

        <NavLink
          to="/rules"
          className={({ isActive }) => `mobile-bottom-link ${isActive ? 'active' : ''}`}
        >
          <Info size={20} />
          <span>Οδηγίες</span>
        </NavLink>
        {isAdmin && (
          <NavLink
            to="/admin"
            className={({ isActive }) => `mobile-bottom-link ${isActive ? 'active' : ''}`}
          >
            <ShieldAlert size={20} />
            <span>Admin</span>
          </NavLink>
        )}
        {hasOddsAccess && (
          <NavLink
            to="/odds-manager"
            className={({ isActive }) => `mobile-bottom-link ${isActive ? 'active' : ''}`}
          >
            <TrendingUp size={20} />
            <span>Odds</span>
          </NavLink>
        )}
      </div>
    </>
  );
}

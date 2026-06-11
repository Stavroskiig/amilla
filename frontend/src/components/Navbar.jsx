import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { BarChartBig, Trophy, LogOut, Calendar, ShieldAlert, Award, Compass, User, PieChart, Info, Bell, TrendingUp } from 'lucide-react';

import { Avatar } from './Avatars';

export default function Navbar({ user, onLogout }) {
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
        <div className="nav-logo">
          <Compass size={24} className="text-indigo-400" />
          <span>Amilla</span>
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
            <Trophy size={18} />
            <span>Πρωταθλητής</span>
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <NavLink to="/profile" className="user-badge" style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
            <Avatar id={user.avatar} size={20} />
            <span className="hide-on-mobile">{user.username}</span>
            <span style={{ fontWeight: 'bold', color: '#6366f1' }}>{user.totalPoints ?? 0} pts</span>
          </NavLink>

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
          <Trophy size={20} />
          <span>Πρωταθλητής</span>
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

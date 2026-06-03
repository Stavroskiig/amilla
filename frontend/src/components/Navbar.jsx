import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Trophy, LogOut, Calendar, ShieldAlert, Award, Compass } from 'lucide-react';

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    onLogout();
    navigate('/auth');
  };

  if (!user) return null;

  const isAdmin = user.role === 'ROLE_ADMIN';

  return (
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
          <Trophy size={18} />
          <span>Κατάταξη</span>
        </NavLink>

        <NavLink
          to="/longterm"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <Award size={18} />
          <span>Πρωταθλητής</span>
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
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div className="user-badge">
          <Award size={16} />
          <span>{user.username}</span>
          <span style={{ fontWeight: 'bold', color: '#6366f1' }}>{user.totalPoints ?? 0} pts</span>
        </div>

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
  );
}

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import BottomNav from './BottomNav';

const Security = ({ userRole, onLogout, allowedTo = [] }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (typeof onLogout === 'function') {
      onLogout();
    } else {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userRole');
      navigate('/login', { replace: true });
    }
  };

  return (
    <div style={{ background: '#ffffff', minHeight: '100dvh', padding: 16, paddingBottom: 96, boxSizing: 'border-box' }}>
      <div style={{
        maxWidth: 600,
        margin: '0 auto',
        background: '#ffffff',
        color: '#111827',
        borderRadius: 12,
        padding: 20,
        boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
        border: '1px solid rgb(255, 204, 204)'
      }}>
        <h2 style={{ marginTop: 0, color: 'FF0000' }}>Security</h2>
        <p style={{ marginBottom: 16, color: '#374151' }}>You can logout from here.</p>
        <button
          onClick={handleLogout}
          style={{
            background: '#FF0000',
            color: '#ffffff',
            border: 'none',
            borderRadius: 10,
            padding: '12px 18px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(249, 115, 22, 0.35)'
          }}
        >
          Logout
        </button>
      </div>

      {createPortal(
        <BottomNav
          userRole={userRole}
          allowedTo={allowedTo}
          onMonitorClick={() => navigate('/monitor')}
          onSettingsClick={() => navigate('/settings')}
          onAdminClick={() => navigate('/admin')}
          onSecurityClick={() => navigate('/security')}
        />,
        document.body
      )}
    </div>
  );
};

export default Security;

import React from 'react';
import './BottomNav.css';

const BottomNav = ({ onMonitorClick, onSettingsClick, onAdminClick, onSecurityClick, userRole, allowedTo = [] }) => {
  const perms = new Set(Array.isArray(allowedTo) ? allowedTo : []);
  return (
    <div className="bottom-nav">
      {perms.has('MONITOR') && (
        <button className="nav-button" onClick={onMonitorClick}>
          <i className="icon-monitor"></i>
          <span>Monitor</span>
        </button>
      )}
      {perms.has('SETTING') && (
        <button className="nav-button" onClick={onSettingsClick}>
          <i className="icon-settings"></i>
          <span>Settings</span>
        </button>
      )}
      {/* Keep Admin visible or gate it as needed; leaving visible here */}
      <button className="nav-button" onClick={onAdminClick}>
        <i className="icon-admin"></i>
        <span>Admin</span>
      </button>
      {perms.has('SECURITY') && (
        <button className="nav-button" onClick={onSecurityClick}>
          <i className="icon-security"></i>
          <span>Security</span>
        </button>
      )}
    </div>
  );
};

export default BottomNav;

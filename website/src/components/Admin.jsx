import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { addUser, deleteUser, updateUser, getUsers } from '../utils/api1';
import BottomNav from './BottomNav';

const Admin = ({ userRole, allowedTo = [] }) => {
  const navigate = useNavigate();

  // WiFi credentials local state
  const [wifi, setWifi] = useState({ ssid: '', password: '' });
  
  // User management state
  const [users, setUsers] = useState([]);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({
    username: '',
    password: '',
    userAlias: '',
    allowedTo: []
  });

  const availablePermissions = ['SETTING', 'MONITOR', 'SECURITY'];

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await getUsers();
      if (response.code === 200) {
        setUsers(response.users);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleWifiUpdate = (e) => {
    e.preventDefault();
    alert(`WiFi updated for SSID: ${wifi.ssid}`);
  };

  const handleAddUser = () => {
    setShowAddUserForm(true);
    setEditingUser(null);
    setUserForm({
      username: '',
      password: '',
      userAlias: '',
      allowedTo: []
    });
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowAddUserForm(true);
    setUserForm({
      username: user.username,
      password: '', // Don't prefill password for security
      userAlias: user.userAlias,
      allowedTo: [...user.allowedTo]
    });
  };

  const handleDeleteUser = async (username) => {
    if (window.confirm(`Are you sure you want to delete user "${username}"?`)) {
      try {
        const response = await deleteUser(username);
        if (response.code === 200) {
          alert('User deleted successfully');
          loadUsers(); // Refresh the user list
        } else {
          alert(`Failed to delete user: ${response.reason}`);
        }
      } catch (error) {
        console.error('Delete user error:', error);
        alert('Failed to delete user');
      }
    }
  };

  const handleSubmitUser = async (e) => {
    e.preventDefault();
    
    if (!userForm.username || !userForm.userAlias || userForm.allowedTo.length === 0) {
      alert('Please fill in all required fields and select at least one permission');
      return;
    }

    if (!editingUser && !userForm.password) {
      alert('Password is required for new users');
      return;
    }

    try {
      let response;
      if (editingUser) {
        // Update existing user
        const updates = {
          userAlias: userForm.userAlias,
          allowedTo: userForm.allowedTo
        };
        if (userForm.password) {
          updates.password = userForm.password;
        }
        response = await updateUser(userForm.username, updates);
      } else {
        // Add new user
        response = await addUser(
          userForm.username,
          userForm.password,
          userForm.userAlias,
          userForm.allowedTo
        );
      }

      if (response.code === 200) {
        alert(editingUser ? 'User updated successfully' : 'User added successfully');
        setShowAddUserForm(false);
        setEditingUser(null);
        loadUsers(); // Refresh the user list
      } else {
        alert(`Failed to ${editingUser ? 'update' : 'add'} user: ${response.reason}`);
      }
    } catch (error) {
      console.error('Submit user error:', error);
      alert(`Failed to ${editingUser ? 'update' : 'add'} user`);
    }
  };

  const handleCancelUserForm = () => {
    setShowAddUserForm(false);
    setEditingUser(null);
    setUserForm({
      username: '',
      password: '',
      userAlias: '',
      allowedTo: []
    });
  };

  const handlePermissionChange = (permission) => {
    setUserForm(prev => ({
      ...prev,
      allowedTo: prev.allowedTo.includes(permission)
        ? prev.allowedTo.filter(p => p !== permission)
        : [...prev.allowedTo, permission]
    }));
  };

  return (
    <div className="admin-page" style={{ background: '#ffffff', minHeight: '100dvh', padding: '16px', paddingBottom: 96, boxSizing: 'border-box' }}>
      
      {/* WiFi Credentials Section */}
      <section className="card" style={{ background: '#ffffff', color: '#111827', borderRadius: 12, padding: 16, maxWidth: 720, margin: '0 auto 16px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', border: '1px solid rgb(255, 204, 204)' }}>
        <h2 style={{ margin: 0, marginBottom: 12, borderBottom: '1px solid rgb(255, 204, 204)', paddingBottom: 8, color: '#FF0000' }}>WiFi Credentials</h2>
        <form onSubmit={handleWifiUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label>
            <div style={{ marginBottom: 6 }}>SSID</div>
            <input
              type="text"
              value={wifi.ssid}
              onChange={(e) => setWifi({ ...wifi, ssid: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#ffffff', color: '#111827' }}
              placeholder="Enter SSID"
            />
          </label>
          <label>
            <div style={{ marginBottom: 6 }}>Password</div>
            <input
              type="password"
              value={wifi.password}
              onChange={(e) => setWifi({ ...wifi, password: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#ffffff', color: '#111827' }}
              placeholder="Enter Password"
            />
          </label>
          <button type="submit" style={{ alignSelf: 'center', background: '#FF0000', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 10, fontWeight: 700, boxShadow: '0 2px 6px rgba(249,115,22,0.35)' }}>UPDATE</button>
        </form>
      </section>

      {/* User Management Section */}
      <section className="card" style={{ background: '#ffffff', color: '#111827', borderRadius: 12, padding: 16, maxWidth: 720, margin: '0 auto', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', border: '1px solid rgb(255, 204, 204)' }}>
        <h2 style={{ margin: 0, marginBottom: 12, borderBottom: '1px solid rgb(255, 204, 204)', paddingBottom: 8, color: '#FF0000' }}>User Management</h2>

        {!showAddUserForm ? (
          <>
            {/* User List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
              {users.map((user) => (
                <div key={user.username} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff7ed', color: '#7c2d12', borderRadius: 10, padding: '12px 12px', border: '1px solid #fed7aa' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{user.userAlias} (@{user.username})</div>
                    <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>
                      Permissions: {user.allowedTo.join(', ')}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleEditUser(user)} 
                    title="Edit User" 
                    style={{ background: '#fde68a', border: '1px solid #f59e0b', borderRadius: 8, padding: '8px 10px', cursor: 'pointer', color: '#7c2d12' }}
                  >
                    ✏️
                  </button>
                  {user.username !== 'admin' && (
                    <button 
                      onClick={() => handleDeleteUser(user.username)} 
                      title="Delete User" 
                      style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 10px', cursor: 'pointer' }}
                    >
                      🗑️
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add User Button */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button 
                onClick={handleAddUser} 
                style={{ background: '#FF0000', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 10, fontWeight: 700, boxShadow: '0 2px 6px rgba(249,115,22,0.35)' }}
              >
                Add New User
              </button>
            </div>
          </>
        ) : (
          /* Add/Edit User Form */
          <form onSubmit={handleSubmitUser} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ margin: 0, color: '#FF0000' }}>
              {editingUser ? `Edit User: ${editingUser.username}` : 'Add New User'}
            </h3>
            
            <label>
              <div style={{ marginBottom: 6, fontWeight: 600 }}>Username *</div>
              <input
                type="text"
                value={userForm.username}
                onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                disabled={editingUser !== null}
                style={{ 
                  width: '100%', 
                  padding: '10px 12px', 
                  borderRadius: 8, 
                  border: '1px solid #e5e7eb', 
                  background: editingUser ? '#f9fafb' : '#ffffff', 
                  color: '#111827' 
                }}
                placeholder="Enter username"
              />
            </label>

            <label>
              <div style={{ marginBottom: 6, fontWeight: 600 }}>
                Password {editingUser ? '(leave blank to keep current)' : '*'}
              </div>
              <input
                type="password"
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#ffffff', color: '#111827' }}
                placeholder={editingUser ? "Enter new password (optional)" : "Enter password"}
              />
            </label>

            <label>
              <div style={{ marginBottom: 6, fontWeight: 600 }}>Display Name *</div>
              <input
                type="text"
                value={userForm.userAlias}
                onChange={(e) => setUserForm({ ...userForm, userAlias: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#ffffff', color: '#111827' }}
                placeholder="Enter display name"
              />
            </label>

            <div>
              <div style={{ marginBottom: 8, fontWeight: 600 }}>Permissions *</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {availablePermissions.map(permission => (
                  <label key={permission} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={userForm.allowedTo.includes(permission)}
                      onChange={() => handlePermissionChange(permission)}
                      style={{ width: '16px', height: '16px' }}
                    />
                    <span>{permission}</span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 8 }}>
              <button 
                type="submit" 
                style={{ background: '#FF0000', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 10, fontWeight: 700 }}
              >
                {editingUser ? 'Update User' : 'Add User'}
              </button>
              <button 
                type="button" 
                onClick={handleCancelUserForm}
                style={{ background: '#6b7280', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 10, fontWeight: 700 }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </section>

      {createPortal(
        <BottomNav
          userRole={userRole}
          allowedTo={allowedTo}
          onSettingsClick={() => navigate('/settings')}
          onMonitorClick={() => navigate('/monitor')}
          onAdminClick={() => navigate('/admin')}
          onSecurityClick={() => navigate('/security')}
        />,
        document.body
      )}
    </div>
  );
};

export default Admin;

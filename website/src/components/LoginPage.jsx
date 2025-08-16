import React, { useState, useEffect } from 'react';
import './LoginForm.css'; 
import logo from './logo2.png';
import { login as apiLogin } from '../utils/api1';

console.log("login form");

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const res = await apiLogin(username, password);
      if (res.code === 200) {
        onLogin?.(res.userAlias, res.allowedTo);
        setError('');
      } else {
        setError(res.reason || 'Invalid username or password');
      }
    } catch (err) {
      console.error('Error during login:', err);
      setError('Error processing login');
    }
  };

  // useEffect(() => {
  //   console.log('Users data:');
  // }, []);

  // Force white background on login route to override any global dark theme
  useEffect(() => {
    const rootEl = document.getElementById('root');
    const prevHtmlBg = document.documentElement.style.backgroundColor;
    const prevBodyBg = document.body.style.backgroundColor;
    const prevRootBg = rootEl ? rootEl.style.backgroundColor : undefined;

    document.documentElement.style.backgroundColor = '#ffffff';
    document.body.style.backgroundColor = '#ffffff';
    if (rootEl) rootEl.style.backgroundColor = '#ffffff';

    return () => {
      document.documentElement.style.backgroundColor = prevHtmlBg;
      document.body.style.backgroundColor = prevBodyBg;
      if (rootEl && prevRootBg !== undefined) rootEl.style.backgroundColor = prevRootBg;
    };
  }, []);

  return (
    <div className="login-container">
      <div className="login-card">
        <img src={logo} alt="Zanvar" className="login-logo" />
        <div className="login-subtitle">Welcome to</div>
        <h2 className="login-title">Zanvar</h2>
        {error && <div className="error-message">{error}</div>}
        <div className="login-form">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="login-btn" onClick={handleLogin}>Login</button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
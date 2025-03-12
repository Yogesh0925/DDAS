import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import styles from '../styles.module.css';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email.trim(), password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h2 className={styles.authTitle}>
          <LogIn size={32} />
          Welcome Back
        </h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())}
              className={styles.input}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="Enter your password"
              required
            />
          </div>
          {error && (
            <div className={styles.error}>
              <AlertCircle size={20} />
              {error}
            </div>
          )}
          <button type="submit" className={styles.button}>
            <LogIn size={20} />
            Sign In
          </button>
          <div className={styles.authLinks}>
            Don't have an account?{' '}
            <Link to="/register">Create one now</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
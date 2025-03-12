import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import styles from '../styles.module.css';

export function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;

    try {
      setError('');
      setIsSubmitting(true);

      if (!name.trim()) {
        throw new Error('Name is required');
      }

      if (!email.trim()) {
        throw new Error('Email is required');
      }

      if (!password) {
        throw new Error('Password is required');
      }

      await register({
        email: email.trim(),
        password,
        name: name.trim()
      });

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h2 className={styles.authTitle}>
          <UserPlus size={32} />
          Create Account
        </h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.input}
              placeholder="Enter your name"
              required
              disabled={isSubmitting}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              placeholder="Enter your email"
              required
              disabled={isSubmitting}
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
              placeholder="Create a password"
              required
              disabled={isSubmitting}
            />
          </div>
          {error && (
            <div className={styles.error}>
              <AlertCircle size={20} />
              {error}
            </div>
          )}
          <button 
            type="submit" 
            className={styles.button}
            disabled={isSubmitting}
          >
            <UserPlus size={20} />
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>
          <div className={styles.authLinks}>
            Already have an account?{' '}
            <Link to="/login">Sign in instead</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
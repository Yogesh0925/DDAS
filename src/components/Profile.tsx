import React, { useState } from 'react';
import { UserCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import styles from '../styles.module.css';

export function Profile() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({ name, avatar });
      setSuccess('Profile updated successfully!');
      setError('');
    } catch (err) {
      setError('Failed to update profile');
      setSuccess('');
    }
  };

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileCard}>
        <h2 className={styles.profileTitle}>
          <UserCircle size={24} />
          Edit Profile
        </h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="avatar">Avatar URL</label>
            <input
              type="url"
              id="avatar"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              className={styles.input}
              placeholder="https://example.com/avatar.jpg"
            />
          </div>
          {error && <div className={styles.error}>{error}</div>}
          {success && <div className={styles.success}>{success}</div>}
          <button type="submit" className={styles.button}>
            Update Profile
          </button>
        </form>
      </div>
    </div>
  );
}
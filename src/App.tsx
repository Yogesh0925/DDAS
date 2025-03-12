import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { FileUpload } from './components/FileUpload';
import { DocumentList } from './components/DocumentList';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Profile } from './components/Profile';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AlertCircle, UserCircle, LogOut } from 'lucide-react';
import styles from './styles.module.css';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return user ? <>{children}</> : <Navigate to="/register" />;
}

function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  
  return (
    <div>
      <header className={styles.header}>
        <h1>Document Duplication Detection System</h1>
        {user && (
          <div className={styles.userMenu}>
            <a href="/profile" className={styles.profileLink}>
              <UserCircle size={24} />
              {user.name}
            </a>
            <button onClick={logout} className={styles.logoutButton}>
              <LogOut size={20} />
              Logout
            </button>
          </div>
        )}
      </header>
      <main className={styles.container}>{children}</main>
    </div>
  );
}

function Dashboard() {
  return (
    <>
      <div className={styles.card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <AlertCircle size={24} />
          <h2>Upload Document</h2>
        </div>
        <FileUpload />
      </div>

      <div className={styles.card}>
        <h2>Document List & Similarity Analysis</h2>
        <DocumentList />
      </div>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Layout>
                  <Profile />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/register" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
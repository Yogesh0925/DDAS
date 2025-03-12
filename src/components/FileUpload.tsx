import React, { useState, useRef } from 'react';
import { Upload, Link, AlertCircle, CheckCircle } from 'lucide-react';
import { saveDocument, checkDocumentExists, getDocumentByName } from '../db';
import { useAuth } from '../context/AuthContext';
import styles from '../styles.module.css';

export function FileUpload() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [duplicateDialog, setDuplicateDialog] = useState<{
    show: boolean;
    name: string;
    content: string;
    path: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const showNotification = (message: string, isError = false) => {
    if (isError) {
      setError(message);
      setSuccess(null);
    } else {
      setSuccess(message);
      setError(null);
    }
    // Clear notification after 5 seconds
    setTimeout(() => {
      if (isError) {
        setError(null);
      } else {
        setSuccess(null);
      }
    }, 5000);
  };

  const handleDuplicateOption = async (option: 'show' | 'open') => {
    if (!duplicateDialog) return;

    if (option === 'show') {
      alert(`File Location: ${duplicateDialog.path}`);
    } else {
      // Create a Blob with the content and appropriate type
      const getFileType = (fileName: string) => {
        const ext = fileName.split('.').pop()?.toLowerCase();
        switch (ext) {
          case 'txt': return 'text/plain';
          case 'doc': return 'application/msword';
          case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          case 'pdf': return 'application/pdf';
          default: return 'text/plain';
        }
      };

      const blob = new Blob([duplicateDialog.content], { type: getFileType(duplicateDialog.name) });
      const url = URL.createObjectURL(blob);

      // Open in a new tab
      const win = window.open(url, '_blank');
      if (!win) {
        showNotification('Please allow pop-ups to view the file', true);
      }

      // Clean up the URL after opening
      setTimeout(() => URL.revokeObjectURL(url), 100);
    }
    setDuplicateDialog(null);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const content = await file.text();
      const exists = await checkDocumentExists(file.name, user.id);
      
      if (exists) {
        const existingDoc = await getDocumentByName(file.name, user.id);
        setDuplicateDialog({
          show: true,
          name: file.name,
          content: existingDoc.content,
          path: `/documents/${user.id}/${file.name}`
        });
      } else {
        await saveDocument({
          name: file.name,
          content,
          uploadDate: new Date(),
          userId: user.id,
          path: `/documents/${user.id}/${file.name}`
        });
        showNotification(`File "${file.name}" has been successfully uploaded!`);
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      showNotification('Failed to process the file. Please try again.', true);
      console.error('Error processing file:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUrlUpload = async () => {
    if (!url || !user) {
      showNotification('Please enter a URL', true);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const content = await response.text();
      const fileName = url.split('/').pop() || 'downloaded-document';
      const exists = await checkDocumentExists(fileName, user.id);

      if (exists) {
        const existingDoc = await getDocumentByName(fileName, user.id);
        setDuplicateDialog({
          show: true,
          name: fileName,
          content: existingDoc.content,
          path: `/documents/${user.id}/${fileName}`
        });
      } else {
        await saveDocument({
          name: fileName,
          content,
          uploadDate: new Date(),
          userId: user.id,
          path: `/documents/${user.id}/${fileName}`
        });
        showNotification(`Document "${fileName}" has been successfully downloaded and saved!`);
      }

      setUrl('');
    } catch (err) {
      showNotification('Failed to download document. Please check the URL and try again.', true);
      console.error('Error downloading document:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Upload from Computer</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <input
            type="file"
            onChange={handleFileUpload}
            ref={fileInputRef}
            accept=".txt,.doc,.docx,.pdf"
            className={styles.input}
            disabled={loading}
          />
          <button 
            className={styles.button} 
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
          >
            <Upload size={16} style={{ marginRight: '0.5rem' }} />
            Upload
          </button>
        </div>
      </div>

      <div>
        <h3 style={{ marginBottom: '1rem' }}>Upload from URL</h3>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter document URL"
            className={styles.input}
            disabled={loading}
          />
          <button 
            className={styles.button} 
            onClick={handleUrlUpload}
            disabled={loading}
          >
            <Link size={16} style={{ marginRight: '0.5rem' }} />
            {loading ? 'Downloading...' : 'Download'}
          </button>
        </div>
      </div>

      {error && (
        <div className={styles.error}>
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {success && (
        <div className={styles.success}>
          <CheckCircle size={20} />
          {success}
        </div>
      )}

      {duplicateDialog && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Duplicate File Detected</h3>
            <p>A file with the name "{duplicateDialog.name}" already exists.</p>
            <div className={styles.modalButtons}>
              <button 
                className={styles.button}
                onClick={() => handleDuplicateOption('show')}
              >
                Show Path Location
              </button>
              <button 
                className={styles.button}
                onClick={() => handleDuplicateOption('open')}
              >
                Open Existing File
              </button>
              <button 
                className={`${styles.button} ${styles.buttonSecondary}`}
                onClick={() => setDuplicateDialog(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
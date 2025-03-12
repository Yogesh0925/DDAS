import React, { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { getAllDocuments, deleteDocument, Document } from '../db';
import { calculateSimilarity } from '../utils/levenshtein';
import styles from '../styles.module.css';

export function DocumentList() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [similarities, setSimilarities] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    const docs = await getAllDocuments();
    setDocuments(docs);

    // Calculate similarities between all documents
    const newSimilarities: { [key: string]: number } = {};
    for (let i = 0; i < docs.length; i++) {
      for (let j = i + 1; j < docs.length; j++) {
        const similarity = calculateSimilarity(docs[i].content, docs[j].content);
        const key = `${docs[i].id}-${docs[j].id}`;
        newSimilarities[key] = similarity;
      }
    }
    setSimilarities(newSimilarities);
  };

  const handleDelete = async (id: number) => {
    await deleteDocument(id);
    await loadDocuments();
  };

  const getSimilarityClass = (similarity: number) => {
    if (similarity >= 80) return styles.highSimilarity;
    if (similarity >= 50) return styles.mediumSimilarity;
    return styles.lowSimilarity;
  };

  return (
    <ul className={styles.fileList}>
      {documents.map((doc) => (
        <li key={doc.id} className={styles.fileItem}>
          <div>
            <strong>{doc.name}</strong>
            <div style={{ fontSize: '0.875rem', color: '#666' }}>
              Uploaded: {new Date(doc.uploadDate).toLocaleString()}
            </div>
            {documents.map((otherDoc) => {
              if (doc.id === otherDoc.id) return null;
              const key = `${Math.min(doc.id!, otherDoc.id!)}-${Math.max(doc.id!, otherDoc.id!)}`;
              const similarity = similarities[key];
              if (!similarity || similarity < 30) return null;

              return (
                <div key={key} style={{ marginTop: '0.5rem' }}>
                  <span>Similarity with {otherDoc.name}: </span>
                  <span className={`${styles.similarityScore} ${getSimilarityClass(similarity)}`}>
                    {similarity.toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
          <button
            onClick={() => doc.id && handleDelete(doc.id)}
            className={styles.button}
            style={{ background: '#ef4444' }}
          >
            <Trash2 size={16} />
          </button>
        </li>
      ))}
    </ul>
  );
}
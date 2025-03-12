import { openDB } from 'idb';
import bcrypt from 'bcryptjs';

const DB_NAME = 'documentDB';
const DB_VERSION = 2;
const STORE_NAMES = {
  documents: 'documents',
  users: 'users',
  sessions: 'sessions'
};

export interface Document {
  id?: number;
  name: string;
  content: string;
  uploadDate: Date;
  userId: string;
  path: string;
}

export interface User {
  id?: string;
  email: string;
  password: string;
  name: string;
  avatar?: string;
  createdAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
}

const initDB = async () => {
  const db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create documents store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAMES.documents)) {
        const docStore = db.createObjectStore(STORE_NAMES.documents, { keyPath: 'id', autoIncrement: true });
        docStore.createIndex('nameAndUser', ['name', 'userId'], { unique: true });
      }

      // Create users store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAMES.users)) {
        const userStore = db.createObjectStore(STORE_NAMES.users, { keyPath: 'id' });
        userStore.createIndex('email', 'email', { unique: true });
      }

      // Create sessions store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAMES.sessions)) {
        db.createObjectStore(STORE_NAMES.sessions, { keyPath: 'id' });
      }
    },
  });
  return db;
};

// User management
export async function createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
  try {
    const db = await initDB();
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const newUser: User = {
      id: crypto.randomUUID(),
      ...user,
      password: hashedPassword,
      createdAt: new Date()
    };
    
    const tx = db.transaction(STORE_NAMES.users, 'readwrite');
    await tx.store.add(newUser);
    await tx.done;
    
    return newUser;
  } catch (error: any) {
    if (error.name === 'ConstraintError') {
      throw new Error('Email already exists');
    }
    throw error;
  }
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User> {
  const db = await initDB();
  const tx = db.transaction(STORE_NAMES.users, 'readwrite');
  const user = await tx.store.get(id);
  if (!user) throw new Error('User not found');

  const updatedUser = { ...user, ...updates };
  if (updates.password) {
    updatedUser.password = await bcrypt.hash(updates.password, 10);
  }

  await tx.store.put(updatedUser);
  await tx.done;
  return updatedUser;
}

export async function loginUser(email: string, password: string): Promise<Session> {
  const db = await initDB();
  const tx = db.transaction(STORE_NAMES.users, 'readonly');
  const userStore = tx.objectStore(STORE_NAMES.users);
  const userIndex = userStore.index('email');
  
  const user = await userIndex.get(email);
  if (!user) throw new Error('Invalid credentials');

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) throw new Error('Invalid credentials');

  const session: Session = {
    id: crypto.randomUUID(),
    userId: user.id!,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  };

  const sessionTx = db.transaction(STORE_NAMES.sessions, 'readwrite');
  await sessionTx.store.add(session);
  await sessionTx.done;

  return session;
}

export async function getUser(id: string): Promise<Omit<User, 'password'> | null> {
  const db = await initDB();
  const tx = db.transaction(STORE_NAMES.users, 'readonly');
  const user = await tx.store.get(id);
  if (!user) return null;
  
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

// Document management
export async function saveDocument(doc: Omit<Document, 'id'>) {
  const db = await initDB();
  const tx = db.transaction(STORE_NAMES.documents, 'readwrite');
  const result = await tx.store.add(doc);
  await tx.done;
  return result;
}

export async function getAllDocuments(userId?: string) {
  const db = await initDB();
  const tx = db.transaction(STORE_NAMES.documents, 'readonly');
  const docs = await tx.store.getAll();
  return userId ? docs.filter(doc => doc.userId === userId) : docs;
}

export async function deleteDocument(id: number) {
  const db = await initDB();
  const tx = db.transaction(STORE_NAMES.documents, 'readwrite');
  await tx.store.delete(id);
  await tx.done;
}

export async function checkDocumentExists(name: string, userId: string): Promise<boolean> {
  const db = await initDB();
  const tx = db.transaction(STORE_NAMES.documents, 'readonly');
  const store = tx.objectStore(STORE_NAMES.documents);
  const index = store.index('nameAndUser');
  const doc = await index.get([name, userId]);
  return !!doc;
}

export async function getDocumentByName(name: string, userId: string): Promise<Document> {
  const db = await initDB();
  const tx = db.transaction(STORE_NAMES.documents, 'readonly');
  const store = tx.objectStore(STORE_NAMES.documents);
  const index = store.index('nameAndUser');
  const doc = await index.get([name, userId]);
  if (!doc) throw new Error('Document not found');
  return doc;
}
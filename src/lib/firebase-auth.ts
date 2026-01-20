// Firebase Auth client wrapper
// This file should only be imported on the client side

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  type User,
  type Auth,
} from 'firebase/auth';
import { getFirebaseAuth } from './firebase';

export interface AuthUser {
  id: string;
  email: string;
  displayName?: string;
}

class FirebaseAuthService {
  private auth: Auth | null = null;
  private currentUser: User | null = null;
  private initialized = false;
  private userReady = false;
  private userReadyPromise: Promise<AuthUser | null> | null = null;
  private userReadyResolve: ((user: AuthUser | null) => void) | null = null;
  private authListeners: ((user: AuthUser | null) => void)[] = [];

  constructor() {
    this.userReadyPromise = new Promise((resolve) => {
      this.userReadyResolve = resolve;
    });
  }

  async init() {
    if (typeof window === 'undefined') return;
    if (this.initialized) return;

    this.auth = getFirebaseAuth();
    this.initialized = true;

    onAuthStateChanged(this.auth, (user) => {
      this.currentUser = user;
      const authUser = user ? this.mapUser(user) : null;

      if (!this.userReady) {
        this.userReady = true;
        if (this.userReadyResolve) {
          this.userReadyResolve(authUser);
        }
      }

      this.authListeners.forEach((callback) => callback(authUser));
    });
  }

  private mapUser(user: User): AuthUser {
    return {
      id: user.uid,
      email: user.email || '',
      displayName: user.displayName || undefined,
    };
  }

  async waitForUser(): Promise<AuthUser | null> {
    if (this.userReady && this.currentUser) {
      return this.mapUser(this.currentUser);
    }
    if (this.userReady) {
      return null;
    }
    return this.userReadyPromise || Promise.resolve(null);
  }

  async waitForInit(): Promise<void> {
    if (this.userReady) return;
    await this.userReadyPromise;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getUser(): AuthUser | null {
    if (!this.currentUser) return null;
    return this.mapUser(this.currentUser);
  }

  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  async login(email: string, password: string): Promise<AuthUser> {
    if (!this.auth) {
      await this.init();
    }

    if (!this.auth) {
      throw new Error('Firebase Auth not initialized');
    }

    const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
    return this.mapUser(userCredential.user);
  }

  async signup(email: string, password: string): Promise<AuthUser> {
    if (!this.auth) {
      await this.init();
    }

    if (!this.auth) {
      throw new Error('Firebase Auth not initialized');
    }

    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    return this.mapUser(userCredential.user);
  }

  async loginWithGoogle(): Promise<AuthUser> {
    if (!this.auth) {
      await this.init();
    }

    if (!this.auth) {
      throw new Error('Firebase Auth not initialized');
    }

    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(this.auth, provider);
    return this.mapUser(userCredential.user);
  }

  async logout(): Promise<void> {
    if (!this.auth) return;
    await signOut(this.auth);
  }

  async getToken(): Promise<string | null> {
    if (!this.currentUser) return null;

    try {
      return await this.currentUser.getIdToken();
    } catch (error) {
      console.error('Error getting ID token:', error);
      return null;
    }
  }

  onAuthChange(callback: (user: AuthUser | null) => void): () => void {
    this.authListeners.push(callback);

    if (this.userReady) {
      callback(this.getUser());
    }

    return () => {
      const index = this.authListeners.indexOf(callback);
      if (index > -1) {
        this.authListeners.splice(index, 1);
      }
    };
  }
}

// Singleton instance
export const firebaseAuth = new FirebaseAuthService();

// Helper function for API calls with Firebase Auth
export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  await firebaseAuth.waitForInit();

  const token = await firebaseAuth.getToken();

  if (!token) {
    throw new Error('Not authenticated');
  }

  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${token}`);
  headers.set('Content-Type', 'application/json');

  return fetch(url, {
    ...options,
    headers,
  });
}

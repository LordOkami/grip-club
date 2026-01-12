// Netlify Identity client wrapper
// This file should only be imported on the client side

export interface IdentityUser {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
  };
  token: {
    access_token: string;
    expires_at: number;
    refresh_token: string;
    token_type: string;
  };
}

class IdentityService {
  private widget: any = null;
  private initialized = false;
  private initPromise: Promise<void> | null = null;
  private initResolve: (() => void) | null = null;

  constructor() {
    // Create a promise that resolves when init completes
    this.initPromise = new Promise((resolve) => {
      this.initResolve = resolve;
    });
  }

  async init(locale: string = 'es') {
    if (typeof window === 'undefined') return;
    if (this.initialized) return;

    // Dynamic import to avoid SSR issues
    const netlifyIdentity = (await import('netlify-identity-widget')).default;
    this.widget = netlifyIdentity;

    // When running locally, point to production Netlify site for Identity
    const isLocalhost = typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    const siteUrl = import.meta.env.PUBLIC_SITE_URL || '';
    netlifyIdentity.init({
      locale: locale === 'en' ? 'en' : 'es',
      ...(isLocalhost && siteUrl && { APIUrl: `${siteUrl}/.netlify/identity` })
    });

    this.initialized = true;

    // Resolve the init promise
    if (this.initResolve) {
      this.initResolve();
    }
  }

  // Wait for initialization to complete
  async waitForInit(): Promise<void> {
    if (this.initialized) return;
    return this.initPromise || Promise.resolve();
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getWidget() {
    return this.widget;
  }

  getUser(): IdentityUser | null {
    if (!this.widget) return null;
    return this.widget.currentUser() as IdentityUser | null;
  }

  isLoggedIn(): boolean {
    return this.getUser() !== null;
  }

  async login(): Promise<IdentityUser> {
    if (!this.widget) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      this.widget.open('login');

      const handleLogin = (user: IdentityUser) => {
        this.widget.close();
        this.widget.off('login', handleLogin);
        this.widget.off('error', handleError);
        resolve(user);
      };

      const handleError = (err: Error) => {
        this.widget.off('login', handleLogin);
        this.widget.off('error', handleError);
        reject(err);
      };

      this.widget.on('login', handleLogin);
      this.widget.on('error', handleError);
    });
  }

  async signup(): Promise<IdentityUser> {
    if (!this.widget) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      this.widget.open('signup');

      const handleLogin = (user: IdentityUser) => {
        this.widget.close();
        this.widget.off('login', handleLogin);
        this.widget.off('error', handleError);
        resolve(user);
      };

      const handleError = (err: Error) => {
        this.widget.off('login', handleLogin);
        this.widget.off('error', handleError);
        reject(err);
      };

      this.widget.on('login', handleLogin);
      this.widget.on('error', handleError);
    });
  }

  logout() {
    if (!this.widget) return;
    this.widget.logout();
  }

  getToken(): string | null {
    const user = this.getUser();
    if (!user?.token?.access_token) return null;

    // Check if token is expired
    const expiresAt = user.token.expires_at;
    if (expiresAt && expiresAt < Date.now()) {
      // Token expired, try to refresh
      this.widget?.refresh();
      const refreshedUser = this.getUser();
      return refreshedUser?.token?.access_token || null;
    }

    return user.token.access_token;
  }

  onAuthChange(callback: (user: IdentityUser | null) => void) {
    if (!this.widget) return;

    this.widget.on('login', callback);
    this.widget.on('logout', () => callback(null));
    this.widget.on('init', (user: IdentityUser | null) => callback(user));
  }
}

// Singleton instance
export const identity = new IdentityService();

// Helper function for API calls
export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  // Wait for identity to be initialized
  await identity.waitForInit();

  const token = identity.getToken();

  if (!token) {
    throw new Error('Not authenticated');
  }

  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${token}`);
  headers.set('Content-Type', 'application/json');

  return fetch(url, {
    ...options,
    headers
  });
}

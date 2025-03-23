// Simple storage interface without depending on Supabase's internal types
export class CustomStorageProvider {
  private storage = new Map<string, string>();
  private locks = new Set<string>();

  async getItem(key: string): Promise<string | null> {
    return this.storage.get(key) || null;
  }

  async setItem(key: string, value: string): Promise<void> {
    if (this.locks.has(key)) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    this.locks.add(key);
    try {
      this.storage.set(key, value);
    } finally {
      this.locks.delete(key);
    }
  }

  async removeItem(key: string): Promise<void> {
    if (this.locks.has(key)) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    this.locks.add(key);
    try {
      this.storage.delete(key);
    } finally {
      this.locks.delete(key);
    }
  }
}
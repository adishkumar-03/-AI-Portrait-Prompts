/**
 * Supabase Client & Data Access Layer
 * Seamlessly talks to Supabase PostgreSQL & Storage,
 * with a high-fidelity local fallback mode for instant offline demoing.
 */

class DatabaseService {
  constructor() {
    this.client = null;
    this.initClient();
  }

  /**
   * Initialize Supabase client if valid credentials exist
   */
  initClient() {
    if (typeof window.supabase !== 'undefined' && window.SUPABASE_CONFIG.isConfigured()) {
      try {
        const url = window.SUPABASE_CONFIG.getUrl();
        const key = window.SUPABASE_CONFIG.getAnonKey();
        this.client = window.supabase.createClient(url, key);
        console.log('✅ Supabase Client initialized successfully.');
      } catch (err) {
        console.warn('Could not initialize Supabase client:', err);
        this.client = null;
      }
    } else {
      this.client = null;
      console.log('ℹ️ Running in Local/Demo Mode. Connect Supabase anytime in Admin Settings.');
    }
  }

  /**
   * Check connection to Supabase
   */
  async testConnection() {
    if (!this.client) {
      return { success: false, message: 'Supabase credentials not configured yet.' };
    }
    try {
      const { data, error } = await this.client.from('prompts').select('id').limit(1);
      if (error) {
        return { success: false, message: `Database error: ${error.message}. Did you run the SQL schema?` };
      }
      return { success: true, message: 'Successfully connected to Supabase database!' };
    } catch (err) {
      return { success: false, message: err.message || 'Failed to connect to Supabase.' };
    }
  }

  /**
   * Fetch all prompts (from Supabase or local storage fallback)
   */
  async getPrompts() {
    if (this.client) {
      try {
        const { data, error } = await this.client
          .from('prompts')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data && data.length > 0) return data;
      } catch (err) {
        console.warn('Failed to fetch from Supabase, falling back to local dataset:', err);
      }
    }

    // Fallback: get from localStorage combined with default sample prompts
    const localSaved = localStorage.getItem('local_prompts_db');
    if (localSaved) {
      try {
        return JSON.parse(localSaved);
      } catch (e) {
        console.error('Error parsing local prompts', e);
      }
    }

    // First load: seed with default prompts
    const initial = window.DEFAULT_PROMPTS || [];
    localStorage.setItem('local_prompts_db', JSON.stringify(initial));
    return initial;
  }

  /**
   * Increment copy count when a user copies a prompt
   */
  async incrementCopyCount(promptId) {
    if (this.client) {
      try {
        // Try calling the RPC function defined in sql schema
        const { error } = await this.client.rpc('increment_copy_count', { prompt_id: promptId });
        if (!error) return;
      } catch (e) {
        // Fallback to direct increment if RPC is not created yet
        try {
          const { data: item } = await this.client.from('prompts').select('copy_count').eq('id', promptId).single();
          if (item) {
            await this.client.from('prompts').update({ copy_count: (item.copy_count || 0) + 1 }).eq('id', promptId);
          }
        } catch (err) {
          console.warn('Could not update copy count on server:', err);
        }
      }
    }

    // Update local cache
    const local = this.getLocalPrompts();
    const target = local.find(p => p.id === promptId);
    if (target) {
      target.copy_count = (target.copy_count || 0) + 1;
      localStorage.setItem('local_prompts_db', JSON.stringify(local));
    }
  }

  /**
   * Upload an image file (to Supabase Storage or Base64 fallback)
   */
  async uploadImage(file) {
    if (this.client) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
        const filePath = `uploads/${fileName}`;

        const { data, error } = await this.client.storage
          .from('prompt-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) throw error;

        // Get public URL
        const { data: publicUrlData } = this.client.storage
          .from('prompt-images')
          .getPublicUrl(filePath);

        return publicUrlData.publicUrl;
      } catch (err) {
        console.error('Supabase storage upload failed:', err);
        throw new Error(`Storage upload error: ${err.message || 'Make sure prompt-images bucket exists.'}`);
      }
    }

    // Fallback for offline/demo: convert to Base64 Data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }

  /**
   * Create a new prompt
   */
  async createPrompt(promptData) {
    if (this.client) {
      try {
        const { data, error } = await this.client
          .from('prompts')
          .insert([promptData])
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (err) {
        console.error('Supabase create failed:', err);
        throw err;
      }
    }

    // Fallback: save to local storage
    const local = this.getLocalPrompts();
    const newRecord = {
      ...promptData,
      id: 'local-' + Date.now(),
      created_at: new Date().toISOString(),
      copy_count: 0
    };
    local.unshift(newRecord);
    localStorage.setItem('local_prompts_db', JSON.stringify(local));
    return newRecord;
  }

  /**
   * Update an existing prompt
   */
  async updatePrompt(id, updatedFields) {
    if (this.client) {
      try {
        const { data, error } = await this.client
          .from('prompts')
          .update(updatedFields)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (err) {
        console.error('Supabase update failed:', err);
        throw err;
      }
    }

    // Fallback: update in localStorage
    const local = this.getLocalPrompts();
    const index = local.findIndex(p => p.id === id);
    if (index !== -1) {
      local[index] = { ...local[index], ...updatedFields, updated_at: new Date().toISOString() };
      localStorage.setItem('local_prompts_db', JSON.stringify(local));
      return local[index];
    }
    throw new Error('Prompt not found');
  }

  /**
   * Delete a prompt
   */
  async deletePrompt(id) {
    if (this.client) {
      try {
        const { error } = await this.client
          .from('prompts')
          .delete()
          .eq('id', id);

        if (error) throw error;
        return true;
      } catch (err) {
        console.error('Supabase delete failed:', err);
        throw err;
      }
    }

    // Fallback: delete from localStorage
    const local = this.getLocalPrompts();
    const filtered = local.filter(p => p.id !== id);
    localStorage.setItem('local_prompts_db', JSON.stringify(filtered));
    return true;
  }

  /**
   * Sign In Admin
   */
  async signIn(email, password) {
    if (this.client) {
      const { data, error } = await this.client.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data.user;
    }

    // Fallback Demo Login (pass code: admin123 or demo mode)
    if (password === 'admin123' || password === 'admin') {
      const demoUser = { email: email || 'admin@prompthero.local', id: 'demo-admin-id' };
      localStorage.setItem('demo_admin_session', JSON.stringify(demoUser));
      return demoUser;
    }
    throw new Error('Invalid demo credentials. Use password "admin123" for demo mode, or connect Supabase.');
  }

  /**
   * Sign Out Admin
   */
  async signOut() {
    if (this.client) {
      await this.client.auth.signOut();
    }
    localStorage.removeItem('demo_admin_session');
  }

  /**
   * Get current authenticated user
   */
  async getUser() {
    if (this.client) {
      const { data: { user } } = await this.client.auth.getUser();
      if (user) return user;
    }
    const demo = localStorage.getItem('demo_admin_session');
    if (demo) {
      try {
        return JSON.parse(demo);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  /**
   * Helper: get current local prompt array
   */
  getLocalPrompts() {
    try {
      const stored = localStorage.getItem('local_prompts_db');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return window.DEFAULT_PROMPTS || [];
  }
}

// Global instance
window.dbService = new DatabaseService();

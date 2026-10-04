/**
 * Supabase Configuration & Settings Manager
 * 
 * You can set your Supabase credentials here directly, OR enter them 
 * via the "Connect Database" modal in the Admin Dashboard without editing any code!
 */

const SUPABASE_CONFIG = {
  // If you want to hardcode your Supabase project credentials, enter them below:
  url: "https://your-project-id.supabase.co",
  anonKey: "your-anon-public-key-here",

  /**
   * Returns current active Supabase URL (prefers localStorage if configured via UI)
   */
  getUrl() {
    const stored = localStorage.getItem('ai_prompts_supabase_url');
    if (stored && stored.trim() !== '') return stored.trim();
    return this.url;
  },

  /**
   * Returns current active Anon Key
   */
  getAnonKey() {
    const stored = localStorage.getItem('ai_prompts_supabase_key');
    if (stored && stored.trim() !== '') return stored.trim();
    return this.anonKey;
  },

  /**
   * Check if user has set real Supabase credentials
   */
  isConfigured() {
    const currentUrl = this.getUrl();
    const currentKey = this.getAnonKey();
    return (
      currentUrl &&
      currentKey &&
      !currentUrl.includes('your-project-id') &&
      !currentKey.includes('your-anon-public-key') &&
      currentUrl.startsWith('https://')
    );
  },

  /**
   * Save credentials to localStorage from the UI settings modal
   */
  saveCredentials(url, key) {
    localStorage.setItem('ai_prompts_supabase_url', url.trim());
    localStorage.setItem('ai_prompts_supabase_key', key.trim());
  },

  /**
   * Clear saved credentials
   */
  clearCredentials() {
    localStorage.removeItem('ai_prompts_supabase_url');
    localStorage.removeItem('ai_prompts_supabase_key');
  }
};

if (typeof window !== 'undefined') {
  window.SUPABASE_CONFIG = SUPABASE_CONFIG;
}

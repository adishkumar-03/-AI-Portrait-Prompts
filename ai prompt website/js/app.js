/**
 * AI Prompt Website - Core Application Logic
 * Handles gallery rendering, real-time filtering, search, copy actions,
 * interactive prompt personalization, favorites, and modals.
 */

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

const App = {
  prompts: [],
  filteredPrompts: [],
  currentPrompt: null,
  activeCategory: 'All',
  activeModel: 'All',
  activeRatio: 'All',
  sortBy: 'popular',
  searchQuery: '',
  showOnlySaved: false,
  savedPromptIds: new Set(),

  // DOM Elements
  elements: {
    grid: document.getElementById('promptsGrid'),
    resultsCount: document.getElementById('resultsCount'),
    searchInput: document.getElementById('searchInput'),
    searchClearBtn: document.getElementById('searchClearBtn'),
    categoryPills: document.getElementById('categoryPills'),
    modelFilter: document.getElementById('modelFilter'),
    ratioFilter: document.getElementById('ratioFilter'),
    sortFilter: document.getElementById('sortFilter'),
    savedToggle: document.getElementById('savedToggle'),
    statusBadge: document.getElementById('statusBadge'),
    statusDot: document.getElementById('statusDot'),
    statusText: document.getElementById('statusText'),
    
    // Detail Modal Elements
    modalBackdrop: document.getElementById('promptModal'),
    modalCloseBtn: document.getElementById('modalCloseBtn'),
    modalImage: document.getElementById('modalImage'),
    modalTitle: document.getElementById('modalTitle'),
    modalModelBadge: document.getElementById('modalModelBadge'),
    modalCategoryBadge: document.getElementById('modalCategoryBadge'),
    modalRatioBadge: document.getElementById('modalRatioBadge'),
    modalPromptOutput: document.getElementById('modalPromptOutput'),
    modalVariablesContainer: document.getElementById('modalVariablesContainer'),
    modalNegativeBox: document.getElementById('modalNegativeBox'),
    modalNegativeText: document.getElementById('modalNegativeText'),
    modalTipsText: document.getElementById('modalTipsText'),
    modalParamsGrid: document.getElementById('modalParamsGrid'),
    modalCopyBtn: document.getElementById('modalCopyBtn'),
    modalCopyNegativeBtn: document.getElementById('modalCopyNegativeBtn'),
    
    // Supabase Connect Modal
    dbModalBackdrop: document.getElementById('dbConnectModal'),
    dbModalCloseBtn: document.getElementById('dbModalCloseBtn'),
    supabaseUrlInput: document.getElementById('supabaseUrlInput'),
    supabaseKeyInput: document.getElementById('supabaseKeyInput'),
    btnTestDb: document.getElementById('btnTestDb'),
    btnSaveDb: document.getElementById('btnSaveDb'),
    dbStatusMsg: document.getElementById('dbStatusMsg')
  },

  /**
   * Initialize App
   */
  async init() {
    this.loadSavedPrompts();
    this.setupEventListeners();
    await this.checkDatabaseStatus();
    await this.fetchPrompts();
  },

  /**
   * Check connection status to Supabase
   */
  async checkDatabaseStatus() {
    const isConfigured = window.SUPABASE_CONFIG.isConfigured();
    if (isConfigured) {
      this.elements.statusDot.classList.add('connected');
      this.elements.statusText.textContent = 'Supabase Connected';
    } else {
      this.elements.statusDot.classList.remove('connected');
      this.elements.statusText.textContent = 'Demo Mode (Click to Connect)';
    }
  },

  /**
   * Load saved / bookmarked prompts from localStorage
   */
  loadSavedPrompts() {
    try {
      const stored = localStorage.getItem('user_saved_prompts');
      if (stored) {
        this.savedPromptIds = new Set(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Could not load saved bookmarks', e);
    }
  },

  /**
   * Persist saved / bookmarked prompts to localStorage
   */
  persistSavedPrompts() {
    localStorage.setItem('user_saved_prompts', JSON.stringify(Array.from(this.savedPromptIds)));
  },

  /**
   * Toggle prompt bookmark
   */
  toggleSavePrompt(id, e) {
    if (e) e.stopPropagation();
    if (this.savedPromptIds.has(id)) {
      this.savedPromptIds.delete(id);
      this.showToast('Removed from saved collection');
    } else {
      this.savedPromptIds.add(id);
      this.showToast('Saved to your collection! ❤️');
    }
    this.persistSavedPrompts();
    this.renderPrompts();
  },

  /**
   * Fetch prompts from DatabaseService
   */
  async fetchPrompts() {
    this.renderLoading();
    try {
      this.prompts = await window.dbService.getPrompts();
      this.applyFiltersAndSort();
    } catch (err) {
      console.error('Error fetching prompts:', err);
      this.elements.grid.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">⚠️</div>
          <h3>Failed to load prompts</h3>
          <p>Please check your connection and try again.</p>
          <button class="btn btn-primary" onclick="App.fetchPrompts()">Retry</button>
        </div>
      `;
    }
  },

  /**
   * Setup Event Listeners
   */
  setupEventListeners() {
    // Search input
    this.elements.searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.trim().toLowerCase();
      this.elements.searchClearBtn.style.display = this.searchQuery ? 'block' : 'none';
      this.applyFiltersAndSort();
    });

    this.elements.searchClearBtn.addEventListener('click', () => {
      this.elements.searchInput.value = '';
      this.searchQuery = '';
      this.elements.searchClearBtn.style.display = 'none';
      this.applyFiltersAndSort();
      this.elements.searchInput.focus();
    });

    // Keyboard shortcut '/' to focus search
    window.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== this.elements.searchInput && !document.activeElement.matches('input, textarea')) {
        e.preventDefault();
        this.elements.searchInput.focus();
      } else if (e.key === 'Escape') {
        this.closeModal();
        this.closeDbModal();
      }
    });

    // Category pills
    if (this.elements.categoryPills) {
      this.elements.categoryPills.addEventListener('click', (e) => {
        const pill = e.target.closest('.category-pill');
        if (!pill) return;
        this.elements.categoryPills.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.activeCategory = pill.dataset.category;
        this.applyFiltersAndSort();
      });
    }

    // Model dropdown
    this.elements.modelFilter.addEventListener('change', (e) => {
      this.activeModel = e.target.value;
      this.applyFiltersAndSort();
    });

    // Ratio dropdown
    this.elements.ratioFilter.addEventListener('change', (e) => {
      this.activeRatio = e.target.value;
      this.applyFiltersAndSort();
    });

    // Sort dropdown
    this.elements.sortFilter.addEventListener('change', (e) => {
      this.sortBy = e.target.value;
      this.applyFiltersAndSort();
    });

    // Saved toggle
    this.elements.savedToggle.addEventListener('click', () => {
      this.showOnlySaved = !this.showOnlySaved;
      this.elements.savedToggle.classList.toggle('active', this.showOnlySaved);
      this.applyFiltersAndSort();
    });

    // Modal tabs
    document.querySelectorAll('.modal-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tabTarget = btn.dataset.tab;
        document.querySelectorAll('.modal-tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        const activeTab = document.getElementById(tabTarget);
        if (activeTab) activeTab.classList.add('active');
      });
    });

    // Modal close
    this.elements.modalCloseBtn.addEventListener('click', () => this.closeModal());
    this.elements.modalBackdrop.addEventListener('click', (e) => {
      if (e.target === this.elements.modalBackdrop) this.closeModal();
    });

    // Copy in modal
    this.elements.modalCopyBtn.addEventListener('click', () => {
      const textToCopy = this.elements.modalPromptOutput.innerText;
      this.copyToClipboard(textToCopy, this.elements.modalCopyBtn, this.currentPrompt?.id);
    });

    if (this.elements.modalCopyNegativeBtn) {
      this.elements.modalCopyNegativeBtn.addEventListener('click', () => {
        const neg = this.elements.modalNegativeText.innerText;
        this.copyToClipboard(neg, this.elements.modalCopyNegativeBtn);
      });
    }

    // Supabase Connect Modal trigger
    this.elements.statusBadge.addEventListener('click', () => this.openDbModal());
    this.elements.dbModalCloseBtn.addEventListener('click', () => this.closeDbModal());
    this.elements.dbModalBackdrop.addEventListener('click', (e) => {
      if (e.target === this.elements.dbModalBackdrop) this.closeDbModal();
    });

    this.elements.btnTestDb.addEventListener('click', () => this.testDbConnection());
    this.elements.btnSaveDb.addEventListener('click', () => this.saveDbCredentials());
  },

  /**
   * Apply Search, Category, Model, Ratio, and Sort
   */
  applyFiltersAndSort() {
    let result = [...this.prompts];

    // Filter by Category
    if (this.activeCategory !== 'All') {
      result = result.filter(p => p.category === this.activeCategory);
    }

    // Filter by Model
    if (this.activeModel !== 'All') {
      result = result.filter(p => (p.model || '').toLowerCase().includes(this.activeModel.toLowerCase()));
    }

    // Filter by Aspect Ratio
    if (this.activeRatio !== 'All') {
      result = result.filter(p => p.aspect_ratio === this.activeRatio);
    }

    // Filter by Saved
    if (this.showOnlySaved) {
      result = result.filter(p => this.savedPromptIds.has(p.id));
    }

    // Filter by Search Query
    if (this.searchQuery) {
      result = result.filter(p => {
        const text = `${p.title || ''} ${p.prompt_text || ''} ${p.category || ''} ${p.model || ''} ${(p.tags || []).join(' ')}`.toLowerCase();
        return text.includes(this.searchQuery);
      });
    }

    // Sort Results
    if (this.sortBy === 'popular') {
      result.sort((a, b) => (b.copy_count || 0) - (a.copy_count || 0));
    } else if (this.sortBy === 'newest') {
      result.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    } else if (this.sortBy === 'title') {
      result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    }

    this.filteredPrompts = result;
    this.renderPrompts();
  },

  /**
   * Render loading skeleton state
   */
  renderLoading() {
    this.elements.grid.innerHTML = Array(6).fill(0).map(() => `
      <div class="prompt-card" style="opacity: 0.5;">
        <div class="card-image-box" style="background: rgba(255,255,255,0.05); animate: pulse 1.5s infinite;"></div>
        <div class="card-content">
          <div style="height: 20px; background: rgba(255,255,255,0.1); border-radius: 4px; margin-bottom: 12px;"></div>
          <div style="height: 50px; background: rgba(255,255,255,0.05); border-radius: 4px; margin-bottom: 16px;"></div>
          <div style="height: 38px; background: rgba(255,255,255,0.08); border-radius: 8px;"></div>
        </div>
      </div>
    `).join('');
  },

  /**
   * Render filtered prompts into the grid
   */
  renderPrompts() {
    this.elements.resultsCount.textContent = `${this.filteredPrompts.length} prompt${this.filteredPrompts.length === 1 ? '' : 's'}`;

    if (this.filteredPrompts.length === 0) {
      this.elements.grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-icon">🔍</div>
          <h3>No matching prompts found</h3>
          <p>Try clearing filters or search terms to see other curated prompts.</p>
          <button class="btn btn-outline" onclick="App.resetFilters()">Clear All Filters</button>
        </div>
      `;
      return;
    }

    this.elements.grid.innerHTML = this.filteredPrompts.map(prompt => {
      const isSaved = this.savedPromptIds.has(prompt.id);
      const highlightedSnippet = this.highlightPlaceholders(prompt.prompt_text);

      return `
        <article class="prompt-card" data-id="${prompt.id}">
          <div class="card-image-box" onclick="App.openModal('${prompt.id}')">
            <img class="card-image" src="${this.escapeHtml(prompt.image_url)}" alt="${this.escapeHtml(prompt.title)}" loading="lazy" />
            <div class="card-overlay-top">
              <span class="badge-model">${this.escapeHtml(prompt.model || 'AI Model')}</span>
              <span class="badge-ratio">${this.escapeHtml(prompt.aspect_ratio || '4:5')}</span>
            </div>
            <div class="card-overlay-bottom">
              <span class="badge-category">${this.escapeHtml(prompt.category || 'Curated')}</span>
              <button class="card-favorite-btn ${isSaved ? 'saved' : ''}" 
                title="${isSaved ? 'Remove from bookmarks' : 'Save bookmark'}"
                onclick="App.toggleSavePrompt('${prompt.id}', event)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="${isSaved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="card-content">
            <h3 class="card-title" title="${this.escapeHtml(prompt.title)}" onclick="App.openModal('${prompt.id}')">${this.escapeHtml(prompt.title)}</h3>
            
            <div class="prompt-snippet-box" onclick="App.openModal('${prompt.id}')" title="Click to view & personalize prompt">
              ${highlightedSnippet}
            </div>

            <div class="card-actions">
              <button class="btn-copy-prompt" onclick="App.handleCardCopy('${prompt.id}', this, event)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                </svg>
                <span>Copy Prompt</span>
              </button>
              
              <button class="btn-customize" onclick="App.openModal('${prompt.id}')" title="Customize prompt variables">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 20h9"/>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
              </button>
            </div>

            <div class="card-meta-copies">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <span>${(prompt.copy_count || 0).toLocaleString()} people used this prompt</span>
            </div>
          </div>
        </article>
      `;
    }).join('');
  },

  /**
   * Reset all active filters
   */
  resetFilters() {
    this.elements.searchInput.value = '';
    this.searchQuery = '';
    this.elements.searchClearBtn.style.display = 'none';
    this.activeCategory = 'All';
    this.activeModel = 'All';
    this.activeRatio = 'All';
    this.showOnlySaved = false;
    this.elements.savedToggle.classList.remove('active');
    this.elements.modelFilter.value = 'All';
    this.elements.ratioFilter.value = 'All';

    if (this.elements.categoryPills) {
      this.elements.categoryPills.querySelectorAll('.category-pill').forEach(p => {
        p.classList.toggle('active', p.dataset.category === 'All');
      });
    }

    this.applyFiltersAndSort();
  },

  /**
   * Fast card copy button handler
   */
  async handleCardCopy(id, btnElement, event) {
    if (event) event.stopPropagation();
    const prompt = this.prompts.find(p => p.id === id);
    if (!prompt) return;

    await this.copyToClipboard(prompt.prompt_text, btnElement, id);
    // increment local copy count UI immediately
    prompt.copy_count = (prompt.copy_count || 0) + 1;
    const cardCopies = btnElement.closest('.card-content')?.querySelector('.card-meta-copies span');
    if (cardCopies) {
      cardCopies.textContent = `${prompt.copy_count.toLocaleString()} people used this prompt`;
    }
  },

  /**
   * Copy to clipboard utility with button feedback
   */
  async copyToClipboard(text, btnElement, promptId = null) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }

    // Visual feedback on button
    if (btnElement) {
      const origHtml = btnElement.innerHTML;
      btnElement.classList.add('copied');
      btnElement.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        <span>Copied!</span>
      `;
      setTimeout(() => {
        btnElement.classList.remove('copied');
        btnElement.innerHTML = origHtml;
      }, 2000);
    }

    this.showToast('Prompt copied to clipboard! Paste into Midjourney or Flux.');

    // Increment in DB
    if (promptId) {
      window.dbService.incrementCopyCount(promptId);
    }
  },

  /**
   * Parse prompt and find all bracketed placeholders [variable]
   */
  extractPlaceholders(text) {
    const regex = /\[(.*?)\]/g;
    const matches = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      matches.push({
        full: match[0],
        content: match[1]
      });
    }
    return matches;
  },

  /**
   * Highlight bracketed placeholders with styled spans
   */
  highlightPlaceholders(text) {
    if (!text) return '';
    const escaped = this.escapeHtml(text);
    return escaped.replace(/\[(.*?)\]/g, '<span class="ph-tag">[$1]</span>');
  },

  /**
   * Open Prompt Detail & Personalizer Modal
   */
  openModal(promptId) {
    const prompt = this.prompts.find(p => p.id === promptId);
    if (!prompt) return;
    this.currentPrompt = prompt;

    // Reset tabs to default (Prompt & Personalize)
    document.querySelectorAll('.modal-tab-btn').forEach((b, idx) => b.classList.toggle('active', idx === 0));
    document.querySelectorAll('.tab-content').forEach((c, idx) => c.classList.toggle('active', idx === 0));

    // Populate Modal Header & Image
    this.elements.modalTitle.textContent = prompt.title;
    this.elements.modalImage.src = prompt.image_url;
    this.elements.modalImage.alt = prompt.title;
    this.elements.modalModelBadge.textContent = prompt.model || 'Midjourney';
    this.elements.modalCategoryBadge.textContent = prompt.category || 'Curated';
    this.elements.modalRatioBadge.textContent = prompt.aspect_ratio || '4:5';

    // Populate Negative Prompt
    if (prompt.negative_prompt && prompt.negative_prompt.trim()) {
      this.elements.modalNegativeBox.style.display = 'block';
      this.elements.modalNegativeText.textContent = prompt.negative_prompt;
    } else {
      this.elements.modalNegativeBox.style.display = 'none';
    }

    // Populate Tips
    this.elements.modalTipsText.textContent = prompt.tips || 'Upload a clear front-facing portrait of yourself as character reference to match this composition.';

    // Populate Model Parameters Grid
    this.renderParamsGrid(prompt);

    // Setup Interactive Variable Customizer
    this.setupPersonalizerInputs(prompt);

    // Show Modal
    this.elements.modalBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  /**
   * Close Modal
   */
  closeModal() {
    this.elements.modalBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  },

  /**
   * Setup interactive fields for variables found in prompt
   */
  setupPersonalizerInputs(prompt) {
    const placeholders = this.extractPlaceholders(prompt.prompt_text);
    const container = this.elements.modalVariablesContainer;
    container.innerHTML = '';

    if (placeholders.length === 0) {
      container.innerHTML = `<p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px;">This prompt doesn't have bracketed variables. You can edit the text directly below.</p>`;
      this.elements.modalPromptOutput.innerText = prompt.prompt_text;
      return;
    }

    // Store state of replaced variables
    const currentValues = {};

    placeholders.forEach((item, index) => {
      currentValues[item.full] = item.content;

      const group = document.createElement('div');
      group.className = 'var-input-group';
      group.innerHTML = `
        <label>Custom Field #${index + 1}:</label>
        <input type="text" class="var-input" data-placeholder="${this.escapeHtml(item.full)}" value="${this.escapeHtml(item.content)}" />
      `;

      const input = group.querySelector('input');
      input.addEventListener('input', () => {
        currentValues[item.full] = input.value;
        this.updatePersonalizedPrompt(prompt.prompt_text, currentValues);
      });

      container.appendChild(group);
    });

    this.updatePersonalizedPrompt(prompt.prompt_text, currentValues);
  },

  /**
   * Live update the personalized output prompt text
   */
  updatePersonalizedPrompt(originalText, currentValues) {
    let customized = originalText;
    for (const [key, val] of Object.entries(currentValues)) {
      customized = customized.split(key).join(val);
    }
    this.elements.modalPromptOutput.innerText = customized;
  },

  /**
   * Render parameters breakdown
   */
  renderParamsGrid(prompt) {
    const settings = prompt.settings_info || {};
    const items = [
      { label: 'Aspect Ratio', val: prompt.aspect_ratio || settings.aspectRatio || '4:5' },
      { label: 'Model Version', val: settings.version || prompt.model || 'v 6.1' },
      { label: 'Camera / Lens', val: settings.camera || '85mm Portrait Lens, f/1.8' },
      { label: 'Lighting Style', val: settings.lighting || 'Natural Diffused Studio Light' },
      { label: 'Stylize / CFG', val: settings.stylize ? `--s ${settings.stylize}` : (settings.guidance ? `Guidance: ${settings.guidance}` : 'Default') }
    ];

    this.elements.modalParamsGrid.innerHTML = items.map(i => `
      <div class="param-item">
        <div class="param-label">${this.escapeHtml(i.label)}</div>
        <div class="param-value">${this.escapeHtml(i.val)}</div>
      </div>
    `).join('');
  },

  /**
   * Open Supabase Connection Modal
   */
  openDbModal() {
    this.elements.supabaseUrlInput.value = window.SUPABASE_CONFIG.getUrl() || '';
    this.elements.supabaseKeyInput.value = window.SUPABASE_CONFIG.getAnonKey() || '';
    this.elements.dbStatusMsg.textContent = '';
    this.elements.dbModalBackdrop.classList.add('active');
  },

  closeDbModal() {
    this.elements.dbModalBackdrop.classList.remove('active');
  },

  async testDbConnection() {
    const url = this.elements.supabaseUrlInput.value.trim();
    const key = this.elements.supabaseKeyInput.value.trim();

    if (!url || !key) {
      this.elements.dbStatusMsg.innerHTML = '<span style="color: var(--danger)">Please enter both URL and Anon Key.</span>';
      return;
    }

    // Temporarily save to test
    window.SUPABASE_CONFIG.saveCredentials(url, key);
    window.dbService.initClient();

    this.elements.dbStatusMsg.innerHTML = '<span style="color: var(--text-accent)">Testing connection...</span>';
    const result = await window.dbService.testConnection();

    if (result.success) {
      this.elements.dbStatusMsg.innerHTML = `<span style="color: var(--success)">✅ ${result.message}</span>`;
      this.checkDatabaseStatus();
    } else {
      this.elements.dbStatusMsg.innerHTML = `<span style="color: var(--danger)">❌ ${result.message}</span>`;
    }
  },

  async saveDbCredentials() {
    const url = this.elements.supabaseUrlInput.value.trim();
    const key = this.elements.supabaseKeyInput.value.trim();

    if (!url || !key) {
      this.showToast('Please enter both Supabase URL and Key', true);
      return;
    }

    window.SUPABASE_CONFIG.saveCredentials(url, key);
    window.dbService.initClient();
    this.showToast('Supabase settings saved! Reloading prompts...');
    this.closeDbModal();
    this.checkDatabaseStatus();
    await this.fetchPrompts();
  },

  /**
   * Floating Toast Notification
   */
  showToast(message, isError = false) {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${isError ? 'toast-error' : 'toast-success'}`;
    toast.innerHTML = `
      <span class="toast-icon">${isError ? '⚠️' : '✓'}</span>
      <span>${this.escapeHtml(message)}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px) scale(0.95)';
      setTimeout(() => toast.remove(), 250);
    }, 2800);
  },

  /**
   * Helper: Escape HTML
   */
  escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
};

window.App = App;

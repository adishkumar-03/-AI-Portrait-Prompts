/**
 * AI Prompt Website - Admin Dashboard Controller
 * Handles Admin authentication, uploading new prompts with image storage,
 * editing, deletion, and Supabase database settings.
 */

document.addEventListener('DOMContentLoaded', () => {
  AdminApp.init();
});

const AdminApp = {
  currentUser: null,
  prompts: [],
  editingPromptId: null,
  selectedImageFile: null,

  // DOM Elements
  elements: {
    loginGate: document.getElementById('loginGate'),
    adminDashboard: document.getElementById('adminDashboard'),
    loginForm: document.getElementById('loginForm'),
    loginEmail: document.getElementById('loginEmail'),
    loginPassword: document.getElementById('loginPassword'),
    loginErrorMsg: document.getElementById('loginErrorMsg'),
    btnLogout: document.getElementById('btnLogout'),
    adminUserEmail: document.getElementById('adminUserEmail'),

    // Nav Tabs
    navTabs: document.querySelectorAll('.admin-nav-tab'),
    tabPanels: document.querySelectorAll('.admin-tab-panel'),

    // Stats
    statTotalPrompts: document.getElementById('statTotalPrompts'),
    statTotalCopies: document.getElementById('statTotalCopies'),
    statTopCategory: document.getElementById('statTopCategory'),
    statDbStatus: document.getElementById('statDbStatus'),

    // Form
    promptForm: document.getElementById('promptForm'),
    formTitleText: document.getElementById('formTitleText'),
    cancelEditBtn: document.getElementById('cancelEditBtn'),
    submitBtnText: document.getElementById('submitBtnText'),
    inputTitle: document.getElementById('inputTitle'),
    inputModel: document.getElementById('inputModel'),
    inputCategory: document.getElementById('inputCategory'),
    inputAspectRatio: document.getElementById('inputAspectRatio'),
    inputPromptText: document.getElementById('inputPromptText'),
    inputNegativePrompt: document.getElementById('inputNegativePrompt'),
    inputTips: document.getElementById('inputTips'),
    inputImageUrl: document.getElementById('inputImageUrl'),
    inputCamera: document.getElementById('inputCamera'),
    inputLighting: document.getElementById('inputLighting'),
    inputStylize: document.getElementById('inputStylize'),

    // Image Upload Dropzone
    dropzone: document.getElementById('dropzone'),
    fileInput: document.getElementById('fileInput'),
    imagePreviewBox: document.getElementById('imagePreviewBox'),
    previewImg: document.getElementById('previewImg'),
    removeImgBtn: document.getElementById('removeImgBtn'),

    // Placeholder Helper Buttons
    placeholderChips: document.querySelectorAll('.ph-btn'),

    // Manage Table
    promptsTableBody: document.getElementById('promptsTableBody'),

    // Settings
    adminDbUrl: document.getElementById('adminDbUrl'),
    adminDbKey: document.getElementById('adminDbKey'),
    btnAdminTestDb: document.getElementById('btnAdminTestDb'),
    btnAdminSaveDb: document.getElementById('btnAdminSaveDb'),
    adminDbStatus: document.getElementById('adminDbStatus')
  },

  /**
   * Initialize Admin App
   */
  async init() {
    this.setupEventListeners();
    await this.checkAuth();
  },

  /**
   * Verify User Session
   */
  async checkAuth() {
    try {
      this.currentUser = await window.dbService.getUser();
    } catch (e) {
      this.currentUser = null;
    }

    if (this.currentUser) {
      this.showDashboard();
    } else {
      this.showLogin();
    }
  },

  showLogin() {
    this.elements.loginGate.style.display = 'flex';
    this.elements.adminDashboard.style.display = 'none';
    if (this.elements.btnLogout) this.elements.btnLogout.style.display = 'none';
  },

  async showDashboard() {
    this.elements.loginGate.style.display = 'none';
    this.elements.adminDashboard.style.display = 'block';
    if (this.elements.btnLogout) this.elements.btnLogout.style.display = 'inline-flex';
    this.elements.adminUserEmail.textContent = this.currentUser?.email || 'Site Admin';
    await this.loadPrompts();
    this.loadSettings();
  },

  /**
   * Setup Event Handlers
   */
  setupEventListeners() {
    // Login form submission
    this.elements.loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = this.elements.loginEmail.value.trim();
      const password = this.elements.loginPassword.value.trim();
      this.elements.loginErrorMsg.textContent = '';

      try {
        this.currentUser = await window.dbService.signIn(email, password);
        this.showToast('Login successful!');
        this.showDashboard();
      } catch (err) {
        this.elements.loginErrorMsg.textContent = err.message || 'Login failed. Please check credentials.';
      }
    });

    // Logout button
    this.elements.btnLogout.addEventListener('click', async () => {
      await window.dbService.signOut();
      this.currentUser = null;
      this.showToast('Logged out');
      this.showLogin();
    });

    // Admin Navigation Tabs
    this.elements.navTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.panel;
        this.elements.navTabs.forEach(t => t.classList.remove('active'));
        this.elements.tabPanels.forEach(p => p.style.display = 'none');

        tab.classList.add('active');
        const targetPanel = document.getElementById(target);
        if (targetPanel) targetPanel.style.display = 'block';
      });
    });

    // Placeholder Helper Buttons (Click to insert into prompt textarea)
    this.elements.placeholderChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const textToInsert = chip.dataset.insert;
        this.insertAtCursor(this.elements.inputPromptText, textToInsert);
      });
    });

    // Drag and drop image upload handlers
    const dropzone = this.elements.dropzone;
    dropzone.addEventListener('click', () => this.elements.fileInput.click());

    ['dragenter', 'dragover'].forEach(name => {
      dropzone.addEventListener(name, (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(name => {
      dropzone.addEventListener(name, (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
      });
    });

    dropzone.addEventListener('drop', (e) => {
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        this.handleImageSelected(e.dataTransfer.files[0]);
      }
    });

    this.elements.fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        this.handleImageSelected(e.target.files[0]);
      }
    });

    this.elements.removeImgBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.clearImagePreview();
    });

    // Direct Image URL preview if pasted
    this.elements.inputImageUrl.addEventListener('input', (e) => {
      const url = e.target.value.trim();
      if (url && !this.selectedImageFile) {
        this.setImagePreview(url);
      }
    });

    // Form submit
    this.elements.promptForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleFormSubmit();
    });

    // Cancel edit
    this.elements.cancelEditBtn.addEventListener('click', () => {
      this.resetForm();
    });

    // Settings actions
    this.elements.btnAdminTestDb.addEventListener('click', () => this.testSettingsConnection());
    this.elements.btnAdminSaveDb.addEventListener('click', () => this.saveSettings());
  },

  /**
   * Insert snippet at cursor in textarea
   */
  insertAtCursor(textarea, text) {
    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const current = textarea.value;

    textarea.value = current.substring(0, startPos) + text + current.substring(endPos);
    textarea.focus();
    textarea.selectionStart = startPos + text.length;
    textarea.selectionEnd = startPos + text.length;
  },

  /**
   * Handle selected image file
   */
  handleImageSelected(file) {
    if (!file.type.startsWith('image/')) {
      this.showToast('Please select a valid image file', true);
      return;
    }
    this.selectedImageFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  },

  setImagePreview(url) {
    this.elements.previewImg.src = url;
    this.elements.imagePreviewBox.style.display = 'block';
  },

  clearImagePreview() {
    this.selectedImageFile = null;
    this.elements.fileInput.value = '';
    this.elements.previewImg.src = '';
    this.elements.imagePreviewBox.style.display = 'none';
  },

  /**
   * Load Prompts and compute stats
   */
  async loadPrompts() {
    this.prompts = await window.dbService.getPrompts();
    this.renderStats();
    this.renderPromptsTable();
  },

  renderStats() {
    const total = this.prompts.length;
    const totalCopies = this.prompts.reduce((acc, p) => acc + (p.copy_count || 0), 0);

    // Compute top category
    const catMap = {};
    this.prompts.forEach(p => {
      catMap[p.category] = (catMap[p.category] || 0) + 1;
    });
    let topCat = 'N/A';
    let max = 0;
    for (const [k, v] of Object.entries(catMap)) {
      if (v > max) { max = v; topCat = k; }
    }

    this.elements.statTotalPrompts.textContent = total;
    this.elements.statTotalCopies.textContent = totalCopies.toLocaleString();
    this.elements.statTopCategory.textContent = topCat;

    const isConnected = window.SUPABASE_CONFIG.isConfigured();
    this.elements.statDbStatus.textContent = isConnected ? 'Supabase' : 'Demo Local';
  },

  /**
   * Render Prompts Table for Management
   */
  renderPromptsTable() {
    if (this.prompts.length === 0) {
      this.elements.promptsTableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 30px;">
            No prompts found. Create your first one above!
          </td>
        </tr>
      `;
      return;
    }

    this.elements.promptsTableBody.innerHTML = this.prompts.map(p => `
      <tr>
        <td style="width: 60px;">
          <img class="table-thumb" src="${this.escapeHtml(p.image_url)}" alt="${this.escapeHtml(p.title)}" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'40\\' height=\\'40\\'><rect fill=\\'%23333\\' width=\\'40\\' height=\\'40\\'/></svg>'">
        </td>
        <td>
          <div class="table-prompt-meta">
            <span class="table-prompt-title">${this.escapeHtml(p.title)}</span>
            <span class="table-prompt-sub">${this.escapeHtml(p.aspect_ratio || '4:5')} • Added ${new Date(p.created_at || Date.now()).toLocaleDateString()}</span>
          </div>
        </td>
        <td>
          <span class="badge-model">${this.escapeHtml(p.model || 'Midjourney')}</span>
        </td>
        <td>
          <span class="badge-category">${this.escapeHtml(p.category || 'Curated')}</span>
        </td>
        <td>
          <strong>${(p.copy_count || 0).toLocaleString()}</strong>
        </td>
        <td>
          <div class="table-actions">
            <button class="btn btn-outline btn-sm" onclick="AdminApp.editPrompt('${p.id}')">Edit</button>
            <button class="btn btn-outline btn-sm" style="color: var(--danger); border-color: rgba(239,68,68,0.3);" onclick="AdminApp.deletePrompt('${p.id}')">Delete</button>
          </div>
        </td>
      </tr>
    `).join('');
  },

  /**
   * Handle Form Submission (Create or Update)
   */
  async handleFormSubmit() {
    const title = this.elements.inputTitle.value.trim();
    const promptText = this.elements.inputPromptText.value.trim();
    const model = this.elements.inputModel.value;
    const category = this.elements.inputCategory.value;
    const aspectRatio = this.elements.inputAspectRatio.value;
    const negativePrompt = this.elements.inputNegativePrompt.value.trim();
    const tips = this.elements.inputTips.value.trim();
    const directImageUrl = this.elements.inputImageUrl.value.trim();
    const camera = this.elements.inputCamera.value.trim();
    const lighting = this.elements.inputLighting.value.trim();
    const stylize = this.elements.inputStylize.value.trim();

    if (!title || !promptText) {
      this.showToast('Please provide both a Title and Prompt text.', true);
      return;
    }

    let finalImageUrl = directImageUrl;

    // Upload image if file was selected
    if (this.selectedImageFile) {
      try {
        this.showToast('Uploading image...');
        finalImageUrl = await window.dbService.uploadImage(this.selectedImageFile);
      } catch (err) {
        this.showToast(err.message || 'Image upload failed.', true);
        return;
      }
    }

    if (!finalImageUrl) {
      this.showToast('Please provide an image file or direct image URL.', true);
      return;
    }

    const payload = {
      title,
      prompt_text: promptText,
      model,
      category,
      aspect_ratio: aspectRatio,
      image_url: finalImageUrl,
      negative_prompt: negativePrompt,
      tips,
      settings_info: {
        aspectRatio,
        camera: camera || undefined,
        lighting: lighting || undefined,
        stylize: stylize || undefined
      }
    };

    try {
      if (this.editingPromptId) {
        await window.dbService.updatePrompt(this.editingPromptId, payload);
        this.showToast('Prompt updated successfully! ✨');
      } else {
        await window.dbService.createPrompt(payload);
        this.showToast('New prompt published successfully! 🚀');
      }

      this.resetForm();
      await this.loadPrompts();

      // Switch to Manage tab to see result
      const manageTab = document.querySelector('[data-panel="tabManage"]');
      if (manageTab) manageTab.click();
    } catch (err) {
      console.error(err);
      this.showToast(err.message || 'Failed to save prompt.', true);
    }
  },

  /**
   * Edit existing prompt
   */
  editPrompt(id) {
    const prompt = this.prompts.find(p => p.id === id);
    if (!prompt) return;

    this.editingPromptId = id;
    this.elements.formTitleText.textContent = `Edit Prompt: "${prompt.title}"`;
    this.elements.submitBtnText.textContent = 'Update Prompt';
    this.elements.cancelEditBtn.style.display = 'inline-block';

    this.elements.inputTitle.value = prompt.title || '';
    this.elements.inputModel.value = prompt.model || 'Midjourney v6.1';
    this.elements.inputCategory.value = prompt.category || 'Cinematic & Moody';
    this.elements.inputAspectRatio.value = prompt.aspect_ratio || '4:5';
    this.elements.inputPromptText.value = prompt.prompt_text || '';
    this.elements.inputNegativePrompt.value = prompt.negative_prompt || '';
    this.elements.inputTips.value = prompt.tips || '';
    this.elements.inputImageUrl.value = prompt.image_url || '';

    const settings = prompt.settings_info || {};
    this.elements.inputCamera.value = settings.camera || '';
    this.elements.inputLighting.value = settings.lighting || '';
    this.elements.inputStylize.value = settings.stylize || '';

    if (prompt.image_url) {
      this.setImagePreview(prompt.image_url);
    }

    // Switch to Upload tab
    const uploadTab = document.querySelector('[data-panel="tabUpload"]');
    if (uploadTab) uploadTab.click();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  /**
   * Delete prompt
   */
  async deletePrompt(id) {
    const prompt = this.prompts.find(p => p.id === id);
    if (!prompt) return;

    if (!confirm(`Are you sure you want to delete "${prompt.title}"?`)) {
      return;
    }

    try {
      await window.dbService.deletePrompt(id);
      this.showToast('Prompt deleted.');
      await this.loadPrompts();
    } catch (err) {
      this.showToast(err.message || 'Failed to delete prompt.', true);
    }
  },

  resetForm() {
    this.editingPromptId = null;
    this.elements.promptForm.reset();
    this.elements.formTitleText.textContent = 'Create & Publish New Prompt';
    this.elements.submitBtnText.textContent = 'Publish Prompt';
    this.elements.cancelEditBtn.style.display = 'none';
    this.clearImagePreview();
  },

  /**
   * Settings management
   */
  loadSettings() {
    this.elements.adminDbUrl.value = window.SUPABASE_CONFIG.getUrl() || '';
    this.elements.adminDbKey.value = window.SUPABASE_CONFIG.getAnonKey() || '';
  },

  async testSettingsConnection() {
    const url = this.elements.adminDbUrl.value.trim();
    const key = this.elements.adminDbKey.value.trim();

    if (!url || !key) {
      this.elements.adminDbStatus.innerHTML = '<span style="color: var(--danger)">Please enter URL and Anon Key.</span>';
      return;
    }

    window.SUPABASE_CONFIG.saveCredentials(url, key);
    window.dbService.initClient();

    this.elements.adminDbStatus.innerHTML = '<span style="color: var(--text-accent)">Testing connection...</span>';
    const result = await window.dbService.testConnection();

    if (result.success) {
      this.elements.adminDbStatus.innerHTML = `<span style="color: var(--success)">✅ ${result.message}</span>`;
    } else {
      this.elements.adminDbStatus.innerHTML = `<span style="color: var(--danger)">❌ ${result.message}</span>`;
    }
    this.renderStats();
  },

  saveSettings() {
    const url = this.elements.adminDbUrl.value.trim();
    const key = this.elements.adminDbKey.value.trim();

    window.SUPABASE_CONFIG.saveCredentials(url, key);
    window.dbService.initClient();
    this.showToast('Database credentials updated! Reloading prompts...');
    this.loadPrompts();
  },

  /**
   * Toast notification
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

  escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
};

window.AdminApp = AdminApp;

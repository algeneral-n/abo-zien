/**
 * RARE 4N - Client Portal Main Application (New Version)
 * ✅ مع RARE Character والثيمات واللغات والـ Smart Agent
 */

import { CONFIG } from './config.js?v=5';
import { VoiceAgentService } from './services/VoiceAgentService.js?v=5';
import { BuilderIntegrationService } from './services/BuilderIntegrationService.js?v=5';
import { LibrariesPage } from './pages/LibrariesPage.js?v=5';
import { DashboardPage } from './pages/DashboardPage.js?v=5';
import { AuthPage } from './pages/AuthPage.js?v=31';
import { PreviewPage } from './pages/PreviewPage.js?v=5';
import { PaymentsPage } from './pages/PaymentsPage.js?v=5';
import RARECharacter from './components/RARECharacter.js?v=5';
import ThemeManager from './themes/themes.js?v=5';
import LanguageManager from './i18n/languages.js?v=5';
import SmartPortalAgent from './services/SmartPortalAgent.js?v=5';
import { PortalAgent } from './services/PortalAgent.js?v=5';
import './matrix-background.js?v=31';

class ClientPortalApp {
    constructor() {
        this.config = CONFIG;
        this.socket = null;
        this.voiceAgent = null;
        this.builderIntegration = null;
        this.librariesPage = null;
        this.dashboardPage = null;
        this.authPage = null;
        this.previewPage = null;
        this.paymentsPage = null;
        this.currentPage = 'home';
        this.rareCharacter = null;
        this.rareCharacterFloat = null;
        this.rareCharacterHero = null;
        this.themeManager = new ThemeManager();
        this.languageManager = new LanguageManager();
        this.smartAgent = null;
        this.portalAgent = null;
    }

    async init() {
        console.log('Initializing RARE 4N Client Portal...');
        
        // ✅ Initialize AuthPage FIRST (before auth check)
        this.authPage = new AuthPage(this.config.api.baseUrl);
        
        // Check authentication
        const token = localStorage.getItem('auth_token');
        if (!token) {
            this.showAuthPage();
            return;
        }
        
        // Verify token
        const isValid = await this.verifyAuth(token);
        if (!isValid) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            this.showAuthPage();
            return;
        }
        
        // 1. Initialize Theme Manager
        this.themeManager.init();
        this.setupThemeSelector();
        
        // 2. Initialize Language Manager
        this.languageManager.init();
        this.setupLanguageSelector();
        
        // 3. Initialize Socket.IO
        await this.initSocket();
        
        // 4. Initialize RARE Characters
        this.initRARECharacters();
        
        // 5. Initialize Pages
        this.librariesPage = new LibrariesPage(this.config.api.baseUrl);
        this.previewPage = new PreviewPage({ themeManager: this.themeManager });
        this.paymentsPage = new PaymentsPage({ apiBaseUrl: this.config.api.baseUrl });
        this.dashboardPage = new DashboardPage(this.config.api.baseUrl);
        
        // 6. Initialize Smart Portal Agent
        this.initSmartAgent();
        
        // 6. Initialize Voice Agent
        await this.initVoiceAgent();
        
        // 7. Initialize Builder Integration
        await this.initBuilderIntegration();
        
        // 8. Initialize Libraries Page
        this.initLibrariesPage();
        
        // 9. Setup Navigation
        this.setupNavigation();
        
        // 10. Setup Settings Page
        this.setupSettingsPage();
        
        // 11. Load user data
        this.loadUserData();
        
        // 12. Load Dashboard on home page IMMEDIATELY
        const homePage = document.getElementById('page-home');
        if (homePage && this.dashboardPage) {
            homePage.innerHTML = this.dashboardPage.render();
            this.dashboardPage.setupEventListeners();
            this.dashboardPage.loadCategories();
        }
        
        // 13. Setup initial page display
        this.showPage('home');
        
        console.log('✅ Client Portal initialized');
    }
    
    async verifyAuth(token) {
        try {
            const response = await fetch(`${this.config.api.baseUrl}/api/auth/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token }),
            });
            const data = await response.json();
            return data.success === true;
        } catch (error) {
            console.error('Auth verification failed:', error);
            return false;
        }
    }
    
    showAuthPage() {
        // Hide navigation and sidebar
        const nav = document.querySelector('.main-nav');
        const sidebar = document.querySelector('.sidebar');
        if (nav) nav.style.display = 'none';
        if (sidebar) sidebar.style.display = 'none';
        
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            // Initialize authPage if not already initialized
            if (!this.authPage) {
                this.authPage = new AuthPage(this.config.api.baseUrl);
            }
            
            // Clear main content and show auth page
            mainContent.innerHTML = '';
            mainContent.style.padding = '0';
            mainContent.style.display = 'flex';
            mainContent.style.alignItems = 'center';
            mainContent.style.justifyContent = 'center';
            mainContent.style.minHeight = '100vh';
            
            const authHTML = this.authPage.render();
            mainContent.innerHTML = authHTML;
            
            // Setup event listeners
            setTimeout(() => {
                this.authPage.setupEventListeners();
            }, 100);
            
            // Listen for auth success
            window.addEventListener('auth:success', () => {
                location.reload();
            });
        }
    }
    
    loadUserData() {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                
                // Update profile in nav
                const profileName = document.getElementById('profileName');
                const profileEmail = document.getElementById('profileEmail');
                const profileInitial = document.getElementById('profileInitial');
                
                if (profileName) {
                    profileName.textContent = user.name || 'User';
                }
                if (profileEmail) {
                    profileEmail.textContent = user.email || 'user@example.com';
                }
                if (profileInitial) {
                    profileInitial.textContent = (user.name || user.email || 'U').charAt(0).toUpperCase();
                }
            } catch (error) {
                console.error('Failed to parse user data:', error);
            }
        } else {
            // Show Guest
            const profileName = document.getElementById('profileName');
            const profileEmail = document.getElementById('profileEmail');
            const profileInitial = document.getElementById('profileInitial');
            
            if (profileName) profileName.textContent = 'Guest';
            if (profileEmail) profileEmail.textContent = 'guest@example.com';
            if (profileInitial) profileInitial.textContent = 'G';
        }
    }

    initRARECharacters() {
        // Initialize RARE Character Hero (Large) - Image is already in HTML
        const heroImage = document.getElementById('rareHeroImage');
        if (heroImage) {
            heroImage.onerror = () => {
                // Show fallback
                const fallback = document.getElementById('rareHeroFallback');
                if (fallback) {
                    fallback.style.display = 'flex';
                    heroImage.style.display = 'none';
                }
            };
            
            // Try to load image
            heroImage.src = heroImage.src || 'assets/character/rare-hero.png';
        }

        // Initialize floating RARE Character
        const floatContainer = document.getElementById('rareCharacterFloat');
        if (floatContainer) {
            this.rareCharacterFloat = new RARECharacter(floatContainer, {
                size: 80,
                animated: true,
                theme: this.themeManager.currentTheme,
            });
        }

        // Update character theme when theme changes
        window.addEventListener('theme:changed', (e) => {
            if (this.rareCharacterFloat) {
                this.rareCharacterFloat.setTheme(e.detail.theme);
            }
            
            // Update hero image glow based on theme
            const heroImage = document.getElementById('rareHeroImage');
            if (heroImage) {
                const theme = this.themeManager.getTheme(e.detail.theme);
                heroImage.style.filter = `drop-shadow(0 0 30px ${theme.colors.primary})`;
            }
        });
    }

    initSmartAgent() {
        this.smartAgent = new SmartPortalAgent(this.socket, this.config);
        this.portalAgent = new PortalAgent(this.socket, this.config);
        this.portalAgent.loadFavorites();
        
        // Listen to agent actions
        window.addEventListener('agent:action', (e) => {
            this.handleAgentAction(e.detail);
        });

        // Listen to agent notifications
        window.addEventListener('agent:notification', (e) => {
            this.showNotification(e.detail.message, e.detail.type);
        });
    }

    async initSocket() {
        this.socket = io(this.config.api.socketUrl + '/client-portal', {
            transports: ['websocket'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });

        this.socket.on('connect', () => {
            console.log('✅ Connected to backend');
            this.updateStatus('builder', true);
        });

        this.socket.on('disconnect', () => {
            console.log('❌ Disconnected from backend');
            this.updateStatus('builder', false);
        });

        // Listen for agent responses
        this.socket.on('agent:response', (data) => {
            this.onAgentResponse(data);
        });

        // Listen for build updates
        this.socket.on('client:build:completed', (data) => {
            this.onBuildCompleted(data);
        });

        // Listen for Portal Agent events
        this.socket.on('agent:payment:created', (data) => {
            this.handlePaymentCreated(data);
        });

        this.socket.on('agent:favorite:added', (data) => {
            if (this.portalAgent) {
                this.portalAgent.addToFavorites(data.type, data.item);
            }
        });

        // Listen for payment success
        this.socket.on('payment:succeeded', (data) => {
            if (this.portalAgent) {
                this.portalAgent.handlePaymentSuccess(data);
            }
        });

        // Listen for build progress
        this.socket.on('client:build:progress', (data) => {
            if (this.portalAgent) {
                this.portalAgent.handleBuildProgress(data);
            }
        });
    }

    handlePaymentCreated(data) {
        // Show payment modal or redirect
        console.log('Payment created:', data);
        if (data.paymentUrl) {
            window.open(data.paymentUrl, '_blank');
        }
    }

    async initVoiceAgent() {
        try {
            this.voiceAgent = new VoiceAgentService(this.config);
            await this.voiceAgent.initialize(this.socket);
            
            // ✅ Wait for ElevenLabs widget to load (non-blocking)
            this.waitForElevenLabsWidget()
                .then(() => {
                    console.log('✅ ElevenLabs widget ready');
                    this.updateStatus('voice', true);
                    
                    if (this.config.ui.voiceFirst) {
                        setTimeout(() => {
                            this.voiceAgent.startListening();
                        }, 1000);
                    }
                })
                .catch((error) => {
                    console.warn('⚠️ ElevenLabs widget loading warning:', error.message);
                    // Don't fail completely, widget might still work
                    this.updateStatus('voice', true);
                    
                    // Show warning but don't block
                    const errorDiv = document.getElementById('voiceWidgetError');
                    if (errorDiv) {
                        errorDiv.style.display = 'block';
                        errorDiv.querySelector('p').textContent = '⚠️ Voice Agent قد يحتاج إلى وقت إضافي للتحميل...';
                    }
                });
        } catch (error) {
            console.error('❌ Voice Agent initialization failed:', error);
            this.updateStatus('voice', false);
            const errorDiv = document.getElementById('voiceWidgetError');
            if (errorDiv) {
                errorDiv.style.display = 'block';
            }
        }
    }
    
    async waitForElevenLabsWidget() {
        return new Promise((resolve, reject) => {
            const maxAttempts = 30; // زيادة المحاولات إلى 30 (15 ثانية)
            let attempts = 0;
            
            // ✅ Check if script is loaded first
            const checkScript = () => {
                if (document.querySelector('script[src*="elevenlabs/convai-widget"]')) {
                    console.log('✅ ElevenLabs script tag found');
                    checkWidget();
                } else {
                    attempts++;
                    if (attempts >= 10) {
                        console.warn('⚠️ ElevenLabs script not found in DOM');
                        reject(new Error('Script not loaded'));
                    } else {
                        setTimeout(checkScript, 200);
                    }
                }
            };
            
            const checkWidget = () => {
                attempts++;
                const widget = document.querySelector('elevenlabs-convai');
                
                if (widget) {
                    // ✅ Check if widget is defined (custom element registered)
                    if (customElements.get('elevenlabs-convai')) {
                        console.log('✅ ElevenLabs widget custom element registered');
                        // Wait a bit more for shadowRoot
                        setTimeout(() => {
                            if (widget.shadowRoot) {
                                console.log('✅ ElevenLabs widget shadowRoot available');
                            }
                            resolve();
                        }, 500);
                    } else {
                        // Widget element exists but custom element not registered yet
                        if (attempts >= maxAttempts) {
                            console.warn('⚠️ ElevenLabs widget custom element not registered after 15 seconds');
                            reject(new Error('Widget custom element timeout'));
                        } else {
                            setTimeout(checkWidget, 500);
                        }
                    }
                } else if (attempts >= maxAttempts) {
                    console.warn('⚠️ ElevenLabs widget element not found after 15 seconds');
                    reject(new Error('Widget element timeout'));
                } else {
                    setTimeout(checkWidget, 500);
                }
            };
            
            // Start checking
            checkScript();
        });
    }

    async initBuilderIntegration() {
        this.builderIntegration = new BuilderIntegrationService(this.config, this.socket);
        this.builderIntegration.initialize();
    }

    initLibrariesPage() {
        this.librariesPage = new LibrariesPage(this.config.api.baseUrl);
        this.previewPage = new PreviewPage({ themeManager: this.themeManager });
        this.paymentsPage = new PaymentsPage({ apiBaseUrl: this.config.api.baseUrl });
        
        document.addEventListener('page:show', (e) => {
            if (e.detail.page === 'libraries') {
                // Load libraries when page is shown
                setTimeout(() => {
                    this.loadLibraries();
                }, 100);
            }
        });
        
        // Listen for library item selection
        window.addEventListener('library:item:selected', (e) => {
            const { item, type } = e.detail;
            console.log('📦 Library item selected:', item);
            
            // Notify agent
            if (this.smartAgent) {
                this.smartAgent.processMessage(`اخترت ${item.nameAr || item.name} من ${type === 'template' ? 'التطبيقات' : type === 'system' ? 'الأنظمة' : 'الثيمات'}`);
            }
        });
    }
    
    async loadLibraries() {
        if (this.librariesPage) {
            const result = await this.librariesPage.loadLibraries('all');
            if (result.success) {
                console.log('✅ Libraries loaded:', result.items);
            } else {
                console.error('❌ Failed to load libraries:', result.error);
            }
        }
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                this.showPage(page);
            });
        });
        
        // ✅ Setup button click handlers using event delegation
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.action-btn');
            if (btn) {
                const action = btn.getAttribute('data-action');
                if (action) {
                    e.preventDefault();
                    this.handleButtonAction(action);
                }
            }
        });
    
        // External navigation events (Preview/Agent/etc)
        window.addEventListener('portal:navigate', (ev) => {
            const page = ev?.detail?.page;
            if (page) this.showPage(page);
        });

        window.addEventListener('preview:open', (ev) => {
            const { item, type } = ev?.detail || {};
            if (item && this.previewPage) this.previewPage.setSelectedItem(item, type);
            this.showPage('preview');
        });
}
    
    handleButtonAction(action) {
        console.log('🔘 Button action:', action);
        switch (action) {
            case 'showNewProject':
                this.showPage('projects');
                if (this.portalAgent) {
                    this.portalAgent.understandIntent('أريد إنشاء مشروع جديد');
                }
                break;
            case 'showLibraries':
                this.showPage('libraries');
                setTimeout(() => {
                    this.loadLibraries();
                }, 100);
                break;
            case 'showProjects':
                this.showPage('projects');
                break;
            case 'showDashboard':
                this.showPage('home');
                break;
            default:
                this.handleAgentAction({ action });
        }
    }

    showPage(pageName) {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        const targetPage = document.getElementById(`page-${pageName}`);
        if (targetPage) {
            targetPage.classList.add('active');
        }
        
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-page') === pageName) {
                link.classList.add('active');
            }
        });
        
        this.currentPage = pageName;
        window.dispatchEvent(new CustomEvent('page:show', { detail: { page: pageName } }));
        
        // Load page-specific content
        if (pageName === 'home' || pageName === 'dashboard') {
            setTimeout(() => {
                if (this.dashboardPage) {
                    const container = document.getElementById('page-home');
                    if (container) {
                        container.innerHTML = this.dashboardPage.render();
                        this.dashboardPage.setupEventListeners();
                        this.dashboardPage.loadCategories();
                    }
                }
            }, 100);
        } else if (pageName === 'libraries') {
            setTimeout(() => {
                this.loadLibraries();
            }, 100);
        } else if (pageName === 'preview') {
            setTimeout(() => {
                this.loadPreviewStudio();
            }, 100);
        } else if (pageName === 'payments') {
            setTimeout(() => {
                this.loadPayments();
            }, 100);
        } else if (pageName === 'projects') {
            this.loadProjects();
        } else if (pageName === 'settings') {
            this.setupSettingsPage();
        }
    }
    
    loadProjects() {
        const content = document.getElementById('projectsContent');
        if (content) {
            content.innerHTML = `
                <div class="projects-container">
                    <div class="projects-header glass">
                        <h2 data-i18n="myProjects">مشاريعي</h2>
                        <p data-i18n="noProjects">لا توجد مشاريع حالياً. ابدأ مشروعاً جديداً!</p>
                    </div>
                    <div class="projects-grid">
                        <!-- Projects will be loaded here -->
                    </div>
                </div>
            `;
        }
    }

    setupThemeSelector() {
        const themeSelect = document.getElementById('themeSelect');
        if (!themeSelect) {
            console.warn('Theme selector not found');
            return;
        }
        
        // Set current value
        themeSelect.value = this.themeManager.currentTheme;
        
        // Add change event listener
        themeSelect.addEventListener('change', (e) => {
            const themeName = e.target.value;
            console.log('Changing theme to:', themeName);
            this.themeManager.applyTheme(themeName);
            
            // Update settings selector if exists
            const settingsSelect = document.getElementById('settingsThemeSelect');
            if (settingsSelect) {
                settingsSelect.value = themeName;
            }
        });
        
        console.log('Theme selector initialized');
    }

    setupLanguageSelector() {
        const langSelect = document.getElementById('languageSelect');
        if (!langSelect) {
            console.warn('Language selector not found');
            return;
        }
        
        // Set current value
        langSelect.value = this.languageManager.currentLanguage;
        
        // Add change event listener
        langSelect.addEventListener('change', (e) => {
            const langCode = e.target.value;
            console.log('Changing language to:', langCode);
            this.languageManager.applyLanguage(langCode);
            
            // Update settings selector if exists
            const settingsSelect = document.getElementById('settingsLanguageSelect');
            if (settingsSelect) {
                settingsSelect.value = langCode;
            }
        });
        
        console.log('Language selector initialized');
    }

    handleAgentAction(detail) {
        const { action, data } = detail;
        
        switch (action) {
            case 'showNewProject':
            case 'showLibraries':
            case 'showProjects':
                this.showPage(action.replace('show', '').toLowerCase());
                break;
                
            case 'showThemeSelector':
                document.getElementById('themeSelect')?.focus();
                break;
                
            case 'showLanguageSelector':
                document.getElementById('languageSelect')?.focus();
                break;
        }
    }

    async loadLibraries() {
        const content = document.getElementById('librariesContent');
        if (!content) {
            console.error('❌ Libraries content element not found');
            return;
        }
        
        if (!this.librariesPage) {
            console.error('❌ LibrariesPage not initialized');
            return;
        }
        
        // Show loading state
        content.innerHTML = '<div class="libraries-loading"><div class="loading-spinner"></div><p>جاري تحميل المكتبات...</p></div>';
        
        try {
            // Render the page structure
            content.innerHTML = this.librariesPage.render();
            
            // Setup event listeners
            this.librariesPage.setupEventListeners();
            
            // Load libraries data
            const result = await this.librariesPage.loadLibraries('all');
            if (result.success) {
                console.log('✅ Libraries loaded:', result.items);
                this.librariesPage.renderItems('all');
            } else {
                console.error('❌ Failed to load libraries:', result.error);
                content.innerHTML = `<div class="error-message">❌ فشل تحميل المكتبات: ${result.error || 'خطأ غير معروف'}</div>`;
            }
        } catch (error) {
            console.error('❌ Error loading libraries:', error);
            content.innerHTML = `<div class="error-message">❌ خطأ في تحميل المكتبات: ${error.message}</div>`;
        }
    }

    renderLibraries(items) {
        const grid = document.getElementById('librariesGrid');
        if (!grid) return;
        
        grid.innerHTML = items.map(item => 
            this.librariesPage.renderLibraryItem(item)
        ).join('');
    }

    autoEnableVoice() {
        setTimeout(() => {
            if (this.voiceAgent) {
                this.voiceAgent.startListening();
                this.updateStatus('voice', true);
                this.updateStatus('agent', true);
            }
        }, 2000);
    }

    updateStatus(type, enabled) {
        const statusEl = document.getElementById(`${type}Status`);
        if (statusEl) {
            statusEl.className = `status-dot ${enabled ? 'active' : ''}`;
        }
    }

    onAgentResponse(data) {
        console.log('🤖 Agent response:', data);
        
        if (this.voiceAgent && data.text) {
            this.voiceAgent.speak(data.text);
        }
        
        const statusText = document.getElementById('agentStatusText');
        if (statusText) {
            statusText.textContent = data.text.substring(0, 50) + '...';
        }
    }

    onBuildCompleted(data) {
        console.log('✅ Build completed:', data);
        this.showNotification('تم اكتمال بناء مشروعك!', 'success');
        
        if (this.currentPage === 'projects') {
            this.loadProjects();
        }
    }

    showNotification(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
    
    setupSettingsPage() {
        // Theme selector in settings
        const settingsThemeSelect = document.getElementById('settingsThemeSelect');
        if (settingsThemeSelect) {
            settingsThemeSelect.value = this.themeManager.currentTheme;
            settingsThemeSelect.addEventListener('change', (e) => {
                const themeName = e.target.value;
                this.themeManager.applyTheme(themeName);
                // Update nav selector
                const navSelect = document.getElementById('themeSelect');
                if (navSelect) {
                    navSelect.value = themeName;
                }
            });
        }
        
        // Language selector in settings
        const settingsLanguageSelect = document.getElementById('settingsLanguageSelect');
        if (settingsLanguageSelect) {
            settingsLanguageSelect.value = this.languageManager.currentLanguage;
            settingsLanguageSelect.addEventListener('change', (e) => {
                const langCode = e.target.value;
                this.languageManager.applyLanguage(langCode);
                // Update nav selector
                const navSelect = document.getElementById('languageSelect');
                if (navSelect) {
                    navSelect.value = langCode;
                }
            });
        }
        
        // Voice settings
        const voiceAutoStart = document.getElementById('voiceAutoStart');
        if (voiceAutoStart) {
            voiceAutoStart.checked = this.config.ui.voiceFirst || false;
            voiceAutoStart.addEventListener('change', (e) => {
                this.config.ui.voiceFirst = e.target.checked;
                localStorage.setItem('rare_voice_auto', e.target.checked);
            });
        }
        
        // Reset settings button
        const resetBtn = document.getElementById('resetSettingsBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('هل أنت متأكد من إعادة تعيين جميع الإعدادات؟')) {
                    localStorage.clear();
                    location.reload();
                }
            });
        }
        
        console.log('✅ Settings page initialized');
    }


    // ======================
    // Preview Studio / Payments
    // ======================
    loadPreviewStudio() {
        const container = document.getElementById('previewContent');
        if (!container || !this.previewPage) return;
        container.innerHTML = this.previewPage.render();
        this.previewPage.setupEventListeners(() => {
            this.showPage('payments');
        });
    }

    loadPayments() {
        const container = document.getElementById('paymentsContent');
        if (!container || !this.paymentsPage) return;
        container.innerHTML = this.paymentsPage.render();
        this.paymentsPage.setupEventListeners();
    }
}

// ✅ Global functions - Available immediately (before app init)
window.setTheme = (themeName) => {
    if (window.RARE_APP && window.RARE_APP.themeManager) {
        window.RARE_APP.themeManager.applyTheme(themeName);
    } else {
        // Fallback: Store theme preference until app loads
        localStorage.setItem('rare_theme', themeName);
        console.log('Theme preference saved, will apply when app loads');
    }
};

window.setLanguage = (langCode) => {
    if (window.RARE_APP && window.RARE_APP.languageManager) {
        window.RARE_APP.languageManager.applyLanguage(langCode);
    } else {
        // Fallback: Store language preference until app loads
        localStorage.setItem('rare_language', langCode);
        console.log('Language preference saved, will apply when app loads');
    }
};

window.showNewProject = () => {
    if (window.RARE_APP) {
        window.RARE_APP.showPage('home');
    }
};

window.showLibraries = () => {
    if (window.RARE_APP) {
        window.RARE_APP.showPage('libraries');
    }
};

window.showProjects = () => {
    if (window.RARE_APP) {
        window.RARE_APP.showPage('projects');
    }
};

// Initialize app when DOM is ready
let app;
if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', async () => {
        app = new ClientPortalApp();
        await app.init();
        
        window.RARE_APP = app;
        
        // Apply saved preferences
        const savedTheme = localStorage.getItem('rare_theme');
        if (savedTheme && app.themeManager) {
            app.themeManager.applyTheme(savedTheme);
        }
        
        const savedLang = localStorage.getItem('rare_language');
        if (savedLang && app.languageManager) {
            app.languageManager.applyLanguage(savedLang);
        }
    });
} else {
    // DOM already loaded
    (async () => {
        app = new ClientPortalApp();
        await app.init();
        
        window.RARE_APP = app;
        
        // Apply saved preferences
        const savedTheme = localStorage.getItem('rare_theme');
        if (savedTheme && app.themeManager) {
            app.themeManager.applyTheme(savedTheme);
        }
        
        const savedLang = localStorage.getItem('rare_language');
        if (savedLang && app.languageManager) {
            app.languageManager.applyLanguage(savedLang);
        }
    })();
}

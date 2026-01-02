/**
 * RARE 4N - Authentication Page
 * Handles login and registration
 */

export class AuthPage {
    constructor(apiBaseUrl) {
        this.apiBaseUrl = apiBaseUrl;
        this.isLoginMode = true;
    }

    render() {
        return `
            <div class="auth-container">
                <div class="auth-card glass">
                    <div class="auth-header">
                        <h2 data-i18n="welcome">مرحباً بك في RARE 4N</h2>
                        <p class="auth-subtitle" data-i18n="auth_subtitle">Client Portal</p>
                    </div>

                    <div class="auth-tabs">
                        <button class="auth-tab ${this.isLoginMode ? 'active' : ''}" id="loginTab" data-mode="login">
                            <span data-i18n="login">تسجيل الدخول</span>
                        </button>
                        <button class="auth-tab ${!this.isLoginMode ? 'active' : ''}" id="registerTab" data-mode="register">
                            <span data-i18n="register">إنشاء حساب</span>
                        </button>
                    </div>

                    <form class="auth-form" id="authForm">
                        <div class="auth-error" id="authError"></div>

                        <div id="loginFields" style="display: ${this.isLoginMode ? 'flex' : 'none'}; flex-direction: column; gap: 10px;">
                            <input 
                                type="text" 
                                id="loginEmail" 
                                placeholder="البريد الإلكتروني أو اسم المستخدم"
                                autocomplete="username"
                                required
                            />
                            <input 
                                type="password" 
                                id="loginPassword" 
                                placeholder="كلمة المرور"
                                autocomplete="current-password"
                                required
                            />
                            <button type="submit" class="btn btn-primary" id="loginBtn">
                                <span data-i18n="login">تسجيل الدخول</span>
                            </button>
                        </div>

                        <div id="registerFields" style="display: ${!this.isLoginMode ? 'flex' : 'none'}; flex-direction: column; gap: 10px;">
                            <input 
                                type="text" 
                                id="registerName" 
                                placeholder="الاسم الكامل"
                                autocomplete="name"
                                required
                            />
                            <input 
                                type="email" 
                                id="registerEmail" 
                                placeholder="البريد الإلكتروني"
                                autocomplete="email"
                                required
                            />
                            <input 
                                type="password" 
                                id="registerPassword" 
                                placeholder="كلمة المرور"
                                autocomplete="new-password"
                                minlength="6"
                                required
                            />
                            <input 
                                type="password" 
                                id="registerConfirmPassword" 
                                placeholder="تأكيد كلمة المرور"
                                autocomplete="new-password"
                                required
                            />
                            <button type="submit" class="btn btn-primary" id="registerBtn">
                                <span data-i18n="register">إنشاء حساب</span>
                            </button>
                        </div>
                    </form>

                    <div class="auth-footer">
                        <p class="auth-help" data-i18n="auth_help">للمساعدة، تواصل مع الدعم الفني</p>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        console.log('🔐 Setting up AuthPage event listeners...');

        // Tab switching
        const loginTab = document.getElementById('loginTab');
        const registerTab = document.getElementById('registerTab');
        
        if (loginTab) {
            loginTab.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchMode('login');
            });
        }

        if (registerTab) {
            registerTab.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchMode('register');
            });
        }

        // Form submission
        const authForm = document.getElementById('authForm');
        if (authForm) {
            authForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSubmit();
            });
        }

        // Enter key support
        const inputs = document.querySelectorAll('#authForm input');
        inputs.forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.handleSubmit();
                }
            });
        });

        console.log('✅ AuthPage event listeners setup complete');
    }

    switchMode(mode) {
        this.isLoginMode = mode === 'login';
        
        const loginTab = document.getElementById('loginTab');
        const registerTab = document.getElementById('registerTab');
        const loginFields = document.getElementById('loginFields');
        const registerFields = document.getElementById('registerFields');

        if (loginTab && registerTab) {
            loginTab.classList.toggle('active', this.isLoginMode);
            registerTab.classList.toggle('active', !this.isLoginMode);
        }

        if (loginFields && registerFields) {
            loginFields.style.display = this.isLoginMode ? 'flex' : 'none';
            registerFields.style.display = !this.isLoginMode ? 'flex' : 'none';
        }

        this.hideError();
    }

    async handleSubmit() {
        const errorEl = document.getElementById('authError');
        this.hideError();

        if (this.isLoginMode) {
            await this.handleLogin();
        } else {
            await this.handleRegister();
        }
    }

    async handleLogin() {
        const email = document.getElementById('loginEmail')?.value.trim();
        const password = document.getElementById('loginPassword')?.value;

        if (!email || !password) {
            this.showError('يرجى إدخال البريد الإلكتروني وكلمة المرور');
            return;
        }

        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.disabled = true;
            loginBtn.textContent = 'جاري تسجيل الدخول...';
        }

        try {
            console.log('🔐 Attempting login...');
            
            const response = await fetch(`${this.apiBaseUrl}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    method: 'password',
                    password: password,
                    email: email,
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                console.log('✅ Login successful');
                
                // Store token and user data
                if (data.token) {
                    localStorage.setItem('auth_token', data.token);
                }
                if (data.user) {
                    localStorage.setItem('user', JSON.stringify(data.user));
                }

                // Dispatch success event
                window.dispatchEvent(new CustomEvent('auth:success', {
                    detail: { user: data.user }
                }));

                this.showSuccess('تم تسجيل الدخول بنجاح!');
                
                // Reload page after short delay
                setTimeout(() => {
                    window.location.reload();
                }, 500);
            } else {
                const errorMsg = data.error || 'فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.';
                this.showError(errorMsg);
                console.error('❌ Login failed:', errorMsg);
            }
        } catch (error) {
            console.error('❌ Login error:', error);
            this.showError('حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.');
        } finally {
            if (loginBtn) {
                loginBtn.disabled = false;
                const loginText = document.querySelector('#loginBtn [data-i18n="login"]');
                loginBtn.textContent = loginText ? loginText.textContent : 'تسجيل الدخول';
            }
        }
    }

    async handleRegister() {
        const name = document.getElementById('registerName')?.value.trim();
        const email = document.getElementById('registerEmail')?.value.trim();
        const password = document.getElementById('registerPassword')?.value;
        const confirmPassword = document.getElementById('registerConfirmPassword')?.value;

        if (!name || !email || !password || !confirmPassword) {
            this.showError('يرجى ملء جميع الحقول');
            return;
        }

        if (password.length < 6) {
            this.showError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
            return;
        }

        if (password !== confirmPassword) {
            this.showError('كلمات المرور غير متطابقة');
            return;
        }

        const registerBtn = document.getElementById('registerBtn');
        if (registerBtn) {
            registerBtn.disabled = true;
            registerBtn.textContent = 'جاري إنشاء الحساب...';
        }

        try {
            console.log('🔐 Attempting registration...');
            
            const response = await fetch(`${this.apiBaseUrl}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                console.log('✅ Registration successful');
                this.showSuccess('تم إنشاء الحساب بنجاح! جاري تسجيل الدخول...');
                
                // Auto login after registration
                setTimeout(() => {
                    this.switchMode('login');
                    document.getElementById('loginEmail').value = email;
                    document.getElementById('loginPassword').value = password;
                    this.handleLogin();
                }, 1000);
            } else {
                const errorMsg = data.error || 'فشل إنشاء الحساب. يرجى المحاولة مرة أخرى.';
                this.showError(errorMsg);
                console.error('❌ Registration failed:', errorMsg);
            }
        } catch (error) {
            console.error('❌ Registration error:', error);
            this.showError('حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.');
        } finally {
            if (registerBtn) {
                registerBtn.disabled = false;
                const registerText = document.querySelector('#registerBtn [data-i18n="register"]');
                registerBtn.textContent = registerText ? registerText.textContent : 'إنشاء حساب';
            }
        }
    }

    showError(message) {
        const errorEl = document.getElementById('authError');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
            errorEl.style.background = 'rgba(255,59,48,0.12)';
            errorEl.style.borderColor = 'rgba(255,59,48,0.25)';
            errorEl.style.color = '#ffd6d6';
        }
    }

    showSuccess(message) {
        const errorEl = document.getElementById('authError');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
            errorEl.style.background = 'rgba(52,199,89,0.12)';
            errorEl.style.borderColor = 'rgba(52,199,89,0.25)';
            errorEl.style.color = '#d6ffd6';
        }
    }

    hideError() {
        const errorEl = document.getElementById('authError');
        if (errorEl) {
            errorEl.style.display = 'none';
        }
    }
}

/**
 * Community Connect Hub - Authentication Module
 * 
 * This module handles all authentication-related functionality including
 * user registration, login, logout, and user data management.
 */

const Auth = {
    // Initialize authentication functionality
    init: function() {
        this.setupAuthForms();
        this.handleRedirects();
    },

    // Setup login and signup form handlers
    setupAuthForms: function() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                // Validate form
                if (this.validateLoginForm(loginForm)) {
                    UI.showLoading();
                    
                    try {
                        const email = loginForm.email.value;
                        const password = loginForm.password.value;
                        
                        // Attempt login
                        const user = await this.login(email, password);
                        
                        if (user) {
                            UI.showNotification('Login successful!', 'success');
                            
                            // Redirect to appropriate page
                            this.redirectAfterAuth();
                        } else {
                            UI.showNotification('Invalid email or password.', 'error');
                        }
                        
                    } catch (error) {
                        console.error('Login error:', error);
                        UI.showNotification('Login failed. Please try again.', 'error');
                    } finally {
                        UI.hideLoading();
                    }
                }
            });
        }
        
        // Signup form
        const signupForm = document.getElementById('signup-form');
        if (signupForm) {
            signupForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                // Validate form
                if (this.validateSignupForm(signupForm)) {
                    UI.showLoading();
                    
                    try {
                        const name = signupForm.name.value;
                        const email = signupForm.email.value;
                        const password = signupForm.password.value;
                        
                        // Check if email already exists
                        const exists = await this.checkEmailExists(email);
                        
                        if (exists) {
                            UI.showNotification('Email already registered. Please use a different email.', 'error');
                            UI.hideLoading();
                            return;
                        }
                        
                        // Create user
                        const user = await this.register(name, email, password);
                        
                        if (user) {
                            UI.showNotification('Registration successful! Welcome to Community Connect Hub.', 'success');
                            
                            // Redirect to appropriate page
                            this.redirectAfterAuth();
                        } else {
                            UI.showNotification('Registration failed. Please try again.', 'error');
                        }
                        
                    } catch (error) {
                        console.error('Signup error:', error);
                        UI.showNotification('Registration failed. Please try again.', 'error');
                    } finally {
                        UI.hideLoading();
                    }
                }
            });
        }
        
        // Logout action
        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) {
            logoutButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
                UI.showNotification('You have been logged out.', 'info');
                window.location.href = '../index.html';
            });
        }
    },
    
    // Validate login form
    validateLoginForm: function(form) {
        let isValid = true;
        
        // Clear previous errors
        document.querySelectorAll('.error-message').forEach(el => el.remove());
        document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
        
        // Validate email
        const email = form.email.value.trim();
        if (!email) {
            this.showFormError(form.email, 'Email is required');
            isValid = false;
        } else if (!this.validateEmail(email)) {
            this.showFormError(form.email, 'Please enter a valid email address');
            isValid = false;
        }
        
        // Validate password
        if (!form.password.value) {
            this.showFormError(form.password, 'Password is required');
            isValid = false;
        }
        
        return isValid;
    },
    
    // Validate signup form
    validateSignupForm: function(form) {
        let isValid = true;
        
        // Clear previous errors
        document.querySelectorAll('.error-message').forEach(el => el.remove());
        document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
        
        // Validate name
        if (!form.name.value.trim()) {
            this.showFormError(form.name, 'Name is required');
            isValid = false;
        }
        
        // Validate email
        const email = form.email.value.trim();
        if (!email) {
            this.showFormError(form.email, 'Email is required');
            isValid = false;
        } else if (!this.validateEmail(email)) {
            this.showFormError(form.email, 'Please enter a valid email address');
            isValid = false;
        }
        
        // Validate password
        if (!form.password.value) {
            this.showFormError(form.password, 'Password is required');
            isValid = false;
        } else if (form.password.value.length < 6) {
            this.showFormError(form.password, 'Password must be at least 6 characters');
            isValid = false;
        }
        
        // Validate password confirmation
        if (form.password.value !== form.confirmPassword.value) {
            this.showFormError(form.confirmPassword, 'Passwords do not match');
            isValid = false;
        }
        
        // Terms and conditions
        if (form.terms && !form.terms.checked) {
            this.showFormError(form.terms, 'You must agree to the terms and conditions');
            isValid = false;
        }
        
        return isValid;
    },
    
    // Validate email format
    validateEmail: function(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    // Display form error
    showFormError: function(element, message) {
        element.classList.add('input-error');
        
        const errorElement = document.createElement('p');
        errorElement.className = 'error-message';
        errorElement.innerText = message;
        
        if (element.type === 'checkbox') {
            element.parentNode.appendChild(errorElement);
        } else {
            element.parentNode.appendChild(errorElement);
        }
    },
    
    // Check if email already exists in the database
    checkEmailExists: async function(email) {
        try {
            const users = await DataService.getUsers();
            return users.some(user => user.email.toLowerCase() === email.toLowerCase());
        } catch (error) {
            console.error('Error checking email existence:', error);
            return false;
        }
    },
    
    // Register a new user
    register: async function(name, email, password) {
        try {
            const users = await DataService.getUsers();
            
            // Create new user object
            const newUser = {
                id: Date.now().toString(),
                name,
                email,
                password, // In a real app, this should be hashed
                createdAt: new Date().toISOString()
            };
            
            // Add to users array
            users.push(newUser);
            
            // Save users
            await DataService.saveUsers(users);
            
            // Save to local storage for session
            localStorage.setItem('currentUser', JSON.stringify(newUser));
            
            return newUser;
            
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    },
    
    // Login user
    login: async function(email, password) {
        try {
            const users = await DataService.getUsers();
            
            // Find user with matching email and password
            const user = users.find(u => 
                u.email.toLowerCase() === email.toLowerCase() && u.password === password
            );
            
            if (user) {
                // Save to local storage for session
                localStorage.setItem('currentUser', JSON.stringify(user));
                return user;
            }
            
            return null;
            
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },
    
    // Logout user
    logout: function() {
        localStorage.removeItem('currentUser');
    },
    
    // Get currently logged in user
    getCurrentUser: function() {
        const userJson = localStorage.getItem('currentUser');
        return userJson ? JSON.parse(userJson) : null;
    },
    
    // Update user information
    updateUser: async function(updatedUser) {
        try {
            const users = await DataService.getUsers();
            
            // Find and update user
            const index = users.findIndex(u => u.id === updatedUser.id);
            
            if (index !== -1) {
                users[index] = updatedUser;
                
                // Save updated users array
                await DataService.saveUsers(users);
                
                // Update current user in local storage
                localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                
                return updatedUser;
            }
            
            throw new Error('User not found');
            
        } catch (error) {
            console.error('Update user error:', error);
            throw error;
        }
    },
    
    // Handle redirections after authentication
    redirectAfterAuth: function() {
        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get('redirect');
        const eventId = urlParams.get('id');
        
        setTimeout(() => {
            if (redirect) {
                if (redirect === 'event-details' && eventId) {
                    window.location.href = `event-details.html?id=${eventId}`;
                } else {
                    window.location.href = `${redirect}.html`;
                }
            } else {
                window.location.href = '../index.html';
            }
        }, 1500);
    },
    
    // Handle redirects to login page
    handleRedirects: function() {
        const currentUser = this.getCurrentUser();
        const restrictedPages = ['profile.html', 'create-event.html'];
        
        // Get current page filename
        const currentPage = window.location.pathname.split('/').pop();
        
        // If on a restricted page and not logged in, redirect to login
        if (restrictedPages.includes(currentPage) && !currentUser) {
            window.location.href = `login.html?redirect=${currentPage.replace('.html', '')}`;
        }
    }
};

// Initialize auth functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    Auth.init();
});

/**
 * Community Connect Hub - UI Module
 * 
 * This module handles all UI-related functionality including DOM manipulations,
 * animations, UI state changes, and responsive behaviors.
 */

const UI = {
    // Current UI state
    state: {
        currentSlide: 0,
        totalSlides: 3,
        isMobileNavOpen: false,
        isLoading: false
    },
    
    // Initialize UI functionality
    init: function() {
        console.log('Initializing UI Manager...');
        
        // Setup global UI elements
        this.setupMobileNav();
        this.setupLoadingIndicator();
        this.setupNotifications();
        this.setupAnimations();
        
        console.log('UI Manager initialized');
    },
    
    // Setup mobile navigation
    setupMobileNav: function() {
        const hamburger = document.getElementById('hamburger');
        const navLinks = document.querySelector('.nav-links');
        
        if (hamburger && navLinks) {
            hamburger.addEventListener('click', () => {
                this.toggleMobileNav();
            });
            
            // Close mobile nav when clicking outside
            document.addEventListener('click', (e) => {
                if (this.state.isMobileNavOpen && !navLinks.contains(e.target) && e.target !== hamburger) {
                    this.toggleMobileNav();
                }
            });
        }
    },
    
    // Toggle mobile navigation
    toggleMobileNav: function() {
        const navLinks = document.querySelector('.nav-links');
        const hamburger = document.getElementById('hamburger');
        
        if (navLinks && hamburger) {
            if (this.state.isMobileNavOpen) {
                navLinks.classList.remove('show');
                hamburger.innerHTML = '<i class="fas fa-bars"></i>';
            } else {
                navLinks.classList.add('show');
                hamburger.innerHTML = '<i class="fas fa-times"></i>';
            }
            
            this.state.isMobileNavOpen = !this.state.isMobileNavOpen;
        }
    },
    
    // Setup loading indicator
    setupLoadingIndicator: function() {
        // Create loading overlay if it doesn't exist
        if (!document.getElementById('loading-overlay')) {
            const loadingOverlay = document.createElement('div');
            loadingOverlay.id = 'loading-overlay';
            loadingOverlay.className = 'hidden';
            loadingOverlay.innerHTML = '<div class="spinner"></div>';
            document.body.appendChild(loadingOverlay);
        }
    },
    
    // Show loading overlay
    showLoading: function() {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.classList.remove('hidden');
            this.state.isLoading = true;
        }
    },
    
    // Hide loading overlay
    hideLoading: function() {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
            this.state.isLoading = false;
        }
    },
    
    // Setup notification system
    setupNotifications: function() {
        // Create notification toast if it doesn't exist
        if (!document.getElementById('notification-toast')) {
            const notificationToast = document.createElement('div');
            notificationToast.id = 'notification-toast';
            notificationToast.className = 'notification hidden';
            notificationToast.innerHTML = `
                <div class="notification-content">
                    <i class="notification-icon"></i>
                    <p class="notification-message"></p>
                </div>
                <button class="notification-close">×</button>
            `;
            document.body.appendChild(notificationToast);
            
            // Add event listener to close button
            const closeBtn = notificationToast.querySelector('.notification-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', this.hideNotification);
            }
        }
    },
    
    // Show notification toast
    showNotification: function(message, type = 'info') {
        const toast = document.getElementById('notification-toast');
        const messageElement = toast.querySelector('.notification-message');
        const iconElement = toast.querySelector('.notification-icon');
        
        if (toast && messageElement) {
            // Set notification message
            messageElement.textContent = message;
            
            // Remove all type classes
            toast.classList.remove('notification-success', 'notification-error', 'notification-warning', 'notification-info');
            
            // Set type class and icon
            switch (type) {
                case 'success':
                    toast.classList.add('notification-success');
                    iconElement.className = 'notification-icon fas fa-check-circle';
                    break;
                case 'error':
                    toast.classList.add('notification-error');
                    iconElement.className = 'notification-icon fas fa-exclamation-circle';
                    break;
                case 'warning':
                    toast.classList.add('notification-warning');
                    iconElement.className = 'notification-icon fas fa-exclamation-triangle';
                    break;
                default:
                    toast.classList.add('notification-info');
                    iconElement.className = 'notification-icon fas fa-info-circle';
            }
            
            // Show notification
            toast.classList.remove('hidden');
            toast.classList.add('show');
            
            // Auto-hide after delay
            clearTimeout(this.notificationTimeout);
            this.notificationTimeout = setTimeout(() => {
                this.hideNotification();
            }, 5000);
        }
    },
    
    // Hide notification toast
    hideNotification: function() {
        const toast = document.getElementById('notification-toast');
        if (toast) {
            toast.classList.remove('show');
            toast.classList.add('hidden');
        }
    },
    
    // Setup animations for elements
    setupAnimations: function() {
        // Reveal animations for elements with data-aos attribute
        const animatedElements = document.querySelectorAll('[data-aos]');
        
        if (animatedElements.length > 0) {
            const observerOptions = {
                root: null,
                rootMargin: '0px',
                threshold: 0.1
            };
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const element = entry.target;
                        const delay = element.getAttribute('data-aos-delay') || 0;
                        
                        setTimeout(() => {
                            element.classList.add('aos-animate');
                        }, delay);
                        
                        // Unobserve after animation is triggered
                        observer.unobserve(element);
                    }
                });
            }, observerOptions);
            
            animatedElements.forEach(element => {
                observer.observe(element);
            });
        }
    },
    
    // Update auth-related UI elements based on user state
    updateAuthUI: function(user) {
        const authLink = document.getElementById('auth-link');
        const heroCtaButton = document.getElementById('hero-cta');
        const footerCtaButton = document.getElementById('footer-cta');
        
        if (authLink) {
            if (user) {
                authLink.innerHTML = `
                    <a href="pages/profile.html">
                        <i class="fas fa-user-circle"></i> ${user.name}
                    </a>
                    <a href="#" id="logout-button" class="btn-text">Logout</a>
                `;
                
                // Add logout functionality
                const logoutButton = document.getElementById('logout-button');
                if (logoutButton) {
                    logoutButton.addEventListener('click', (e) => {
                        e.preventDefault();
                        Auth.logout();
                        window.location.href = 'index.html';
                    });
                }
            } else {
                authLink.innerHTML = '<a href="pages/login.html">Login</a>';
            }
        }
        
        // Update CTA buttons
        if (heroCtaButton) {
            heroCtaButton.textContent = user ? 'Create Event' : 'Join Now';
            heroCtaButton.href = user ? 'pages/create-event.html' : 'pages/signup.html';
        }
        
        if (footerCtaButton) {
            footerCtaButton.textContent = user ? 'Explore Events' : 'Sign Up Now';
            footerCtaButton.href = user ? 'pages/events.html' : 'pages/signup.html';
        }
    },
    
    // Control testimonial slider
    slideTestimonials: function(direction) {
        const slides = document.querySelectorAll('.testimonial-card');
        const dots = document.querySelectorAll('.slider-dots .dot');
        
        if (slides.length === 0) return;
        
        if (direction === 'next') {
            this.state.currentSlide = (this.state.currentSlide + 1) % this.state.totalSlides;
        } else {
            this.state.currentSlide = (this.state.currentSlide - 1 + this.state.totalSlides) % this.state.totalSlides;
        }
        
        // Update slide positions
        slides.forEach((slide, index) => {
            slide.style.transform = `translateX(${(index - this.state.currentSlide) * 100}%)`;
        });
        
        // Update dots
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.state.currentSlide);
        });
    },
    
    // Go to specific slide in testimonial slider
    goToSlide: function(slideIndex) {
        const slides = document.querySelectorAll('.testimonial-card');
        const dots = document.querySelectorAll('.slider-dots .dot');
        
        if (slides.length === 0 || slideIndex < 0 || slideIndex >= this.state.totalSlides) return;
        
        this.state.currentSlide = slideIndex;
        
        // Update slide positions
        slides.forEach((slide, index) => {
            slide.style.transform = `translateX(${(index - this.state.currentSlide) * 100}%)`;
        });
        
        // Update dots
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.state.currentSlide);
        });
    },
    
    // Create animated event card
    createEventCard: function(event, delay = 0) {
        const eventDate = new Date(event.date);
        const formattedDate = eventDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        // Determine icon based on category
        let categoryIcon;
        switch (event.category) {
            case 'social':
                categoryIcon = 'fas fa-users';
                break;
            case 'volunteer':
                categoryIcon = 'fas fa-hands-helping';
                break;
            case 'education':
                categoryIcon = 'fas fa-graduation-cap';
                break;
            case 'sports':
                categoryIcon = 'fas fa-running';
                break;
            default:
                categoryIcon = 'fas fa-calendar-alt';
        }
        
        const card = document.createElement('div');
        card.className = 'event-card';
        card.setAttribute('data-category', event.category);
        card.setAttribute('data-aos', 'fade-up');
        card.setAttribute('data-aos-delay', delay);
        
        card.innerHTML = `
            <div class="event-image">
                <i class="${categoryIcon}"></i>
                <span class="event-category">${event.category}</span>
            </div>
            <div class="event-details">
                <div class="event-date">
                    <i class="fas fa-calendar-day"></i>
                    <span>${formattedDate} at ${event.time}</span>
                </div>
                <h3 class="event-title">${event.title}</h3>
                <div class="event-location">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${event.location}</span>
                </div>
                <p class="event-description">${event.description}</p>
                <div class="event-footer">
                    <div class="event-attendees">
                        <i class="fas fa-user-friends"></i>
                        <span>${event.attendees ? event.attendees.length : 0}/${event.maxAttendees}</span>
                    </div>
                    <a href="pages/event-details.html?id=${event.id}" class="btn btn-primary btn-sm">View Details</a>
                </div>
            </div>
        `;
        
        // Add button click animation
        const viewButton = card.querySelector('.btn');
        if (viewButton) {
            viewButton.addEventListener('click', (e) => {
                viewButton.classList.add('btn-click');
                setTimeout(() => {
                    viewButton.classList.remove('btn-click');
                }, 300);
            });
        }
        
        return card;
    },
    
    // Create empty state element
    createEmptyState: function(message, icon = 'fas fa-calendar-times', actionText = null, actionUrl = null) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        
        let html = `
            <i class="${icon}"></i>
            <p>${message}</p>
        `;
        
        if (actionText && actionUrl) {
            html += `<a href="${actionUrl}" class="btn btn-primary">${actionText}</a>`;
        }
        
        emptyState.innerHTML = html;
        return emptyState;
    },
    
    // Show form validation errors
    showFormError: function(inputElement, message) {
        // Clear any existing error message
        const existingError = inputElement.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Add error class to input
        inputElement.classList.add('input-error');
        
        // Add shake animation
        inputElement.classList.add('shake');
        setTimeout(() => {
            inputElement.classList.remove('shake');
        }, 820); // Animation duration
        
        // Create error message
        const errorMessage = document.createElement('p');
        errorMessage.className = 'error-message';
        errorMessage.textContent = message;
        
        // Append to parent element
        inputElement.parentNode.appendChild(errorMessage);
    },
    
    // Clear form validation errors
    clearFormErrors: function(form) {
        // Remove error classes
        const errorInputs = form.querySelectorAll('.input-error');
        errorInputs.forEach(input => {
            input.classList.remove('input-error');
        });
        
        // Remove error messages
        const errorMessages = form.querySelectorAll('.error-message');
        errorMessages.forEach(message => {
            message.remove();
        });
    },
    
    // Create loading placeholders for content
    createLoadingPlaceholders: function(container, count = 3) {
        container.innerHTML = '';
        
        for (let i = 0; i < count; i++) {
            const placeholder = document.createElement('div');
            placeholder.className = 'loading-card shimmer';
            container.appendChild(placeholder);
        }
    },
    
    // Add staggered animation to a list of elements
    addStaggeredAnimation: function(elements, animationClass = 'fade-in-up', delay = 100) {
        elements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.add(animationClass);
            }, index * delay);
        });
    }
};

// Initialize UI when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    UI.init();
});

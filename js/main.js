/**
 * Community Connect Hub - Main JavaScript
 * 
 * This file contains the main functionality of the Community Connect Hub application
 * including initializing the application, setting up event listeners, and managing
 * the global application state.
 */

// Main app object to avoid global namespace pollution
const CommunityHub = {
    // App state
    state: {
        currentPage: null,
        isLoading: false,
        user: null,
        events: [],
        filteredEvents: [],
        activeFilter: 'all'
    },

    // Initialize the application
    init: async function() {
        console.log('Initializing Community Connect Hub...');
        
        // Set current page based on URL
        this.setCurrentPage();
        
        // Check for user authentication
        this.checkAuth();
        
        // Setup UI event listeners
        this.setupEventListeners();
        
        // Load page-specific content
        await this.loadPageContent();
        
        // Hide loading overlay if it's showing
        UI.hideLoading();
        
        console.log('Initialization complete');
    },
    
    // Set current page based on URL
    setCurrentPage: function() {
        const path = window.location.pathname;
        
        if (path.includes('login.html')) {
            this.state.currentPage = 'login';
        } else if (path.includes('signup.html')) {
            this.state.currentPage = 'signup';
        } else if (path.includes('profile.html')) {
            this.state.currentPage = 'profile';
        } else if (path.includes('events.html')) {
            this.state.currentPage = 'events';
        } else if (path.includes('event-details.html')) {
            this.state.currentPage = 'eventDetails';
        } else if (path.includes('create-event.html')) {
            this.state.currentPage = 'createEvent';
        } else if (path.includes('community.html')) {
            this.state.currentPage = 'community';
        } else {
            this.state.currentPage = 'home';
        }
        
        console.log(`Current page set to: ${this.state.currentPage}`);
    },
    
    // Check user authentication state
    checkAuth: function() {
        this.state.user = Auth.getCurrentUser();
        UI.updateAuthUI(this.state.user);
    },
    
    // Setup global event listeners
    setupEventListeners: function() {
        // Mobile navigation toggle
        const hamburger = document.getElementById('hamburger');
        if (hamburger) {
            hamburger.addEventListener('click', UI.toggleMobileNav);
        }
        
        // Setup event category filters if on home page
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const filter = button.getAttribute('data-filter');
                this.filterEvents(filter);
                
                // Update active button state
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            });
        });
        
        // Testimonial slider controls
        const prevButton = document.querySelector('.slider-arrow.prev');
        const nextButton = document.querySelector('.slider-arrow.next');
        const dots = document.querySelectorAll('.slider-dots .dot');
        
        if (prevButton && nextButton) {
            prevButton.addEventListener('click', () => UI.slideTestimonials('prev'));
            nextButton.addEventListener('click', () => UI.slideTestimonials('next'));
            
            dots.forEach((dot, index) => {
                dot.addEventListener('click', () => UI.goToSlide(index));
            });
        }
        
        // Notification close button
        const notificationClose = document.querySelector('.notification-close');
        if (notificationClose) {
            notificationClose.addEventListener('click', UI.hideNotification);
        }
        
        // Page transitions
        document.addEventListener('DOMContentLoaded', () => {
            document.body.classList.add('page-enter');
        });
    },
    
    // Load page-specific content based on current page
    loadPageContent: async function() {
        switch (this.state.currentPage) {
            case 'home':
                await this.loadHomePageContent();
                break;
            case 'events':
                await this.loadEventsPageContent();
                break;
            case 'eventDetails':
                await this.loadEventDetailsContent();
                break;
            case 'profile':
                this.loadProfileContent();
                break;
            case 'createEvent':
                this.setupCreateEventPage();
                break;
            case 'community':
                await this.loadCommunityContent();
                break;
        }
    },
    
    // Load home page content including featured events
    loadHomePageContent: async function() {
        console.log('Loading home page content...');
        UI.showLoading();
        
        try {
            // Load events data for the home page
            this.state.events = await DataService.getEvents();
            this.state.filteredEvents = [...this.state.events];
            
            // Display featured/upcoming events on home page
            const upcomingEvents = this.getUpcomingEvents(3);
            this.renderEventsList(upcomingEvents, 'events-container');
            
            console.log('Home page content loaded successfully');
        } catch (error) {
            console.error('Error loading home page content:', error);
            UI.showNotification('Error loading events. Please try again later.', 'error');
        } finally {
            UI.hideLoading();
        }
    },
    
    // Load events page content
    loadEventsPageContent: async function() {
        console.log('Loading events page content...');
        UI.showLoading();
        
        try {
            // Load all events for the events page
            this.state.events = await DataService.getEvents();
            this.state.filteredEvents = [...this.state.events];
            
            // Render all events
            this.renderEventsList(this.state.filteredEvents, 'events-list-container');
            
            // Setup search and filter functionality
            this.setupEventsSearch();
            
            console.log('Events page content loaded successfully');
        } catch (error) {
            console.error('Error loading events page content:', error);
            UI.showNotification('Error loading events. Please try again later.', 'error');
        } finally {
            UI.hideLoading();
        }
    },
    
    // Load specific event details
    loadEventDetailsContent: async function() {
        console.log('Loading event details...');
        UI.showLoading();
        
        try {
            // Get event ID from URL query parameter
            const urlParams = new URLSearchParams(window.location.search);
            const eventId = urlParams.get('id');
            
            if (!eventId) {
                throw new Error('Event ID not provided');
            }
            
            // Fetch specific event
            const event = await DataService.getEventById(eventId);
            
            if (!event) {
                throw new Error('Event not found');
            }
            
            // Render event details
            this.renderEventDetails(event);
            
            // Setup join/leave event functionality
            this.setupEventActions(event);
            
            console.log('Event details loaded successfully');
        } catch (error) {
            console.error('Error loading event details:', error);
            UI.showNotification('Event not found or could not be loaded.', 'error');
            
            // Redirect back to events page after a short delay
            setTimeout(() => {
                window.location.href = 'events.html';
            }, 3000);
        } finally {
            UI.hideLoading();
        }
    },
    
    // Load user profile content
    loadProfileContent: function() {
        console.log('Loading profile content...');
        
        // Check if user is logged in
        if (!this.state.user) {
            window.location.href = 'login.html?redirect=profile';
            return;
        }
        
        try {
            // Display user information
            const profileInfoContainer = document.getElementById('profile-info');
            if (profileInfoContainer) {
                profileInfoContainer.innerHTML = `
                    <div class="profile-header">
                        <div class="profile-avatar">
                            <i class="fas fa-user-circle"></i>
                        </div>
                        <h2>${this.state.user.name}</h2>
                        <p>${this.state.user.email}</p>
                    </div>
                `;
            }
            
            // Load user's events (both created and joined)
            this.loadUserEvents();
            
            // Setup profile edit functionality
            this.setupProfileEdit();
            
            console.log('Profile content loaded successfully');
        } catch (error) {
            console.error('Error loading profile content:', error);
            UI.showNotification('Error loading profile information.', 'error');
        }
    },
    
    // Load events created or joined by the user
    loadUserEvents: async function() {
        if (!this.state.user) return;
        
        UI.showLoading();
        
        try {
            // Get all events
            const allEvents = await DataService.getEvents();
            
            // Filter for user's created events
            const createdEvents = allEvents.filter(event => 
                event.createdBy === this.state.user.id
            );
            
            // Filter for events the user has joined
            const joinedEvents = allEvents.filter(event => 
                event.attendees && event.attendees.includes(this.state.user.id)
            );
            
            // Render created events
            const createdEventsContainer = document.getElementById('created-events');
            if (createdEventsContainer) {
                if (createdEvents.length > 0) {
                    this.renderEventsList(createdEvents, 'created-events');
                } else {
                    createdEventsContainer.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-calendar-plus"></i>
                            <p>You haven't created any events yet.</p>
                            <a href="create-event.html" class="btn btn-primary">Create an Event</a>
                        </div>
                    `;
                }
            }
            
            // Render joined events
            const joinedEventsContainer = document.getElementById('joined-events');
            if (joinedEventsContainer) {
                if (joinedEvents.length > 0) {
                    this.renderEventsList(joinedEvents, 'joined-events');
                } else {
                    joinedEventsContainer.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-calendar-alt"></i>
                            <p>You haven't joined any events yet.</p>
                            <a href="events.html" class="btn btn-primary">Browse Events</a>
                        </div>
                    `;
                }
            }
        } catch (error) {
            console.error('Error loading user events:', error);
            UI.showNotification('Error loading your events.', 'error');
        } finally {
            UI.hideLoading();
        }
    },
    
    // Setup create event page
    setupCreateEventPage: function() {
        console.log('Setting up create event page...');
        
        // Check if user is logged in
        if (!this.state.user) {
            window.location.href = 'login.html?redirect=create-event';
            return;
        }
        
        // Setup form validation and submission
        const createEventForm = document.getElementById('create-event-form');
        if (createEventForm) {
            createEventForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                // Validate form
                if (this.validateEventForm(createEventForm)) {
                    UI.showLoading();
                    
                    try {
                        // Collect form data
                        const eventData = {
                            id: Date.now().toString(),
                            title: createEventForm.title.value,
                            description: createEventForm.description.value,
                            date: createEventForm.date.value,
                            time: createEventForm.time.value,
                            location: createEventForm.location.value,
                            category: createEventForm.category.value,
                            maxAttendees: parseInt(createEventForm.maxAttendees.value),
                            createdBy: this.state.user.id,
                            attendees: [this.state.user.id],
                            createdAt: new Date().toISOString()
                        };
                        
                        // Save the event
                        await DataService.createEvent(eventData);
                        
                        UI.showNotification('Event created successfully!', 'success');
                        
                        // Redirect to event details page
                        setTimeout(() => {
                            window.location.href = `event-details.html?id=${eventData.id}`;
                        }, 1500);
                        
                    } catch (error) {
                        console.error('Error creating event:', error);
                        UI.showNotification('Error creating event. Please try again.', 'error');
                    } finally {
                        UI.hideLoading();
                    }
                }
            });
        }
        
        console.log('Create event page setup complete');
    },
    
    // Validate event creation form
    validateEventForm: function(form) {
        let isValid = true;
        const requiredFields = ['title', 'description', 'date', 'time', 'location', 'category', 'maxAttendees'];
        
        // Clear previous error messages
        document.querySelectorAll('.error-message').forEach(el => el.remove());
        document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
        
        // Check required fields
        requiredFields.forEach(field => {
            const input = form[field];
            if (!input.value.trim()) {
                this.showFormError(input, 'This field is required');
                isValid = false;
            }
        });
        
        // Validate date (must be today or future)
        const dateInput = form.date;
        const selectedDate = new Date(dateInput.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            this.showFormError(dateInput, 'Date must be today or in the future');
            isValid = false;
        }
        
        // Validate max attendees (must be positive number)
        const maxAttendeesInput = form.maxAttendees;
        if (parseInt(maxAttendeesInput.value) <= 0) {
            this.showFormError(maxAttendeesInput, 'Must be a positive number');
            isValid = false;
        }
        
        return isValid;
    },
    
    // Show form validation error
    showFormError: function(inputElement, message) {
        inputElement.classList.add('input-error');
        
        const errorElement = document.createElement('p');
        errorElement.className = 'error-message';
        errorElement.innerText = message;
        
        inputElement.parentNode.appendChild(errorElement);
    },
    
    // Setup profile edit functionality
    setupProfileEdit: function() {
        const editProfileForm = document.getElementById('edit-profile-form');
        if (editProfileForm) {
            // Pre-fill form with user data
            editProfileForm.name.value = this.state.user.name;
            editProfileForm.email.value = this.state.user.email;
            
            // Handle form submission
            editProfileForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                if (this.validateProfileForm(editProfileForm)) {
                    UI.showLoading();
                    
                    try {
                        // Update user data
                        const updatedUser = {
                            ...this.state.user,
                            name: editProfileForm.name.value,
                            email: editProfileForm.email.value
                        };
                        
                        if (editProfileForm.password.value) {
                            updatedUser.password = editProfileForm.password.value;
                        }
                        
                        // Save updated user
                        await Auth.updateUser(updatedUser);
                        
                        // Update local state
                        this.state.user = updatedUser;
                        
                        UI.showNotification('Profile updated successfully!', 'success');
                        
                        // Refresh profile content
                        this.loadProfileContent();
                        
                    } catch (error) {
                        console.error('Error updating profile:', error);
                        UI.showNotification('Error updating profile. Please try again.', 'error');
                    } finally {
                        UI.hideLoading();
                    }
                }
            });
        }
    },
    
    // Validate profile edit form
    validateProfileForm: function(form) {
        let isValid = true;
        
        // Clear previous error messages
        document.querySelectorAll('.error-message').forEach(el => el.remove());
        document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
        
        // Validate name
        if (!form.name.value.trim()) {
            this.showFormError(form.name, 'Name is required');
            isValid = false;
        }
        
        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email.value)) {
            this.showFormError(form.email, 'Please enter a valid email address');
            isValid = false;
        }
        
        // Validate password and confirm password if provided
        if (form.password.value) {
            if (form.password.value.length < 6) {
                this.showFormError(form.password, 'Password must be at least 6 characters');
                isValid = false;
            }
            
            if (form.password.value !== form.confirmPassword.value) {
                this.showFormError(form.confirmPassword, 'Passwords do not match');
                isValid = false;
            }
        }
        
        return isValid;
    },
    
    // Load community page content
    loadCommunityContent: async function() {
        console.log('Loading community content...');
        UI.showLoading();
        
        try {
            // Load user profiles
            const users = await DataService.getUsers();
            
            // Render community members
            this.renderCommunityMembers(users);
            
            // Load upcoming community events
            this.state.events = await DataService.getEvents();
            const upcomingEvents = this.getUpcomingEvents(3);
            this.renderEventsList(upcomingEvents, 'community-events');
            
            console.log('Community content loaded successfully');
        } catch (error) {
            console.error('Error loading community content:', error);
            UI.showNotification('Error loading community information.', 'error');
        } finally {
            UI.hideLoading();
        }
    },
    
    // Render community members
    renderCommunityMembers: function(users) {
        const membersContainer = document.getElementById('community-members');
        if (!membersContainer) return;
        
        if (users.length === 0) {
            membersContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <p>No community members found.</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        
        users.forEach(user => {
            html += `
                <div class="member-card card">
                    <div class="member-avatar">
                        <i class="fas fa-user-circle"></i>
                    </div>
                    <div class="member-details">
                        <h3>${user.name}</h3>
                        <p class="member-email">${user.email}</p>
                        <p class="member-joined">Joined: ${this.formatDate(user.createdAt)}</p>
                    </div>
                    <div class="member-actions">
                        <button class="btn btn-primary btn-sm">Connect</button>
                    </div>
                </div>
            `;
        });
        
        membersContainer.innerHTML = html;
    },
    
    // Setup events search and filter functionality
    setupEventsSearch: function() {
        const searchInput = document.getElementById('events-search');
        const categoryFilter = document.getElementById('category-filter');
        const dateFilter = document.getElementById('date-filter');
        
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.applyEventsFilters();
            });
        }
        
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => {
                this.applyEventsFilters();
            });
        }
        
        if (dateFilter) {
            dateFilter.addEventListener('change', () => {
                this.applyEventsFilters();
            });
        }
    },
    
    // Apply all active filters to events
    applyEventsFilters: function() {
        const searchInput = document.getElementById('events-search');
        const categoryFilter = document.getElementById('category-filter');
        const dateFilter = document.getElementById('date-filter');
        
        let filteredEvents = [...this.state.events];
        
        // Apply search filter
        if (searchInput && searchInput.value.trim()) {
            const searchTerm = searchInput.value.trim().toLowerCase();
            filteredEvents = filteredEvents.filter(event => 
                event.title.toLowerCase().includes(searchTerm) || 
                event.description.toLowerCase().includes(searchTerm) ||
                event.location.toLowerCase().includes(searchTerm)
            );
        }
        
        // Apply category filter
        if (categoryFilter && categoryFilter.value !== 'all') {
            filteredEvents = filteredEvents.filter(event => 
                event.category === categoryFilter.value
            );
        }
        
        // Apply date filter
        if (dateFilter && dateFilter.value) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            const nextWeek = new Date(today);
            nextWeek.setDate(nextWeek.getDate() + 7);
            
            const nextMonth = new Date(today);
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            
            switch (dateFilter.value) {
                case 'today':
                    filteredEvents = filteredEvents.filter(event => {
                        const eventDate = new Date(event.date);
                        return eventDate >= today && eventDate < tomorrow;
                    });
                    break;
                case 'week':
                    filteredEvents = filteredEvents.filter(event => {
                        const eventDate = new Date(event.date);
                        return eventDate >= today && eventDate < nextWeek;
                    });
                    break;
                case 'month':
                    filteredEvents = filteredEvents.filter(event => {
                        const eventDate = new Date(event.date);
                        return eventDate >= today && eventDate < nextMonth;
                    });
                    break;
            }
        }
        
        // Update state and render
        this.state.filteredEvents = filteredEvents;
        this.renderEventsList(filteredEvents, 'events-list-container');
    },
    
    // Filter events by category (for home page)
    filterEvents: function(category) {
        console.log(`Filtering events by: ${category}`);
        this.state.activeFilter = category;
        
        let filteredEvents;
        
        if (category === 'all') {
            filteredEvents = [...this.state.events];
        } else {
            filteredEvents = this.state.events.filter(event => event.category === category);
        }
        
        // Get only upcoming events and limit to 3 for home page
        const upcomingEvents = this.getUpcomingEvents(3, filteredEvents);
        this.renderEventsList(upcomingEvents, 'events-container');
    },
    
    // Get upcoming events
    getUpcomingEvents: function(limit = 3, events = null) {
        const eventsToFilter = events || this.state.events;
        const today = new Date();
        
        // Filter out past events
        const upcomingEvents = eventsToFilter.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= today;
        });
        
        // Sort by date (closest first)
        upcomingEvents.sort((a, b) => {
            return new Date(a.date) - new Date(b.date);
        });
        
        // Return limited number
        return upcomingEvents.slice(0, limit);
    },
    
    // Render a list of events in the specified container
    renderEventsList: function(events, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        // Clear loading placeholder
        container.innerHTML = '';
        
        if (events.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-times"></i>
                    <p>No events found.</p>
                </div>
            `;
            return;
        }
        
        // Create event cards
        events.forEach((event, index) => {
            const eventDate = new Date(event.date);
            const formattedDate = this.formatDate(eventDate);
            
            const eventCard = document.createElement('div');
            eventCard.className = 'event-card';
            eventCard.setAttribute('data-category', event.category);
            eventCard.setAttribute('data-aos', 'fade-up');
            eventCard.setAttribute('data-aos-delay', `${index * 100}`);
            
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
            
            eventCard.innerHTML = `
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
            
            container.appendChild(eventCard);
        });
        
        // Add animation class to trigger fade-in
        setTimeout(() => {
            const cards = container.querySelectorAll('.event-card');
            cards.forEach(card => {
                card.classList.add('fade-in-up');
            });
        }, 100);
    },
    
    // Render detailed view of a single event
    renderEventDetails: function(event) {
        const detailsContainer = document.getElementById('event-details-container');
        if (!detailsContainer) return;
        
        const eventDate = new Date(event.date);
        const formattedDate = this.formatDate(eventDate);
        
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
        
        // Check if the current user is attending
        const isAttending = this.state.user && event.attendees && 
                            event.attendees.includes(this.state.user.id);
        
        // Check if event is full
        const isFull = event.attendees && event.attendees.length >= event.maxAttendees;
        
        // Check if user is the creator
        const isCreator = this.state.user && event.createdBy === this.state.user.id;
        
        // Prepare action button
        let actionButton;
        if (isCreator) {
            actionButton = `<button id="edit-event-btn" class="btn btn-primary">Edit Event</button>`;
        } else if (isAttending) {
            actionButton = `<button id="leave-event-btn" class="btn btn-danger">Leave Event</button>`;
        } else if (isFull) {
            actionButton = `<button class="btn btn-secondary" disabled>Event Full</button>`;
        } else {
            actionButton = `<button id="join-event-btn" class="btn btn-primary">Join Event</button>`;
        }
        
        detailsContainer.innerHTML = `
            <div class="event-details-header">
                <div class="event-category-badge">${event.category}</div>
                <h1>${event.title}</h1>
                <div class="event-meta">
                    <div class="event-date-time">
                        <i class="fas fa-calendar-day"></i>
                        <span>${formattedDate} at ${event.time}</span>
                    </div>
                    <div class="event-location">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${event.location}</span>
                    </div>
                </div>
            </div>
            
            <div class="event-content">
                <div class="event-description-full">
                    <h2>About This Event</h2>
                    <p>${event.description}</p>
                </div>
                
                <div class="event-details-sidebar">
                    <div class="event-icon">
                        <i class="${categoryIcon}"></i>
                    </div>
                    
                    <div class="event-attendance">
                        <h3>Attendance</h3>
                        <div class="progress-container">
                            <div class="progress-bar" style="width: ${Math.min(100, (event.attendees ? event.attendees.length : 0) / event.maxAttendees * 100)}%"></div>
                        </div>
                        <p>${event.attendees ? event.attendees.length : 0} of ${event.maxAttendees} spots filled</p>
                    </div>
                    
                    <div class="event-actions">
                        ${actionButton}
                        <button id="share-event-btn" class="btn btn-outline">
                            <i class="fas fa-share-alt"></i> Share
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="event-organizer">
                <h2>Organized by</h2>
                <div class="organizer-info">
                    <div class="organizer-avatar">
                        <i class="fas fa-user-circle"></i>
                    </div>
                    <div class="organizer-details">
                        <h3 id="organizer-name">Loading...</h3>
                        <p>Event Creator</p>
                    </div>
                </div>
            </div>
        `;
        
        // Load organizer info
        this.loadOrganizerInfo(event.createdBy);
    },
    
    // Load and display organizer information
    loadOrganizerInfo: async function(organizerId) {
        try {
            const organizer = await DataService.getUserById(organizerId);
            const organizerNameElement = document.getElementById('organizer-name');
            
            if (organizerNameElement && organizer) {
                organizerNameElement.textContent = organizer.name;
            }
        } catch (error) {
            console.error('Error loading organizer info:', error);
        }
    },
    
    // Setup event join/leave/edit actions
    setupEventActions: function(event) {
        // Join event button
        const joinBtn = document.getElementById('join-event-btn');
        if (joinBtn) {
            joinBtn.addEventListener('click', async () => {
                // Check if user is logged in
                if (!this.state.user) {
                    window.location.href = `login.html?redirect=event-details&id=${event.id}`;
                    return;
                }
                
                UI.showLoading();
                
                try {
                    // Add user to attendees
                    if (!event.attendees) {
                        event.attendees = [];
                    }
                    
                    event.attendees.push(this.state.user.id);
                    
                    // Save updated event
                    await DataService.updateEvent(event);
                    
                    UI.showNotification('You have successfully joined the event!', 'success');
                    
                    // Reload the page to refresh the UI
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                    
                } catch (error) {
                    console.error('Error joining event:', error);
                    UI.showNotification('Error joining event. Please try again.', 'error');
                    UI.hideLoading();
                }
            });
        }
        
        // Leave event button
        const leaveBtn = document.getElementById('leave-event-btn');
        if (leaveBtn) {
            leaveBtn.addEventListener('click', async () => {
                // Confirm user wants to leave
                const confirmed = confirm('Are you sure you want to leave this event?');
                if (!confirmed) return;
                
                UI.showLoading();
                
                try {
                    // Remove user from attendees
                    const index = event.attendees.indexOf(this.state.user.id);
                    if (index !== -1) {
                        event.attendees.splice(index, 1);
                    }
                    
                    // Save updated event
                    await DataService.updateEvent(event);
                    
                    UI.showNotification('You have left the event.', 'info');
                    
                    // Reload the page to refresh the UI
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                    
                } catch (error) {
                    console.error('Error leaving event:', error);
                    UI.showNotification('Error leaving event. Please try again.', 'error');
                    UI.hideLoading();
                }
            });
        }
        
        // Edit event button
        const editBtn = document.getElementById('edit-event-btn');
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                window.location.href = `edit-event.html?id=${event.id}`;
            });
        }
        
        // Share event button
        const shareBtn = document.getElementById('share-event-btn');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => {
                const currentUrl = window.location.href;
                
                // Check if the Web Share API is supported
                if (navigator.share) {
                    navigator.share({
                        title: event.title,
                        text: `Check out this event: ${event.title}`,
                        url: currentUrl
                    })
                    .then(() => console.log('Successful share'))
                    .catch((error) => console.log('Error sharing:', error));
                } else {
                    // Fallback: copy to clipboard
                    navigator.clipboard.writeText(currentUrl)
                        .then(() => {
                            UI.showNotification('Link copied to clipboard!', 'success');
                        })
                        .catch(() => {
                            UI.showNotification('Failed to copy link.', 'error');
                        });
                }
            });
        }
    },
    
    // Helper function to format dates
    formatDate: function(date) {
        if (!(date instanceof Date)) {
            date = new Date(date);
        }
        
        // Check if date is valid
        if (isNaN(date.getTime())) {
            return 'Invalid date';
        }
        
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString(undefined, options);
    }
};

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    CommunityHub.init();
});

// Handle page visibility changes to refresh data when user returns to the page
document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible') {
        // Refresh data when user returns to the tab
        CommunityHub.checkAuth();
    }
});

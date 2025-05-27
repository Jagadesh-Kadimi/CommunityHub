/**
 * Community Connect Hub - Data Service Module
 * 
 * This module handles all data operations including loading and saving
 * data to localStorage, and managing the application data models.
 */

const DataService = {
    // Storage keys
    STORAGE_KEYS: {
        EVENTS: 'communityHub_events',
        USERS: 'communityHub_users',
        COMMENTS: 'communityHub_comments'
    },
    
    // Initialize with default data if needed
    init: function() {
        console.log('Initializing Data Service...');
        
        // Check if initial data exists, if not, create it
        this.initializeStorage();
        
        console.log('Data Service initialized');
    },
    
    // Initialize storage with default data if it doesn't exist
    initializeStorage: function() {
        // Check and initialize events
        if (!localStorage.getItem(this.STORAGE_KEYS.EVENTS)) {
            const defaultEvents = this.getDefaultEvents();
            localStorage.setItem(this.STORAGE_KEYS.EVENTS, JSON.stringify(defaultEvents));
        }
        
        // Check and initialize users
        if (!localStorage.getItem(this.STORAGE_KEYS.USERS)) {
            const defaultUsers = this.getDefaultUsers();
            localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
        }
        
        // Check and initialize comments
        if (!localStorage.getItem(this.STORAGE_KEYS.COMMENTS)) {
            localStorage.setItem(this.STORAGE_KEYS.COMMENTS, JSON.stringify([]));
        }
    },
    
    // Get events from storage
    getEvents: async function() {
        return new Promise((resolve, reject) => {
            try {
                const eventsJson = localStorage.getItem(this.STORAGE_KEYS.EVENTS);
                const events = eventsJson ? JSON.parse(eventsJson) : [];
                resolve(events);
            } catch (error) {
                console.error('Error fetching events from storage:', error);
                reject(error);
            }
        });
    },
    
    // Save events to storage
    saveEvents: async function(events) {
        return new Promise((resolve, reject) => {
            try {
                localStorage.setItem(this.STORAGE_KEYS.EVENTS, JSON.stringify(events));
                resolve(true);
            } catch (error) {
                console.error('Error saving events to storage:', error);
                reject(error);
            }
        });
    },
    
    // Get specific event by ID
    getEventById: async function(eventId) {
        return new Promise(async (resolve, reject) => {
            try {
                const events = await this.getEvents();
                const event = events.find(event => event.id === eventId);
                resolve(event || null);
            } catch (error) {
                console.error(`Error fetching event with ID ${eventId}:`, error);
                reject(error);
            }
        });
    },
    
    // Create a new event
    createEvent: async function(eventData) {
        return new Promise(async (resolve, reject) => {
            try {
                const events = await this.getEvents();
                
                // Add creation timestamp and ID if not provided
                const newEvent = {
                    ...eventData,
                    id: eventData.id || Date.now().toString(),
                    createdAt: eventData.createdAt || new Date().toISOString()
                };
                
                events.push(newEvent);
                await this.saveEvents(events);
                
                resolve(newEvent);
            } catch (error) {
                console.error('Error creating event:', error);
                reject(error);
            }
        });
    },
    
    // Update an existing event
    updateEvent: async function(eventData) {
        return new Promise(async (resolve, reject) => {
            try {
                const events = await this.getEvents();
                const index = events.findIndex(e => e.id === eventData.id);
                
                if (index === -1) {
                    throw new Error('Event not found');
                }
                
                events[index] = {
                    ...events[index],
                    ...eventData,
                    updatedAt: new Date().toISOString()
                };
                
                await this.saveEvents(events);
                
                resolve(events[index]);
            } catch (error) {
                console.error('Error updating event:', error);
                reject(error);
            }
        });
    },
    
    // Delete an event
    deleteEvent: async function(eventId) {
        return new Promise(async (resolve, reject) => {
            try {
                let events = await this.getEvents();
                events = events.filter(e => e.id !== eventId);
                
                await this.saveEvents(events);
                
                resolve(true);
            } catch (error) {
                console.error('Error deleting event:', error);
                reject(error);
            }
        });
    },
    
    // Get users from storage
    getUsers: async function() {
        return new Promise((resolve, reject) => {
            try {
                const usersJson = localStorage.getItem(this.STORAGE_KEYS.USERS);
                const users = usersJson ? JSON.parse(usersJson) : [];
                resolve(users);
            } catch (error) {
                console.error('Error fetching users from storage:', error);
                reject(error);
            }
        });
    },
    
    // Save users to storage
    saveUsers: async function(users) {
        return new Promise((resolve, reject) => {
            try {
                localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users));
                resolve(true);
            } catch (error) {
                console.error('Error saving users to storage:', error);
                reject(error);
            }
        });
    },
    
    // Get specific user by ID
    getUserById: async function(userId) {
        return new Promise(async (resolve, reject) => {
            try {
                const users = await this.getUsers();
                const user = users.find(user => user.id === userId);
                resolve(user || null);
            } catch (error) {
                console.error(`Error fetching user with ID ${userId}:`, error);
                reject(error);
            }
        });
    },
    
    // Create a new user
    createUser: async function(userData) {
        return new Promise(async (resolve, reject) => {
            try {
                const users = await this.getUsers();
                
                // Check if email already exists
                const emailExists = users.some(user => 
                    user.email.toLowerCase() === userData.email.toLowerCase()
                );
                
                if (emailExists) {
                    throw new Error('Email already registered');
                }
                
                // Add creation timestamp and ID if not provided
                const newUser = {
                    ...userData,
                    id: userData.id || Date.now().toString(),
                    createdAt: userData.createdAt || new Date().toISOString()
                };
                
                users.push(newUser);
                await this.saveUsers(users);
                
                resolve(newUser);
            } catch (error) {
                console.error('Error creating user:', error);
                reject(error);
            }
        });
    },
    
    // Update an existing user
    updateUser: async function(userData) {
        return new Promise(async (resolve, reject) => {
            try {
                const users = await this.getUsers();
                const index = users.findIndex(u => u.id === userData.id);
                
                if (index === -1) {
                    throw new Error('User not found');
                }
                
                users[index] = {
                    ...users[index],
                    ...userData,
                    updatedAt: new Date().toISOString()
                };
                
                await this.saveUsers(users);
                
                resolve(users[index]);
            } catch (error) {
                console.error('Error updating user:', error);
                reject(error);
            }
        });
    },
    
    // Delete a user
    deleteUser: async function(userId) {
        return new Promise(async (resolve, reject) => {
            try {
                let users = await this.getUsers();
                users = users.filter(u => u.id !== userId);
                
                await this.saveUsers(users);
                
                resolve(true);
            } catch (error) {
                console.error('Error deleting user:', error);
                reject(error);
            }
        });
    },
    
    // Get comments for a specific event
    getCommentsByEventId: async function(eventId) {
        return new Promise((resolve, reject) => {
            try {
                const commentsJson = localStorage.getItem(this.STORAGE_KEYS.COMMENTS);
                const allComments = commentsJson ? JSON.parse(commentsJson) : [];
                
                const eventComments = allComments.filter(comment => comment.eventId === eventId);
                resolve(eventComments);
            } catch (error) {
                console.error(`Error fetching comments for event ${eventId}:`, error);
                reject(error);
            }
        });
    },
    
    // Add a comment to an event
    addComment: async function(commentData) {
        return new Promise(async (resolve, reject) => {
            try {
                const commentsJson = localStorage.getItem(this.STORAGE_KEYS.COMMENTS);
                const allComments = commentsJson ? JSON.parse(commentsJson) : [];
                
                // Add timestamp and ID
                const newComment = {
                    ...commentData,
                    id: Date.now().toString(),
                    createdAt: new Date().toISOString()
                };
                
                allComments.push(newComment);
                localStorage.setItem(this.STORAGE_KEYS.COMMENTS, JSON.stringify(allComments));
                
                resolve(newComment);
            } catch (error) {
                console.error('Error adding comment:', error);
                reject(error);
            }
        });
    },
    
    // Clear all data (for testing or reset)
    clearAllData: function() {
        localStorage.removeItem(this.STORAGE_KEYS.EVENTS);
        localStorage.removeItem(this.STORAGE_KEYS.USERS);
        localStorage.removeItem(this.STORAGE_KEYS.COMMENTS);
        console.log('All data cleared from storage');
    },
    
    // Default events data (used when initializing storage)
    getDefaultEvents: function() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        
        const nextMonth = new Date(today);
        nextMonth.setDate(nextMonth.getDate() + 30);
        
        return [
            {
                id: '1',
                title: 'Community Cleanup Day',
                description: 'Join your neighbors for a day of community service! We\'ll be cleaning up the local park and surrounding areas. All cleaning supplies will be provided. Please wear comfortable clothes and bring water.',
                date: tomorrow.toISOString().split('T')[0],
                time: '09:00',
                location: 'Central Park',
                category: 'volunteer',
                maxAttendees: 30,
                createdBy: 'admin',
                attendees: ['admin', 'user1'],
                createdAt: today.toISOString()
            },
            {
                id: '2',
                title: 'Neighborhood Block Party',
                description: 'It\'s time for our annual block party! Bring your family and favorite dish to share. There will be games for the kids, music, and a chance to connect with your neighbors.',
                date: nextWeek.toISOString().split('T')[0],
                time: '16:00',
                location: 'Oak Street',
                category: 'social',
                maxAttendees: 100,
                createdBy: 'admin',
                attendees: ['admin', 'user1', 'user2'],
                createdAt: today.toISOString()
            },
            {
                id: '3',
                title: 'Community Garden Workshop',
                description: 'Learn how to grow your own vegetables and herbs! This workshop will cover the basics of gardening, composting, and seasonal planting. Perfect for beginners and experienced gardeners alike.',
                date: nextWeek.toISOString().split('T')[0],
                time: '10:00',
                location: 'Community Garden',
                category: 'education',
                maxAttendees: 20,
                createdBy: 'user1',
                attendees: ['user1', 'user2'],
                createdAt: today.toISOString()
            },
            {
                id: '4',
                title: 'Neighborhood Watch Meeting',
                description: 'Monthly neighborhood watch meeting to discuss safety concerns and initiatives. All residents are welcome to attend and contribute to making our community safer.',
                date: nextMonth.toISOString().split('T')[0],
                time: '19:00',
                location: 'Community Center',
                category: 'education',
                maxAttendees: 50,
                createdBy: 'user2',
                attendees: ['user2', 'admin'],
                createdAt: today.toISOString()
            },
            {
                id: '5',
                title: 'Community Soccer Game',
                description: 'Weekly pick-up soccer game for all ages and skill levels. Come get some exercise and have fun with your neighbors! No experience necessary.',
                date: tomorrow.toISOString().split('T')[0],
                time: '17:00',
                location: 'Neighborhood Field',
                category: 'sports',
                maxAttendees: 24,
                createdBy: 'user1',
                attendees: ['user1'],
                createdAt: today.toISOString()
            }
        ];
    },
    
    // Default users data (used when initializing storage)
    getDefaultUsers: function() {
        const today = new Date();
        
        return [
            {
                id: 'admin',
                name: 'Admin User',
                email: 'admin@example.com',
                password: 'password123',
                createdAt: today.toISOString()
            },
            {
                id: 'user1',
                name: 'Kowsik Alluri',
                email: 'kousikalluri@gmail.com',
                password: 'password1234',
                createdAt: today.toISOString()
            },
            {
                id: 'user2',
                name: 'Jagadeesh Kadimi',
                email: 'kadamijagadesh@gmail.com',
                password: 'password123',
                createdAt: today.toISOString()
            }
        ];
    }
};

// Initialize data service when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    DataService.init();
});

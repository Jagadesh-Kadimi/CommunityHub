/**
 * Community Connect Hub - Events Module
 * 
 * This module handles event-specific functionality including event creation,
 * management, joining/leaving events, and event filtering.
 */

const EventsManager = {
    // Current events data
    events: [],
    
    // Initialize events functionality
    init: async function() {
        console.log('Initializing Events Manager...');
        try {
            await this.loadEvents();
        } catch (error) {
            console.error('Error initializing events:', error);
            UI.showNotification('Failed to load events. Please try again later.', 'error');
        }
    },
    
    // Load events from storage
    loadEvents: async function() {
        try {
            this.events = await DataService.getEvents();
            return this.events;
        } catch (error) {
            console.error('Error loading events:', error);
            throw error;
        }
    },
    
    // Get a specific event by ID
    getEventById: async function(eventId) {
        try {
            const events = await this.loadEvents();
            return events.find(event => event.id === eventId);
        } catch (error) {
            console.error(`Error getting event with ID ${eventId}:`, error);
            throw error;
        }
    },
    
    // Create a new event
    createEvent: async function(eventData) {
        try {
            // Validate event data
            if (!this.validateEventData(eventData)) {
                throw new Error('Invalid event data');
            }
            
            // Add creation timestamp and generate ID if not provided
            const newEvent = {
                ...eventData,
                id: eventData.id || Date.now().toString(),
                createdAt: eventData.createdAt || new Date().toISOString(),
                attendees: eventData.attendees || [eventData.createdBy]
            };
            
            // Add to events array
            this.events.push(newEvent);
            
            // Save to storage
            await DataService.saveEvents(this.events);
            
            return newEvent;
        } catch (error) {
            console.error('Error creating event:', error);
            throw error;
        }
    },
    
    // Update an existing event
    updateEvent: async function(eventData) {
        try {
            // Validate event data
            if (!this.validateEventData(eventData) || !eventData.id) {
                throw new Error('Invalid event data');
            }
            
            // Find event index
            const index = this.events.findIndex(e => e.id === eventData.id);
            
            if (index === -1) {
                throw new Error('Event not found');
            }
            
            // Update event
            this.events[index] = {
                ...this.events[index],
                ...eventData,
                updatedAt: new Date().toISOString()
            };
            
            // Save to storage
            await DataService.saveEvents(this.events);
            
            return this.events[index];
        } catch (error) {
            console.error('Error updating event:', error);
            throw error;
        }
    },
    
    // Delete an event
    deleteEvent: async function(eventId) {
        try {
            // Remove event from array
            this.events = this.events.filter(e => e.id !== eventId);
            
            // Save to storage
            await DataService.saveEvents(this.events);
            
            return true;
        } catch (error) {
            console.error('Error deleting event:', error);
            throw error;
        }
    },
    
    // Join an event (add user to attendees)
    joinEvent: async function(eventId, userId) {
        try {
            const event = await this.getEventById(eventId);
            
            if (!event) {
                throw new Error('Event not found');
            }
            
            // Check if event is full
            if (event.attendees && event.attendees.length >= event.maxAttendees) {
                throw new Error('Event is full');
            }
            
            // Check if user is already attending
            if (event.attendees && event.attendees.includes(userId)) {
                throw new Error('Already joined this event');
            }
            
            // Add user to attendees
            if (!event.attendees) {
                event.attendees = [];
            }
            
            event.attendees.push(userId);
            
            // Update event
            await this.updateEvent(event);
            
            return event;
        } catch (error) {
            console.error('Error joining event:', error);
            throw error;
        }
    },
    
    // Leave an event (remove user from attendees)
    leaveEvent: async function(eventId, userId) {
        try {
            const event = await this.getEventById(eventId);
            
            if (!event) {
                throw new Error('Event not found');
            }
            
            // Check if user is attending
            if (!event.attendees || !event.attendees.includes(userId)) {
                throw new Error('Not attending this event');
            }
            
            // Remove user from attendees
            event.attendees = event.attendees.filter(id => id !== userId);
            
            // Update event
            await this.updateEvent(event);
            
            return event;
        } catch (error) {
            console.error('Error leaving event:', error);
            throw error;
        }
    },
    
    // Get all events created by a specific user
    getUserCreatedEvents: async function(userId) {
        try {
            const events = await this.loadEvents();
            return events.filter(event => event.createdBy === userId);
        } catch (error) {
            console.error('Error getting user created events:', error);
            throw error;
        }
    },
    
    // Get all events a user is attending
    getUserAttendingEvents: async function(userId) {
        try {
            const events = await this.loadEvents();
            return events.filter(event => 
                event.attendees && event.attendees.includes(userId)
            );
        } catch (error) {
            console.error('Error getting user attending events:', error);
            throw error;
        }
    },
    
    // Get upcoming events (events with dates in the future)
    getUpcomingEvents: function(limit = null) {
        const today = new Date();
        
        // Filter for events with dates in the future
        let upcomingEvents = this.events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= today;
        });
        
        // Sort by date (closest first)
        upcomingEvents.sort((a, b) => {
            return new Date(a.date) - new Date(b.date);
        });
        
        // Apply limit if provided
        if (limit && limit > 0) {
            upcomingEvents = upcomingEvents.slice(0, limit);
        }
        
        return upcomingEvents;
    },
    
    // Get past events (events with dates in the past)
    getPastEvents: function() {
        const today = new Date();
        
        // Filter for events with dates in the past
        let pastEvents = this.events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate < today;
        });
        
        // Sort by date (most recent first)
        pastEvents.sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });
        
        return pastEvents;
    },
    
    // Filter events by category
    filterEventsByCategory: function(category) {
        if (!category || category === 'all') {
            return this.events;
        }
        
        return this.events.filter(event => event.category === category);
    },
    
    // Search events by text
    searchEvents: function(searchTerm) {
        if (!searchTerm) {
            return this.events;
        }
        
        const term = searchTerm.toLowerCase().trim();
        
        return this.events.filter(event => 
            event.title.toLowerCase().includes(term) ||
            event.description.toLowerCase().includes(term) ||
            event.location.toLowerCase().includes(term)
        );
    },
    
    // Apply multiple filters to events
    filterEvents: function(filters = {}) {
        let filteredEvents = [...this.events];
        
        // Apply category filter
        if (filters.category && filters.category !== 'all') {
            filteredEvents = filteredEvents.filter(event => 
                event.category === filters.category
            );
        }
        
        // Apply search filter
        if (filters.searchTerm) {
            const term = filters.searchTerm.toLowerCase().trim();
            filteredEvents = filteredEvents.filter(event => 
                event.title.toLowerCase().includes(term) ||
                event.description.toLowerCase().includes(term) ||
                event.location.toLowerCase().includes(term)
            );
        }
        
        // Apply date filter
        if (filters.dateRange) {
            switch (filters.dateRange) {
                case 'upcoming':
                    filteredEvents = this.filterUpcomingEvents(filteredEvents);
                    break;
                case 'past':
                    filteredEvents = this.filterPastEvents(filteredEvents);
                    break;
                case 'today':
                    filteredEvents = this.filterTodayEvents(filteredEvents);
                    break;
                case 'week':
                    filteredEvents = this.filterThisWeekEvents(filteredEvents);
                    break;
                case 'month':
                    filteredEvents = this.filterThisMonthEvents(filteredEvents);
                    break;
            }
        }
        
        // Apply sorting
        if (filters.sort) {
            filteredEvents = this.sortEvents(filteredEvents, filters.sort);
        }
        
        return filteredEvents;
    },
    
    // Helper function to filter upcoming events
    filterUpcomingEvents: function(events) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= today;
        });
    },
    
    // Helper function to filter past events
    filterPastEvents: function(events) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate < today;
        });
    },
    
    // Helper function to filter today's events
    filterTodayEvents: function(events) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        return events.filter(event => {
            const eventDate = new Date(event.date);
            eventDate.setHours(0, 0, 0, 0);
            return eventDate >= today && eventDate < tomorrow;
        });
    },
    
    // Helper function to filter this week's events
    filterThisWeekEvents: function(events) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        
        return events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= today && eventDate < nextWeek;
        });
    },
    
    // Helper function to filter this month's events
    filterThisMonthEvents: function(events) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const nextMonth = new Date(today);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        
        return events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= today && eventDate < nextMonth;
        });
    },
    
    // Sort events by different criteria
    sortEvents: function(events, sortBy) {
        const sortedEvents = [...events];
        
        switch (sortBy) {
            case 'date-asc':
                sortedEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
                break;
            case 'date-desc':
                sortedEvents.sort((a, b) => new Date(b.date) - new Date(a.date));
                break;
            case 'title-asc':
                sortedEvents.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'title-desc':
                sortedEvents.sort((a, b) => b.title.localeCompare(a.title));
                break;
            case 'popularity':
                sortedEvents.sort((a, b) => 
                    (b.attendees ? b.attendees.length : 0) - 
                    (a.attendees ? a.attendees.length : 0)
                );
                break;
        }
        
        return sortedEvents;
    },
    
    // Validate event data before saving
    validateEventData: function(eventData) {
        // Check required fields
        const requiredFields = ['title', 'description', 'date', 'time', 'location', 'category', 'maxAttendees', 'createdBy'];
        
        for (const field of requiredFields) {
            if (!eventData[field]) {
                console.error(`Missing required field: ${field}`);
                return false;
            }
        }
        
        // Validate date (must be a valid date)
        const dateObj = new Date(eventData.date);
        if (isNaN(dateObj.getTime())) {
            console.error('Invalid date');
            return false;
        }
        
        // Validate maxAttendees (must be a positive number)
        if (!Number.isInteger(eventData.maxAttendees) || eventData.maxAttendees <= 0) {
            console.error('Invalid maxAttendees: must be a positive integer');
            return false;
        }
        
        return true;
    }
};

// Initialize events functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    EventsManager.init();
});

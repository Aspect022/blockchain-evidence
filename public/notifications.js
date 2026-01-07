// Real-time Notifications System
class NotificationManager {
    constructor() {
        this.socket = null;
        this.userWallet = null;
        this.notifications = [];
        this.unreadCount = 0;
        this.soundEnabled = true;
        this.init();
    }

    init() {
        this.createNotificationUI();
        this.loadNotificationPreferences();
        this.requestNotificationPermission();
    }

    // Connect to WebSocket
    connect(userWallet) {
        if (!userWallet) return;
        
        this.userWallet = userWallet;
        this.socket = io();
        
        this.socket.on('connect', () => {
            console.log('Connected to notification server');
            this.socket.emit('join', userWallet);
            this.loadNotifications();
        });

        this.socket.on('notification', (notification) => {
            this.handleNewNotification(notification);
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from notification server');
        });
    }

    // Create notification UI elements
    createNotificationUI() {
        // Create notification bell in header
        const header = document.querySelector('header') || document.querySelector('.header');
        if (!header) return;

        const notificationContainer = document.createElement('div');
        notificationContainer.className = 'notification-container';
        notificationContainer.innerHTML = `
            <button class="notification-bell" id="notificationBell">
                <i data-lucide="bell"></i>
                <span class="notification-badge" id="notificationBadge" style="display: none;">0</span>
            </button>
            <div class="notification-dropdown" id="notificationDropdown">
                <div class="notification-header">
                    <h3>Notifications</h3>
                    <button class="mark-all-read" id="markAllRead">Mark all read</button>
                </div>
                <div class="notification-list" id="notificationList">
                    <div class="loading">Loading notifications...</div>
                </div>
                <div class="notification-footer">
                    <button class="view-all-notifications" id="viewAllNotifications">View All</button>
                </div>
            </div>
        `;

        header.appendChild(notificationContainer);
        this.attachEventListeners();
        this.addNotificationStyles();
    }

    // Add CSS styles for notifications
    addNotificationStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .notification-container {
                position: relative;
                display: inline-block;
                margin-left: 1rem;
            }

            .notification-bell {
                background: none;
                border: none;
                color: var(--text-color, #333);
                cursor: pointer;
                padding: 0.5rem;
                border-radius: 50%;
                position: relative;
                transition: background-color 0.2s;
            }

            .notification-bell:hover {
                background-color: rgba(0, 0, 0, 0.1);
            }

            .notification-badge {
                position: absolute;
                top: 0;
                right: 0;
                background: #dc3545;
                color: white;
                border-radius: 50%;
                width: 18px;
                height: 18px;
                font-size: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
            }

            .notification-dropdown {
                position: absolute;
                top: 100%;
                right: 0;
                background: white;
                border: 1px solid #ddd;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                width: 350px;
                max-height: 400px;
                z-index: 1000;
                display: none;
            }

            .notification-dropdown.show {
                display: block;
            }

            .notification-header {
                padding: 1rem;
                border-bottom: 1px solid #eee;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .notification-header h3 {
                margin: 0;
                font-size: 1.1rem;
            }

            .mark-all-read {
                background: none;
                border: none;
                color: #007bff;
                cursor: pointer;
                font-size: 0.9rem;
            }

            .notification-list {
                max-height: 250px;
                overflow-y: auto;
            }

            .notification-item {
                padding: 0.75rem 1rem;
                border-bottom: 1px solid #f0f0f0;
                cursor: pointer;
                transition: background-color 0.2s;
            }

            .notification-item:hover {
                background-color: #f8f9fa;
            }

            .notification-item.unread {
                background-color: #e3f2fd;
                border-left: 3px solid #2196f3;
            }

            .notification-title {
                font-weight: 600;
                margin-bottom: 0.25rem;
                font-size: 0.9rem;
            }

            .notification-message {
                color: #666;
                font-size: 0.8rem;
                margin-bottom: 0.25rem;
            }

            .notification-time {
                color: #999;
                font-size: 0.7rem;
            }

            .notification-footer {
                padding: 0.75rem 1rem;
                border-top: 1px solid #eee;
                text-align: center;
            }

            .view-all-notifications {
                background: none;
                border: none;
                color: #007bff;
                cursor: pointer;
                font-size: 0.9rem;
            }

            .loading {
                padding: 2rem;
                text-align: center;
                color: #666;
            }

            .no-notifications {
                padding: 2rem;
                text-align: center;
                color: #666;
            }

            .toast-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                border: 1px solid #ddd;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                padding: 1rem;
                max-width: 300px;
                z-index: 10000;
                animation: slideIn 0.3s ease-out;
            }

            .toast-notification.urgent {
                border-left: 4px solid #dc3545;
            }

            .toast-notification.system {
                border-left: 4px solid #28a745;
            }

            .toast-notification.evidence {
                border-left: 4px solid #007bff;
            }

            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Attach event listeners
    attachEventListeners() {
        const bell = document.getElementById('notificationBell');
        const dropdown = document.getElementById('notificationDropdown');
        const markAllRead = document.getElementById('markAllRead');

        bell?.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('show');
        });

        markAllRead?.addEventListener('click', () => {
            this.markAllAsRead();
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.notification-container')) {
                dropdown.classList.remove('show');
            }
        });
    }

    // Load notifications from server
    async loadNotifications() {
        if (!this.userWallet) return;

        try {
            const response = await fetch(`/api/notifications/${this.userWallet}?limit=20`);
            const data = await response.json();
            
            this.notifications = data.notifications || [];
            this.unreadCount = data.unreadCount || 0;
            this.updateUI();
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    }

    // Handle new notification
    handleNewNotification(notification) {
        this.notifications.unshift(notification);
        this.unreadCount++;
        this.updateUI();
        this.showToast(notification);
        this.playNotificationSound();
        this.showBrowserNotification(notification);
    }

    // Update UI elements
    updateUI() {
        this.updateBadge();
        this.updateNotificationList();
    }

    // Update notification badge
    updateBadge() {
        const badge = document.getElementById('notificationBadge');
        if (!badge) return;

        if (this.unreadCount > 0) {
            badge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }

    // Update notification list
    updateNotificationList() {
        const list = document.getElementById('notificationList');
        if (!list) return;

        if (this.notifications.length === 0) {
            list.innerHTML = '<div class="no-notifications">No notifications</div>';
            return;
        }

        list.innerHTML = this.notifications.map(notification => `
            <div class="notification-item ${!notification.is_read ? 'unread' : ''}" 
                 data-id="${notification.id}">
                <div class="notification-title">${notification.title}</div>
                <div class="notification-message">${notification.message}</div>
                <div class="notification-time">${this.formatTime(notification.created_at)}</div>
            </div>
        `).join('');

        // Add click handlers for notification items
        list.querySelectorAll('.notification-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = item.dataset.id;
                this.markAsRead(id);
            });
        });
    }

    // Show toast notification
    showToast(notification) {
        const toast = document.createElement('div');
        toast.className = `toast-notification ${notification.type}`;
        toast.innerHTML = `
            <div class="notification-title">${notification.title}</div>
            <div class="notification-message">${notification.message}</div>
        `;

        document.body.appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 5000);
    }

    // Play notification sound
    playNotificationSound() {
        if (!this.soundEnabled) return;

        // Create audio context for notification sound
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (error) {
            console.log('Audio notification not supported');
        }
    }

    // Show browser notification
    showBrowserNotification(notification) {
        if (Notification.permission === 'granted') {
            new Notification(notification.title, {
                body: notification.message,
                icon: '/favicon.ico',
                tag: notification.id
            });
        }
    }

    // Request notification permission
    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    // Mark notification as read
    async markAsRead(notificationId) {
        try {
            await fetch(`/api/notifications/${notificationId}/read`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userWallet: this.userWallet })
            });

            // Update local state
            const notification = this.notifications.find(n => n.id == notificationId);
            if (notification && !notification.is_read) {
                notification.is_read = true;
                this.unreadCount--;
                this.updateUI();
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }

    // Mark all notifications as read
    async markAllAsRead() {
        try {
            await fetch('/api/notifications/read-all', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userWallet: this.userWallet })
            });

            // Update local state
            this.notifications.forEach(n => n.is_read = true);
            this.unreadCount = 0;
            this.updateUI();
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    }

    // Load notification preferences
    loadNotificationPreferences() {
        const prefs = localStorage.getItem('notificationPreferences');
        if (prefs) {
            const preferences = JSON.parse(prefs);
            this.soundEnabled = preferences.soundEnabled !== false;
        }
    }

    // Format time for display
    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return date.toLocaleDateString();
    }

    // Disconnect from WebSocket
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

// Global notification manager instance
window.notificationManager = new NotificationManager();

// Auto-connect when user wallet is available
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in and connect
    const checkUserAndConnect = () => {
        const userWallet = localStorage.getItem('userWallet') || window.userWallet;
        if (userWallet && window.notificationManager) {
            window.notificationManager.connect(userWallet);
        }
    };

    // Try to connect immediately
    checkUserAndConnect();

    // Also listen for wallet connection events
    window.addEventListener('walletConnected', (event) => {
        if (event.detail.wallet && window.notificationManager) {
            window.notificationManager.connect(event.detail.wallet);
        }
    });
});
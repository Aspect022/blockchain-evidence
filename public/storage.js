/**
 * Real Storage System - LocalStorage + API Integration
 */

const API_BASE = window.config?.API_BASE_URL || 'https://blockchain-evidence.onrender.com/api';

// Storage system with localStorage and backend API
window.storage = {
    // User management functions (existing)
    async getUser(walletAddress) {
        const userData = localStorage.getItem('evidUser_' + walletAddress);
        return userData ? JSON.parse(userData) : null;
    },
    
    async saveUser(userData) {
        localStorage.setItem('evidUser_' + userData.walletAddress, JSON.stringify(userData));
        return true;
    },
    
    async getAllUsers() {
        const users = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('evidUser_')) {
                try {
                    const userData = JSON.parse(localStorage.getItem(key));
                    users.push(userData);
                } catch (e) {}
            }
        }
        return users;
    },
    
    // Evidence API functions (new)
    async getAllEvidence() {
        try {
            const response = await fetch(`${API_BASE}/evidence`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            return data.evidence || [];
        } catch (error) {
            console.error('Error fetching evidence:', error);
            return [];
        }
    },
    
    async getEvidenceById(id) {
        try {
            const response = await fetch(`${API_BASE}/evidence/${id}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            return data.evidence || null;
        } catch (error) {
            console.error('Error fetching evidence by ID:', error);
            return null;
        }
    },
    
    async getEvidenceByCase(caseId) {
        try {
            const response = await fetch(`${API_BASE}/evidence/case/${caseId}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            return data.evidence || [];
        } catch (error) {
            console.error('Error fetching evidence by case:', error);
            return [];
        }
    },
    
    async getAllCases() {
        try {
            const response = await fetch(`${API_BASE}/cases`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            return data.cases || [];
        } catch (error) {
            console.error('Error fetching cases:', error);
            return [];
        }
    },
    
    async getCaseById(id) {
        try {
            const response = await fetch(`${API_BASE}/cases/${id}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            return data.case || null;
        } catch (error) {
            console.error('Error fetching case by ID:', error);
            return null;
        }
    }
};

// Simple notifications
window.simpleNotifications = {
    addNotification(title, message, type) {
        console.log(`${type}: ${title} - ${message}`);
    }
};
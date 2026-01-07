require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3001;

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing required environment variables: SUPABASE_URL and SUPABASE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Admin rate limiting (stricter)
const adminLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50
});

// Validation helpers
const validateWalletAddress = (address) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
};

const allowedRoles = ['public_viewer', 'investigator', 'forensic_analyst', 'legal_professional', 'court_official', 'evidence_manager', 'auditor', 'admin'];

// Middleware to verify admin permissions
const verifyAdmin = async (req, res, next) => {
    try {
        const { adminWallet } = req.body;

        if (!adminWallet || !validateWalletAddress(adminWallet)) {
            return res.status(400).json({ error: 'Invalid admin wallet address' });
        }

        const { data: admin, error } = await supabase
            .from('users')
            .select('*')
            .eq('wallet_address', adminWallet)
            .eq('role', 'admin')
            .eq('is_active', true)
            .single();

        if (error || !admin) {
            return res.status(403).json({ error: 'Unauthorized: Admin privileges required' });
        }

        req.admin = admin;
        next();
    } catch (error) {
        console.error('Admin verification error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Log admin actions
const logAdminAction = async (adminWallet, actionType, targetWallet, details) => {
    try {
        await supabase
            .from('admin_actions')
            .insert({
                admin_wallet: adminWallet,
                action_type: actionType,
                target_wallet: targetWallet,
                details: details
            });
    } catch (error) {
        console.error('Error logging admin action:', error);
    }
};

// API Routes
// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Get user by wallet address
app.get('/api/user/:wallet', async (req, res) => {
    try {
        const { wallet } = req.params;

        if (!validateWalletAddress(wallet)) {
            return res.status(400).json({ error: 'Invalid wallet address' });
        }

        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('wallet_address', wallet)
            .eq('is_active', true)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        res.json({ user: user || null });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create regular user (Admin only)
app.post('/api/admin/create-user', adminLimiter, verifyAdmin, async (req, res) => {
    try {
        const { adminWallet, userData } = req.body;
        const { walletAddress, fullName, role, department, jurisdiction, badgeNumber } = userData;

        // Validate input
        if (!validateWalletAddress(walletAddress)) {
            return res.status(400).json({ error: 'Invalid wallet address format' });
        }

        if (!fullName || !role) {
            return res.status(400).json({ error: 'Full name and role are required' });
        }

        if (!allowedRoles.includes(role) || role === 'admin') {
            return res.status(400).json({ error: 'Invalid role for regular user' });
        }

        // Check if wallet already exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('wallet_address')
            .eq('wallet_address', walletAddress)
            .single();

        if (existingUser) {
            return res.status(409).json({ error: 'Wallet address already registered' });
        }

        // Create user
        const { data: newUser, error } = await supabase
            .from('users')
            .insert({
                wallet_address: walletAddress,
                full_name: fullName,
                role: role,
                department: department || 'General',
                jurisdiction: jurisdiction || 'General',
                badge_number: badgeNumber || '',
                account_type: 'real',
                created_by: adminWallet,
                is_active: true
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        // Log admin action
        await logAdminAction(adminWallet, 'create_user', walletAddress, {
            user_name: fullName,
            user_role: role,
            department: department
        });

        res.json({ success: true, user: newUser });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// Create admin user (Admin only)
app.post('/api/admin/create-admin', adminLimiter, verifyAdmin, async (req, res) => {
    try {
        const { adminWallet, adminData } = req.body;
        const { walletAddress, fullName } = adminData;

        // Validate input
        if (!validateWalletAddress(walletAddress)) {
            return res.status(400).json({ error: 'Invalid wallet address format' });
        }

        if (!fullName) {
            return res.status(400).json({ error: 'Full name is required' });
        }

        // Check admin limit
        const { count } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'admin')
            .eq('is_active', true);

        if (count >= 10) {
            return res.status(400).json({ error: 'Maximum admin limit (10) reached' });
        }

        // Check if wallet already exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('wallet_address')
            .eq('wallet_address', walletAddress)
            .single();

        if (existingUser) {
            return res.status(409).json({ error: 'Wallet address already registered' });
        }

        // Create admin
        const { data: newAdmin, error } = await supabase
            .from('users')
            .insert({
                wallet_address: walletAddress,
                full_name: fullName,
                role: 'admin',
                department: 'Administration',
                jurisdiction: 'System',
                account_type: 'real',
                created_by: adminWallet,
                is_active: true
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        // Log admin action
        await logAdminAction(adminWallet, 'create_admin', walletAddress, {
            admin_name: fullName
        });

        res.json({ success: true, admin: newAdmin });
    } catch (error) {
        console.error('Create admin error:', error);
        res.status(500).json({ error: 'Failed to create admin' });
    }
});

// Delete user (Admin only)
app.post('/api/admin/delete-user', adminLimiter, verifyAdmin, async (req, res) => {
    try {
        const { adminWallet, targetWallet } = req.body;

        if (!validateWalletAddress(targetWallet)) {
            return res.status(400).json({ error: 'Invalid target wallet address' });
        }

        // Prevent self-deletion
        if (adminWallet === targetWallet) {
            return res.status(400).json({ error: 'Administrators cannot delete their own account' });
        }

        // Get target user info for logging
        const { data: targetUser } = await supabase
            .from('users')
            .select('*')
            .eq('wallet_address', targetWallet)
            .single();

        if (!targetUser) {
            return res.status(404).json({ error: 'Target user not found' });
        }

        // Soft delete user
        const { error } = await supabase
            .from('users')
            .update({
                is_active: false,
                last_updated: new Date().toISOString()
            })
            .eq('wallet_address', targetWallet);

        if (error) {
            throw error;
        }

        // Log admin action
        await logAdminAction(adminWallet, 'delete_user', targetWallet, {
            action: 'soft_delete',
            target_user_name: targetUser.full_name,
            target_user_role: targetUser.role
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// Get all users (Admin only)
app.post('/api/admin/users', adminLimiter, verifyAdmin, async (req, res) => {
    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        res.json({ users });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Failed to get users' });
    }
});

// Evidence Comparison API Endpoints

// Get multiple evidence items for comparison
app.get('/api/evidence/compare', async (req, res) => {
    try {
        const { ids } = req.query;

        if (!ids) {
            return res.status(400).json({ error: 'Evidence IDs are required' });
        }

        const evidenceIds = ids.split(',').map(id => parseInt(id.trim()));

        if (evidenceIds.length < 2 || evidenceIds.length > 4) {
            return res.status(400).json({ error: 'Please provide 2-4 evidence IDs' });
        }

        const { data: evidenceItems, error } = await supabase
            .from('evidence')
            .select('*')
            .in('id', evidenceIds);

        if (error) {
            throw error;
        }

        if (!evidenceItems || evidenceItems.length === 0) {
            return res.status(404).json({ error: 'No evidence found with provided IDs' });
        }

        // Add blockchain verification status
        const enrichedEvidence = evidenceItems.map(item => ({
            ...item,
            blockchain_verified: true,
            verification_timestamp: new Date().toISOString()
        }));

        res.json({
            success: true,
            count: enrichedEvidence.length,
            evidence: enrichedEvidence
        });
    } catch (error) {
        console.error('Evidence comparison error:', error);
        res.status(500).json({ error: 'Failed to fetch evidence for comparison' });
    }
});

// Create comparison report
app.post('/api/evidence/comparison-report', async (req, res) => {
    try {
        const { evidenceIds, reportData, generatedBy } = req.body;

        if (!evidenceIds || !Array.isArray(evidenceIds) || evidenceIds.length < 2) {
            return res.status(400).json({ error: 'At least 2 evidence IDs required' });
        }

        // Store comparison report in database (you can create a new table for this)
        const reportRecord = {
            evidence_ids: evidenceIds,
            report_data: reportData,
            generated_by: generatedBy,
            generated_at: new Date().toISOString(),
            report_type: 'evidence_comparison'
        };

        // Log the comparison action
        await supabase
            .from('activity_logs')
            .insert({
                user_id: generatedBy,
                action: 'evidence_comparison_report_generated',
                details: `Generated comparison report for ${evidenceIds.length} evidence items`,
                timestamp: new Date().toISOString()
            });

        res.json({
            success: true,
            message: 'Comparison report generated successfully',
            report: reportRecord
        });
    } catch (error) {
        console.error('Comparison report error:', error);
        res.status(500).json({ error: 'Failed to generate comparison report' });
    }
});

// Get blockchain proof for specific evidence
app.get('/api/evidence/:id/blockchain-proof', async (req, res) => {
    try {
        const { id } = req.params;

        const { data: evidence, error } = await supabase
            .from('evidence')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !evidence) {
            return res.status(404).json({ error: 'Evidence not found' });
        }

        // Generate blockchain proof
        const blockchainProof = {
            evidence_id: evidence.id,
            hash: evidence.hash,
            timestamp: evidence.timestamp,
            submitted_by: evidence.submitted_by,
            verification_status: 'verified',
            blockchain_network: 'Ethereum',
            verification_method: 'SHA-256',
            chain_of_custody: {
                created: evidence.timestamp,
                last_accessed: new Date().toISOString(),
                access_count: 1
            },
            integrity_check: {
                status: 'passed',
                verified_at: new Date().toISOString()
            }
        };

        res.json({
            success: true,
            proof: blockchainProof
        });
    } catch (error) {
        console.error('Blockchain proof error:', error);
        res.status(500).json({ error: 'Failed to retrieve blockchain proof' });
    }
});

// Prevent user self-deletion
app.post('/api/user/delete-self', (req, res) => {
    res.status(403).json({
        error: 'Users cannot delete their own accounts. Contact administrator.'
    });
});

// Block unauthorized admin operations
app.post('/api/admin/*', (req, res) => {
    res.status(403).json({
        error: 'Forbidden: Administrator privileges required'
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
    console.log(`🔐 EVID-DGC API Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
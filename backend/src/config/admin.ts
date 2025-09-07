/**
 * SaveMyRyde Admin Configuration Module
 *
 * This module provides configuration settings and utilities for the admin platform,
 * including permission levels, feature flags, and admin-specific settings.
 */

import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { getPool } from './database';

// Admin permission levels
export enum AdminPermissionLevel {
  VIEWER = 'viewer',      // Can only view data
  EDITOR = 'editor',      // Can edit listings, approve payments
  MANAGER = 'manager',    // Can manage users, access analytics
  ADMIN = 'admin',        // Full access, can manage other admins
  SUPER_ADMIN = 'super_admin', // System-level access
}

// Admin feature flags
export interface AdminFeatureFlags {
  enableAnalytics: boolean;
  enableBulkOperations: boolean;
  enableUserImpersonation: boolean;
  enableSystemSettings: boolean;
  enableApiKeys: boolean;
  enableExports: boolean;
  enableAuditLogs: boolean;
}

// Default feature flags based on permission level
export const defaultFeatureFlags: Record<AdminPermissionLevel, AdminFeatureFlags> = {
  [AdminPermissionLevel.VIEWER]: {
    enableAnalytics: true,
    enableBulkOperations: false,
    enableUserImpersonation: false,
    enableSystemSettings: false,
    enableApiKeys: false,
    enableExports: true,
    enableAuditLogs: false,
  },
  [AdminPermissionLevel.EDITOR]: {
    enableAnalytics: true,
    enableBulkOperations: true,
    enableUserImpersonation: false,
    enableSystemSettings: false,
    enableApiKeys: false,
    enableExports: true,
    enableAuditLogs: false,
  },
  [AdminPermissionLevel.MANAGER]: {
    enableAnalytics: true,
    enableBulkOperations: true,
    enableUserImpersonation: true,
    enableSystemSettings: false,
    enableApiKeys: true,
    enableExports: true,
    enableAuditLogs: true,
  },
  [AdminPermissionLevel.ADMIN]: {
    enableAnalytics: true,
    enableBulkOperations: true,
    enableUserImpersonation: true,
    enableSystemSettings: true,
    enableApiKeys: true,
    enableExports: true,
    enableAuditLogs: true,
  },
  [AdminPermissionLevel.SUPER_ADMIN]: {
    enableAnalytics: true,
    enableBulkOperations: true,
    enableUserImpersonation: true,
    enableSystemSettings: true,
    enableApiKeys: true,
    enableExports: true,
    enableAuditLogs: true,
  },
};

// Admin sections configuration
export const adminSections = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: 'dashboard',
    requiredPermission: AdminPermissionLevel.VIEWER,
  },
  {
    id: 'listings',
    name: 'Listings',
    icon: 'listings',
    requiredPermission: AdminPermissionLevel.VIEWER,
    subsections: [
      { id: 'all', name: 'All Listings' },
      { id: 'pending', name: 'Pending Approval' },
      { id: 'active', name: 'Active' },
      { id: 'sold', name: 'Sold' },
      { id: 'expired', name: 'Expired' },
    ],
  },
  {
    id: 'users',
    name: 'Users',
    icon: 'users',
    requiredPermission: AdminPermissionLevel.EDITOR,
    subsections: [
      { id: 'all', name: 'All Users' },
      { id: 'sellers', name: 'Sellers' },
      { id: 'buyers', name: 'Buyers' },
      { id: 'verification', name: 'Pending Verification' },
    ],
  },
  {
    id: 'payments',
    name: 'Payments',
    icon: 'payments',
    requiredPermission: AdminPermissionLevel.EDITOR,
    subsections: [
      { id: 'all', name: 'All Payments' },
      { id: 'pending', name: 'Pending Verification' },
      { id: 'successful', name: 'Successful' },
      { id: 'failed', name: 'Failed' },
    ],
  },
  {
    id: 'verifications',
    name: 'Verifications',
    icon: 'verifications',
    requiredPermission: AdminPermissionLevel.EDITOR,
    subsections: [
      { id: 'pending', name: 'Pending Requests' },
      { id: 'scheduled', name: 'Scheduled' },
      { id: 'completed', name: 'Completed' },
    ],
  },
  {
    id: 'credits',
    name: 'Credit System',
    icon: 'credits',
    requiredPermission: AdminPermissionLevel.MANAGER,
    subsections: [
      { id: 'transactions', name: 'Transactions' },
      { id: 'adjustments', name: 'Manual Adjustments' },
      { id: 'packages', name: 'Credit Packages' },
    ],
  },
  {
    id: 'analytics',
    name: 'Analytics',
    icon: 'analytics',
    requiredPermission: AdminPermissionLevel.MANAGER,
    subsections: [
      { id: 'dashboard', name: 'Overview' },
      { id: 'sales', name: 'Sales Metrics' },
      { id: 'users', name: 'User Metrics' },
      { id: 'listings', name: 'Listing Metrics' },
      { id: 'revenue', name: 'Revenue' },
    ],
  },
  {
    id: 'marketing',
    name: 'Marketing',
    icon: 'marketing',
    requiredPermission: AdminPermissionLevel.MANAGER,
    subsections: [
      { id: 'promotions', name: 'Promotions' },
      { id: 'email', name: 'Email Campaigns' },
      { id: 'referrals', name: 'Referral Program' },
    ],
  },
  {
    id: 'content',
    name: 'Content',
    icon: 'content',
    requiredPermission: AdminPermissionLevel.EDITOR,
    subsections: [
      { id: 'pages', name: 'Pages' },
      { id: 'blog', name: 'Blog Posts' },
      { id: 'faq', name: 'FAQ' },
    ],
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: 'settings',
    requiredPermission: AdminPermissionLevel.ADMIN,
    subsections: [
      { id: 'general', name: 'General' },
      { id: 'payments', name: 'Payment Methods' },
      { id: 'email', name: 'Email' },
      { id: 'api', name: 'API Keys' },
      { id: 'backups', name: 'Backups' },
    ],
  },
  {
    id: 'admins',
    name: 'Admin Users',
    icon: 'admins',
    requiredPermission: AdminPermissionLevel.ADMIN,
  },
  {
    id: 'audit',
    name: 'Audit Logs',
    icon: 'audit',
    requiredPermission: AdminPermissionLevel.ADMIN,
  },
];

// JWT settings for admin auth
export const jwtAdminSettings = {
  secret: process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET || 'dev-admin-jwt-secret',
  expiresIn: '24h',
};

// Generate admin JWT token
export const generateAdminToken = (adminId: string, permissionLevel: AdminPermissionLevel): string => {
  return jwt.sign(
    {
      id: adminId,
      role: 'admin',
      permissionLevel,
      features: defaultFeatureFlags[permissionLevel]
    },
    jwtAdminSettings.secret,
    { expiresIn: jwtAdminSettings.expiresIn }
  );
};

// Get admin record by ID
export const getAdminById = async (adminId: string) => {
  const pool = getPool();
  const result = await pool.query(
    'SELECT id, name, email, role, permission_level FROM users WHERE id = $1 AND role = $2',
    [adminId, 'admin']
  );
  return result.rows[0] || null;
};

// Admin authentication middleware
export const authenticateAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, jwtAdminSettings.secret) as any;

    if (!decoded || !decoded.id || decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Not an admin user' });
    }

    // Get admin from database
    const admin = await getAdminById(decoded.id);
    if (!admin) {
      return res.status(403).json({ error: 'Forbidden: Admin user not found' });
    }

    // Attach admin data to request
    req.user = {
      ...admin,
      permissionLevel: decoded.permissionLevel,
      features: decoded.features || defaultFeatureFlags[decoded.permissionLevel as AdminPermissionLevel],
    };

    next();
  } catch (error) {
    console.error('Admin authentication error:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

// Check if admin has specific permission level
export const requirePermission = (requiredLevel: AdminPermissionLevel) => {
  const permissionHierarchy: Record<AdminPermissionLevel, number> = {
    [AdminPermissionLevel.VIEWER]: 0,
    [AdminPermissionLevel.EDITOR]: 1,
    [AdminPermissionLevel.MANAGER]: 2,
    [AdminPermissionLevel.ADMIN]: 3,
    [AdminPermissionLevel.SUPER_ADMIN]: 4,
  };

  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.permissionLevel) {
      return res.status(403).json({ error: 'Forbidden: No permission level found' });
    }

    const userPermissionLevel = req.user.permissionLevel as AdminPermissionLevel;

    if (permissionHierarchy[userPermissionLevel] >= permissionHierarchy[requiredLevel]) {
      return next();
    }

    return res.status(403).json({
      error: `Forbidden: Requires ${requiredLevel} permission, you have ${userPermissionLevel}`,
    });
  };
};

// Log admin activity
export const logAdminActivity = async (
  adminId: string,
  action: string,
  resourceType: string,
  resourceId: string,
  details: Record<string, any>
) => {
  try {
    const pool = getPool();
    await pool.query(
      `INSERT INTO admin_activity_logs
       (admin_id, action, resource_type, resource_id, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [adminId, action, resourceType, resourceId, JSON.stringify(details)]
    );
  } catch (error) {
    console.error('Failed to log admin activity:', error);
  }
};

// Create initial admin user if none exists
export const ensureAdminExists = async (): Promise<void> => {
  try {
    const pool = getPool();

    // Check if any admin user exists
    const adminCheck = await pool.query('SELECT COUNT(*) FROM users WHERE role = $1', ['admin']);

    if (Number(adminCheck.rows[0].count) === 0) {
      console.log('No admin users found, creating default admin user...');

      // Create default admin user
      const bcrypt = require('bcryptjs');
      const passwordHash = await bcrypt.hash('admin123', 10);

      await pool.query(
        `INSERT INTO users (name, email, phone, password_hash, role, permission_level)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          'System Admin',
          process.env.DEFAULT_ADMIN_EMAIL || 'admin@savemyryde.co.ke',
          '254700000000',
          passwordHash,
          'admin',
          AdminPermissionLevel.SUPER_ADMIN
        ]
      );

      console.log('Default admin user created.');
    }
  } catch (error) {
    console.error('Failed to ensure admin exists:', error);
  }
};

// Apply schema changes needed for admin functionality
export const applyAdminSchema = async (): Promise<void> => {
  try {
    const pool = getPool();

    // Add permission_level column to users table if it doesn't exist
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'users' AND column_name = 'permission_level'
        ) THEN
          ALTER TABLE users ADD COLUMN permission_level TEXT;
        END IF;
      END$$;
    `);

    // Create admin activity logs table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_activity_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        admin_id TEXT NOT NULL,
        action TEXT NOT NULL,
        resource_type TEXT NOT NULL,
        resource_id TEXT NOT NULL,
        details JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Create indexes for better query performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_activity_logs(admin_id);
      CREATE INDEX IF NOT EXISTS idx_admin_logs_resource_type ON admin_activity_logs(resource_type);
      CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_activity_logs(created_at);
    `);

    console.log('Admin schema applied successfully');
  } catch (error) {
    console.error('Failed to apply admin schema:', error);
  }
};

export default {
  AdminPermissionLevel,
  defaultFeatureFlags,
  adminSections,
  generateAdminToken,
  authenticateAdmin,
  requirePermission,
  logAdminActivity,
  ensureAdminExists,
  applyAdminSchema,
};

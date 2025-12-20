/**
 * ABO ZIEN - Authentication Routes
 * Local authentication with JWT
 */

import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { getDatabase, DB } from '../database/localDB.js';

const router = express.Router();
// ??? Fallback to RARE_JWT_SECRET if JWT_SECRET not found
const JWT_SECRET = process.env.JWT_SECRET || process.env.RARE_JWT_SECRET || crypto.randomBytes(32).toString('hex');

/**
 * Register user
 * POST /api/auth/register
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user exists
    const existing = DB.users.findByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const userId = `user_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
    DB.users.create({
      id: userId,
      email,
      name: name || email,
      passwordHash,
    });

    // Generate token
    const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '30d' });

    res.json({
      success: true,
      token,
      user: {
        id: userId,
        email,
        name: name || email,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

/**
 * Login with Face ID or Password
 * POST /api/auth/login
 * ??? Cognitive Loop ??? Kernel ??? Auth Agent
 */
router.post('/login', async (req, res) => {
  try {
    const { method, password, faceIdData } = req.body;

    // Family password authentication
    const FAMILY_PASSWORD = '?????? ???? ????????????';

    if (method === 'password') {
      if (!password || password.trim() !== FAMILY_PASSWORD) {
        return res.status(401).json({ 
          success: false,
          error: 'Invalid password' 
        });
      }

      // Generate token for family password
      const token = jwt.sign({ 
        userId: 'family_user',
        method: 'password',
        timestamp: Date.now(),
      }, JWT_SECRET, { expiresIn: '30d' });

      // Create session
      const sessionId = `session_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
      DB.sessions.create({
        id: sessionId,
        userId: 'family_user',
        token,
        expiresAt: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
      });

      return res.json({
        success: true,
        token,
        user: {
          id: 'family_user',
          name: 'Family Member',
        },
      });
    }

    if (method === 'faceid') {
      // Face ID authentication (simplified - real implementation would verify Face ID)
      if (!faceIdData || !faceIdData.success) {
        return res.status(401).json({ 
          success: false,
          error: 'Face ID authentication failed' 
        });
      }

      // Generate token for Face ID
      const token = jwt.sign({ 
        userId: 'family_user',
        method: 'faceid',
        timestamp: Date.now(),
      }, JWT_SECRET, { expiresIn: '30d' });

      // Create session
      const sessionId = `session_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
      DB.sessions.create({
        id: sessionId,
        userId: 'family_user',
        token,
        expiresAt: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
      });

      return res.json({
        success: true,
        token,
        user: {
          id: 'family_user',
          name: 'Family Member',
        },
      });
    }

    // Traditional email/password login
    const { email, password: emailPassword } = req.body;

    if (!email || !emailPassword) {
      return res.status(400).json({ 
        success: false,
        error: 'Email and password are required' 
      });
    }

    // Find user
    const user = DB.users.findByEmail(email);
    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid credentials' 
      });
    }

    // Verify password
    const valid = await bcrypt.compare(emailPassword, user.password_hash);
    if (!valid) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid credentials' 
      });
    }

    // Generate token
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

    // Create session
    const sessionId = `session_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
    DB.sessions.create({
      id: sessionId,
      userId: user.id,
      token,
      expiresAt: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Login failed',
      message: error.message,
    });
  }
});

/**
 * Verify token
 * POST /api/auth/verify
 */
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Verify JWT
    const decoded = jwt.verify(token, JWT_SECRET);

    // Check session
    const session = DB.sessions.findByToken(token);
    if (!session) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    // Get user
    const user = DB.users.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

/**
 * Logout
 * POST /api/auth/logout
 */
router.post('/logout', async (req, res) => {
  try {
    const { token } = req.body;

    if (token) {
      DB.sessions.delete(token);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

/**
 * Change password
 * POST /api/auth/change-password
 */
router.post('/change-password', async (req, res) => {
  try {
    // #region agent log
    if (process.env.NODE_ENV === 'development') {
      fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/auth.js:change-password',message:'Change password request started',data:{hasOldPassword:!!req.body.oldPassword,hasNewPassword:!!req.body.newPassword},timestamp:Date.now(),sessionId:'auth-session',runId:'run1',hypothesisId:'AUTH_CHANGE_PASSWORD_START'})}).catch(()=>{});
    }
    // #endregion

    const { oldPassword, newPassword, userId } = req.body;

    // Input validation
    if (!oldPassword || !newPassword) {
      // #region agent log
      if (process.env.NODE_ENV === 'development') {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/auth.js:change-password',message:'Change password validation failed',data:{error:'Old password and new password are required'},timestamp:Date.now(),sessionId:'auth-session',runId:'run1',hypothesisId:'AUTH_CHANGE_PASSWORD_VALIDATION'})}).catch(()=>{});
      }
      // #endregion
      return res.status(400).json({ error: 'Old password and new password are required' });
    }

    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      // #region agent log
      if (process.env.NODE_ENV === 'development') {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/auth.js:change-password',message:'Change password validation failed - weak password',data:{error:'New password must be at least 6 characters',passwordLength:newPassword.length},timestamp:Date.now(),sessionId:'auth-session',runId:'run1',hypothesisId:'AUTH_CHANGE_PASSWORD_VALIDATION_WEAK'})}).catch(()=>{});
      }
      // #endregion
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    try {
      // Get user (from token or userId)
      const targetUserId = userId || req.headers['x-user-id'] || 'family_user';
      const user = DB.users.findById(targetUserId);

      if (!user) {
        // #region agent log
        if (process.env.NODE_ENV === 'development') {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/auth.js:change-password',message:'Change password user not found',data:{userId:targetUserId},timestamp:Date.now(),sessionId:'auth-session',runId:'run1',hypothesisId:'AUTH_CHANGE_PASSWORD_USER_NOT_FOUND'})}).catch(()=>{});
        }
        // #endregion
        return res.status(404).json({ error: 'User not found' });
      }

      // Verify old password (for family password, check against FAMILY_PASSWORD)
      const FAMILY_PASSWORD = '?????? ???? ????????????';
      if (targetUserId === 'family_user' && oldPassword !== FAMILY_PASSWORD) {
        // #region agent log
        if (process.env.NODE_ENV === 'development') {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/auth.js:change-password',message:'Change password invalid old password',data:{userId:targetUserId},timestamp:Date.now(),sessionId:'auth-session',runId:'run1',hypothesisId:'AUTH_CHANGE_PASSWORD_INVALID_OLD'})}).catch(()=>{});
        }
        // #endregion
        return res.status(401).json({ error: 'Invalid old password' });
      }

      if (user.passwordHash) {
        const isValid = await bcrypt.compare(oldPassword, user.passwordHash);
        if (!isValid) {
          // #region agent log
          if (process.env.NODE_ENV === 'development') {
            fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/auth.js:change-password',message:'Change password invalid old password hash',data:{userId:targetUserId},timestamp:Date.now(),sessionId:'auth-session',runId:'run1',hypothesisId:'AUTH_CHANGE_PASSWORD_INVALID_HASH'})}).catch(()=>{});
          }
          // #endregion
          return res.status(401).json({ error: 'Invalid old password' });
        }
      }

      // Hash new password
      const newPasswordHash = await bcrypt.hash(newPassword, 10);

      // Update user password
      DB.users.update(targetUserId, {
        passwordHash: newPasswordHash,
      });

      // #region agent log
      if (process.env.NODE_ENV === 'development') {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/auth.js:change-password',message:'Change password success',data:{userId:targetUserId},timestamp:Date.now(),sessionId:'auth-session',runId:'run1',hypothesisId:'AUTH_CHANGE_PASSWORD_SUCCESS'})}).catch(()=>{});
      }
      // #endregion

      res.json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (updateError) {
      // #region agent log
      if (process.env.NODE_ENV === 'development') {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/auth.js:change-password',message:'Change password operation failed',data:{error:updateError.message,stack:updateError.stack},timestamp:Date.now(),sessionId:'auth-session',runId:'run1',hypothesisId:'AUTH_CHANGE_PASSWORD_ERROR'})}).catch(()=>{});
      }
      // #endregion
      console.error('Change password operation error:', updateError);
      res.status(500).json({ error: 'Failed to change password' });
    }
  } catch (error) {
    // #region agent log
    if (process.env.NODE_ENV === 'development') {
      fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'backend/src/routes/auth.js:change-password',message:'Change password route error',data:{error:error.message,stack:error.stack},timestamp:Date.now(),sessionId:'auth-session',runId:'run1',hypothesisId:'AUTH_CHANGE_PASSWORD_ROUTE_ERROR'})}).catch(()=>{});
    }
    // #endregion
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

export default router;



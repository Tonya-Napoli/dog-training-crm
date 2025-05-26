import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Basic authentication middleware
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('x-auth-token');

    // Check if no token
    if (!token) {
      return res.status(401).json({ 
        message: 'No token provided, authorization denied' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database to ensure they still exist and are active
    const user = await User.findById(decoded.user.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        message: 'Token is valid but user not found' 
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        message: 'Account has been deactivated' 
      });
    }

    // Set user data from database to request object
    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      accessLevel: user.accessLevel
    };
    
    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' });
    }
    
    res.status(401).json({ message: 'Token verification failed' });
  }
};

// Admin-only authentication middleware
const adminAuth = async (req, res, next) => {
  try {
    // First run basic authentication
    await new Promise((resolve, reject) => {
      auth(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Access denied. Admin privileges required.' 
      });
    }

    next();
  } catch (err) {
    // Auth middleware already handled the response
    return;
  }
};

// Trainer-only authentication middleware
const trainerAuth = async (req, res, next) => {
  try {
    // First run basic authentication
    await new Promise((resolve, reject) => {
      auth(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Check if user is trainer
    if (req.user.role !== 'trainer') {
      return res.status(403).json({ 
        message: 'Access denied. Trainer privileges required.' 
      });
    }

    next();
  } catch (err) {
    // Auth middleware already handled the response
    return;
  }
};

// Client-only authentication middleware
const clientAuth = async (req, res, next) => {
  try {
    // First run basic authentication
    await new Promise((resolve, reject) => {
      auth(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Check if user is client
    if (req.user.role !== 'client') {
      return res.status(403).json({ 
        message: 'Access denied. Client access required.' 
      });
    }

    next();
  } catch (err) {
    // Auth middleware already handled the response
    return;
  }
};

// Multi-role authentication middleware
const roleAuth = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      // First run basic authentication
      await new Promise((resolve, reject) => {
        auth(req, res, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Check if user role is in allowed roles
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ 
          message: `Access denied. Required roles: ${allowedRoles.join(', ')}` 
        });
      }

      next();
    } catch (err) {
      // Auth middleware already handled the response
      return;
    }
  };
};

// Admin access level check (full, limited, readonly)
const adminAccessLevel = (requiredLevel) => {
  const accessLevels = {
    'readonly': 1,
    'limited': 2,
    'full': 3
  };

  return async (req, res, next) => {
    try {
      // First run admin authentication
      await new Promise((resolve, reject) => {
        adminAuth(req, res, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Check access level
      const userLevel = accessLevels[req.user.accessLevel] || 0;
      const requiredLevelNum = accessLevels[requiredLevel] || 0;

      if (userLevel < requiredLevelNum) {
        return res.status(403).json({ 
          message: `Insufficient access level. Required: ${requiredLevel}` 
        });
      }

      next();
    } catch (err) {
      // Previous middleware already handled the response
      return;
    }
  };
};

// Optional authentication (for routes that work both with and without auth)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('x-auth-token');
    
    if (!token) {
      // No token provided, continue without user data
      req.user = null;
      return next();
    }

    // Token provided, try to authenticate
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.user.id).select('-password');
    
    if (user && user.isActive) {
      req.user = {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        accessLevel: user.accessLevel
      };
    } else {
      req.user = null;
    }
    
    next();
  } catch (err) {
    // Invalid token, but since this is optional auth, continue without user
    req.user = null;
    next();
  }
};

export default auth;
export { 
  adminAuth, 
  trainerAuth, 
  clientAuth, 
  roleAuth, 
  adminAccessLevel, 
  optionalAuth 
};
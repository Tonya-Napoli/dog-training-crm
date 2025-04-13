// src/utils/fileUpload.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload directories exist
const createDirIfNotExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Create directories
createDirIfNotExists('uploads/profile-images');
createDirIfNotExists('uploads/vaccination-records');

// Storage configuration for profile images
const profileImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profile-images/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Storage configuration for vaccination records
const vaccinationRecordStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/vaccination-records/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter - only allow images
const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Configure multer for different upload types
export const uploadProfileImage = multer({
  storage: profileImageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  },
  fileFilter: fileFilter
});

export const uploadVaccinationRecord = multer({
  storage: vaccinationRecordStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max file size
  },
  fileFilter: fileFilter
});

// Helper function to get file URL
export const getFileUrl = (req, filename, type) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  if (type === 'profile') {
    return `${baseUrl}/uploads/profile-images/${filename}`;
  } else if (type === 'vaccination') {
    return `${baseUrl}/uploads/vaccination-records/${filename}`;
  }
  return null;
};
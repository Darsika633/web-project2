import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import { ENV } from '../config/env.js';

// Configure multer for memory storage
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
    files: 5 // Maximum 5 files at once
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Middleware for multiple product images upload
export const uploadProductImages = upload.array('images', 5);

// Upload to Cloudinary for product images
export const uploadToCloudinary = async (req, res, next) => {
  try {
    console.log('Upload middleware - req.files:', req.files);
    console.log('Upload middleware - req.params:', req.params);
    
    if (!req.files || req.files.length === 0) {
      console.log('No files found in req.files');
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    // Check if Cloudinary is configured
    if (!ENV.CLOUDINARY_CLOUD_NAME || !ENV.CLOUDINARY_API_KEY || !ENV.CLOUDINARY_API_SECRET) {
      console.log('Cloudinary configuration missing');
      console.log('ENV.CLOUDINARY_CLOUD_NAME:', ENV.CLOUDINARY_CLOUD_NAME);
      console.log('ENV.CLOUDINARY_API_KEY:', ENV.CLOUDINARY_API_KEY ? 'Set' : 'Not set');
      console.log('ENV.CLOUDINARY_API_SECRET:', ENV.CLOUDINARY_API_SECRET ? 'Set' : 'Not set');
      return res.status(500).json({
        success: false,
        message: 'Cloudinary configuration is missing. Please check your environment variables.'
      });
    }

    console.log('Starting Cloudinary upload for', req.files.length, 'files');
    const uploadedImages = [];

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      console.log(`Uploading file ${i + 1}:`, file.originalname, 'Size:', file.size);
      
      try {
        // Upload to Cloudinary using direct upload method
        console.log('Starting direct upload for file', i + 1);
        const result = await cloudinary.uploader.upload(
          `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
          {
            folder: `trendbite/products/${req.params.id || 'temp'}`,
            transformation: [
              { width: 800, height: 800, crop: 'fill', quality: 'auto' }
            ],
            public_id: `product_${req.params.id || 'temp'}_${Date.now()}_${i}`,
            timeout: 30000
          }
        );
        console.log('Successfully uploaded file', i + 1, 'to Cloudinary');

        const imageData = {
          public_id: result.public_id,
          url: result.secure_url,
          alt: req.body.alt || `Product image ${i + 1}`,
          order: i,
          isMain: req.body.isMain === 'true' && i === 0
        };

        uploadedImages.push(imageData);
      } catch (uploadError) {
        console.error(`Error uploading file ${i + 1}:`, uploadError);
        throw new Error(`Failed to upload file ${i + 1}: ${uploadError.message}`);
      }
    }

    console.log('All files uploaded successfully, adding to req.cloudinaryResults');
    // Add Cloudinary results to request
    req.cloudinaryResults = uploadedImages;
    next();
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading files to Cloudinary',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Error handling middleware for multer
export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB per file.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 5 files allowed.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected field name. Use "images" as field name.'
      });
    }
  }
  
  if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({
      success: false,
      message: 'Only image files are allowed!'
    });
  }
  
  next(error);
};

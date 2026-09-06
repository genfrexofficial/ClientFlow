const fs = require('fs');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

/**
 * Handle file upload with Cloudinary or local disk fallback
 */
const uploadFile = async (file) => {
  if (isCloudinaryConfigured) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        resource_type: 'auto',
        folder: 'clientflow_files'
      });
      // Clean up temporary local disk file
      try {
        fs.unlinkSync(file.path);
      } catch (err) {
        console.warn(`[Storage] Failed to unlink temp file ${file.path}: ${err.message}`);
      }
      return {
        fileUrl: result.secure_url,
        publicId: result.public_id
      };
    } catch (cloudinaryError) {
      console.warn(`[Storage] Cloudinary upload failed: ${cloudinaryError.message}. Retaining local file.`);
      // Local fallback in case Cloudinary throws at runtime
      return {
        fileUrl: `/uploads/${file.filename}`,
        publicId: file.filename
      };
    }
  }

  // Local disk storage fallback
  return {
    fileUrl: `/uploads/${file.filename}`,
    publicId: file.filename
  };
};

/**
 * Handle file deletion
 */
const deleteFile = async (publicId, fileUrl) => {
  if (isCloudinaryConfigured && publicId && !fileUrl.startsWith('/uploads/')) {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (err) {
      console.warn(`[Storage] Failed to delete file from Cloudinary: ${err.message}`);
    }
  } else if (fileUrl && fileUrl.startsWith('/uploads/')) {
    const filename = fileUrl.replace('/uploads/', '');
    const path = require('path');
    const localPath = path.join(__dirname, '../uploads', filename);
    if (fs.existsSync(localPath)) {
      try {
        fs.unlinkSync(localPath);
      } catch (err) {
        console.warn(`[Storage] Failed to delete local file ${localPath}: ${err.message}`);
      }
    }
  }
};

module.exports = {
  uploadFile,
  deleteFile
};

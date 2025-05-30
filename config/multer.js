const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../utils/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const folderName = req.body.folder || 'uploads';
    return {
      folder: folderName,
      allowed_formats: ['jpg', 'png', 'jpeg', 'pdf','webp' ],
      upload_preset: 'secure_upload',
      type: 'private',
    };
  },
});

const upload = multer({ storage });
module.exports = upload;
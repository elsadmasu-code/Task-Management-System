const multer = require('multer');
const path = require('path');
const { avatarStorage, attachmentStorage } = require('../config/cloudinary');

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|doc|docx|xlsx|csv|txt/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error(`File type not supported: ${file.originalname}`));
};

// Avatar upload
const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    if (allowed.test(path.extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed for avatar'));
    }
  },
}).single('avatar');

// Attachment upload
const uploadAttachment = multer({
  storage: attachmentStorage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter,
}).array('attachments', 5);

// Memory storage (for when cloudinary config is not set)
const uploadLocal = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter,
});

module.exports = { uploadAvatar, uploadAttachment, uploadLocal };

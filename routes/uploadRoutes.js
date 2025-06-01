const express = require('express');
const router = express.Router();
const upload = require('../utils/multer');
const { 
    uploadImage,getSignedImageUrl 

} = require('../controllers/uploadControllers');

router.post('/image', upload.single('image'), uploadImage);
router.get('/document/:public_id', getSignedImageUrl);
module.exports = router;
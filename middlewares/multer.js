var multer = require('multer');

var storage = multer.diskStorage({
    filename: function (req, file, cb) {
        
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = file.originalname.split('.').pop();
        cb(null, `${uniqueSuffix}.${fileExtension}`);
    }
});

var upload = multer({ storage: storage });
module.exports = upload;
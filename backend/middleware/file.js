const multer = require("multer");

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg' : 'jpg'
};

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error('Invalid File Type');
    if (isValid) {
      error = null;
    }

    cb(error, './images')
  },
  filename: function (req, file, cb) {
    let fileName = file.originalname.toLowerCase().split(' ').join('');
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, fileName + '-' + Date.now() + '.' + ext);
  }
})

module.exports = multer({ storage: storage }).single('image');

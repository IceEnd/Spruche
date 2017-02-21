const multer  = require('multer')

const blogImgUpload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/upload/img/blog')
    },
    filename: function (req, file, cb) {
      cb(null, `${file.fieldname}-${Date.now()}.${file.originalname.match(/\.(\w+)$/)[1]}`)
    }
  }),
  limits: {
    fieldSize: '1MB',
    files: 1
  }
});

const friendImgUpload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/upload/img/friends')
    },
    filename: function (req, file, cb) {
      cb(null, `${file.fieldname}-${Date.now()}.${file.originalname.match(/\.(\w+)$/)[1]}`)
    }
  }),
  limits: {
    fieldSize: '1MB',
    files: 1
  }
});

module.exports = {
  blogImgUpload: blogImgUpload,            // 文章特色图片上传
  friendImgUpload: friendImgUpload,
}
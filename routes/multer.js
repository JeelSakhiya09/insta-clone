import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images/uploads");
  },
  filename: function (req, file, cb) {
    const fn = `${Date.now()}-${file.originalname}`;
    cb(null, fn);
  },
});

const upload = multer({ storage: storage });

export default upload;  
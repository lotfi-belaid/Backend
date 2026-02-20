const multer = require("multer");
const path = require('path')
const fs = require('fs')
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
]);

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = 'public/images';
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath)
    },
    filename: function (req, file, cb) {
        const uploadPath = 'public/images';
        const originalName = file.originalname;
        console.log(file.originalname)
        const fileExtension = path.extname(originalName);
        let fileName = originalName;

        // Ensure unique filename
        let fileIndex = 1;
        while (fs.existsSync(path.join(uploadPath, fileName))) {
            const baseName = path.basename(originalName, fileExtension);
            fileName = `${baseName}_${fileIndex}${fileExtension}`;
            fileIndex++;
        }

        cb(null, fileName);
    }
})

var uploadfile = multer({
    storage: storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (req, file, cb) => {
        if (!ALLOWED_IMAGE_TYPES.has(file.mimetype)) {
            return cb(new Error("Only jpg, jpeg, png, and webp files are allowed"));
        }
        cb(null, true);
    },
});
module.exports = uploadfile;

import multer from 'multer';
// const upload = multer({});
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

export default upload;

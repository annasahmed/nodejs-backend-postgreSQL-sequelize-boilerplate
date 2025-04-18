import express from 'express';
import { pageController } from '../../controllers/index.js';

const router = express.Router();

router.route('/').get(pageController.getPages).post(
	pageController.addPage,
);
router
	.route('/:pageId')
	.get(pageController.getPageById)
	.delete(pageController.deletePage)
	.patch(pageController.updatePage);

export default router;

const express = require('express');
const validate = require('../../middlewares/validate');
const userValidation = require('../../validations/user.validation');
const { storiesController } = require('../../controllers');
const { resources } = require('../../config/roles');
const upload = require('../../middlewares/multerUpload');

const router = express.Router();

router
	.route('/')
	.get(storiesController.getStories)
	.post(
		upload.fields([
			{ name: 'logo', maxCount: 1 },
			{ name: 'featured' },
			{ name: 'videos' },
		]),
		storiesController.addStory,
	);
router
	.route('/:storyId')
	.delete(storiesController.deleteStory)
	.patch(
		upload.fields([
			{ name: 'logo', maxCount: 1 },
			{ name: 'featured' },
			{ name: 'videos' },
		]),
		storiesController.updateStory,
	);

export default router;

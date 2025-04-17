const express = require('express');
const validate = require('../../middlewares/validate');
const userValidation = require('../../validations/user.validation');
const { currencyController } = require('../../controllers');
const upload = require('../../middlewares/multerUpload');

const router = express.Router();

router
	.route('/')
	.get(currencyController.getCurrencies)
	.patch(currencyController.updateCurrenctRates)
	.post(
		// grantAccess('createAny', resources.ROLE),
		// validate(roleValidation.createRole),
		upload.fields([{ name: 'image', maxCount: 1 }]),
		currencyController.addCurrency,
	);
router
	.route('/:currencyId')
	.delete(currencyController.deleteCurrency)
	.patch(
		upload.fields([{ name: 'image', maxCount: 1 }]),
		currencyController.updateCurrency,
	);

module.exports = router;

const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { stripeService } = require('../../services/Admin');

const stripeInvoicePaid = catchAsync(async (req, res) => {
	const invoice = await stripeService.paymentSuccessIntent(req);
	res.status(httpStatus.ACCEPTED).send({ received: true, invoice });
});
const stripeInvoicePaidManual = catchAsync(async (req, res) => {
	const invoice = await stripeService.paymentSuccessIntentManual(req);
	res.status(httpStatus.ACCEPTED).send({ received: true, invoice });
});

module.exports = {
	stripeInvoicePaid,
	stripeInvoicePaidManual,
};

import httpStatus from 'http-status'
import catchAsync from '../../utils/catchAsync'
import stripeService from '../../services/Admin'

const stripeInvoicePaid = catchAsync(async (req, res) => {
	const invoice = await stripeService.paymentSuccessIntent(req);
	res.status(httpStatus.ACCEPTED).send({ received: true, invoice });
});
const stripeInvoicePaidManual = catchAsync(async (req, res) => {
	const invoice = await stripeService.paymentSuccessIntentManual(req);
	res.status(httpStatus.ACCEPTED).send({ received: true, invoice });
});

export default {
	stripeInvoicePaid,
	stripeInvoicePaidManual,
};

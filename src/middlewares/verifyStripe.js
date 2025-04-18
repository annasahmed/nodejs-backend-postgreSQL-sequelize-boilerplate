const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

const verifyStripeSignature = (req, res, next) => {
	const sig = req.headers['stripe-signature'];

	try {
		const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
		req.stripeEvent = event;
		next();
	} catch (err) {
		console.error('Error verifying webhook signature:', err);
		res.status(400).send(`Webhook Error: ${err.message}`);
	}
};

export default verifyStripeSignature;

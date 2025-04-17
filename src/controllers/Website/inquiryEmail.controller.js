const httpStatus = require('http-status');
const { emailService } = require('../../services');
const catchAsync = require('../../utils/catchAsync');

const sendWebsiteEnquiryEmail = catchAsync(async (req, res) => {
	//     const data={
	//         business_name:req.body
	// first_name
	// last_name
	// partner
	// business_name
	// full_name
	// emirates
	// first_name
	// last_name
	// location
	// phone_number
	// message
	//     }
	await emailService.websiteEnquiryEmail(req.body);
	res.status(httpStatus.CREATED).send({ message: 'Email Sent Successfully' });
});

module.exports = {
	sendWebsiteEnquiryEmail,
};

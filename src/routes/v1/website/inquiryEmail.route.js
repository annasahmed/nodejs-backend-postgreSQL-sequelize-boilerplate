const express = require('express');

const { websiteInquiryEmail } = require('../../../controllers');

const router = express.Router();

router.post('/send-inquiry-email', websiteInquiryEmail.sendWebsiteEnquiryEmail);

export default router;

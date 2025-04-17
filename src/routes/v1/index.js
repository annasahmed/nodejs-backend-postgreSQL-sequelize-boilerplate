const express = require('express');
const authRoute = require('./auth.route');
const appAuthRoute = require('./app.auth.route');
const vendorPortalRoute = require('./vendor/vendorPortal.route');
const userRoute = require('./user.route');
const appuserRoute = require('./appuser.route');
const categoryRoute = require('./category.route');
const subCategoryRoute = require('./sub_category.route');
const uspRoute = require('./usp.route');
const cuisineRoute = require('./cuisine.route');
const emirateRoute = require('./emirate.route');
const areaRoute = require('./area.route');
const neighbourhoodRoute = require('./neighbourhood.route');
const roleRoute = require('./role.route');
const permissionRoute = require('./permission.route');
const subscriptionRoute = require('./subscription.route');
const docsRoute = require('./docs.route');
const placeRoute = require('./place.route');
const metadataRoute = require('./metadata.route');
const imageRoute = require('./image.route');
const homeRoute = require('./home.route');
const dealRoute = require('./deal.route');
const parentDealRoute = require('./parent_deal.route');
const monthlyDealRoute = require('./monthly_deal.route');
const checkRoute = require('./check.route');
const dealRedemptionRoute = require('./dealRedemption.route');
const pageRoute = require('./page.route');
const infoRoute = require('./info.route');
const placeInvoiceRoute = require('./placeInvoice.route');
const stripeRoute = require('./stripe.route');
const happeningBadgeRoute = require('./happening_badge.route');
const lockedRoute = require('./locked.route');
const analyticRoute = require('./analytic.route');
const notificationRoute = require('./notification.route');
const autoCompleteRoute = require('./autocomplete.route');
const reportsRoute = require('./reports.route');
const currencyRoute = require('./currency.route');
const emailFormatRoute = require('./email_format.route');
const logRoute = require('./log.route');
const seasonsRoute = require('./seasons.route');
const storyRoute = require('./stories.route');
const adminVendorRoute = require('./vendor/admin/vendor.route');

// affilaites
const platinumList = require('./affiliates/platinumlist.route');

// website
const websiteTempRoutes = require('./website/inquiryEmail.route');
const websiteRoutes = require('./website');

const router = express.Router();

// auth
router.use('/auth', authRoute);
router.use('/imageUpload', authRoute);
router.use('/appauth', appAuthRoute);
router.use('/vendors/portal', vendorPortalRoute);
router.use('/vendors', adminVendorRoute);

router.use('/metadata', metadataRoute);

router.use('/role', roleRoute);
router.use('/permission', permissionRoute);
router.use('/subscription', subscriptionRoute);
router.use('/docs', docsRoute);
router.use('/log', logRoute);

// filters
router.use('/category', categoryRoute);
router.use('/subCategory', subCategoryRoute);
router.use('/cuisine', cuisineRoute);
router.use('/usp', uspRoute); //keywords
router.use('/emirate', emirateRoute);
router.use('/area', areaRoute);
router.use('/neighbourhood', neighbourhoodRoute);

// users
router.use('/users', userRoute);
router.use('/appuser', appuserRoute);

// place
router.use('/place', placeRoute);
router.use('/image', imageRoute);
router.use('/check', checkRoute);
router.use('/happeningBadge', happeningBadgeRoute);
router.use('/locked', lockedRoute);
router.use('/autocomplete', autoCompleteRoute);
router.use('/analytic', analyticRoute);
router.use('/reports', reportsRoute);
router.use('/seasons', seasonsRoute);

router.use('/deal', dealRoute);
router.use('/parentDeal', parentDealRoute);
router.use('/monthlyDeal', monthlyDealRoute);

router.use('/deal', dealRedemptionRoute);
router.use('/invoice', placeInvoiceRoute);
router.use('/stripe', stripeRoute);

router.use('/notifications', notificationRoute);

router.use('/home', homeRoute);
router.use('/page', pageRoute);
router.use('/stories', storyRoute);

// setting
router.use('/info', infoRoute);
router.use('/currency', currencyRoute);
router.use('/emailFormat', emailFormatRoute);

//affiliates
router.use('/affiliates/platinumList', platinumList);

//api/v1/website
router.use('/website', websiteRoutes);

//website
router.use('/website/', websiteTempRoutes);

module.exports = router;

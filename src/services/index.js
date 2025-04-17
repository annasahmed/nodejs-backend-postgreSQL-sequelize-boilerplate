module.exports.authService = require('./auth.service');
module.exports.imageService = require('./image.service');
module.exports.emailService = require('./email.service');
module.exports.tokenService = require('./token.service');
module.exports.otpService = require('./otp.service');
module.exports.logService = require('./log.service');

module.exports.userService = require('./user.service');
module.exports.adminappUserService = require('./appuser/admin/appuser.service');
module.exports.roleService = require('./role.service');
module.exports.permissionService = require('./permission.service');

module.exports.adminLockedService = require('./locked/admin/locked.service');

// filters
module.exports.adminCategoryService = require('./category/admin/category.service');
module.exports.apiCategoryService = require('./category/api/category.service');
module.exports.adminSubCategoryService = require('./subCategory/admin/sub_category.service');
module.exports.apiSubCategoryService = require('./subCategory/api/sub_category.service');
module.exports.adminCuisineService = require('./cuisine/admin/cuisine.service');
module.exports.apiCuisineService = require('./cuisine/api/cuisine.service');
module.exports.adminUspService = require('./usp/admin/usp.service');
module.exports.apiUspService = require('./usp/api/usp.service');
module.exports.adminEmirateService = require('./emirate/admin/emirate.service');
module.exports.apiEmirateService = require('./emirate/api/emirate.service');
module.exports.adminAreaService = require('./area/admin/area.service');
module.exports.apiAreaService = require('./area/api/area.service');
module.exports.adminNeighbourhoodService = require('./neighbourhood/admin/neighbourhood.service');

// place
module.exports.adminPlaceService = require('./place/admin/place.service');
module.exports.apiPlaceService = require('./place/api/place.service');
module.exports.subscriptionService = require('./place/admin/packages.service');
module.exports.packagesService = require('./place/admin/packages.service');
module.exports.mediaService = require('./place/admin/media.service');
module.exports.adminHappeningBadgeService = require('./happeningBadge/admin/happening_badge.service');
module.exports.happeningService = require('./place/admin/happening.service');
module.exports.timingService = require('./place/admin/timing.service');
module.exports.trendingService = require('./place/admin/trending.service');
module.exports.adminInvoiceService = require('./place/admin/invoice.service');
module.exports.adminSeasonsService = require('./seasons/admin/seasons.service');

module.exports.apiHomeService = require('./home/api/home.service');
module.exports.adminHomeService = require('./home/admin/home.service');
module.exports.adminParentDealService = require('./parentDeal/admin/parent_deal.service');
module.exports.apiDealService = require('./deal/api/deal.service');
module.exports.adminDealService = require('./deal/admin/deal.service');
module.exports.apiMonthlyDealService = require('./monthlyDeal/api/monthly_deal.service');
module.exports.adminMonthlyDealService = require('./monthlyDeal/admin/monthly_deal.service');

module.exports.dealRedemptionService = require('./Api/DealRedemption.service');
module.exports.adminDealRedemptionService = require('./Admin/dealRedemption.service.js');
module.exports.userSavingService = require('./Api/UserSaving.service');

module.exports.apiPageService = require('./page/api/page.service');
module.exports.adminPageService = require('./page/admin/page.service');
module.exports.apiInfoService = require('./info/api/info.service');
module.exports.adminInfoService = require('./info/admin/info.service');
module.exports.adminPlaceSubscriptionService = require('./place/admin/placeSubscription.service');
module.exports.adminAnalyticService = require('./analytic/admin/analytic.service');
module.exports.apiAnalyticService = require('./analytic/api/analytic.service');
module.exports.adminNotificationService = require('./notification/admin/notification.service');
module.exports.apiNotificationService = require('./notification/api/notification.service');
module.exports.adminAutoCompleteService = require('./autocomplete/autocomplete.service');
module.exports.adminReportsService = require('./Admin/reports.service');
module.exports.adminVendorService = require('./Admin/vendor/vendor.service');
module.exports.adminCurrencyService = require('./currency/admin/currency.service');
module.exports.apiCurrencyService = require('./currency/api/currency.service');
module.exports.adminEmailFormat = require('./email_format/admin/email_format.service');
module.exports.adminStoriesService = require('./stories/admin/stories.service');
module.exports.apiStoriesService = require('./stories/api/stories.service');

// vendors
module.exports.vendorService = require('./Admin/vendor/place.service');
module.exports.vendorInvoiceService = require('./Admin/vendor/invoice.service');

// affiliates
module.exports.apiPlatinumListService = require('./affiliates/platunumList/api/platinumList.service');
module.exports.adminPlatinumListService = require('./affiliates/platunumList/admin/platinumList.service');

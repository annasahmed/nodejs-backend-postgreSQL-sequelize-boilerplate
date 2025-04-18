import authService from './auth.service.js';
import imageService from './image.service.js';
import emailService from './email.service.js';
import tokenService from './token.service.js';
import otpService from './otp.service.js';
import logService from './log.service.js';

import userService from './user.service.js';
import adminappUserService from './appuser/admin/appuser.service.js';
import roleService from './role.service.js';
import permissionService from './permission.service.js';

import adminLockedService from './locked/admin/locked.service.js';

// filters
import adminCategoryService from './category/admin/category.service.js';
import apiCategoryService from './category/api/category.service.js';
import adminSubCategoryService from './subCategory/admin/sub_category.service.js';
import apiSubCategoryService from './subCategory/api/sub_category.service.js';
import adminCuisineService from './cuisine/admin/cuisine.service.js';
import apiCuisineService from './cuisine/api/cuisine.service.js';
import adminUspService from './usp/admin/usp.service.js';
import apiUspService from './usp/api/usp.service.js';
import adminEmirateService from './emirate/admin/emirate.service.js';
import apiEmirateService from './emirate/api/emirate.service.js';
import adminAreaService from './area/admin/area.service.js';
import apiAreaService from './area/api/area.service.js';
import adminNeighbourhoodService from './neighbourhood/admin/neighbourhood.service.js';

// place
import adminPlaceService from './place/admin/place.service.js';
import apiPlaceService from './place/api/place.service.js';
import subscriptionService from './place/admin/packages.service.js';
import packagesService from './place/admin/packages.service.js';
import mediaService from './place/admin/media.service.js';
import adminHappeningBadgeService from './happeningBadge/admin/happening_badge.service.js';
import happeningService from './place/admin/happening.service.js';
import timingService from './place/admin/timing.service.js';
import trendingService from './place/admin/trending.service.js';
import adminInvoiceService from './place/admin/invoice.service.js';
import adminSeasonsService from './seasons/admin/seasons.service.js';

import apiHomeService from './home/api/home.service.js';
import adminHomeService from './home/admin/home.service.js';
import adminParentDealService from './parentDeal/admin/parent_deal.service.js';
import apiDealService from './deal/api/deal.service.js';
import adminDealService from './deal/admin/deal.service.js';
import apiMonthlyDealService from './monthlyDeal/api/monthly_deal.service.js';
import adminMonthlyDealService from './monthlyDeal/admin/monthly_deal.service.js';

import dealRedemptionService from './Api/DealRedemption.service.js';
import adminDealRedemptionService from './Admin/dealRedemption.service.js';
import userSavingService from './Api/UserSaving.service.js';

import apiPageService from './page/api/page.service.js';
import adminPageService from './page/admin/page.service.js';
import apiInfoService from './info/api/info.service.js';
import adminInfoService from './info/admin/info.service.js';
import adminPlaceSubscriptionService from './place/admin/placeSubscription.service.js';
import adminAnalyticService from './analytic/admin/analytic.service.js';
import apiAnalyticService from './analytic/api/analytic.service.js';
import adminNotificationService from './notification/admin/notification.service.js';
import apiNotificationService from './notification/api/notification.service.js';
import adminAutoCompleteService from './autocomplete/autocomplete.service.js';
import adminReportsService from './Admin/reports.service.js';
import adminVendorService from './Admin/vendor/vendor.service.js';
import adminCurrencyService from './currency/admin/currency.service.js';
import apiCurrencyService from './currency/api/currency.service.js';
import adminEmailFormat from './email_format/admin/email_format.service.js';
import adminStoriesService from './stories/admin/stories.service.js';
import apiStoriesService from './stories/api/stories.service.js';

// vendors
import vendorService from './Admin/vendor/place.service.js';
import vendorInvoiceService from './Admin/vendor/invoice.service.js';

// affiliates
import apiPlatinumListService from './affiliates/platunumList/api/platinumList.service.js';
import adminPlatinumListService from './affiliates/platunumList/admin/platinumList.service.js';

export {
  authService,
  imageService,
  emailService,
  tokenService,
  otpService,
  logService,
  userService,
  adminappUserService,
  roleService,
  permissionService,
  adminLockedService,
  adminCategoryService,
  apiCategoryService,
  adminSubCategoryService,
  apiSubCategoryService,
  adminCuisineService,
  apiCuisineService,
  adminUspService,
  apiUspService,
  adminEmirateService,
  apiEmirateService,
  adminAreaService,
  apiAreaService,
  adminNeighbourhoodService,
  adminPlaceService,
  apiPlaceService,
  subscriptionService,
  packagesService,
  mediaService,
  adminHappeningBadgeService,
  happeningService,
  timingService,
  trendingService,
  adminInvoiceService,
  adminSeasonsService,
  apiHomeService,
  adminHomeService,
  adminParentDealService,
  apiDealService,
  adminDealService,
  apiMonthlyDealService,
  adminMonthlyDealService,
  dealRedemptionService,
  adminDealRedemptionService,
  userSavingService,
  apiPageService,
  adminPageService,
  apiInfoService,
  adminInfoService,
  adminPlaceSubscriptionService,
  adminAnalyticService,
  apiAnalyticService,
  adminNotificationService,
  apiNotificationService,
  adminAutoCompleteService,
  adminReportsService,
  adminVendorService,
  adminCurrencyService,
  apiCurrencyService,
  adminEmailFormat,
  adminStoriesService,
  apiStoriesService,
  vendorService,
  vendorInvoiceService,
  apiPlatinumListService,
  adminPlatinumListService
};

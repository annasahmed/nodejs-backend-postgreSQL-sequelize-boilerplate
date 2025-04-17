const express = require('express');
const placesRoute = require('./place.route.js');
// const categoryRoute = require('./sub_category.route.js');
const categoriesRoute = require('./sub_category.route.js');

const router = express.Router();

// places
router.use('/places', placesRoute);
// places
router.use('/category', categoriesRoute);

module.exports = router;

const express = require('express')
const { autoCompleteController } = require('../../controllers')

const router = express.Router();

router
  .route('/place/search')
  .get(autoCompleteController.searchPlace)

module.exports = router;

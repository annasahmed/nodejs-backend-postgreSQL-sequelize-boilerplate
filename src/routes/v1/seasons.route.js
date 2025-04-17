const express = require('express')
const validate = require('../../middlewares/validate')
const seasonValidation = require('../../validations/seasons.validation')
const { seasonsController } = require('../../controllers')

const router = express.Router()

router
  .route('/')
  .get(seasonsController.getSeasons)
  .post(
    validate(seasonValidation.createSeason),
    seasonsController.addSeason
  )

router.get('/all', seasonsController.getAllSeasons);

router
  .route('/:seasonId')
  .get(
    validate(seasonValidation.seasonId),
    seasonsController.getSeasonById
  )
  .delete(
    validate(seasonValidation.seasonId),
    seasonsController.deleteSeason
  )
  .patch(
    validate(seasonValidation.updateSeason),
    seasonsController.updateSeason
  )

module.exports = router

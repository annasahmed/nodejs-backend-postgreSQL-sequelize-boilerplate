const httpStatus = require('http-status')
const { getOffset } = require('../../../utils/query')
const ApiError = require('../../../utils/ApiError')
const db = require('../../../db/models').default
const userService = require('../../user.service')
const {
  checkDeletedCondition,
  softDelete,
} = require('../../../utils/globals.js')

// Get season by title
async function getSeasonByTitle(title, seasonId = null) {
  const conditions = {
    where: { title },
  }
  if (seasonId) {
    conditions.where.id = {
      [db.Sequelize.Op.ne]: seasonId
    }
  }
  return await db.seasons.findOne(conditions)
}

// Get season by ID
async function getSeasonById(id) {
  return await db.seasons.findOne({
    where: { id },
    include: [
      {
        model: db.user,
        required: true,
        attributes: ['id', 'first_name', 'last_name'],
      },
    ],
    attributes: [
      'id',
      'title',
      'start_date',
      'end_date',
      'status',
      'created_date_time',
      'modified_date_time',
    ],
  })
}

// Create a new season
async function createSeason(req) {
  const { title, status, startDate, endDate } = req.body
  const userId = req.auth.userId

  const existingSeason = await getSeasonByTitle(title)
  if (existingSeason) {
    throw new ApiError(httpStatus.CONFLICT, 'This season already exists')
  }

  const user = await userService.getUserById(userId)
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found')
  }

  return await db.seasons
    .create({
      title,
      user_id: userId,
      status,
      start_date: startDate,
      end_date: endDate,
    })
    .then((resultEntity) => resultEntity.get({ plain: true }))
}

// Get all seasons with pagination
async function getSeasons(req) {
  const { page = 1, limit = 10 } = req.query

  const offset = getOffset(page, limit)

  const { count, rows } = await db.seasons.findAndCountAll({
    order: [
      ['title', 'ASC'],
      ['created_date_time', 'DESC'],
      ['modified_date_time', 'DESC'],
    ],
    where: {
      ...checkDeletedCondition,
    },
    include: [
      {
        model: db.user,
        required: true,
        attributes: ['id', 'first_name', 'last_name'],
      },
    ],
    attributes: [
      'id',
      'title',
      'start_date',
      'end_date',
      'status',
      'created_date_time',
      'modified_date_time',
    ],
    offset,
    limit,
  })

  return {
    total: count,
    page: parseInt(page),
    data: rows,
    limit: limit,
  }
}

async function getAllSeasons(req) {
  let where = {
    status: true,
    deleted_by: null,
  }
  if (req.params.status) {
    where.status = req.params.status
  }
  return await db.seasons.findAll({
    order: [
      ['title', 'ASC'],
      ['created_date_time', 'DESC'],
      ['modified_date_time', 'DESC'],
    ],
    where: {
      ...where,
    },
    attributes: [
      'id',
      'title'
    ]
  })
}

// Soft delete a season by ID
async function deleteSeasonById(req) {
  const id = req.params.seasonId || req.body.id
  await softDelete(req, 'seasons', id)
  return true
}

// Update a season by ID
async function updateSeason(req) {
  const { title, status, startDate, endDate } = req.body
  const seasonId = req.params.seasonId
  if (title) {
    const season = await getSeasonByTitle(title, seasonId)
    if (season) {
      throw new ApiError(
        httpStatus.CONFLICT,
        'This season already exists'
      )
    }
  }

  return await db.seasons
    .update(
      {
        title,
        status,
        start_date: startDate,
        end_date: endDate,
      },
      {
        where: { id: seasonId },
        returning: true,
      }
    )
    .then((data) => data[1])
}

export default {
  getSeasons,
  createSeason,
  deleteSeasonById,
  updateSeason,
  getSeasonById,
  getAllSeasons
}

const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { adminAutoCompleteService } = require('../../services');

const searchPlace = catchAsync(async (req, res) => {
  const places = await adminAutoCompleteService.searchPlace(req);
  res.status(httpStatus.CREATED).send({ data:places });
});

module.exports = {
  searchPlace
}
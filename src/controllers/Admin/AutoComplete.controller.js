import httpStatus from 'http-status'
import catchAsync from '../../utils/catchAsync'
import { adminAutoCompleteService } from '../../services';

const searchPlace = catchAsync(async (req, res) => {
  const places = await adminAutoCompleteService.searchPlace(req);
  res.status(httpStatus.CREATED).send({ data: places });
});

export default {
  searchPlace
}

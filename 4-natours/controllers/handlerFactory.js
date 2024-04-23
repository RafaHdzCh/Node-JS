const AppError = require("../Utilities/appError");
const APIFeatures = require("../Utilities/apiFeatures");
const CatchAsync = require("../Utilities/catchAsync");

module.exports.DeleteOne = Model => CatchAsync(async (request, response, next) =>
{
  const document = await Model.findByIdAndDelete(request.params.id);
  if(!document)
  {
    return next(new AppError("No document found with that ID", 404));
  }

  response.status(204).json(
  {
    status: "Successfully deleted",
    data: null
  });
});

module.exports.UpdateOne = Model => CatchAsync(async (request, response, next) =>
{
  const document = await Model.findByIdAndUpdate(request.params.id, request.body, 
    {
      new: true,
      runValidators: true
    })
  if(!document)
  {
    return next(new AppError("No document found with that ID", 404));
  }
  response.status(200)
  .set(
    'Content-Security-Policy',
    "img-src 'self' data: blob:"
  )
  .json(
    {
      status: "Successfully updated",
      data:
      {
        document
      }
    })
});

module.exports.CreateOne = Model => CatchAsync(async (request, response) =>
{
  const document = await Model.create(request.body);
  response.status(201).json(
  {
    status: "Successfully created",
    data:
    {
      data: document
    }
  });
});

module.exports.GetOne = (Model, populateOptions) => CatchAsync(async (request, response, next) =>
{
  let query = Model.findById(request.params.id);
  if(populateOptions) query = query.populate(populateOptions);
  const document = await query;

  if(!document)
  {
    return next(new AppError("No document found with that ID", 404));
  }
  response.status(200).json(
    {
      status: "Successfully obtained",
      data:
      {
        data: document
      }
    })
});

module.exports.GetAll = Model => CatchAsync(async (request, response) =>
{
  const filter = request.params.tourId ? { tour: request.params.tourId } : {};

  const features = new APIFeatures(Model.find(filter), request.query)
                              .Filter()
                              .Sort()
                              .LimitFields()
                              .Paginate();
  const documents = await features.query;

  response.status(200).json(
  {
    status: "Successfully obtained",
    results: documents.length,
    data: 
    {
      documents,
    }
  });
});
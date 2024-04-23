const AppError = require("../Utilities/appError");

function HandleCastErrorDB(error)
{
  const message = `Invalid ${error.path}: ${error.value}.`;
  return new AppError(message, 400);
}

function HandleDuplicateFieldsDB(error)
{
  const value = error.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
}

function HandleValidationErrorDB(error)
{
  const errors = Object.values(error.errors)
                       .map(element => element.message);

  const message = `Invalid input data: ${errors.join(". ")}`;
  return new AppError(message,400);
}

function HandleJWTError()
{
  return new AppError("Invalid token. Please log in again!", 401);
}

function HandleJWTExpiredError()
{
  return new AppError("Expired token. Please log in again!", 401);
}

function SendErrorDev(error, request ,response)
{
  if(request.originalUrl.startsWith("/api"))
  {
    //API
    response.status(error.statusCode).json(
    {
        status: error.status,
        error: error,
        message: error.message,
        stack: error.stack,
    });
  }
  else
  {
    //RENDERED WEBSITE
    response.status(error.statusCode).render("error", 
    {
      title: "Something went wrong!",
      message: error.message
    });
  }
}

function SendErrorProd(error, request, response) {
  // Verificar si el error es para la API
  if (request.originalUrl.startsWith("/api")) {
    // Verificar si error.statusCode está definido
    const statusCode = error.statusCode || 500;

    // Verificar si el error es operacional
    if (error.isOperational) {
      // Enviar respuesta con el error
      return response.status(statusCode).json({
        status: error.status,
        message: error.message,
      });
    } else {
      // Enviar respuesta genérica para errores no operacionales
      return response.status(500).json({
        status: "error",
        message: "Algo salió mal en el servidor. Por favor, inténtalo de nuevo más tarde.",
      });
    }
  } else {
    // Renderizar la página de error para el sitio web
    response.status(error.statusCode || 500).render("error", {
      title: "Error",
      message: error.message || "Algo salió mal en el servidor. Por favor, inténtalo de nuevo más tarde.",
    });
  }
}

module.exports = (error, request, response, next) => 
{
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";

  if (process.env.NODE_ENV === "development") 
  {
      SendErrorDev(error, request, response);
  } 
  else if (process.env.NODE_ENV === 'production ') 
  {
    let errorCopy = Object.create(error);

    if (error.code === 11000) errorCopy = HandleDuplicateFieldsDB(error);
    if (error.name === 'CastError') errorCopy = HandleCastErrorDB(error);
    if (error.name === "JsonWebTokenError") errorCopy = HandleJWTError();
    if (error.name === "TokenExpiredError") errorCopy = HandleJWTExpiredError();
    if (error.name === "ValidationError") errorCopy = HandleValidationErrorDB(error);

    SendErrorProd(errorCopy, request ,response);
  }
}
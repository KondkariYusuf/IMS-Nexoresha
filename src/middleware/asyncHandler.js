export function asyncHandler(handler) {
  return function asyncHandlerWrapper(req, res, next) {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

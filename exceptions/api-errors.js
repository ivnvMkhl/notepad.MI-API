module.exports = class ApiErrors extends Error {
  status
  errors

  constructor(status, message, errors = []) {
    super(message)
    this.status = status
    this.errors = errors
  }

  static UnauthorizeError() {
    return new ApiErrors(401, 'Пользователь не авторизован')
  }

  static BedRequest(message, errors = []) {
    return new ApiErrors(400, message, errors)
  }
}

const { validationResult } = require('express-validator');

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

const withValidation = (validators, handler) => [
  ...validators,
  handleValidationErrors,
  handler
];

module.exports = withValidation; 
const { body, param } = require('express-validator');

// Patient validation
const validatePatient = [
  body('name').isString().notEmpty(),
  body('age').isInt({ min: 0 }),
  body('gender').isIn(['Male', 'Female', 'Other']),
  body('contact').isString().notEmpty()
];

// DiagnosticTest validation
const validateDiagnosticTest = [
  body('name').isString().notEmpty(),
  body('description').isString().notEmpty(),
  body('cost').isInt({ min: 0 })
];

// PatientReport validation
const validatePatientReport = [
  body('patientId').isMongoId(),
  body('testId').isMongoId(),
  body('reportData.result').isString().notEmpty(),
  body('reportData.remarks').optional().isString(),
  body('reportData.testedAt').isISO8601()
];

// ID param validation
const validateIdParam = [
  param('id').isMongoId()
];

// User registration/login validation
const validateUserRegister = [
  body('username').isString().notEmpty(),
  body('password').isString().isLength({ min: 6 }),
  body('role').isIn(['doctor', 'lab_assistant'])
];

const validateUserLogin = [
  body('username').isString().notEmpty(),
  body('password').isString().notEmpty()
];

module.exports = {
  validatePatient,
  validateDiagnosticTest,
  validatePatientReport,
  validateIdParam,
  validateUserRegister,
  validateUserLogin
}; 
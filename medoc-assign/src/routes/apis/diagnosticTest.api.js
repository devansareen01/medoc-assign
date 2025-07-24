const express = require('express');
const DiagnosticTest = require('../../model/schema/DiagnosticTest');
const { validateDiagnosticTest } = require('../../utils/validation');
const { authorizeRoles } = require('../../middleware/auth');
const asyncHandler = require('../../middleware/asyncHandler');
const { validationResult } = require('express-validator');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: DiagnosticTests
 *   description: Diagnostic test management
 */

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

/**
 * @swagger
 * /diagnostic-tests:
 *   post:
 *     summary: Add a new diagnostic test
 *     tags: [DiagnosticTests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - cost
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               cost:
 *                 type: number
 *     responses:
 *       201:
 *         description: Diagnostic test added successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
  '/',
  authorizeRoles('doctor'),
  validateDiagnosticTest,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const test = await DiagnosticTest.createTest(req.body);
    res.status(201).json(test);
  })
);

/**
 * @swagger
 * /diagnostic-tests:
 *   get:
 *     summary: List all available diagnostic tests
 *     tags: [DiagnosticTests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of diagnostic tests
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/', authorizeRoles('doctor', 'lab_assistant'), asyncHandler(async (req, res) => {
  const tests = await DiagnosticTest.listTests();
  res.json(tests);
}));

module.exports = router;

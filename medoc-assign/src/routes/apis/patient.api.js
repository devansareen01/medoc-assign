const express = require('express');
const Patient = require('../../model/schema/Patient');
const { validatePatient, validateIdParam } = require('../../utils/validation');
const { authorizeRoles } = require('../../middleware/auth');
const asyncHandler = require('../../middleware/asyncHandler');
const { validationResult } = require('express-validator');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Patients
 *   description: Patient management
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
 * /patients:
 *   post:
 *     summary: Add a new patient
 *     tags: [Patients]
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
 *               - age
 *               - gender
 *               - contact
 *             properties:
 *               name:
 *                 type: string
 *               age:
 *                 type: integer
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
 *               contact:
 *                 type: string
 *     responses:
 *       201:
 *         description: Patient added successfully
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
  validatePatient,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const patient = await Patient.createPatient(req.body);
    res.status(201).json(patient);
  })
);

/**
 * @swagger
 * /patients/{id}/reports:
 *   get:
 *     summary: Fetch all reports of a patient
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: List of patient reports
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  '/:id/reports',
  authorizeRoles('doctor', 'lab_assistant'),
  validateIdParam,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const reports = await Patient.getReports(req.params.id);
    res.json(reports);
  })
);

module.exports = router;

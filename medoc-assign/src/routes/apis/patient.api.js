const express = require('express');
const Patient = require('../../model/schema/Patient');
const { validatePatient, validateIdParam } = require('../../utils/validation');
const { authorizeRoles } = require('../../middleware/auth');
const asyncHandler = require('../../middleware/asyncHandler');
const { validationResult } = require('express-validator');
const db = require('../../model/db');

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
 *   get:
 *     summary: List all patients
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of patients
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
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
router.get(
  '/',
  authorizeRoles('doctor', 'lab_assistant'),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const total = await Patient.countDocuments();
    const patients = await Patient.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    res.json({
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
      data: patients
    });
  })
);

router.post(
  '/',
  authorizeRoles('doctor', 'lab_assistant'),
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
    const { page = 1, limit = 10 } = req.query;
    const total = await db.PatientReport.countReports(req.params.id);
    const reports = await db.PatientReport.getReports(req.params.id, page, limit);
    res.json({
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
      data: reports
    });
  })
);

module.exports = router;

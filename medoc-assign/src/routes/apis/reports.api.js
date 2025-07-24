const express = require('express');
const PatientReport = require('../../model/schema/PatientReport');
const { validatePatientReport, validateIdParam } = require('../../utils/validation');
const { authorizeRoles } = require('../../middleware/auth');
const asyncHandler = require('../../middleware/asyncHandler');
const { validationResult } = require('express-validator');
const { generateReportHTML, generatePDFBuffer } = require('../../utils/pdfReport');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Patient report management
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
 * /reports:
 *   post:
 *     summary: Assign test to a patient and store result
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patientId
 *               - testId
 *               - reportData
 *             properties:
 *               patientId:
 *                 type: string
 *               testId:
 *                 type: string
 *               reportData:
 *                 type: object
 *                 required:
 *                   - result
 *                   - testedAt
 *                 properties:
 *                   result:
 *                     type: string
 *                   remarks:
 *                     type: string
 *                   testedAt:
 *                     type: string
 *                     format: date-time
 *     responses:
 *       201:
 *         description: Report created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
  '/',
  authorizeRoles('lab_assistant'),
  validatePatientReport,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const report = await PatientReport.createReport(req.body);
    res.status(201).json(report);
  })
);

/**
 * @swagger
 * /reports/{id}:
 *   get:
 *     summary: Get report by ID (include test and patient details)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Report ID
 *     responses:
 *       200:
 *         description: Report details
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Report not found
 */
router.get(
  '/:id',
  authorizeRoles('doctor', 'lab_assistant'),
  validateIdParam,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const report = await PatientReport.getReportById(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json(report);
  })
);

/**
 * @swagger
 * /reports/{id}/pdf:
 *   get:
 *     summary: Download report as PDF
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Report ID
 *     responses:
 *       200:
 *         description: PDF file
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Report not found
 */
router.get(
  '/:id/pdf',
  authorizeRoles('doctor', 'lab_assistant'),
  validateIdParam,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const report = await PatientReport.getReportById(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found' });
    const html = generateReportHTML(report);
    const pdfBuffer = await generatePDFBuffer(html);
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename=report.pdf' });
    res.send(pdfBuffer);
  })
);

module.exports = router;

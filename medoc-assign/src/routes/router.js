const express = require('express');
const patientRoutes = require('./apis/patient.api');
const diagnosticTestRoutes = require('./apis/diagnosticTest.api');
const reportRoutes = require('./apis/reports.api');
const authRoutes = require('./apis/auth.api');

const router = express.Router();

router.use('/patients', patientRoutes);
router.use('/diagnostic-tests', diagnosticTestRoutes);
router.use('/reports', reportRoutes);
router.use('/auth', authRoutes);

module.exports = router;

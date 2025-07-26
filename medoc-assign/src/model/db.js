const mongoose = require('mongoose');

const User = require('./schema/User');
const Patient = require('./schema/Patient');
const DiagnosticTest = require('./schema/DiagnosticTest');
const PatientReport = require('./schema/PatientReport');

module.exports = {
    User,
    Patient,
    DiagnosticTest,
    PatientReport
};
  
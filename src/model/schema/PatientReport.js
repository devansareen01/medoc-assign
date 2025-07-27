const mongoose = require('mongoose');

const patientReportSchema = mongoose.Schema(
    {
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Patient' 
        },
        testId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'DiagnosticTest' 
        },
        reportData: {
            result: {
                type: String,
                required: [true, 'Please add the test result'],
                trim: true
            },
            remarks: {
                type: String,
                trim: true
            },
            testedAt: {
                type: Date,
                default: Date.now 
            }
        }
    },
    {
        timestamps: true 
    }
);

// Create a new report
patientReportSchema.statics.createReport = function(data) {
    return this.create(data);
};

// Get report by ID, populated with patient and test info
patientReportSchema.statics.getReportById = function(id) {
    return this.findById(id).populate('patientId').populate('testId');
};

patientReportSchema.statics.countReports = function(patientId) {
  return this.countDocuments({ patientId });
};

patientReportSchema.statics.getReports = function(patientId, page = 1, limit = 10) {
  const skip = (parseInt(page) - 1) * parseInt(limit);
  return this.find({ patientId })
    .populate('testId')
    .skip(skip)
    .limit(parseInt(limit));
};

module.exports = mongoose.model('PatientReport', patientReportSchema);
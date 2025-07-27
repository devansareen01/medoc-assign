const mongoose = require('mongoose');

const diagnosticTestSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a test name'],
            unique: true, 
            trim: true
        },
        description: {
            type: String,
            required: [true, 'Please add a test description'],
            trim: true
        },
        cost: {
            type: Number,
            required: [true, 'Please add the test cost'],
            min: [0, 'Cost cannot be negative']
        }
    },
    {
        timestamps: true 
    }
);

diagnosticTestSchema.statics.createTest = function(data) {
    return this.create(data);
};

diagnosticTestSchema.statics.listTests = function(page = 1, limit = 10) {
  const skip = (parseInt(page) - 1) * parseInt(limit);
  return this.find()
    .skip(skip)
    .limit(parseInt(limit));
};

module.exports = mongoose.model('DiagnosticTest', diagnosticTestSchema);
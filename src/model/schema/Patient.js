const mongoose = require('mongoose');

const patientSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a patient name'],
            trim: true
        },
        age: {
            type: Number,
            required: [true, 'Please add patient age'],
            min: [0, 'Age cannot be negative']
        },
        gender: {
            type: String,
            required: [true, 'Please add patient gender'],
            enum: ['Male', 'Female', 'Other'] 
        },
        contact: {
            type: String,
            required: [true, 'Please add patient contact information'],
            match: [/^\d{10}$/, 'Please enter a valid 10-digit contact number'] 
        }
    },
    {
        timestamps: true 
    }
);

// Create a new patient
patientSchema.statics.createPatient = function(data) {
    return this.create(data);
};

module.exports = mongoose.model('Patient', patientSchema);
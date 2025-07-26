const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0', 
  info: {
    title: 'Medoc Assignment API', 
    version: '1.0.0', 
    description: 'API documentation for the Medoc Patient & Diagnostic Test Management System.', 
    contact: {
      name: 'Your Name/Team',
      email: 'your.email@example.com',
    },
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT || 3000}/api`, 
      description: 'Local development server',
    },
    
  ],
  components: {
    schemas: {
      Patient: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'John Doe' },
          age: { type: 'number', example: 30 },
          gender: { type: 'string', enum: ['Male', 'Female', 'Other'], example: 'Male' },
          contact: { type: 'string', example: '9876543210' },
        },
        required: ['name', 'age', 'gender', 'contact'],
      },
      DiagnosticTest: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'Blood Test' },
          description: { type: 'string', example: 'Full blood count, blood group' },
          price: { type: 'number', example: 1500 },
        },
        required: ['name', 'price'],
      },
      PatientReport: {
        type: 'object',
        properties: {
          patientId: { type: 'string', format: 'mongoId', example: '60c72b2f9b1d8e001c8a4f2b' },
          testId: { type: 'string', format: 'mongoId', example: '60c72b2f9b1d8e001c8a4f2c' },
          reportData: {
            type: 'object',
            properties: {
              result: { type: 'string', example: 'Positive' },
              remarks: { type: 'string', example: 'Further investigation needed.' },
              testedAt: { type: 'string', format: 'date-time', example: '2023-10-26T10:00:00Z' },
            },
            required: ['result'],
          },
        },
        required: ['patientId', 'testId', 'reportData'],
      },
      User: {
        type: 'object',
        properties: {
          username: { type: 'string', example: 'testuser' },
          email: { type: 'string', format: 'email', example: 'test@example.com' },
          password: { type: 'string', format: 'password', example: 'password123' },
        },
        required: ['username', 'email', 'password'],
      },
      LoginRequest: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email', example: 'test@example.com' },
          password: { type: 'string', format: 'password', example: 'password123' },
        },
        required: ['email', 'password'],
      },
      AuthResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Error message details' },
          stack: { type: 'string', example: 'Error stack trace (development only)' },
        },
      },
    },
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT Bearer token **_only_**',
      },
    },
  },
  security: [{
    bearerAuth: [], 
  }],
};

const options = {
  swaggerDefinition,
 
  apis: [
    './src/routes/apis/*.js', 
    './src/model/schema/*.js' 
  ],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
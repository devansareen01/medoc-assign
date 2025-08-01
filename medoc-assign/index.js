const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
require('dotenv').config();


const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');
const { authMiddleware } = require('./src/middleware/auth');
const apiRoutes = require('./src/routes/router');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/config/swagger');


const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use(helmet());

app.use(cors({
    origin: (origin, callback) => {
      callback(null, true);
    },
    credentials: true
  }));

app.use(morgan('dev'));


app.use(authMiddleware);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api', apiRoutes);
app.use(errorHandler);


connectDB();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});
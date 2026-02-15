var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./swagger');
const { initDatabase, closeDatabase } = require('./utils/db');
const { startBackupScheduler } = require('./jobs/scheduler');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize SQLite database
try {
  initDatabase();
  console.log('✅ Database initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize database:', error);
}

// Start backup scheduler
try {
  startBackupScheduler();
} catch (error) {
  console.error('❌ Failed to start backup scheduler:', error);
}

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "AnimekudesuAPI Documentation",
}));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// 404 handler
app.use(notFoundHandler);

// Error handler middleware
app.use(errorHandler);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down gracefully...');
  closeDatabase();
  process.exit(0);
});

module.exports = app;

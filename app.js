const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const requestLogger = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const {ecomRoutes, productRoutes, cartRoutes, fileRoutes, runtime} = require('./ecom');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

const app = express();
const allowedOrigins = runtime.env.CORS_ORIGIN.split(',').map((origin) => origin.trim());

app.use(helmet());
app.use(cors({ origin: allowedOrigins.includes('*') ? '*' : allowedOrigins, credentials: !allowedOrigins.includes('*') }));
app.use(rateLimit({ windowMs: runtime.env.RATE_LIMIT_WINDOW_MS, max: runtime.env.RATE_LIMIT_MAX, standardHeaders: true, legacyHeaders: false }));
app.use(requestLogger('dev'));
app.use(runtime.requestContext);
app.use(express.json({ limit: runtime.env.REQUEST_BODY_LIMIT }));
app.use(express.urlencoded({ extended: false, limit: runtime.env.REQUEST_BODY_LIMIT }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

ecomRoutes(app);
productRoutes(app);
cartRoutes(app);
fileRoutes(app);

app.use(runtime.notFound);
app.use(runtime.errorHandler);

app.locals.runtime = runtime;

module.exports = app;

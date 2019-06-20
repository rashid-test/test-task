const express = require('express');
require('express-async-errors');
const app = express();

// load settings
require('./config/config.js');

app.use(express.json());

// check token for all URLs except authorizing one
const jwt = require('express-jwt');
app.use(jwt({ secret: global.gConfig.SECRET }).unless({ path: ['/v1/authenticate'] }));

// Controllers
const authentication = require('./controllers/auth');
const payments = require('./controllers/payments');

// API endpoints
app.post('/v1/authenticate', authentication);
app.post('/v1/payments', payments.create);
app.get('/v1/payments', payments.list);
app.get('/v1/payment/:id', payments.get);
app.put('/v1/payments/:id/approve', payments.approve)
app.put('/v1/payments/:id/cancel', payments.cancel)

// Error handling
app.use((err, req, res, next) => {
    let code, message;

    switch (err.name) {

        case 'UnknownUserError':
            code = 'ERR_LOGON_FAILURE';
            message = 'Cannot obtain token with supplied username and password';
            res.status(401).send({ code, message });
            break;

        case 'UnauthorizedError':
            if (err.inner.name === 'TokenExpiredError') {
                code = 'ERR_AUTH_TOKEN_EXPIRED';
                message = 'Auth token expired';
            } else {
                code = 'ERR_UNATHORIZED';
                message = 'No auth token provided';
            }
            res.status(401).send({ code, message });
            break;

        case 'ValidationError':
            code = 'ERR_VALIDATION';
            message = 'Validation failed';
            res.status(400).send({ code, message, details: err.details });
            break;

        case 'CannotApproveError':
            code = 'ERR_CANNOT_APPROVE';
            message = 'Cannot approve a payment that has already been cancelled';
            res.status(400).send({ code, message });
            break;

        case 'CannotCancelError':
            code = 'ERR_CANNOT_CANCEL';
            message = 'Cannot cancel a payment that has already been approved';
            res.status(400).send({ code, message });
            break;

        // ...
    }

    // default handler
    next(err, req, res);
});

app.listen(global.gConfig.port, () => {
    console.log('Server is running at PORT', global.gConfig.port);
});
const db = require('../models/db');
const errors = require('./errors');
const validate = require('uuid-validate');

module.exports = {
    // Returns the list of existing payments.
    async list(req, res) {
        let result = await db.listPayments();
        res.send(result.map(item => (item.amount /= 100, item)));
    },

    // Returns an existing payment.
    async get(req, res) {
        const id = req.params.id;

        if (!validate(id))
            errors.throwBadID(id);

        let result = await db.getPayment(id);

        if (result && result.amount)
            result.amount /= 100;

        res.send(result);
    },

    // Creates a new payment.
    async create(req, res) {
        let { payeeId,
            payerId,
            paymentSystem,
            paymentMethod,
            amount,
            currency,
            comment } = req.body;

        const validationErrors = [];

        [{ payeeId }, { payerId }, { paymentSystem }, { paymentMethod }, { amount }, { currency }].forEach(item => {
            for (let prop in item) {
                if (item.hasOwnProperty(prop)) {
                    let val = item[prop];
                    if (typeof val === 'undefined') {
                        validationErrors.push({
                            message: `'${prop}' field is required`,
                            path: [prop],
                            value: 'null'
                        });
                    }
                }
            }
        });

        // check for fractional cents (not allowed)
        if (!Number.isInteger(amount * 100))
            validationErrors.push({
                message: '\'amount\' must be a number and have no more than 2 decimals',
                path: ['amount'],
                value: amount ? amount : 'null'
            });

        // additional checks if required
        // ...

        if (validationErrors.length)
            errors.throwValidationError(validationErrors);

        // we keep the amount in cents to eliminate errors of accuracy loss
        // on math operations (see IEEE 754 floating point number problems)
        amount *= 100;

        if (comment === '')
            comment = null;

        const payment = await db.createPayment({
            payeeId,
            payerId,
            paymentSystem,
            paymentMethod,
            amount,
            currency,
            comment
        });

        // assemble the answer, the order of the fields should be specific
        const result = {
            id: payment.id,
            payeeId: payment.payeeId,
            payerId: payment.payerId,
            paymentSystem: payment.paymentSystem,
            paymentMethod: payment.paymentMethod,
            amount: payment.amount / 100,
            currency: payment.currency,
            status: payment.status,
            comment: payment.comment,
            created: payment.created,
            updated: payment.updated
        }

        res.status(201).send(result);
    },

    // Approves a payment
    async approve(req, res) {
        const id = req.params.id;

        if (!validate(id))
            errors.throwBadID(id);

        const payment = await db.getPayment(id);

        if (payment && payment.status == 'canceled')
            errors.throwError('CannotApproveError');

        await db.approvePayment(id);
        res.sendStatus(200);
    },

    // Cancels created payment that hasn’t been approved yet.
    async cancel(req, res) {
        const id = req.params.id;

        if (!validate(id))
            errors.throwBadID(id);

        const payment = await db.getPayment(id);

        if (payment && payment.status == 'approved')
            errors.throwError('CannotCancelError');

        await db.cancelPayment(id);
        res.sendStatus(200);
    }
}
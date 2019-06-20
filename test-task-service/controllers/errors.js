function throwError(name) {
    const err = new Error();
    err.name = name;
    throw err;
}

function throwValidationError(details) {
    const err = new Error();
    err.name = 'ValidationError';
    err.details = details;
    throw err;
}

function throwBadID(id) {
    throwValidationError([{ message: 'bad ID - must be a valid UUID', path: ['id'], value: id }])
}

module.exports = {
    throwError,
    throwValidationError,
    throwBadID
}
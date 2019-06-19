const db = require('../models/db');
const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
    const name = req.body.username;
    const pwd = req.body.password;

    const user = await db.getUser(name);

    if (user && user.password && user.password === pwd) {
        const token = jwt.sign({ name }, global.gConfig.SECRET, { expiresIn: '1h' });

        const decoded = jwt.decode(token);
        const expires = new Date(decoded.exp * 1000);

        res.send({
            authToken: token,
            expiresIn: expires.toISOString()
        });

        return;
    }

    throw new Error('No such user');
}
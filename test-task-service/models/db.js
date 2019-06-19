const uuidV4 = require('uuid/v4');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(global.gConfig.database, err =>
    err ? console.error(err) : console.log('Connected to the SQlite database'));

// промисифицируем основные методы
const { promisify } = require('util');
db.getAsync = promisify(db.get);
db.allAsync = promisify(db.all);

// обертка для авто-промисифицирования метода run всех результатов db.prepare
const originalPrepare = db.prepare.bind(db);
db.prepare = (...args) => {
    const stmt = originalPrepare(...args);
    stmt.runAsync = promisify(stmt.run);
    return stmt;
};

// Database initialization
db.serialize(() => {
    let stmt;

    db.run('CREATE TABLE IF NOT EXISTS users (username TEXT, password TEXT, UNIQUE(username))');

    stmt = db.prepare('INSERT OR IGNORE INTO users VALUES (?, ?)');
    stmt.run(['serious_business', 'suchPassw0rdSecure']);
    stmt.finalize();

    db.run(`CREATE TABLE IF NOT EXISTS payments (id TEXT, payeeId TEXT, payerId TEXT, paymentSystem TEXT, paymentMethod TEXT,
        amount INTEGER, currency TEXT, status TEXT, comment TEXT, created TEXT, updated TEXT, UNIQUE(id))`);

    stmt = db.prepare('INSERT OR IGNORE INTO payments VALUES (?,?,?,?,?,?,?,?,?,?,?)');
    stmt.run([
        '9781bd16-8221-4eb6-a37f-2eb60acc1338',
        'a5b500e1-2ba7-4623-baa2-e09b6a721b5e',
        'd8f090ae-a4ed-42dc-9181-f51564d0e304',
        'yandexMoney',
        'PMB',
        133701,
        'RUB',
        'created',
        null,
        '2018-03-09T11:26:14.805Z',
        '2018-03-09T11:31:14.666Z'
    ]);
    stmt.finalize();
});

module.exports = {
    async getUser(name) {
        return await db.getAsync('SELECT * FROM users WHERE username = ?', name);
    },

    async getPayment(id) {
        return await db.getAsync('SELECT * FROM payments WHERE id = ?', id);
    },

    async listPayments() {
        return await db.allAsync('SELECT * FROM payments');
    },

    async createPayment(data) {
        const now = new Date().toISOString();

        const payment = {
            ...data,
            id: uuidV4(),
            status: 'created',
            created: now,
            updated: now
        }

        const stmt = db.prepare('INSERT INTO payments VALUES (?,?,?,?,?,?,?,?,?,?,?)');
        await stmt.runAsync([ // порядок важен, поэтому для надежности вместо Object.values() вот так...
            payment.id,
            payment.payeeId,
            payment.payerId,
            payment.paymentSystem,
            payment.paymentMethod,
            payment.amount,
            payment.currency,
            payment.status,
            payment.comment,
            payment.created,
            payment.updated]);
        stmt.finalize();

        return payment;
    },

    async approvePayment(id) {
        const stmt = db.prepare('UPDATE payments SET status = ?, updated = ? WHERE id = ?');
        await stmt.runAsync(['approved', new Date().toISOString(), id]);
        stmt.finalize();
    },

    async cancelPayment(id) {
        const stmt = db.prepare('UPDATE payments SET status = ?, updated = ? WHERE id = ?');
        await stmt.runAsync(['canceled', new Date().toISOString(), id]);
        stmt.finalize();
    }
}
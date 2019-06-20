const { inspect } = require('util');

const testTaskLib = require('../test-task-lib');

const lib = new testTaskLib(
    'http://localhost:8000',    // server
    'serious_business',         // username
    'suchPassw0rdSecure');      // password

async function test() {
    try {
        // test paymentId API
        const id = '9781bd16-8221-4eb6-a37f-2eb60acc1338';
        const getPayment = await lib.getPayment(id);
        console.log(`getPayment = ${inspect(getPayment)}`);

        // test createPayment API
        const payment = {
            payeeId: 'fc1941f3-7912-4b3d-8fdb-dcb9733aa994',
            payerId: '0499274e-9325-43b1-9cff-57c957e9a337',
            paymentSystem: 'ingenico',
            paymentMethod: 'mastercard',
            amount: 100500.42,
            currency: 'USD',
            comment: 'Salary for March'
        };
        const createPayment = await lib.createPayment(payment);
        console.log(`createPayment = ${inspect(createPayment)}`);

        // test listPayments API
        const listPayments = await lib.listPayments();
        console.log(`listPayments = ${inspect(listPayments)}`);

        // test approvePayment API
        const approvePayment = await lib.approvePayment(id);
        console.log(`approvePayment = ${inspect(approvePayment)}`);

        // test cancelPayment API
        const cancelPayment = await lib.cancelPayment(id);
        console.log(`cancelPayment = ${inspect(cancelPayment)}`);
    }
    catch (err) {
        console.error(`${err.code ? err.code  + ': ': ''}${err.message}`);
        Array.isArray(err.details) && err.details.forEach(element => {
            console.error(inspect(element));
        });
    }
}

test();
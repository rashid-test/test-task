const Lib = require('../test-task-lib');

const testLib = new Lib('http://localhost:8000', 'serious_business', 'suchPassw0rdSecure');

async function main() {
    try {
        const getPayment = await testLib.getPayment('9781bd16-8221-4eb6-a37f-2eb60acc1338');
        console.log(`getPayment = ${JSON.stringify(getPayment)}`);

        const payment = {
            "payeeId": "fc1941f3-7912-4b3d-8fdb-dcb9733aa994",
            "payerId": "0499274e-9325-43b1-9cff-57c957e9a337",
            "paymentSystem": "ingenico",
            "paymentMethod": "mastercard",
            "amount": 100500.42,
            "currency": "USDa",
            "comment": "Salary for March"
        };
        const createPayment = await testLib.createPayment(payment);
        console.log(`createPayment = ${JSON.stringify(createPayment)}`);

        const listPayments = await testLib.listPayments();
        console.log(`listPayments = ${JSON.stringify(listPayments)}`);

        const approvePayment = await testLib.approvePayment('9781bd16-8221-4eb6-a37f-2eb60acc1338');
        console.log(`approvePayment = ${JSON.stringify(approvePayment)}`);

        const cancelPayment = await testLib.cancelPayment('9781bd16-8221-4eb6-a37f-2eb60acc1338');
        console.log(`cancelPayment = ${JSON.stringify(cancelPayment)}`);
    }
    catch (err) {
        console.error(err);
    }
}

main();
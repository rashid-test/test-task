# test-task

test-task-lib - SDK library for service API

    Usage:
        const Lib = require('test-task-lib');
        const testLib = new Lib(server, username, password);
        
        ... await testLib.listPayments();
        ... await testLib.getPayment(id);
        ... await testLib.createPayment(payment);
        ... await testLib.approvePayment(id);
        ... await testLib.cancelPayment(id);

test-task-app - test app for test-task-lib,
test-task-service - test service (a third party payments service) for test-task-lib

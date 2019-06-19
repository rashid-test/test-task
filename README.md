# test-task

test-task-lib - библиотека (SDK library for service API)

    Использование:
        const Lib = require('test-task-lib');
        const testLib = new Lib(server, username, password);
        ...
        ... await testLib.listPayments();
        ... await testLib.getPayment(id);
        ... await testLib.createPayment(payment);
        ... await testLib.approvePayment(id);
        ... await testLib.cancelPayment(id);

test-task-app - приложение использующее test-task-lib
test-task-service - тестовый сервис (third party payments service) для проверки библиотеки
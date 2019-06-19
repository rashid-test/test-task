const axios = require('axios');

function resultHandler(result) {
    return result.data;
}

function errorHandler(error) {
    if (error.response && error.response.data) {
        const { code, message, details } = error.response.data;

        if (code && message) {
            const err = new Error(message);
            err.code = code;

            if (details)
                err.details = details;

            throw err;
        }
    }

    throw error;
}

// проверка токена (истек ли срок) и получение
async function auth(obj) {
    if (!obj.token || obj.expires < Date.now()) {

        await axios.post(`${obj.server}/v1/authenticate`,
            { username: obj.username, password: obj.password })
            .then(res => {
                const { authToken, expiresIn } = res.data;

                obj.token = authToken;
                obj.expires = Date.parse(expiresIn);
            })
            .catch(() => false);
    }
}

module.exports = class {

    constructor(server, username, password) {
        this.server = server;
        this.username = username;
        this.password = password;

        axios.interceptors.request.use(async config => {
            if (config.url && !config.url.includes('/v1/authenticate')) {
                await auth(this);
                config.headers.Authorization = `Bearer ${this.token}`;
            }
            return config;
        }, error => Promise.reject(error));
    }

    // API endpoints

    async listPayments() {
        return await axios.get(`${this.server}/v1/payments`)
            .then(resultHandler)
            .catch(errorHandler);
    }

    async getPayment(id) {
        return await axios.get(`${this.server}/v1/payment/${id}`)
            .then(resultHandler)
            .catch(errorHandler);
    }

    async createPayment(payment) {
        return await axios.post(`${this.server}/v1/payments`, payment)
            .then(resultHandler)
            .catch(errorHandler);
    }

    async approvePayment(id) {
        return await axios.put(`${this.server}/v1/payments/${id}/approve`)
            .then(resultHandler)
            .catch(errorHandler);
    }

    async cancelPayment(id) {
        return await axios.put(`${this.server}/v1/payments/${id}/cancel`)
            .then(resultHandler)
            .catch(errorHandler);
    }
}
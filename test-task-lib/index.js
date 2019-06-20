const axios = require('axios');

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

// check token and refresh if expired
async function auth(obj) {
    if (!obj.token || obj.expires < Date.now()) {

        await obj.instance.post('/v1/authenticate',
            { username: obj.username, password: obj.password })
            .then(response => {
                const { authToken, expiresIn } = response;

                obj.token = authToken;
                obj.expires = Date.parse(expiresIn);
            });
    }
}

module.exports = class {

    constructor(server, username, password) {
        this.username = username;
        this.password = password;

        this.instance = axios.create({ baseURL: server });

        // intercept requests (add token)
        this.instance.interceptors.request.use(async config => {
            if (!config.url.includes('/v1/authenticate')) {
                await auth(this);
                config.headers.Authorization = `Bearer ${this.token}`;
            }
            return config;
        }, error => Promise.reject(error));

        // add a response interceptor
        this.instance.interceptors.response.use(response => response.data,
            error => errorHandler(error));
    }

    // API endpoints
    // ...

    async listPayments() {
        return await this.instance.get(`/v1/payments`);
    }

    async getPayment(id) {
        return await this.instance.get(`/v1/payment/${id}`);
    }

    async createPayment(payment) {
        return await this.instance.post(`/v1/payments`, payment);
    }

    async approvePayment(id) {
        return await this.instance.put(`/v1/payments/${id}/approve`);
    }

    async cancelPayment(id) {
        return await this.instance.put(`/v1/payments/${id}/cancel`);
    }
}
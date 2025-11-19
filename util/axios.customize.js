import axios from 'axios';

const instance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080',
});

instance.interceptors.request.use(
    function (config) {
        const token = localStorage.getItem('token') || localStorage.getItem('access_token');
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    function (error) {
        return Promise.reject(error);
    }
);

instance.interceptors.response.use(
    function (response) {
        // Trả về toàn bộ response object
        return response;
    },
    function (error) {
        // Xử lý lỗi - giữ nguyên error object để frontend có thể truy cập error.response
        // Không reject với error.response.data vì điều này sẽ làm mất thông tin về status code
        return Promise.reject(error);
    }
);

export default instance;

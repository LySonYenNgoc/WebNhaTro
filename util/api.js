import axios from './axios.customize';

const CreateNguoidungApi = (TenDN, Email, SDT, MatKhau, Role) => {
    const URL_API = "/v1/api/register";
    const data = { TenDN, Email, SDT, MatKhau, Role };
    return axios.post(URL_API, data);
}

const loginAPI = (tenDN, matKhau) => {
    const URL_API = "/v1/api/login";
    const data = { tenDN, matKhau };
    return axios.post(URL_API, data);
}

const getUserAPI = (role = null) => {
    const URL_API = "/v1/api/Nguoidung";
    const params = role ? { role } : {};
    return axios.get(URL_API, { params });
}

const createBaidangAPI = (
    Tieude, Mota, Noidung, Anh, Hinhanh, Trangthai, 
    MaTro, Dientich, Gia, Diachi, Loai, TenDN, Nguoidung
) => {
    const URL_API = "/v1/api/baidangs";
    const data = {
        Tieude, Mota, Noidung, Anh, Hinhanh, Trangthai,
        MaTro, Dientich, Gia, Diachi, Loai, TenDN, Nguoidung
    };
    return axios.post(URL_API, data);
}

const getBaidangAPI = () => {
    return axios.get('/v1/api/baidangs');
}

const getBaidangByIdAPI = (id) => {
    if (!id) {
        return Promise.reject(new Error('Thiếu id bài đăng'));
    }
    const URL_API = `/v1/api/baidangs/${id}`;
    return axios.get(URL_API);
}

const updateBaidangStatusAPI = (id, status) => {
    if (!id || !status) {
        return Promise.reject(new Error('ID và trạng thái là bắt buộc'));
    }
    const url = `/v1/api/baidang/${id}`;
    const data = { Trangthai: status };
    return axios.put(url, data);
}

const createTroAPI = (
    TenPhong, Dientich, Gia, Diachi, Loai, Mota, TenDN, Nguoidung, Trangthai
) => {
    const URL_API = "/v1/api/tros";
    const data = {
        TenPhong, Dientich, Gia, Diachi, Loai, Mota, TenDN, Nguoidung, Trangthai
    };
    return axios.post(URL_API, data);
}

const getTroAPI = (tenDN = null) => {
    const URL_API = "/v1/api/tros";
    const cleanTenDN = tenDN ? String(tenDN).trim().replace(/[:]/g, '') : null;
    const params = cleanTenDN ? { tenDN: cleanTenDN } : {};
    return axios.get(URL_API, { params });
}

const updateTroAPI = (id, updateData) => {
    const URL_API = `/v1/api/tros/${id}`;
    return axios.put(URL_API, updateData);
}

const deleteTroAPI = (id) => {
    const URL_API = `/v1/api/tros/${id}`;
    return axios.delete(URL_API);
}

const getNguoithueAPI = (tenDN = null) => {
    const URL_API = "/v1/api/nguoithues";
    const cleanTenDN = tenDN ? String(tenDN).trim().replace(/[:]/g, '') : null;
    const params = cleanTenDN ? { tenDN: cleanTenDN } : {};
    return axios.get(URL_API, { params });
}

const getNguoithueByIdAPI = (id) => {
    const URL_API = `/v1/api/nguoithues/${id}`;
    return axios.get(URL_API);
}

const createNguoithueAPI = (tenantData) => {
    const URL_API = "/v1/api/nguoithues";
    return axios.post(URL_API, tenantData);
}

const updateNguoithueAPI = (id, tenantData) => {
    const URL_API = `/v1/api/nguoithues/${id}`;
    return axios.put(URL_API, tenantData);
}

const deleteNguoithueAPI = (id) => {
    const URL_API = `/v1/api/nguoithues/${id}`;
    return axios.delete(URL_API);
}

const deleteMultipleNguoithueAPI = (ids) => {
    const URL_API = "/v1/api/nguoithues/delete-multiple";
    return axios.post(URL_API, { ids });
}

const getDichvuAPI = (filters = {}) => {
    const URL_API = "/v1/api/dichvus";
    const params = {};
    if (filters.tenDV) params.tenDV = filters.tenDV;
    if (filters.maTro) params.maTro = filters.maTro;
    if (filters.tenDN) params.tenDN = filters.tenDN;
    if (filters.thang) params.thang = filters.thang;
    if (filters.nam) params.nam = filters.nam;
    return axios.get(URL_API, { params });
}

const getDichvuByIdAPI = (id) => {
    const URL_API = `/v1/api/dichvus/${id}`;
    return axios.get(URL_API);
}

const createDichvuAPI = (serviceData) => {
    const URL_API = "/v1/api/dichvus";
    return axios.post(URL_API, serviceData);
}

const updateDichvuAPI = (id, updateData) => {
    const URL_API = `/v1/api/dichvus/${id}`;
    return axios.put(URL_API, updateData);
}

const deleteDichvuAPI = (id) => {
    const URL_API = `/v1/api/dichvus/${id}`;
    return axios.delete(URL_API);
}

const updateNguoidungAPI = (id, updateData) => {
    const URL_API = `/v1/api/nguoidungs/${id}`;
    return axios.put(URL_API, updateData);
}

export {
    CreateNguoidungApi,
    loginAPI,
    getUserAPI,
    createBaidangAPI,
    getBaidangAPI,
    getBaidangByIdAPI,
    updateBaidangStatusAPI,
    createTroAPI,
    getTroAPI,
    updateTroAPI,
    deleteTroAPI,
    getNguoithueAPI,
    getNguoithueByIdAPI,
    createNguoithueAPI,
    updateNguoithueAPI,
    deleteNguoithueAPI,
    deleteMultipleNguoithueAPI,
    getDichvuAPI,
    getDichvuByIdAPI,
    createDichvuAPI,
    updateDichvuAPI,
    deleteDichvuAPI,
    updateNguoidungAPI
}

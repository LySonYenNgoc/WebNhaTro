import React, { useState, useEffect, useContext, useRef } from "react";
import { Input, Button, Table, Row, Col, Typography, Modal, Form, notification, Select, Descriptions } from "antd";

import { getNguoithueAPI, createNguoithueAPI, deleteNguoithueAPI, deleteMultipleNguoithueAPI, updateNguoithueAPI } from "../../../util/api";
import { AuthContext } from "../../context/authcontext";
import "../../styles/ChutroPages.css";

const { Title } = Typography;
const { Option } = Select;

// Trang quản lý khách thuê
const DanhSachKhachThuePage = () => {
    const { user } = useContext(AuthContext);
    const isFetchingRef = useRef(false);
    const hasFetchedRef = useRef(false);
    
    // State filter
    const [maKhachThue, setMaKhachThue] = useState('');
    const [maTro, setMaTro] = useState('');
    const [soDienThoai, setSoDienThoai] = useState('');
    const [trangThai, setTrangThai] = useState('');
    // State dữ liệu
    const [allData, setAllData] = useState([]);
    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(false);
    // State modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingTenant, setEditingTenant] = useState(null);
    const [detailTenant, setDetailTenant] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);

    // Lấy dữ liệu khách thuê từ API
    const fetchData = async () => {
        if (isFetchingRef.current) {
            return;
        }
        
        setLoading(true);
        isFetchingRef.current = true;
        try {
            const currentUser = user || JSON.parse(localStorage.getItem('user_info') || '{}');
            const tenDN = currentUser?.TenDN || currentUser?.tenDN || '';
            
            // Clean tenDN
            const cleanTenDN = tenDN ? String(tenDN).trim().replace(/[:]/g, '') : null;
            const cleanTenDNForAPI = null; // Lấy tất cả dữ liệu
            
            // Gọi API lấy danh sách khách thuê
            const res = await getNguoithueAPI(cleanTenDNForAPI || null);
            
            // Xử lý response
            let list = [];
            if (res?.data) {
                if (res.data.error === false && Array.isArray(res.data.data)) {
                    list = res.data.data;
                } else if (Array.isArray(res.data.data)) {
                    list = res.data.data;
                } else if (Array.isArray(res.data)) {
                    list = res.data;
                }
            }

            // Format dữ liệu cho bảng
            const formatted = list.map((item, index) => {
                // Chuẩn hóa trạng thái
                let trangThai = item.Trangthai || item.trangThai || null;
                if (!trangThai || trangThai === '' || trangThai === 'undefined') {
                    trangThai = 'Chưa thanh toán';
                } else {
                    const trangThaiLower = trangThai.toLowerCase();
                    if (trangThaiLower === 'đã thanh toán' || trangThaiLower === 'da thanh toan' || 
                        trangThaiLower === 'đã trả phòng' || trangThaiLower === 'da tra phong' ||
                        trangThaiLower === 'đang thuê' || trangThaiLower === 'dang thue') {
                        trangThai = 'Đã thanh toán';
                    } else {
                        trangThai = 'Chưa thanh toán';
                    }
                }
                
                const itemId = item._id || item.id || `item-${index}`;
                return {
                    key: itemId,
                    _id: itemId,
                    MaKH: item.MaNT || item.MaKH || item.maNT || '',
                    HoTen: item.Hoten || item.HoTen || item.hoten || '',
                    SDT: item.SDT || item.sdt || '',
                    MaTro: item.MaTro || item.Phong || item.maTro || '',
                    SoXe: item.SoXe || item.soXe || item.SOXE || '',
                    Trangthai: trangThai,
                    ...item
                };
            });

            setAllData(formatted);
            setDataSource(formatted);
            
            // Hiển thị notification nếu có dữ liệu
            if (formatted.length > 0) {
                notification.success({
                    message: "Tải dữ liệu thành công",
                    description: `Đã tải ${formatted.length} khách thuê`,
                    duration: 2
                });
            } else {
                notification.warning({
                    message: "Không có dữ liệu",
                    description: "Không tìm thấy khách thuê nào trong database",
                    duration: 3
                });
            }
        } catch (error) {
            setAllData([]);
            setDataSource([]);
            notification.error({
                message: "Load danh sách khách thuê thất bại",
                description: error?.response?.data?.message || error?.message || "Lỗi không xác định",
            });
        } finally {
            setLoading(false);
            isFetchingRef.current = false;
        }
    };

    // Áp dụng filter
    const applyFilters = (data) => {
        let filtered = [...data];
        
        if (maKhachThue) {
            filtered = filtered.filter(item => 
                (item.MaKH || item.MaNT || '').toLowerCase().includes(maKhachThue.toLowerCase())
            );
        }
        if (maTro) {
            filtered = filtered.filter(item => 
                (item.MaTro || item.Phong || '').toLowerCase().includes(maTro.toLowerCase())
            );
        }
        if (soDienThoai) {
            filtered = filtered.filter(item => 
                (item.SDT || '').replace(/\s/g, '').includes(soDienThoai.replace(/\s/g, ''))
            );
        }
        if (trangThai) {
            filtered = filtered.filter(item => 
                (item.Trangthai || '').toLowerCase().includes(trangThai.toLowerCase())
            );
        }

        setDataSource(filtered);
    };

    // Xử lý tìm kiếm
    const handleSearch = () => {
        if (allData.length > 0) {
            applyFilters(allData);
        } else {
            fetchData();
        }
    };

    // Load dữ liệu khi component mount
    useEffect(() => {
        if (!hasFetchedRef.current) {
            hasFetchedRef.current = true;
            fetchData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    // Xử lý làm mới
    const handleRefresh = () => {
        setMaKhachThue('');
        setMaTro('');
        setSoDienThoai('');
        setTrangThai('');
        setSelectedRowKeys([]);
        fetchData();
    };

    // Mở modal thêm khách thuê
    const handleOpenModal = () => {
        form.resetFields();
        setIsModalOpen(true);
    };

    // Đóng modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        form.resetFields();
    };

    // Submit form thêm khách thuê
    const handleSubmit = async (values) => {
        setModalLoading(true);
        try {
            const currentUser = user || JSON.parse(localStorage.getItem('user_info') || '{}');
            const tenDN = currentUser?.TenDN || currentUser?.tenDN || '';
            const userId = currentUser?._id || currentUser?.id || null;

            // Chuẩn bị dữ liệu
            const tenantData = {
                MaNT: values.maKhachThue || null,
                Hoten: values.hoTen,
                SDT: values.soDienThoai || '',
                Email: values.email || '',
                MaTro: values.phong || '',
                Trangthai: values.trangThai || 'Đang thuê',
                TenDN: tenDN,
                Nguoidung: userId,
                Ngaythue: values.ngayThue ? new Date(values.ngayThue) : new Date(),
            };

            // Gọi API tạo khách thuê
            const res = await createNguoithueAPI(tenantData);

            if (res?.data && !res?.data?.error) {
                notification.success({
                    message: "Thành công",
                    description: res?.data?.message || "Khách thuê đã được thêm thành công!",
                    duration: 4,
                });
                handleCloseModal();
                await fetchData();
            } else {
                throw new Error(res?.data?.message || "Có lỗi xảy ra khi thêm khách thuê");
            }
        } catch (error) {
            const errorMsg = error?.response?.data?.message || error?.message || "Lỗi không xác định";
            notification.error({
                message: "Thêm khách thuê thất bại",
                description: errorMsg,
                duration: 4,
            });
        } finally {
            setModalLoading(false);
        }
    };

    // Mở modal sửa khách thuê
    const handleEditTenant = (tenant) => {
        if (!tenant || !tenant._id) {
            notification.warning({
                message: "Cảnh báo",
                description: "Không tìm thấy thông tin khách thuê để sửa",
            });
            return;
        }
        setEditingTenant(tenant);
        form.setFieldsValue({
            maKhachThue: tenant.MaKH || tenant.MaNT || '',
            hoTen: tenant.Hoten || tenant.HoTen || '',
            soDienThoai: tenant.SDT || tenant.sdt || '',
            email: tenant.Email || tenant.email || '',
            phong: tenant.MaTro || tenant.Phong || '',
            trangThai: tenant.Trangthai || tenant.TrangThai || 'Đang thuê',
            ngayThue: tenant.Ngaythue ? new Date(tenant.Ngaythue).toISOString().split('T')[0] : '',
        });
        setIsEditModalOpen(true);
    };

    // Xem chi tiết khách thuê
    const handleViewDetails = () => {
        if (selectedRows.length === 0) {
            notification.warning({
                message: "Cảnh báo",
                description: "Vui lòng chọn khách thuê cần xem chi tiết",
            });
            return;
        }
        setDetailTenant(selectedRows[0]);
        setIsDetailModalOpen(true);
    };

    // Đóng modal chi tiết
    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false);
        setDetailTenant(null);
    };

    // Đóng modal sửa
    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditingTenant(null);
        form.resetFields();
    };

    // Cập nhật khách thuê
    const handleUpdateTenant = async (values) => {
        if (!editingTenant || !editingTenant._id) {
            notification.error({
                message: "Lỗi",
                description: "Không tìm thấy khách thuê để cập nhật",
            });
            return;
        }

        setModalLoading(true);
        try {
            const currentUser = user || JSON.parse(localStorage.getItem('user_info') || '{}');
            const tenDN = currentUser?.TenDN || currentUser?.tenDN || '';
            const userId = currentUser?._id || currentUser?.id || null;

            const updateData = {
                MaNT: values.maKhachThue || editingTenant.MaKH || editingTenant.MaNT || null,
                Hoten: values.hoTen,
                SDT: values.soDienThoai || '',
                Email: values.email || '',
                MaTro: values.phong || '',
                Trangthai: values.trangThai || 'Đang thuê',
                TenDN: tenDN,
                Nguoidung: userId,
                Ngaythue: values.ngayThue ? new Date(values.ngayThue) : new Date(),
            };

            const res = await updateNguoithueAPI(editingTenant._id, updateData);
            if (res?.data && !res?.data?.error) {
                notification.success({
                    message: "Thành công",
                    description: res?.data?.message || "Khách thuê đã được cập nhật thành công!",
                    duration: 4,
                });
                handleCloseEditModal();
                await fetchData();
                setSelectedRowKeys([]);
                setSelectedRows([]);
            } else {
                throw new Error(res?.data?.message || "Có lỗi xảy ra khi cập nhật khách thuê");
            }
        } catch (error) {
            const errorMsg = error?.response?.data?.message || error?.message || "Lỗi không xác định";
            notification.error({
                message: "Cập nhật khách thuê thất bại",
                description: errorMsg,
                duration: 4,
            });
        } finally {
            setModalLoading(false);
        }
    };

    // Xóa khách thuê
    const handleDelete = () => {
        if (selectedRowKeys.length === 0) {
            notification.warning({
                message: "Cảnh báo",
                description: "Vui lòng chọn khách thuê cần xóa",
            });
            return;
        }

        Modal.confirm({
            title: 'Xác nhận xóa',
            content: `Bạn có chắc chắn muốn xóa ${selectedRowKeys.length} khách thuê đã chọn?`,
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    if (selectedRowKeys.length === 1) {
                        const res = await deleteNguoithueAPI(selectedRowKeys[0]);
                        if (res?.data && !res?.data?.error) {
                            notification.success({
                                message: "Thành công",
                                description: res?.data?.message || "Đã xóa khách thuê thành công",
                            });
                            setSelectedRowKeys([]);
                            await fetchData();
                        } else {
                            throw new Error(res?.data?.message || "Có lỗi xảy ra khi xóa khách thuê");
                        }
                    } else {
                        const res = await deleteMultipleNguoithueAPI(selectedRowKeys);
                        if (res?.data && !res?.data?.error) {
                            notification.success({
                                message: "Thành công",
                                description: res?.data?.message || `Đã xóa ${selectedRowKeys.length} khách thuê thành công`,
                            });
                            setSelectedRowKeys([]);
                            await fetchData();
                        } else {
                            throw new Error(res?.data?.message || "Có lỗi xảy ra khi xóa khách thuê");
                        }
                    }
                } catch (error) {
                    const errorMsg = error?.response?.data?.message || error?.message || "Lỗi không xác định";
                    notification.error({
                        message: "Xóa khách thuê thất bại",
                        description: errorMsg,
                    });
                }
            },
        });
    };

    // Cập nhật trạng thái khách thuê
    const handleStatusChange = async (record, newStatus) => {
        try {
            const res = await updateNguoithueAPI(record._id, { Trangthai: newStatus });
            if (res?.data && !res?.data?.error) {
                notification.success({
                    message: "Cập nhật thành công",
                    description: `Đã cập nhật trạng thái khách thuê ${record.MaKH} thành "${newStatus}"`,
                    duration: 2
                });
                const updatedDataSource = dataSource.map(item => 
                    item._id === record._id ? { ...item, Trangthai: newStatus } : item
                );
                const updatedAllData = allData.map(item => 
                    item._id === record._id ? { ...item, Trangthai: newStatus } : item
                );
                setDataSource(updatedDataSource);
                setAllData(updatedAllData);
            } else {
                throw new Error(res?.data?.message || "Có lỗi xảy ra khi cập nhật trạng thái");
            }
        } catch (error) {
            notification.error({
                message: "Cập nhật thất bại",
                description: error?.response?.data?.message || error?.message || "Lỗi không xác định",
                duration: 3
            });
        }
    };

    // Render trạng thái với dropdown
    const renderTrangThai = (status, record) => {
        const statusOptions = [
            { value: 'Đã thanh toán', label: 'Đã thanh toán', color: '#52c41a' },
            { value: 'Chưa thanh toán', label: 'Chưa thanh toán', color: '#ff4d4f' },
        ];
        let normalizedStatus = status || 'Chưa thanh toán';
        const statusLower = normalizedStatus.toLowerCase();
        if (statusLower === 'đã thanh toán' || statusLower === 'da thanh toan') {
            normalizedStatus = 'Đã thanh toán';
        } else {
            normalizedStatus = 'Chưa thanh toán';
        }
        
        return (
            <Select
                value={normalizedStatus}
                onChange={(value) => handleStatusChange(record, value)}
                style={{ 
                    width: '100%',
                    fontFamily: 'Arial, sans-serif',
                    fontSize: '14px'
                }}
                variant="borderless"
                dropdownStyle={{ minWidth: '150px' }}
            >
                {statusOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                        <span style={{ color: option.color, fontWeight: 'bold' }}>
                            {option.label}
                        </span>
                    </Option>
                ))}
            </Select>
        );
    };

    // Cấu hình cột cho bảng
    const columns = [
        {
            title: "MaKH",
            dataIndex: "MaKH",
            width: 100,
            align: 'center',
            render: (text, record) => <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '14px' }}>{text || record.MaNT || ''}</span>
        },
        {
            title: "Mã Trọ",
            dataIndex: "MaTro",
            width: 100,
            align: 'center',
            render: (text, record) => <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '14px' }}>{text || record.Phong || record.MaTro || ''}</span>
        },
        {
            title: "Họ tên",
            dataIndex: "HoTen",
            width: 150,
            render: (text, record) => <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '14px' }}>{text || record.Hoten || ''}</span>
        },
        {
            title: "SDT",
            dataIndex: "SDT",
            width: 130,
            render: (text) => <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '14px' }}>{text || ''}</span>
        },
        {
            title: "Số xe",
            dataIndex: "SoXe",
            width: 120,
            render: (text) => <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '14px' }}>{text || ''}</span>
        },
        {
            title: "Trạng thái",
            dataIndex: "Trangthai",
            width: 150,
            align: 'center',
            render: (text, record) => renderTrangThai(text, record),
        },
    ];

    // Row selection config
    const rowSelection = {
        type: 'radio',
        selectedRowKeys,
        onChange: (selectedKeys, selectedRowsData) => {
            setSelectedRowKeys(selectedKeys);
            setSelectedRows(selectedRowsData);
        },
        onSelect: (record, selected, selectedRowsData) => {
            if (selected) {
                setSelectedRows([record]);
            } else {
                setSelectedRows([]);
            }
        },
    };

    return (
        <div style={{
            background: 'white',
            padding: '24px',
            minHeight: 'calc(100vh - 64px)',
            fontFamily: 'Arial, sans-serif'
        }}>
            {/* Title Section */}
            <div style={{ marginBottom: '20px' }}>
                <div style={{
                    position: 'relative',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <Title level={2} className="chutro-page-title" style={{ margin: 0 }}>
                        QUẢN LÝ KHÁCH THUÊ
                    </Title>
                    <Button
                        type="default"
                        onClick={handleRefresh}
                        loading={loading}
                        style={{
                            fontFamily: 'Arial, sans-serif',
                            fontSize: '14px'
                        }}
                    >
                        Làm mới
                    </Button>
                </div>
            </div>

            {/* Filter & Action Buttons */}
            <div style={{ 
                marginBottom: '20px', 
                padding: '20px',
                border: '1px solid #e8e8e8',
                borderRadius: '6px'
            }}>
                {/* Filter */}
                <Row gutter={16} style={{ marginBottom: '20px' }}>
                    <Col xs={24} sm={12} md={12}>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '6px', 
                                fontWeight: 'bold',
                                fontFamily: 'Arial, sans-serif',
                                fontSize: '14px',
                                color: '#333'
                            }}>
                                Mã khách thuê:
                            </label>
                            <Input
                                placeholder="Nhập mã khách thuê"
                                value={maKhachThue}
                                onChange={(e) => setMaKhachThue(e.target.value)}
                                style={{
                                    fontFamily: 'Arial, sans-serif',
                                    fontSize: '14px',
                                    height: '36px'
                                }}
                            />
                        </div>
                    </Col>
                    <Col xs={24} sm={12} md={12}>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '6px', 
                                fontWeight: 'bold',
                                fontFamily: 'Arial, sans-serif',
                                fontSize: '14px',
                                color: '#333'
                            }}>
                                Mã trọ:
                            </label>
                            <Input
                                placeholder="Nhập mã trọ"
                                value={maTro}
                                onChange={(e) => setMaTro(e.target.value)}
                                style={{
                                    fontFamily: 'Arial, sans-serif',
                                    fontSize: '14px',
                                    height: '36px'
                                }}
                            />
                        </div>
                    </Col>
                    <Col xs={24} sm={12} md={12}>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '6px', 
                                fontWeight: 'bold',
                                fontFamily: 'Arial, sans-serif',
                                fontSize: '14px',
                                color: '#333'
                            }}>
                                Số điện thoại:
                            </label>
                            <Input
                                placeholder="Nhập số điện thoại"
                                value={soDienThoai}
                                onChange={(e) => setSoDienThoai(e.target.value)}
                                style={{
                                    fontFamily: 'Arial, sans-serif',
                                    fontSize: '14px',
                                    height: '36px'
                                }}
                            />
                        </div>
                    </Col>
                    <Col xs={24} sm={12} md={12}>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '6px', 
                                fontWeight: 'bold',
                                fontFamily: 'Arial, sans-serif',
                                fontSize: '14px',
                                color: '#333'
                            }}>
                                Trạng thái:
                            </label>
                            <Input
                                placeholder="Nhập trạng thái"
                                value={trangThai}
                                onChange={(e) => setTrangThai(e.target.value)}
                                style={{
                                    fontFamily: 'Arial, sans-serif',
                                    fontSize: '14px',
                                    height: '36px'
                                }}
                            />
                        </div>
                    </Col>
                </Row>

                {/* Buttons */}
                <div style={{ 
                    display: 'flex', 
                    gap: '12px', 
                    flexWrap: 'wrap',
                    justifyContent: 'flex-start',
                    borderTop: '1px solid #e8e8e8',
                    paddingTop: '16px'
                }}>
                    <Button
                        type="primary"
                        onClick={handleOpenModal}
                        style={{ 
                            backgroundColor: '#0045A8', 
                            borderColor: '#0045A8',
                            color: '#fff',
                            height: '40px',
                            minWidth: '130px',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            borderRadius: '4px',
                            fontFamily: 'Arial, sans-serif'
                        }}
                    >
                        Thêm khách
                    </Button>
                    <Button
                        style={{ 
                            backgroundColor: '#00B7FF', 
                            borderColor: '#00B7FF',
                            color: '#fff',
                            height: '40px',
                            minWidth: '130px',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            borderRadius: '4px',
                            fontFamily: 'Arial, sans-serif'
                        }}
                        disabled={selectedRowKeys.length === 0}
                        onClick={() => {
                            if (selectedRowKeys.length > 0 && selectedRows.length > 0) {
                                handleEditTenant(selectedRows[0]);
                            }
                        }}
                    >
                        Sửa khách thuê
                    </Button>
                    <Button
                        style={{ 
                            backgroundColor: '#FF5C00', 
                            borderColor: '#FF5C00',
                            color: '#fff',
                            height: '40px',
                            minWidth: '130px',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            borderRadius: '4px',
                            fontFamily: 'Arial, sans-serif'
                        }}
                        disabled={selectedRowKeys.length === 0}
                        onClick={handleViewDetails}
                    >
                        Chi tiết khách
                    </Button>
                    <Button
                        danger
                        onClick={handleDelete}
                        disabled={selectedRowKeys.length === 0}
                        style={{ 
                            backgroundColor: '#FF0000', 
                            borderColor: '#FF0000',
                            color: '#fff',
                            height: '40px',
                            minWidth: '130px',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            borderRadius: '4px',
                            fontFamily: 'Arial, sans-serif'
                        }}
                    >
                        Xóa khách thuê
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div style={{
                padding: '20px',
                border: '1px solid #e8e8e8',
                borderRadius: '6px'
            }}>
                <Table
                    bordered
                    dataSource={dataSource}
                    columns={columns}
                    rowKey={(record) => record.key || record._id || record.id || `row-${record.MaKH || record.MaNT || ''}`}
                    loading={loading}
                    rowSelection={rowSelection}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} khách thuê`,
                        pageSizeOptions: ['5', '10', '20', '50'],
                    }}
                    style={{
                        fontFamily: 'Arial, sans-serif'
                    }}
                    components={{
                        header: {
                            cell: (props) => (
                                <th {...props} style={{
                                    background: '#e0e0e0',
                                    fontWeight: 'bold',
                                    fontFamily: 'Arial, sans-serif',
                                    fontSize: '14px',
                                    color: '#333',
                                    padding: '12px 8px',
                                    textAlign: 'center',
                                    border: '1px solid #d0d0d0'
                                }} />
                            )
                        }
                    }}
                    rowClassName={(record, index) => {
                        return index % 2 === 0 ? 'table-row-even' : 'table-row-odd';
                    }}
                    locale={{
                        emptyText: (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                                <div style={{ fontSize: '48px', marginBottom: '16px' }}>�</div>
                                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                                    Chưa có khách thuê nào
                                </div>
                                <div style={{ fontSize: '14px', marginTop: '8px' }}>
                                    Hãy bấm nút "Thêm khách" để thêm khách thuê mới
                                </div>
                            </div>
                        )
                    }}
                />
            </div>

            {/* Modal thêm khách thuê */}
            <Modal
                title="Thêm Khách Thuê Mới"
                open={isModalOpen}
                onCancel={handleCloseModal}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    autoComplete="off"
                >
                    <Form.Item
                        label="Mã khách thuê"
                        name="maKhachThue"
                    >
                        <Input placeholder="Ví dụ: KST01, KST02..." size="large" />
                    </Form.Item>

                    <Form.Item
                        label="Họ và tên"
                        name="hoTen"
                        rules={[
                            { required: true, message: 'Vui lòng nhập họ và tên!' },
                        ]}
                    >
                        <Input placeholder="Nhập họ và tên khách thuê" size="large" />
                    </Form.Item>

                    <Form.Item
                        label="Số điện thoại"
                        name="soDienThoai"
                        rules={[
                            { required: true, message: 'Vui lòng nhập số điện thoại!' },
                            { pattern: /^[0-9\s]+$/, message: 'Số điện thoại không hợp lệ!' }
                        ]}
                    >
                        <Input placeholder="Ví dụ: 0977 123 456" size="large" />
                    </Form.Item>

                    <Form.Item
                        label="Phòng"
                        name="phong"
                        rules={[
                            { required: true, message: 'Vui lòng nhập số phòng!' },
                        ]}
                    >
                        <Input placeholder="Ví dụ: P101, P102..." size="large" />
                    </Form.Item>

                    <Form.Item
                        label="Trạng thái"
                        name="trangThai"
                        initialValue="Đang thuê"
                    >
                        <Select size="large">
                            <Option value="Đang thuê">Đang thuê</Option>
                            <Option value="Đã trả phòng">Đã trả phòng</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, marginTop: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <Button onClick={handleCloseModal}>
                                Hủy
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={modalLoading}
                                style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }}
                            >
                                Thêm Khách Thuê
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal Chi tiết khách thuê */}
            <Modal
                title="Chi tiết Khách Thuê"
                open={isDetailModalOpen}
                onCancel={handleCloseDetailModal}
                footer={[
                    <Button key="close" onClick={handleCloseDetailModal}>
                        Đóng
                    </Button>
                ]}
                width={640}
            >
                <Descriptions
                    bordered
                    column={1}
                    size="middle"
                    labelStyle={{ width: '160px', fontWeight: 'bold' }}
                    contentStyle={{ fontSize: '14px' }}
                >
                    <Descriptions.Item label="Mã khách thuê">
                        {detailTenant?.MaKH || detailTenant?.MaNT || 'Chưa cập nhật'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Họ và tên">
                        {detailTenant?.HoTen || detailTenant?.Hoten || 'Chưa cập nhật'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Số điện thoại">
                        {detailTenant?.SDT || 'Chưa cập nhật'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Email">
                        {detailTenant?.Email || 'Chưa cập nhật'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Mã trọ / Phòng">
                        {detailTenant?.MaTro || detailTenant?.Phong || 'Chưa cập nhật'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Số xe">
                        {detailTenant?.SoXe || 'Chưa cập nhật'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                        {detailTenant?.Trangthai || 'Chưa cập nhật'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày thuê">
                        {detailTenant?.Ngaythue
                            ? new Date(detailTenant.Ngaythue).toLocaleDateString('vi-VN')
                            : 'Chưa cập nhật'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ghi chú">
                        {detailTenant?.Ghichu || detailTenant?.GhiChu || 'Không có'}
                    </Descriptions.Item>
                </Descriptions>
            </Modal>

            {/* Modal Sửa Khách Thuê */}
            <Modal
                title="Sửa Khách Thuê"
                open={isEditModalOpen}
                onCancel={handleCloseEditModal}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleUpdateTenant}
                    autoComplete="off"
                >
                    <Form.Item
                        label="Mã khách thuê"
                        name="maKhachThue"
                    >
                        <Input placeholder="Ví dụ: KST01, KST02..." size="large" />
                    </Form.Item>

                    <Form.Item
                        label="Họ và tên"
                        name="hoTen"
                        rules={[
                            { required: true, message: 'Vui lòng nhập họ và tên!' },
                        ]}
                    >
                        <Input placeholder="Nhập họ và tên khách thuê" size="large" />
                    </Form.Item>

                    <Form.Item
                        label="Số điện thoại"
                        name="soDienThoai"
                        rules={[
                            { required: true, message: 'Vui lòng nhập số điện thoại!' },
                            { pattern: /^[0-9\s]+$/, message: 'Số điện thoại không hợp lệ!' }
                        ]}
                    >
                        <Input placeholder="Ví dụ: 0977 123 456" size="large" />
                    </Form.Item>

                    <Form.Item
                        label="Email"
                        name="email"
                    >
                        <Input placeholder="Ví dụ: example@email.com" size="large" />
                    </Form.Item>

                    <Form.Item
                        label="Phòng"
                        name="phong"
                        rules={[
                            { required: true, message: 'Vui lòng nhập số phòng!' },
                        ]}
                    >
                        <Input placeholder="Ví dụ: P101, P102..." size="large" />
                    </Form.Item>

                    <Form.Item
                        label="Trạng thái"
                        name="trangThai"
                    >
                        <Select size="large">
                            <Option value="Đang thuê">Đang thuê</Option>
                            <Option value="Đã trả phòng">Đã trả phòng</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Ngày thuê"
                        name="ngayThue"
                    >
                        <Input type="date" size="large" />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, marginTop: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <Button onClick={handleCloseEditModal}>
                                Hủy
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={modalLoading}
                                style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }}
                            >
                                Cập nhật Khách Thuê
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default DanhSachKhachThuePage;


import React, { useState, useEffect, useContext, useRef } from "react";
import { Input, Button, Table, Row, Col, Tag, Typography, Card, Modal, Form, notification, Select } from "antd";
// KHÔNG SỬ DỤNG ICON - Chỉ dùng text thuần
import { getTroAPI, createTroAPI, updateTroAPI, deleteTroAPI } from "../../../util/api";
import { AuthContext } from "../../context/authcontext";
import "../../styles/ChutroPages.css";

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Trang quản lý phòng
const QuanLyPhongPage = () => {
    const [form] = Form.useForm();
    const { user } = useContext(AuthContext);
    const isFetchingRef = useRef(false);
    const hasFetchedRef = useRef(false);
    
    // State filter
    const [maTro, setMaTro] = useState('');
    const [tenPhong, setTenPhong] = useState('');
    const [diaChi, setDiaChi] = useState('');
    const [trangThai, setTrangThai] = useState('');
    // State dữ liệu
    const [allData, setAllData] = useState([]);
    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(false);
    // State selection
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    // State modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);

    // Lấy dữ liệu phòng trọ từ API
    const fetchData = async () => {
        if (isFetchingRef.current) {
            return;
        }
        
        setLoading(true);
        isFetchingRef.current = true;
        try {
            const currentUser = user || JSON.parse(localStorage.getItem('user_info') || '{}');
            const tenDN = currentUser?.TenDN || currentUser?.tenDN || '';
            const cleanTenDN = tenDN ? String(tenDN).trim().replace(/[:]/g, '') : null;
            const cleanTenDNForAPI = null;
            
            const res = await getTroAPI(cleanTenDNForAPI || null);
            
            let list = [];
            if (res?.data) {
                if (Array.isArray(res.data.data)) {
                    list = res.data.data;
                } else if (Array.isArray(res.data)) {
                    list = res.data;
                } else if (res.data.error === false && Array.isArray(res.data.data)) {
                    list = res.data.data;
                }
            }

            // Format dữ liệu
            const formatted = list.map((item, index) => {
                let trangThai = item?.Trangthai || item?.trangThai || null;
                if (!trangThai || trangThai === '' || trangThai === 'undefined') {
                    trangThai = 'Trống';
                } else if (trangThai === 'Còn trống') {
                    trangThai = 'Trống';
                }
                
                return {
                    key: item._id || item.id || `item-${index}`,
                    _id: item._id || item.id || '',
                    MaTro: item?.MaTro || item?.maTro || '',
                    TenPhong: item?.TenPhong || item?.tenPhong || 'Chưa có tên phòng',
                    Dientich: item?.Dientich || item?.DienTich || item?.dientich || item?.dienTich || '',
                    Gia: item?.Gia || item?.gia || '',
                    Diachi: item?.Diachi || item?.DiaChi || item?.diachi || '',
                    Loai: item?.Loai || item?.LoaiPhong || item?.loai || item?.loaiPhong || '',
                    Mota: item?.Mota || item?.MoTa || item?.mota || '',
                    Succhua: item?.Succhua || item?.succhua || 0,
                    Trangthai: trangThai,
                    TenDN: item?.TenDN || item?.tenDN || '',
                    ...item
                };
            });

            setAllData(formatted);
            setDataSource(formatted);
            
            // Hiển thị notification
            if (formatted.length > 0) {
                notification.success({
                    message: "Tải dữ liệu thành công",
                    description: `Đã tải ${formatted.length} phòng trọ`,
                    duration: 2
                });
            } else {
                notification.warning({
                    message: "Không có dữ liệu",
                    description: "Không tìm thấy phòng trọ nào trong database",
                    duration: 3
                });
            }
        } catch (error) {
            console.error(' Error fetching data:', error);
            notification.error({
                message: "Load danh sách phòng trọ thất bại",
                description: error?.response?.data?.message || error?.message || "Lỗi không xác định",
            });
            setDataSource([]);
        } finally {
            setLoading(false);
            isFetchingRef.current = false;
        }
    };

    /**
     * Load dữ liệu khi component mount (chỉ một lần)
     */
    useEffect(() => {
        // Chỉ fetch nếu chưa fetch trước đó
        if (!hasFetchedRef.current) {
            hasFetchedRef.current = true;
            fetchData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty dependency - chỉ chạy một lần khi mount

    /**
     * Lọc lại khi filter thay đổi
     */
    useEffect(() => {
        if (allData.length === 0) return;
        
        let filtered = [...allData];
        
        if (maTro) {
            filtered = filtered.filter(item => 
                (item.MaTro || '').toLowerCase().includes(maTro.toLowerCase())
            );
        }
        if (tenPhong) {
            filtered = filtered.filter(item => 
                (item.TenPhong || '').toLowerCase().includes(tenPhong.toLowerCase())
            );
        }
        if (diaChi) {
            filtered = filtered.filter(item => {
                const diachi = item.Diachi || item.DiaChi || '';
                return diachi.toLowerCase().includes(diaChi.toLowerCase());
            });
        }
        if (trangThai) {
            filtered = filtered.filter(item => 
                (item.Trangthai || '').toLowerCase().includes(trangThai.toLowerCase())
            );
        }

        setDataSource(filtered);
    }, [maTro, tenPhong, diaChi, trangThai, allData]);

    // Mở modal thêm phòng
    const handleOpenModal = () => {
        form.resetFields();
        setIsModalOpen(true);
    };

    // Đóng modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        form.resetFields();
    };

    // Submit form thêm phòng
    const handleSubmit = async (values) => {
        setModalLoading(true);
        try {
            const currentUser = user || JSON.parse(localStorage.getItem('user_info') || '{}');
            const tenDN = currentUser?.TenDN || currentUser?.tenDN || '';
            const userId = currentUser?._id || currentUser?.id || null;

            const roomData = {
                TenPhong: values.tenPhong,
                Dientich: values.dientich || '',
                Gia: values.gia || '',
                Diachi: values.diachi || '',
                Loai: values.loai || '',
                Mota: values.mota || '',
                TenDN: tenDN,
                Nguoidung: userId,
                Trangthai: values.trangthai || 'Trống',
            };

            const res = await createTroAPI(
                roomData.TenPhong,
                roomData.Dientich,
                roomData.Gia,
                roomData.Diachi,
                roomData.Loai,
                roomData.Mota,
                roomData.TenDN,
                roomData.Nguoidung,
                roomData.Trangthai
            );

            if (res?.data && !res?.data?.error) {
                notification.success({
                    message: "Thành công",
                    description: res?.data?.message || "Phòng trọ đã được tạo thành công!",
                    duration: 4,
                });
                handleCloseModal();
                await fetchData();
            } else {
                throw new Error(res?.data?.message || "Có lỗi xảy ra khi tạo phòng trọ");
            }
        } catch (error) {
            const errorMsg = error?.response?.data?.message || error?.message || "Lỗi không xác định";
            notification.error({
                message: "Tạo phòng trọ thất bại",
                description: errorMsg,
                duration: 4,
            });
        } finally {
            setModalLoading(false);
        }
    };

    // Mở modal sửa phòng
    const handleEditRoom = (room) => {
        if (!room || !room._id) {
            notification.warning({
                message: "Cảnh báo",
                description: "Không tìm thấy thông tin phòng để sửa",
            });
            return;
        }
        setEditingRoom(room);
        form.setFieldsValue({
            tenPhong: room.TenPhong || '',
            loai: room.Loai || '',
            dientich: room.Dientich || '',
            gia: room.Gia || '',
            diachi: room.Diachi || '',
            trangthai: room.Trangthai || 'Trống',
            mota: room.Mota || '',
        });
        setIsEditModalOpen(true);
    };

    // Đóng modal sửa
    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditingRoom(null);
        form.resetFields();
    };

    // Cập nhật phòng trọ
    const handleUpdateRoom = async (values) => {
        if (!editingRoom || !editingRoom._id) {
            notification.error({
                message: "Lỗi",
                description: "Không tìm thấy phòng để cập nhật",
            });
            return;
        }

        setModalLoading(true);
        try {
            const updateData = {
                TenPhong: values.tenPhong,
                Dientich: values.dientich || '',
                Gia: values.gia || '',
                Diachi: values.diachi || '',
                Loai: values.loai || '',
                Mota: values.mota || '',
                Trangthai: values.trangthai || 'Trống',
            };

            const res = await updateTroAPI(editingRoom._id, updateData);
            if (res?.data && !res?.data?.error) {
                notification.success({
                    message: "Thành công",
                    description: res?.data?.message || "Phòng trọ đã được cập nhật thành công!",
                    duration: 4,
                });
                handleCloseEditModal();
                await fetchData();
                setSelectedRowKeys([]);
                setSelectedRows([]);
            } else {
                throw new Error(res?.data?.message || "Có lỗi xảy ra khi cập nhật phòng trọ");
            }
        } catch (error) {
            const errorMsg = error?.response?.data?.message || error?.message || "Lỗi không xác định";
            notification.error({
                message: "Cập nhật phòng trọ thất bại",
                description: errorMsg,
                duration: 4,
            });
        } finally {
            setModalLoading(false);
        }
    };

    // Xóa phòng trọ
    const handleDeleteRoom = () => {
        if (selectedRowKeys.length === 0) {
            notification.warning({
                message: "Cảnh báo",
                description: "Vui lòng chọn phòng cần xóa",
            });
            return;
        }

        Modal.confirm({
            title: 'Xác nhận xóa',
            content: `Bạn có chắc chắn muốn xóa phòng "${selectedRows[0]?.TenPhong || selectedRows[0]?.MaTro}"?`,
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    const roomId = selectedRowKeys[0];
                    const res = await deleteTroAPI(roomId);
                    if (res?.data && !res?.data?.error) {
                        notification.success({
                            message: "Thành công",
                            description: res?.data?.message || "Đã xóa phòng trọ thành công",
                        });
                        setSelectedRowKeys([]);
                        setSelectedRows([]);
                        await fetchData();
                    } else {
                        throw new Error(res?.data?.message || "Có lỗi xảy ra khi xóa phòng trọ");
                    }
                } catch (error) {
                    const errorMsg = error?.response?.data?.message || error?.message || "Lỗi không xác định";
                    notification.error({
                        message: "Xóa phòng trọ thất bại",
                        description: errorMsg,
                    });
                }
            },
        });
    };

    // Cập nhật trạng thái phòng trọ
    const handleStatusChange = async (record, newStatus) => {
        try {
            const res = await updateTroAPI(record._id, { Trangthai: newStatus });
            if (res?.data && !res?.data?.error) {
                notification.success({
                    message: "Cập nhật thành công",
                    description: `Đã cập nhật trạng thái phòng ${record.MaTro} thành "${newStatus}"`,
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

    // Render trạng thái phòng trọ với dropdown
    const renderTrangThaiPhong = (status, record) => {
        const statusOptions = [
            { value: 'Trống', label: 'Trống', color: '#52c41a' },
            { value: 'Đã thuê', label: 'Đã thuê', color: '#ff4d4f' },
            { value: 'Đang sửa chữa', label: 'Đang sửa chữa', color: '#faad14' },
            { value: 'Tạm ngưng', label: 'Tạm ngưng', color: '#999' },
        ];
        
        // Chuẩn hóa status
        let normalizedStatus = status || 'Trống';
        if (normalizedStatus === 'Còn trống') {
            normalizedStatus = 'Trống';
        }
        
        const currentStatus = statusOptions.find(opt => opt.value === normalizedStatus) || statusOptions[0];
        
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
            title: "Mã Trọ",
            dataIndex: "MaTro",
            width: 100,
            align: 'center',
            render: (text) => <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '14px' }}>{text || 'Chưa có'}</span>
        },
        {
            title: "Tên Phòng",
            dataIndex: "TenPhong",
            width: 150,
            render: (text) => <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '14px' }}>{text || 'Chưa có'}</span>
        },
        {
            title: "Diện tích",
            dataIndex: "Dientich",
            width: 100,
            align: 'center',
            render: (text, record) => {
                const dientich = text || record.DienTich || '';
                return <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '14px' }}>{dientich ? `${dientich}m²` : 'Chưa có'}</span>
            }
        },
        {
            title: "Giá",
            dataIndex: "Gia",
            width: 150,
            align: 'right',
            render: (text) => {
                if (!text) return <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '14px' }}>Chưa có</span>;
                const gia = typeof text === 'number' ? text : parseInt(text) || 0;
                return <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '14px' }}>{gia.toLocaleString('vi-VN')} VNĐ</span>
            }
        },
        {
            title: "Địa chỉ",
            dataIndex: "Diachi",
            width: 200,
            render: (text, record) => {
                const diachi = text || record.DiaChi || '';
                return <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '14px' }}>{diachi || 'Chưa có'}</span>
            }
        },
        {
            title: "Loại phòng",
            dataIndex: "Loai",
            width: 120,
            render: (text, record) => {
                const loai = text || record.LoaiPhong || '';
                return <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '14px' }}>{loai || 'Chưa có'}</span>
            }
        },
        {
            title: "Trạng thái",
            dataIndex: "Trangthai",
            width: 150,
            align: 'center',
            render: (text, record) => renderTrangThaiPhong(text, record),
        },
    ];

    return (
        <div style={{
            background: 'white',
            padding: '24px',
            minHeight: 'calc(100vh - 64px)',
            fontFamily: 'Arial, sans-serif'
        }}>
            {/* Title Section */}
            <div style={{
                marginBottom: '20px'
            }}>
                <div style={{
                    position: 'relative',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <Title level={2} className="chutro-page-title" style={{ margin: 0 }}>
                        QUẢN LÝ PHÒNG
                    </Title>
                    <Button
                        type="default"
                        onClick={fetchData}
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

            {/* Filter & Action Buttons Section - Gộp lại thành một phần */}
            <div style={{ 
                marginBottom: '20px', 
                padding: '20px',
                border: '1px solid #e8e8e8',
                borderRadius: '6px'
            }}>
                {/* Filter Fields */}
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
                                Tên phòng:
                            </label>
                            <Input
                                placeholder="Nhập tên phòng"
                                value={tenPhong}
                                onChange={(e) => setTenPhong(e.target.value)}
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
                                Địa chỉ:
                            </label>
                            <Input
                                placeholder="Nhập địa chỉ"
                                value={diaChi}
                                onChange={(e) => setDiaChi(e.target.value)}
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

                {/* Action Buttons */}
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
                        Thêm phòng
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
                                handleEditRoom(selectedRows[0]);
                            }
                        }}
                    >
                        Sửa phòng
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
                        onClick={() => {
                            if (selectedRowKeys.length > 0) {
                                // TODO: Implement detail functionality
                                notification.info({
                                    message: "Chi tiết phòng",
                                    description: `Đã chọn phòng: ${selectedRows[0]?.MaTro || selectedRows[0]?.TenPhong}`,
                                });
                            }
                        }}
                    >
                        Chi tiết phòng
                    </Button>
                    <Button
                        danger
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
                        disabled={selectedRowKeys.length === 0}
                        onClick={handleDeleteRoom}
                    >
                        Xóa phòng
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
                    rowKey={(record) => record._id || record.key}
                    loading={loading}
                    rowSelection={{
                        type: 'radio', // Chỉ cho phép chọn một dòng
                        selectedRowKeys,
                        onChange: (selectedKeys, selectedRowsData) => {
                            setSelectedRowKeys(selectedKeys);
                            setSelectedRows(selectedRowsData);
                        },
                        onSelect: (record, selected, selectedRowsData) => {
                            setSelectedRowKeys(selected ? [record._id || record.key] : []);
                            setSelectedRows(selected ? [record] : []);
                        },
                    }}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} phòng trọ`,
                        pageSizeOptions: ['5', '10', '20', '50'],
                    }}
                    scroll={{ x: 'max-content' }}
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
                                    Chưa có phòng trọ nào
                                </div>
                                <div style={{ fontSize: '14px', marginTop: '8px' }}>
                                    Hãy bấm nút "Thêm phòng" để tạo phòng trọ mới
                                </div>
                            </div>
                        )
                    }}
                />
            </div>

            {/* Modal Thêm Phòng */}
            <Modal
                title="Thêm Phòng Trọ Mới"
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
                        label="Tên Phòng"
                        name="tenPhong"
                        rules={[
                            { required: true, message: 'Vui lòng nhập tên phòng!' },
                            { max: 200, message: 'Tên phòng không được quá 200 ký tự!' }
                        ]}
                    >
                        <Input placeholder="Ví dụ: Phòng 101, Phòng Studio..." size="large" />
                    </Form.Item>

                    <Form.Item
                        label="Loại"
                        name="loai"
                    >
                        <Input placeholder="Ví dụ: Phòng trọ, Căn hộ, Nhà nguyên căn..." size="large" />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Diện tích"
                                name="dientich"
                            >
                                <Input placeholder="Ví dụ: 50m²" size="large" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Giá"
                                name="gia"
                            >
                                <Input placeholder="Ví dụ: 3.000.000 VNĐ/tháng" size="large" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        label="Địa chỉ"
                        name="diachi"
                    >
                        <Input placeholder="Nhập địa chỉ phòng trọ" size="large" />
                    </Form.Item>

                    <Form.Item
                        label="Trạng thái"
                        name="trangthai"
                        initialValue="Trống"
                    >
                        <Select size="large">
                            <Option value="Trống">Trống</Option>
                            <Option value="Đã thuê">Đã thuê</Option>
                            <Option value="Đang sửa chữa">Đang sửa chữa</Option>
                            <Option value="Tạm ngưng">Tạm ngưng</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Mô tả"
                        name="mota"
                    >
                        <TextArea
                            rows={4}
                            placeholder="Nhập mô tả chi tiết về phòng trọ (tùy chọn)"
                            showCount
                            maxLength={1000}
                        />
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
                                Thêm Phòng
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal Sửa Phòng */}
            <Modal
                title="Sửa Phòng Trọ"
                open={isEditModalOpen}
                onCancel={handleCloseEditModal}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleUpdateRoom}
                    autoComplete="off"
                >
                    <Form.Item
                        label="Tên Phòng"
                        name="tenPhong"
                        rules={[
                            { required: true, message: 'Vui lòng nhập tên phòng!' },
                            { max: 200, message: 'Tên phòng không được quá 200 ký tự!' }
                        ]}
                    >
                        <Input placeholder="Ví dụ: Phòng 101, Phòng Studio..." size="large" />
                    </Form.Item>

                    <Form.Item
                        label="Loại"
                        name="loai"
                    >
                        <Input placeholder="Ví dụ: Phòng trọ, Căn hộ, Nhà nguyên căn..." size="large" />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Diện tích"
                                name="dientich"
                            >
                                <Input placeholder="Ví dụ: 50m²" size="large" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Giá"
                                name="gia"
                            >
                                <Input placeholder="Ví dụ: 3.000.000 VNĐ/tháng" size="large" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        label="Địa chỉ"
                        name="diachi"
                    >
                        <Input placeholder="Nhập địa chỉ phòng trọ" size="large" />
                    </Form.Item>

                    <Form.Item
                        label="Trạng thái"
                        name="trangthai"
                    >
                        <Select size="large">
                            <Option value="Trống">Trống</Option>
                            <Option value="Đã thuê">Đã thuê</Option>
                            <Option value="Đang sửa chữa">Đang sửa chữa</Option>
                            <Option value="Tạm ngưng">Tạm ngưng</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Mô tả"
                        name="mota"
                    >
                        <TextArea
                            rows={4}
                            placeholder="Nhập mô tả chi tiết về phòng trọ (tùy chọn)"
                            showCount
                            maxLength={1000}
                        />
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
                                Cập nhật Phòng
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default QuanLyPhongPage;

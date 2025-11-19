import React, { useState, useEffect, useContext, useRef } from "react";
import { Table, Button, Input, Row, Col, Typography, notification } from "antd";
// KHÔNG SỬ DỤNG ICON - Chỉ dùng text thuần
import { getDichvuAPI, updateDichvuAPI } from "../../../util/api";
import { AuthContext } from "../../context/authcontext";

const { Title } = Typography;

/**
 * Trang quản lý chỉ số nước
 */
const ChiSoNuocPage = () => {
    const { user } = useContext(AuthContext);
    const isFetchingRef = useRef(false);
    const hasFetchedRef = useRef(false);

    // State cho các filter
    const [maTro, setMaTro] = useState('');
    const [thangNam, setThangNam] = useState('');
    const [soKi, setSoKi] = useState('');
    const [trangThai, setTrangThai] = useState('');

    // State cho dữ liệu
    const [allData, setAllData] = useState([]);
    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(false);

    // State cho editing
    const [editingRows, setEditingRows] = useState({});

    /**
     * Fetch dữ liệu từ API
     */
    const fetchData = async () => {
        if (isFetchingRef.current) return;
        isFetchingRef.current = true;
        setLoading(true);

        try {
            console.log(' Fetching dichvu data for Nước...');
            
            // Parse tháng/năm từ input (format: MM/YYYY hoặc MM-YYYY)
            let thang = null;
            let nam = null;
            if (thangNam) {
                const parts = thangNam.split(/[\/\-]/);
                if (parts.length === 2) {
                    thang = parseInt(parts[0]);
                    nam = parseInt(parts[1]);
                }
            }

            const filters = {
                tenDV: 'Nước', // Chỉ lấy dữ liệu nước
                maTro: maTro || null,
                // Tạm thời không filter theo tenDN để lấy tất cả dữ liệu
                // tenDN: user?.TenDN || null,
                tenDN: null, // Lấy tất cả dữ liệu, không filter theo TenDN
                thang: thang,
                nam: nam
            };

            console.log(' Filters:', filters);

            const res = await getDichvuAPI(filters);
            console.log(' API Response:', res);
            console.log(' API Response data:', res?.data);
            console.log(' API Response status:', res?.status);

            let list = [];
            // Xử lý nhiều format response
            if (res?.data?.data && Array.isArray(res.data.data)) {
                list = res.data.data;
            } else if (res?.data?.data && !Array.isArray(res.data.data) && res.data.data.length !== undefined) {
                // Nếu data.data là object có length
                list = Object.values(res.data.data);
            } else if (Array.isArray(res?.data)) {
                list = res.data;
            } else if (res?.data && typeof res.data === 'object' && !res.data.error) {
                // Nếu response là object đơn
                list = [res.data];
            }

            console.log(` Received ${list.length} items from API`);
            if (list.length > 0) {
                console.log(' First item:', list[0]);
            }

            // Format dữ liệu cho bảng
            const formatted = list.map((item, index) => {
                const itemId = item._id || item.id || `item-${index}`;
                
                // Format thời gian
                let thoigian = '';
                if (item.Thoigian) {
                    const date = new Date(item.Thoigian);
                    const month = (date.getMonth() + 1).toString().padStart(2, '0');
                    const year = date.getFullYear();
                    thoigian = `${month}/${year}`;
                }

                return {
                    key: itemId,
                    _id: itemId,
                    STT: index + 1,
                    Thoigian: thoigian,
                    Phong: item.MaTro || item.Phong || '',
                    Sodau: item.Sodau || 0,
                    Socuoi: item.Socuoi || 0,
                    Sudung: item.Sudung !== undefined ? item.Sudung : ((item.Socuoi || 0) - (item.Sodau || 0)),
                    Trangthai: item.Trangthai || 'Chưa thanh toán',
                    // Giữ lại dữ liệu gốc
                    ...item
                };
            });

            console.log(` Đã format ${formatted.length} items`);

            setAllData(formatted);
            setDataSource(formatted);

            if (formatted.length > 0) {
                notification.success({
                    message: "Tải dữ liệu thành công",
                    description: `Đã tải ${formatted.length} chỉ số nước`,
                    duration: 2
                });
            } else {
                notification.warning({
                    message: "Không có dữ liệu",
                    description: "Không tìm thấy chỉ số nước nào trong database",
                    duration: 3
                });
            }
        } catch (error) {
            console.error(' Error fetching data:', error);
            console.error(' Error response:', error?.response);
            console.error(' Error message:', error?.message);
            console.error(' Error stack:', error?.stack);
            
            setAllData([]);
            setDataSource([]);
            
            // Hiển thị thông báo lỗi chi tiết hơn
            const errorMessage = error?.response?.data?.message || error?.message || "Lỗi không xác định";
            const errorStatus = error?.response?.status;
            
            if (errorStatus === 404) {
                notification.error({
                    message: "API không tìm thấy",
                    description: "Route /dichvus không tồn tại. Vui lòng kiểm tra backend đã khởi động lại chưa.",
                    duration: 5
                });
            } else {
                notification.error({
                    message: "Load danh sách chỉ số nước thất bại",
                    description: errorMessage,
                    duration: 5
                });
            }
        } finally {
            setLoading(false);
            isFetchingRef.current = false;
        }
    };

    /**
     * Load dữ liệu khi component mount
     */
    useEffect(() => {
        if (!hasFetchedRef.current) {
            hasFetchedRef.current = true;
            fetchData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Xử lý tìm kiếm
     */
    const handleSearch = () => {
        fetchData();
    };

    /**
     * Xử lý làm mới
     */
    const handleRefresh = () => {
        setMaTro('');
        setThangNam('');
        setSoKi('');
        setTrangThai('');
        fetchData();
    };

    /**
     * Xử lý thay đổi chỉ số
     */
    const handleChangeChiSo = (record, field, value) => {
        const newEditingRows = { ...editingRows };
        if (!newEditingRows[record._id]) {
            newEditingRows[record._id] = { ...record };
        }
        newEditingRows[record._id][field] = parseInt(value) || 0;
        
        // Tự động tính Sudung nếu thay đổi Sodau hoặc Socuoi
        if (field === 'Sodau' || field === 'Socuoi') {
            const sodau = field === 'Sodau' ? (parseInt(value) || 0) : (newEditingRows[record._id].Sodau || 0);
            const socuoi = field === 'Socuoi' ? (parseInt(value) || 0) : (newEditingRows[record._id].Socuoi || 0);
            newEditingRows[record._id].Sudung = socuoi - sodau;
        }
        
        setEditingRows(newEditingRows);
    };

    /**
     * Xử lý lưu chỉ số
     */
    const handleSave = async (record) => {
        try {
            const editedData = editingRows[record._id];
            if (!editedData) {
                notification.warning({
                    message: "Không có thay đổi",
                    description: "Vui lòng chỉnh sửa chỉ số trước khi lưu",
                    duration: 2
                });
                return;
            }

            console.log(' Đang cập nhật chỉ số nước:', { id: record._id, data: editedData });

            const updateData = {
                Sodau: editedData.Sodau,
                Socuoi: editedData.Socuoi
            };

            const res = await updateDichvuAPI(record._id, updateData);

            if (res?.data && !res?.data?.error) {
                notification.success({
                    message: "Cập nhật thành công",
                    description: `Đã cập nhật chỉ số nước cho phòng ${record.Phong}`,
                    duration: 2
                });

                // Xóa khỏi editingRows
                const newEditingRows = { ...editingRows };
                delete newEditingRows[record._id];
                setEditingRows(newEditingRows);

                // Refresh data
                await fetchData();
            } else {
                throw new Error(res?.data?.message || "Có lỗi xảy ra khi cập nhật");
            }
        } catch (error) {
            console.error(' Error updating:', error);
            notification.error({
                message: "Cập nhật thất bại",
                description: error?.response?.data?.message || error?.message || "Lỗi không xác định",
                duration: 3
            });
        }
    };

    /**
     * Cấu hình cột cho bảng
     */
    const columns = [
        {
            title: "STT",
            dataIndex: "STT",
            width: 80,
            align: 'center',
            render: (text) => <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '14px' }}>{text}</span>
        },
        {
            title: "Thời gian",
            dataIndex: "Thoigian",
            width: 120,
            align: 'center',
            render: (text) => <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '14px' }}>{text || ''}</span>
        },
        {
            title: "Phòng",
            dataIndex: "Phong",
            width: 100,
            align: 'center',
            render: (text) => <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '14px' }}>{text || ''}</span>
        },
        {
            title: "Chỉ số nước cũ",
            dataIndex: "Sodau",
            width: 150,
            align: 'center',
            render: (text, record) => {
                const editedData = editingRows[record._id];
                const value = editedData ? editedData.Sodau : (text || 0);
                return (
                    <Input
                        type="number"
                        value={value}
                        onChange={(e) => handleChangeChiSo(record, 'Sodau', e.target.value)}
                        style={{
                            width: '100%',
                            fontFamily: 'Arial, sans-serif',
                            fontSize: '14px',
                            textAlign: 'center'
                        }}
                    />
                );
            }
        },
        {
            title: "Chỉ số nước mới",
            dataIndex: "Socuoi",
            width: 150,
            align: 'center',
            render: (text, record) => {
                const editedData = editingRows[record._id];
                const value = editedData ? editedData.Socuoi : (text || 0);
                return (
                    <Input
                        type="number"
                        value={value}
                        onChange={(e) => handleChangeChiSo(record, 'Socuoi', e.target.value)}
                        style={{
                            width: '100%',
                            fontFamily: 'Arial, sans-serif',
                            fontSize: '14px',
                            textAlign: 'center'
                        }}
                    />
                );
            }
        },
        {
            title: "Sử dụng",
            dataIndex: "Sudung",
            width: 120,
            align: 'center',
            render: (text, record) => {
                const editedData = editingRows[record._id];
                const value = editedData ? editedData.Sudung : (text || 0);
                return <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '14px', fontWeight: 'bold' }}>{value}</span>;
            }
        },
        {
            title: "Hành động",
            width: 100,
            align: 'center',
            render: (text, record) => (
                <Button
                    type="primary"
                    onClick={() => handleSave(record)}
                    style={{
                        backgroundColor: '#1890ff',
                        borderColor: '#1890ff',
                        color: '#fff',
                        fontFamily: 'Arial, sans-serif',
                        fontSize: '14px',
                        fontWeight: 'bold'
                    }}
                >
                    Lưu
                </Button>
            )
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
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Title level={2} className="chutro-page-title" style={{ margin: 0 }}>
                    CHỈ SỐ NƯỚC
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

            {/* Search Form */}
            <div style={{
                padding: '20px',
                border: '1px solid #e8e8e8',
                borderRadius: '6px',
                marginBottom: '20px',
                background: '#fafafa'
            }}>
                <Row gutter={16}>
                    <Col xs={24} sm={12} md={6}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>
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
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>
                            Tháng/Năm:
                        </label>
                        <Input
                            placeholder="MM/YYYY"
                            value={thangNam}
                            onChange={(e) => setThangNam(e.target.value)}
                            style={{
                                fontFamily: 'Arial, sans-serif',
                                fontSize: '14px',
                                height: '36px'
                            }}
                        />
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>
                            Số kí:
                        </label>
                        <Input
                            placeholder="Nhập số kí"
                            value={soKi}
                            onChange={(e) => setSoKi(e.target.value)}
                            style={{
                                fontFamily: 'Arial, sans-serif',
                                fontSize: '14px',
                                height: '36px'
                            }}
                        />
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>
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
                    </Col>
                </Row>
                <Row gutter={16} style={{ marginTop: '16px' }}>
                    <Col xs={24} sm={24} md={24} style={{ textAlign: 'right' }}>
                        <Button
                            type="primary"
                            onClick={handleSearch}
                            style={{
                                backgroundColor: '#1890ff',
                                borderColor: '#1890ff',
                                color: '#fff',
                                height: '36px',
                                minWidth: '100px',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                borderRadius: '4px',
                                fontFamily: 'Arial, sans-serif',
                                marginRight: '8px'
                            }}
                        >
                            tìm kiếm
                        </Button>
                        <Button
                            onClick={handleRefresh}
                            style={{
                                height: '36px',
                                minWidth: '100px',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                borderRadius: '4px',
                                fontFamily: 'Arial, sans-serif'
                            }}
                        >
                            Làm mới
                        </Button>
                    </Col>
                </Row>
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
                    rowKey={(record) => record.key || record._id || record.id || `row-${record.Phong || ''}`}
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} chỉ số nước`,
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
                />
            </div>
        </div>
    );
};

export default ChiSoNuocPage;

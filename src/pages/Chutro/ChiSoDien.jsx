import React, { useState, useEffect, useRef } from "react";
import { Table, Button, Input, Row, Col, Typography, notification } from "antd";
import { getDichvuAPI, updateDichvuAPI } from "../../../util/api";
import "../../styles/ChutroPages.css";

const { Title } = Typography;

// Trang quản lý chỉ số điện
const ChiSoDienPage = () => {
    const isFetchingRef = useRef(false);
    const hasFetchedRef = useRef(false);

    // State filter
    const [maTro, setMaTro] = useState('');
    const [thangNam, setThangNam] = useState('');
    const [soKi, setSoKi] = useState('');
    const [trangThai, setTrangThai] = useState('');

    // State dữ liệu
    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingRows, setEditingRows] = useState({});

    // Lấy dữ liệu từ API
    const fetchData = async () => {
        if (isFetchingRef.current) return;
        
        isFetchingRef.current = true;
        setLoading(true);

        try {
            // Parse tháng/năm
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
                tenDV: 'Điện',
                maTro: maTro || null,
                tenDN: null,
                thang: thang,
                nam: nam
            };

            const res = await getDichvuAPI(filters);

            // Xử lý response
            let list = [];
            if (res?.data?.data && Array.isArray(res.data.data)) {
                list = res.data.data;
            } else if (Array.isArray(res?.data)) {
                list = res.data;
            }

            // Format dữ liệu
            const formatted = list.map((item, index) => {
                // Format thời gian
                let thoigian = '';
                if (item.Thoigian) {
                    const date = new Date(item.Thoigian);
                    const month = (date.getMonth() + 1).toString().padStart(2, '0');
                    const year = date.getFullYear();
                    thoigian = `${month}/${year}`;
                }

                return {
                    key: item._id || item.id || `item-${index}`,
                    _id: item._id || item.id || '',
                    STT: index + 1,
                    Thoigian: thoigian,
                    Phong: item.MaTro || item.Phong || '',
                    Sodau: item.Sodau || 0,
                    Socuoi: item.Socuoi || 0,
                    Sudung: item.Sudung !== undefined ? item.Sudung : ((item.Socuoi || 0) - (item.Sodau || 0)),
                    Trangthai: item.Trangthai || 'Chưa thanh toán',
                };
            });

            setDataSource(formatted);

            if (formatted.length > 0) {
                notification.success({
                    message: "Tải dữ liệu thành công",
                    description: `Đã tải ${formatted.length} chỉ số điện`,
                    duration: 2
                });
            } else {
                notification.warning({
                    message: "Không có dữ liệu",
                    description: "Không tìm thấy chỉ số điện nào",
                    duration: 3
                });
            }
        } catch (error) {
            setDataSource([]);
            const errorMessage = error?.response?.data?.message || error?.message || "Lỗi không xác định";
            const errorStatus = error?.response?.status;
            
            if (errorStatus === 404) {
                notification.error({
                    message: "API không tìm thấy",
                    description: "Vui lòng kiểm tra backend đã khởi động lại chưa.",
                    duration: 5
                });
            } else {
                notification.error({
                    message: "Lỗi",
                    description: errorMessage,
                    duration: 5
                });
            }
        } finally {
            setLoading(false);
            isFetchingRef.current = false;
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

    // Tìm kiếm
    const handleSearch = () => {
        fetchData();
    };

    // Làm mới
    const handleRefresh = () => {
        setMaTro('');
        setThangNam('');
        setSoKi('');
        setTrangThai('');
        fetchData();
    };

    // Thay đổi chỉ số
    const handleChangeChiSo = (record, field, value) => {
        const newEditingRows = { ...editingRows };
        if (!newEditingRows[record._id]) {
            newEditingRows[record._id] = { ...record };
        }
        newEditingRows[record._id][field] = parseInt(value) || 0;
        
        // Tự động tính Sudung
        if (field === 'Sodau' || field === 'Socuoi') {
            const sodau = field === 'Sodau' ? (parseInt(value) || 0) : (newEditingRows[record._id].Sodau || 0);
            const socuoi = field === 'Socuoi' ? (parseInt(value) || 0) : (newEditingRows[record._id].Socuoi || 0);
            newEditingRows[record._id].Sudung = socuoi - sodau;
        }
        
        setEditingRows(newEditingRows);
    };

    // Lưu chỉ số
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

            const updateData = {
                Sodau: editedData.Sodau,
                Socuoi: editedData.Socuoi
            };

            const res = await updateDichvuAPI(record._id, updateData);

            if (res?.data && !res?.data?.error) {
                notification.success({
                    message: "Cập nhật thành công",
                    description: `Đã cập nhật chỉ số điện cho phòng ${record.Phong}`,
                    duration: 2
                });

                const newEditingRows = { ...editingRows };
                delete newEditingRows[record._id];
                setEditingRows(newEditingRows);

                await fetchData();
            } else {
                throw new Error(res?.data?.message || "Có lỗi xảy ra khi cập nhật");
            }
        } catch (error) {
            notification.error({
                message: "Cập nhật thất bại",
                description: error?.response?.data?.message || error?.message || "Lỗi không xác định",
                duration: 3
            });
        }
    };

    // Cấu hình cột bảng
    const columns = [
        {
            title: "STT",
            dataIndex: "STT",
            width: 80,
            align: 'center',
            render: (text) => <span className="chutro-table-cell">{text}</span>
        },
        {
            title: "Thời gian",
            dataIndex: "Thoigian",
            width: 120,
            align: 'center',
            render: (text) => <span className="chutro-table-cell">{text || ''}</span>
        },
        {
            title: "Phòng",
            dataIndex: "Phong",
            width: 100,
            align: 'center',
            render: (text) => <span className="chutro-table-cell">{text || ''}</span>
        },
        {
            title: "Chỉ số điện cũ",
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
                        className="chutro-input-number"
                    />
                );
            }
        },
        {
            title: "Chỉ số điện mới",
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
                        className="chutro-input-number"
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
                return <span className="chutro-table-cell" style={{ fontWeight: 'bold' }}>{value}</span>;
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
                    className="chutro-save-button"
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
                    CHỈ SỐ ĐIỆN
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
                marginBottom: '20px',
                padding: '20px',
                border: '1px solid #e8e8e8',
                borderRadius: '6px'
            }}>
                <Row gutter={16}>
                    <Col xs={24} sm={12} md={6}>
                        <div className="chutro-filter-item">
                            <label className="chutro-label">Mã trọ:</label>
                            <Input
                                placeholder="Nhập mã trọ"
                                value={maTro}
                                onChange={(e) => setMaTro(e.target.value)}
                                className="chutro-input"
                            />
                        </div>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <div className="chutro-filter-item">
                            <label className="chutro-label">Tháng/Năm:</label>
                            <Input
                                placeholder="MM/YYYY"
                                value={thangNam}
                                onChange={(e) => setThangNam(e.target.value)}
                                className="chutro-input"
                            />
                        </div>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <div className="chutro-filter-item">
                            <label className="chutro-label">Số kí:</label>
                            <Input
                                placeholder="Nhập số kí"
                                value={soKi}
                                onChange={(e) => setSoKi(e.target.value)}
                                className="chutro-input"
                            />
                        </div>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <div className="chutro-filter-item">
                            <label className="chutro-label">Trạng thái:</label>
                            <Input
                                placeholder="Nhập trạng thái"
                                value={trangThai}
                                onChange={(e) => setTrangThai(e.target.value)}
                                className="chutro-input"
                            />
                        </div>
                    </Col>
                </Row>
                <Row gutter={16} className="chutro-search-button-row">
                    <Col xs={24} sm={24} md={24}>
                        <Button
                            type="primary"
                            onClick={handleSearch}
                            className="chutro-search-button"
                        >
                            Tìm kiếm
                        </Button>
                        <Button
                            onClick={handleRefresh}
                            className="chutro-search-button"
                        >
                            Làm mới
                        </Button>
                    </Col>
                </Row>
            </div>

            <div className="chutro-table-section">
                <Table
                    bordered
                    dataSource={dataSource}
                    columns={columns}
                    rowKey={(record) => record.key || record._id || record.id || `row-${record.Phong || ''}`}
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} chỉ số điện`,
                        pageSizeOptions: ['5', '10', '20', '50'],
                    }}
                />
            </div>
        </div>
    );
};

export default ChiSoDienPage;

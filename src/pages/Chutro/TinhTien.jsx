import React, { useMemo, useState, useEffect, useContext } from 'react';
import {
    Typography,
    Card,
    Row,
    Col,
    Input,
    Button,
    Table,
    Tag,
    Modal,
    Divider,
    message,
    notification,
} from 'antd';
import { getNguoithueAPI } from '../../../util/api';
import { AuthContext } from '../../context/authcontext';
import '../../styles/ChutroPages.css';

const { Title, Text } = Typography;

const STATUS_COLORS = {
    'Đã phê duyệt': '#00B7FF',
    'Chưa phê duyệt': '#FF0000',
};

const TinhTienPage = () => {
    const { user } = useContext(AuthContext);
    const [filters, setFilters] = useState({
        month: '',
        room: '',
        tenant: '',
    });
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedRowKey, setSelectedRowKey] = useState(null);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch tenant data from DB
    useEffect(() => {
        const fetchTenants = async () => {
            setLoading(true);
            try {
                const currentUser = user || JSON.parse(localStorage.getItem('user_info') || '{}');
                const tenDN = currentUser?.TenDN || currentUser?.tenDN || '';
                const cleanTenDN = tenDN ? String(tenDN).trim().replace(/[:]/g, '') : null;
                
                const res = await getNguoithueAPI(cleanTenDN || null);
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

                // Convert tenant data to invoice format
                const formattedInvoices = list.map((tenant, index) => {
                    const today = new Date();
                    const dateStr = today.toLocaleDateString('vi-VN');
                    const status = (tenant.Trangthai || tenant.trangThai || '').toLowerCase();
                    const normalizedStatus = (status === 'đã phê duyệt' || status === 'da phe duyet' || 
                                             status === 'đã thanh toán' || status === 'da thanh toan') 
                                             ? 'Đã phê duyệt' : 'Chưa phê duyệt';
                    
                    // Mock invoice details (can be replaced with actual invoice data from DB)
                    const baseAmount = 2000000 + (index * 100000);
                    return {
                        id: tenant._id || tenant.id || `INV-${index}`,
                        date: dateStr,
                        roomCode: tenant.MaTro || tenant.Phong || tenant.MaNT || `NT${String(index + 1).padStart(3, '0')}`,
                        tenant: tenant.Hoten || tenant.HoTen || tenant.hoten || 'Chưa có tên',
                        amount: baseAmount,
                        paid: normalizedStatus === 'Đã phê duyệt' ? baseAmount : 0,
                        status: normalizedStatus,
                        details: {
                            month: `${today.getMonth() + 1}/${today.getFullYear()}`,
                            period: `01/${today.getMonth() + 1}/${today.getFullYear()} - 28/${today.getMonth() + 1}/${today.getFullYear()}`,
                            room: tenant.MaTro || tenant.Phong || tenant.MaNT || '',
                            tenant: tenant.Hoten || tenant.HoTen || tenant.hoten || '',
                            items: [
                                { label: 'Tiền nhà', value: Math.floor(baseAmount * 0.6) },
                                { label: 'Tiền vệ sinh', value: 70000 },
                                { label: 'Tiền wifi', value: 100000 },
                                { label: 'Tiền điện', value: Math.floor(baseAmount * 0.15) },
                                { label: 'Tiền nước', value: 80000 },
                            ],
                        },
                    };
                });

                setInvoices(formattedInvoices);
                if (formattedInvoices.length === 0) {
                    notification.warning({
                        message: 'Không có dữ liệu',
                        description: 'Không tìm thấy khách thuê nào trong database',
                    });
                }
            } catch (error) {
                notification.error({
                    message: 'Lỗi tải dữ liệu',
                    description: error?.response?.data?.message || error?.message || 'Lỗi không xác định',
                });
                setInvoices([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTenants();
    }, [user]);

    const columns = useMemo(
        () => [
            {
                title: 'Thời gian',
                dataIndex: 'date',
                width: 120,
            },
            {
                title: 'Mã trọ',
                dataIndex: 'roomCode',
                width: 100,
            },
            {
                title: 'Tên người thuê',
                dataIndex: 'tenant',
                width: 150,
            },
            {
                title: 'Số tiền',
                dataIndex: 'amount',
                width: 140,
                render: (value) => `${value.toLocaleString('vi-VN')} đ`,
            },
            {
                title: 'Đã trả',
                dataIndex: 'paid',
                width: 140,
                render: (value) => `${value.toLocaleString('vi-VN')} đ`,
            },
            {
                title: 'Trạng thái',
                dataIndex: 'status',
                width: 160,
                render: (value) => (
                    <Tag color={STATUS_COLORS[value] || '#0045A8'} className="invoice-status-tag">
                        {value}
                    </Tag>
                ),
            },
        ],
        []
    );

    const requireSelection = (callback) => {
        if (!selectedInvoice) {
            message.warning('Vui lòng chọn hóa đơn.');
            return;
        }
        callback(selectedInvoice);
    };

    const handlePay = () =>
        requireSelection(() => {
            Modal.success({
                title: 'Xác nhận thanh toán',
                content: `Đã đánh dấu hóa đơn của ${selectedInvoice.tenant} là đã thanh toán.`,
            });
        });

    const handleEdit = () =>
        requireSelection(() => {
            Modal.info({
                title: 'Sửa hóa đơn',
                content: `Chuẩn bị chỉnh sửa hóa đơn của ${selectedInvoice.tenant}.`,
            });
        });

    const handleDetail = () =>
        requireSelection(() => {
            setModalVisible(true);
        });

    const handleDelete = () =>
        requireSelection(() => {
            Modal.confirm({
                title: 'Xóa hóa đơn',
                content: `Bạn có chắc chắn muốn xóa hóa đơn của ${selectedInvoice.tenant}?`,
                okText: 'Xóa',
                okButtonProps: { danger: true },
            });
        });

    return (
        <>
            <Card className="tinh-tien-card">
                <Title level={3} className="chutro-page-title">
                    Thanh toán tiền trọ
                </Title>

                <Row gutter={16} className="tinh-tien-filters">
                    <Col xs={24} md={12}>
                        <label>Tháng/năm</label>
                        <Input
                            placeholder="Nhập mã khách thuê"
                            value={filters.month}
                            onChange={(e) => setFilters({ ...filters, month: e.target.value })}
                        />
                    </Col>
                    <Col xs={24} md={12}>
                        <label>Mã trọ</label>
                        <Input
                            placeholder="Nhập mã trọ"
                            value={filters.room}
                            onChange={(e) => setFilters({ ...filters, room: e.target.value })}
                        />
                    </Col>
                </Row>

                <Row gutter={16} className="tinh-tien-buttons">
                    <Col>
                        <Button className="chutro-action-button pay" onClick={handlePay}>
                            Thanh toán
                        </Button>
                    </Col>
                    <Col>
                        <Button className="chutro-action-button secondary" onClick={handleEdit}>
                            Sửa hóa đơn
                        </Button>
                    </Col>
                    <Col>
                        <Button className="chutro-action-button info" onClick={handleDetail}>
                            Chi tiết hóa đơn
                        </Button>
                    </Col>
                    <Col>
                        <Button className="chutro-action-button danger" onClick={handleDelete}>
                            Xóa hóa đơn
                        </Button>
                    </Col>
                </Row>

                <Table
                    columns={columns}
                    dataSource={invoices}
                    rowKey="id"
                    pagination={false}
                    loading={loading}
                    className="tinh-tien-table"
                    rowClassName={(record) =>
                        record.id === selectedRowKey ? 'invoice-row selected' : 'invoice-row'
                    }
                    onRow={(record) => ({
                        onClick: () => {
                            setSelectedInvoice(record);
                            setSelectedRowKey(record.id);
                        },
                    })}
                />
            </Card>

            <Modal
                open={modalVisible}
                title={null}
                footer={null}
                width={520}
                onCancel={() => setModalVisible(false)}
                className="invoice-detail-modal"
            >
                {selectedInvoice && (
                    <div className="invoice-detail-content">
                        <Title level={4} className="invoice-detail-title">
                            CHI TIẾT HÓA ĐƠN
                        </Title>
                        <Text className="invoice-detail-period">
                            Tháng {selectedInvoice.details.month} (từ ngày {selectedInvoice.details.period})
                        </Text>
                        <Divider />
                        <div className="invoice-detail-info">
                            <p>
                                <strong>Mã phòng trọ:</strong> {selectedInvoice.details.room}
                            </p>
                            <p>
                                <strong>Tên người thuê:</strong> {selectedInvoice.details.tenant}
                            </p>
                            <p>
                                <strong>Thời gian:</strong> {selectedInvoice.date}
                            </p>
                        </div>
                        <Divider />
                        <div className="invoice-detail-items">
                            {selectedInvoice.details.items.map((item, index) => (
                                <div className="invoice-detail-row" key={index}>
                                    <span>
                                        {index + 1}. {item.label}
                                    </span>
                                    <span>{item.value.toLocaleString('vi-VN')} VNĐ</span>
                                </div>
                            ))}
                        </div>
                        <Divider />
                        <div className="invoice-detail-total">
                            <span>TỔNG CỘNG:</span>
                            <strong>
                                {selectedInvoice.details.items
                                    .reduce((sum, item) => sum + item.value, 0)
                                    .toLocaleString('vi-VN')} VNĐ
                            </strong>
                        </div>
                        <Text type="secondary" className="invoice-note">
                            (Đang chờ chủ trọ xác nhận)
                        </Text>
                        <div className="invoice-modal-actions">
                            <Button type="primary" onClick={() => setModalVisible(false)}>
                                Đóng
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
};

export default TinhTienPage;


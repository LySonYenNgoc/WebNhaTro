import React, { useEffect, useState, useRef } from "react";
import { Table, notification, Typography, Select, Button, Space } from "antd";
// Chỉ dùng text thuần
import { getUserAPI } from "../../../util/api";
import '../../styles/ChutroPages.css';

const { Title } = Typography;
const { Option } = Select;

const Nguoidungpage = () => {
    const [dataSource, setDataSource] = useState([]);
    const [filteredDataSource, setFilteredDataSource] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState('all'); // Mặc định hiển thị tất cả
    const isFetchingRef = useRef(false);
    const hasFetchedRef = useRef(false);

    // Lấy danh sách người dùng
    const fetchData = async () => {
        // Tránh gọi API song song
        if (isFetchingRef.current) {
            return;
        }
        
        setLoading(true);
        isFetchingRef.current = true;
        try {
            const res = await getUserAPI();

            // Chuẩn hóa dữ liệu trả về
            const rawList = Array.isArray(res?.data?.data)
                ? res.data.data
                : Array.isArray(res?.data)
                    ? res.data
                    : [];

            const list = rawList.map((item, index) => ({
                key: item?._id || item?.id || `user-${index}`,
                STT: index + 1,
                _id: item?._id || item?.id || '',
                TenDN: item?.TenDN || item?.tenDN || '',
                Email: item?.Email || item?.email || '',
                SDT: item?.SDT || item?.sdt || item?.SoDienThoai || '',
                HoTen: item?.HoTen || item?.hoten || item?.Ho_ten || '',
                Diachi: item?.Diachi || item?.DiaChi || item?.Dia_chi || '',
                Role: (item?.Role || item?.role || '').trim(),
                Trangthai: item?.Trangthai || item?.trangthai || item?.status || '',
            }));

            setDataSource(list);

            // Lọc theo role đang chọn
            filterByRole(list, selectedRole);
        } catch (e) {
            notification.error({
                message: 'Load users failed',
                description: e?.response?.data?.message || e?.message || 'Unknown error'
            });
            setDataSource([]);
            setFilteredDataSource([]);
        } finally {
            setLoading(false);
            isFetchingRef.current = false;
        }
    };

    // Lọc người dùng theo role
    const filterByRole = (data, role) => {
        if (role === 'all') {
            setFilteredDataSource(data);
        } else {
            const filtered = data.filter(item => {
                const itemRole = item?.Role || '';
                return itemRole.toLowerCase() === role.toLowerCase();
            });
            setFilteredDataSource(filtered);
        }
    };

    // Thay đổi role filter
    const handleRoleChange = (value) => {
        setSelectedRole(value);
        filterByRole(dataSource, value);
    };

    // Tải dữ liệu lần đầu
    useEffect(() => {
        // Bỏ qua nếu đã fetch
        if (!hasFetchedRef.current) {
            hasFetchedRef.current = true;
            fetchData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Chạy một lần khi mount

    // Lọc lại khi role thay đổi
    useEffect(() => {
        if (dataSource.length > 0) {
            filterByRole(dataSource, selectedRole);
        }
    }, [selectedRole]);

    const columns = [
        {
            title: 'STT',
            dataIndex: 'STT',
            width: 70,
            align: 'center',
        },
        {
            title: 'ID (Mongo)',
            dataIndex: '_id',
            width: 200,
            render: (text) => (text ? String(text).substring(0, 20) + '...' : ''),
        },
        {
            title: 'Họ tên',
            dataIndex: 'HoTen',
            width: 200,
            render: (text, record) => text || record?.TenDN || 'Chưa cập nhật',
        },
        {
            title: 'Tên đăng nhập',
            dataIndex: 'TenDN',
            width: 150,
        },
        {
            title: 'Email',
            dataIndex: 'Email',
            width: 200,
        },
        {
            title: 'SĐT',
            dataIndex: 'SDT',
            width: 120,
        },
        {
            title: 'Role',
            dataIndex: 'Role',
            width: 100,
            align: 'center',
            render: (role) => {
                const roleMap = {
                    'admin': { text: 'Admin', color: 'red' },
                    'host': { text: 'Chủ trọ', color: 'blue' },
                    'user': { text: 'User', color: 'green' }
                };
                const roleInfo = roleMap[role?.toLowerCase()] || { text: role || 'N/A', color: 'default' };
                return (
                    <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: roleInfo.color === 'red' ? '#ffebee' :
                            roleInfo.color === 'blue' ? '#e3f2fd' : '#e8f5e9',
                        color: roleInfo.color === 'red' ? '#c62828' :
                            roleInfo.color === 'blue' ? '#1565c0' : '#2e7d32',
                        fontWeight: 'bold'
                    }}>
                        {roleInfo.text}
                    </span>
                );
            },
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'Diachi',
            ellipsis: true,
            render: (text) => text || 'Chưa cập nhật',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'Trangthai',
            width: 120,
            align: 'center',
            render: (status) => status || 'N/A',
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
                    DANH SÁCH TÀI KHOẢN
                </Title>
                <Space>
                    <Select
                        value={selectedRole}
                        onChange={handleRoleChange}
                        style={{ width: 150 }}
                        placeholder="Chọn role"
                    >
                        <Option value="host">Chủ trọ</Option>
                        <Option value="admin">Admin</Option>
                        <Option value="user">User</Option>
                        <Option value="all">Tất cả</Option>
                    </Select>
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
                </Space>
            </div>

            {/* Table */}
            <div style={{
                padding: '20px',
                border: '1px solid #e8e8e8',
                borderRadius: '6px'
            }}>
                <Table
                    bordered
                    dataSource={filteredDataSource}
                    columns={columns}
                    rowKey={(record) => record._id || record.id || record.Email}
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} tài khoản`,
                        pageSizeOptions: ['5', '10', '20', '50'],
                    }}
                    style={{
                        fontFamily: 'Arial, sans-serif'
                    }}
                    locale={{
                        emptyText: 'Không có dữ liệu'
                    }}
                    rowClassName={(record, index) => {
                        return index % 2 === 0 ? 'table-row-even' : 'table-row-odd';
                    }}
                />
            </div>
        </div>
    );
};

export default Nguoidungpage;
import React, { useEffect, useState, useRef } from "react";
import { Table, notification, Tag, Typography, Button } from "antd";
// Chỉ dùng text thuần
import { getBaidangAPI } from "../../../util/api";
import '../../styles/ChutroPages.css';

const { Title } = Typography;

// Trang hiển thị tất cả bài đăng
const BaidangPage = () => {
    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(false);
    const isFetchingRef = useRef(false);
    const hasFetchedRef = useRef(false);

    // Định dạng HH:MM:SS DD/MM/YYYY
    const formatDateTime = (date) => {
        if (!date || isNaN(new Date(date).getTime())) return '';
        const d = new Date(date);
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
    };

    // Lấy danh sách bài đăng
    const fetchData = async () => {
        // Tránh fetch trùng lặp
        if (isFetchingRef.current) {
            return;
        }
        
        setLoading(true);
        isFetchingRef.current = true;
        try {
            const res = await getBaidangAPI();
            
            // Chuẩn hóa dữ liệu trả về
            const list = Array.isArray(res?.data?.data) 
                ? res.data.data 
                : Array.isArray(res?.data) 
                    ? res.data 
                    : [];

            // Chuẩn hóa dữ liệu hiển thị
            const formatted = list.map((item, index) => {
                const formattedItem = {
                    key: item._id || item.id || `item-${index}`,
                    STT: index + 1,
                    _id: item._id || item.id || '',
                    MaBD: item?.MaBD || item?.maBD || '',
                    Tieude: item?.Tieude || item?.tieude || item?.TieuDe || item?.title || '',
                    Mota: item?.Mota || item?.mota || item?.Noidung || item?.noidung || '',
                    TenDN: item?.TenDN || 
                           item?.tenDN ||
                           item?.Nguoidung?.TenDN || 
                           item?.Nguoidung?.tenDN ||
                           item?.Nguoidung?.HoTen || 
                           item?.NguoiDang || 
                           '',
                    MaTro: item?.MaTro || item?.maTro || '',
                    Thoigian: item?.Ngaydang
                        ? formatDateTime(new Date(item.Ngaydang))
                        : item?.ngaydang
                            ? formatDateTime(new Date(item.ngaydang))
                            : item?.createdAt
                                ? formatDateTime(new Date(item.createdAt))
                                : '',
                    Trangthai: item?.Trangthai || 
                              item?.trangthai || 
                              item?.TrangThai || 
                              item?.status || 
                              'Chua phe duyet',
                };
                return formattedItem;
            });

            setDataSource(formatted);
        } catch (error) {
            const errorMsg = error?.response?.data?.message || error?.message || "Lỗi không xác định";
            notification.error({
                message: "Load Bài đăng thất bại",
                description: errorMsg,
            });
            setDataSource([]);
        } finally {
            setLoading(false);
            isFetchingRef.current = false;
        }
    };

    // Fetch dữ liệu lần đầu
    useEffect(() => {
        // Bỏ qua nếu đã fetch
        if (!hasFetchedRef.current) {
            hasFetchedRef.current = true;
            fetchData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Chạy một lần khi mount
    // Cấu hình cột bảng
    const columns = [
        {
            title: "STT",
            dataIndex: "STT",
            width: 80,
            align: 'center',
        },
        {
            title: "Mã bài đăng",
            dataIndex: "MaBD",
            width: 120,
            align: 'center',
        },
        {
            title: "Tiêu đề",
            dataIndex: "Tieude",
            ellipsis: true,
        },
        {
            title: "Mô tả",
            dataIndex: "Mota",
            ellipsis: true,
            width: 200,
        },
        {
            title: "Mã trọ",
            dataIndex: "MaTro",
            width: 120,
            align: 'center',
        },
        {
            title: "Người đăng",
            dataIndex: "TenDN",
        },
        {
            title: "Thời gian đăng",
            dataIndex: "Thoigian",
            width: 180,
        },
        {
            title: "Trạng thái",
            dataIndex: "Trangthai",
            width: 150,
            align: 'center',
            render: (status) => {
                const normalizedStatus = status?.toLowerCase() || '';
                const isApproved = normalizedStatus === 'đã phê duyệt' || 
                                  normalizedStatus === 'da phe duyet' ||
                                  normalizedStatus === 'đã duyệt';
                const color = isApproved ? 'green' : 'red';
                const displayText = isApproved ? 'Đã phê duyệt' : 'Chưa phê duyệt';
                return (
                    <Tag color={color} style={{ fontWeight: 'bold' }}>
                        {displayText}
                    </Tag>
                );
            },
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
                    TẤT CẢ BÀI ĐĂNG
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
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} bài đăng`,
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

export default BaidangPage;

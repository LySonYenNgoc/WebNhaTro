import React, { useEffect, useState, useRef } from "react";
import { Table, notification, Typography, Button } from "antd";
import { getBaidangAPI } from "../../../util/api";
import "../../styles/ChutroPages.css";

const { Title } = Typography;

// Trang hiển thị tất cả bài đăng
const TatCaBaiVietPage = () => {
    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(false);
    const isFetchingRef = useRef(false);
    const hasFetchedRef = useRef(false);

    // Lấy dữ liệu từ API
    const fetchData = async () => {
        if (isFetchingRef.current) return;
        
        setLoading(true);
        isFetchingRef.current = true;
        
        try {
            const res = await getBaidangAPI();
            
            // Xử lý response
            let list = [];
            if (res?.data) {
                if (Array.isArray(res.data.data)) {
                    list = res.data.data;
                } else if (Array.isArray(res.data)) {
                    list = res.data;
                }
            }

            // Format dữ liệu
            const formatted = list.map((item, index) => {
                // Format ngày tháng
                let ngayDang = '';
                if (item.Ngaydang) {
                    try {
                        const date = new Date(item.Ngaydang);
                        if (!isNaN(date.getTime())) {
                            const day = String(date.getDate()).padStart(2, '0');
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            const year = date.getFullYear();
                            ngayDang = `${day}/${month}/${year}`;
                        }
                    } catch (e) {
                        ngayDang = '';
                    }
                }
                
                // Chuẩn hóa trạng thái
                let trangThai = item.Trangthai || item.trangThai || 'Chua phe duyet';
                const trangThaiLower = trangThai.toLowerCase();
                if (trangThaiLower === 'da phe duyet' || trangThaiLower === 'đã phê duyệt') {
                    trangThai = 'Đã phê duyệt';
                } else {
                    trangThai = 'Chưa phê duyệt';
                }
                
                return {
                    key: item._id || item.id || `item-${index}`,
                    _id: item._id || item.id || '',
                    STT: index + 1,
                    MaBD: item.MaBD || item.maBD || '',
                    Tieude: item.Tieude || item.tieude || '',
                    Ngaydang: ngayDang,
                    Trangthai: trangThai,
                };
            });
            
            setDataSource(formatted);
            
            if (formatted.length > 0) {
                notification.success({
                    message: "Tải dữ liệu thành công",
                    description: `Đã tải ${formatted.length} bài đăng`,
                    duration: 2
                });
            } else {
                notification.warning({
                    message: "Không có dữ liệu",
                    description: "Không tìm thấy bài đăng nào",
                    duration: 3
                });
            }
        } catch (error) {
            setDataSource([]);
            notification.error({
                message: "Lỗi",
                description: error?.response?.data?.message || error?.message || "Lỗi không xác định",
            });
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

    // Render trạng thái
    const renderTrangThai = (status) => {
        const isApproved = status === 'Đã phê duyệt' || status === 'Da phe duyet';
        const color = isApproved ? 'green' : 'orange';
        return <span style={{ color }}>{status || 'Chưa phê duyệt'}</span>;
    };

    // Cấu hình cột bảng
    const columns = [
        {
            title: "STT",
            dataIndex: "STT",
            width: 60,
            align: 'center',
            render: (text) => <span className="chutro-table-cell">{text}</span>
        },
        {
            title: "Thời gian",
            dataIndex: "Ngaydang",
            width: 150,
            align: 'center',
            render: (text) => <span className="chutro-table-cell">{text || 'Chưa có'}</span>
        },
        {
            title: "Tiêu đề",
            dataIndex: "Tieude",
            width: 300,
            render: (text) => <span className="chutro-table-cell">{text || 'Chưa có tiêu đề'}</span>
        },
        {
            title: "Trạng thái",
            dataIndex: "Trangthai",
            width: 150,
            align: 'center',
            render: renderTrangThai,
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
                    rowKey={(record) => record._id || record.key || `row-${Math.random()}`}
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

export default TatCaBaiVietPage;

import React from 'react';
import { Typography, Card } from 'antd';
import '../../styles/ChutroPages.css';

const { Title } = Typography;

const DoanhThuPage = () => {
    return (
        <Card>
            <Title level={2} className="chutro-page-title">DOANH THU THEO THÁNG</Title>
            <p>Trang thống kê doanh thu theo tháng. (Đang phát triển...)</p>
        </Card>
    );
};

export default DoanhThuPage;


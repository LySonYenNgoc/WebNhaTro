import React from 'react';
import { Typography, Divider } from 'antd';
import HomeHeader from '../components/layout/HomeHeader';
import HomeFooter from '../components/layout/HomeFooter';
import ProvincesSection from '../components/layout/ProvincesSection';
import '../styles/info-pages.css';

const { Title, Paragraph } = Typography;

const DieuKhoanSuDungPage = () => {
    return (
        <div className="info-page-container">
            <HomeHeader />
            <div className="info-page-content">
                <Title level={1} className="info-page-title">
                    ĐIỀU KHOẢN SỬ DỤNG
                </Title>
                
                <div className="info-sections">
                    <div className="info-section">
                        <Title level={2}>I. QUY ĐỊNH CHUNG</Title>
                        <Paragraph>
                            <strong>Điều 1.</strong> Phạm vi áp dụng<br/>
                            Các quy định này áp dụng cho tất cả người dùng khi truy cập và sử dụng dịch vụ của website Triet.com.
                        </Paragraph>
                        <Paragraph>
                            <strong>Điều 2.</strong> Đối tượng sử dụng<br/>
                            Website dành cho mọi đối tượng có nhu cầu tìm kiếm phòng trọ, cho thuê phòng trọ hoặc các dịch vụ liên quan.
                        </Paragraph>
                        <Paragraph>
                            <strong>Điều 3.</strong> Thuật ngữ<br/>
                            - "Người dùng": Là cá nhân, tổ chức truy cập và sử dụng website<br/>
                            - "Chủ trọ": Là người đăng tin cho thuê phòng trọ<br/>
                            - "Người thuê": Là người có nhu cầu tìm phòng trọ
                        </Paragraph>
                    </div>

                    <div className="info-section">
                        <Title level={2}>II. NGUYÊN TẮC SỬ DỤNG</Title>
                        <Paragraph>
                            <strong>Điều 4.</strong> Quyền và nghĩa vụ của người dùng<br/>
                            - Người dùng có quyền truy cập và sử dụng các tính năng công khai của website<br/>
                            - Người dùng có nghĩa vụ cung cấp thông tin chính xác, trung thực<br/>
                            - Người dùng không được sử dụng website cho mục đích bất hợp pháp
                        </Paragraph>
                        <Paragraph>
                            <strong>Điều 5.</strong> Nội dung cấm<br/>
                            - Đăng tải thông tin sai sự thật, lừa đảo<br/>
                            - Đăng tải nội dung vi phạm pháp luật, đạo đức<br/>
                            - Sử dụng website để spam, quảng cáo trái phép<br/>
                            - Xâm phạm quyền riêng tư của người khác
                        </Paragraph>
                    </div>

                    <div className="info-section">
                        <Title level={2}>III. QUYỀN, TRÁCH NHIỆM VÀ GIỚI HẠN</Title>
                        <Paragraph>
                            <strong>Điều 6.</strong> Quyền của website<br/>
                            - Website có quyền kiểm duyệt, xóa bỏ nội dung vi phạm<br/>
                            - Website có quyền từ chối cung cấp dịch vụ cho người dùng vi phạm<br/>
                            - Website có quyền thay đổi, cập nhật các điều khoản
                        </Paragraph>
                        <Paragraph>
                            <strong>Điều 7.</strong> Trách nhiệm của website<br/>
                            - Cung cấp dịch vụ ổn định, an toàn<br/>
                            - Bảo mật thông tin người dùng<br/>
                            - Hỗ trợ giải quyết tranh chấp khi có yêu cầu
                        </Paragraph>
                        <Paragraph>
                            <strong>Điều 8.</strong> Giới hạn trách nhiệm<br/>
                            - Website không chịu trách nhiệm về giao dịch giữa người dùng<br/>
                            - Website không đảm bảo tính chính xác tuyệt đối của thông tin đăng tải<br/>
                            - Website không chịu trách nhiệm về thiệt hại phát sinh từ việc sử dụng dịch vụ
                        </Paragraph>
                    </div>

                    <div className="info-section">
                        <Title level={2}>IV. CAM KẾT KHÁCH HÀNG</Title>
                        <Paragraph>
                            <strong>Điều 9.</strong> Cam kết của người dùng<br/>
                            - Cung cấp thông tin chính xác, đầy đủ<br/>
                            - Tuân thủ các quy định của website và pháp luật<br/>
                            - Không sử dụng website cho mục đích bất hợp pháp<br/>
                            - Bảo mật thông tin tài khoản của mình
                        </Paragraph>
                        <Paragraph>
                            <strong>Điều 10.</strong> Xử lý vi phạm<br/>
                            - Tài khoản vi phạm có thể bị khóa tạm thời hoặc vĩnh viễn<br/>
                            - Thông tin vi phạm sẽ bị xóa bỏ ngay lập tức<br/>
                            - Website có quyền yêu cầu bồi thường thiệt hại nếu có
                        </Paragraph>
                    </div>

                    <div className="info-section">
                        <Title level={2}>V. THÔNG TIN LIÊN HỆ</Title>
                        <Paragraph>
                            <strong>Công ty:</strong> CÔNG TY TNHH SX TM DV SUZUKI OH<br/>
                            <strong>VP HCM:</strong> 10 Đường số 2A, Phường 10, Quận 6, TP. HCM<br/>
                            <strong>Điện thoại:</strong> 0911 067 171<br/>
                            <strong>Email:</strong> info@tromoi.com
                        </Paragraph>
                    </div>
                </div>

                <ProvincesSection />
            </div>
            <HomeFooter />
        </div>
    );
};

export default DieuKhoanSuDungPage;


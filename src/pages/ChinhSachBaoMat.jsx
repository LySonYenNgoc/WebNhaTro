import React from 'react';
import { Typography } from 'antd';
import HomeHeader from '../components/layout/HomeHeader';
import HomeFooter from '../components/layout/HomeFooter';
import ProvincesSection from '../components/layout/ProvincesSection';
import '../styles/info-pages.css';

const { Title, Paragraph } = Typography;

const ChinhSachBaoMatPage = () => {
    return (
        <div className="info-page-container">
            <HomeHeader />
            <div className="info-page-content">
                <Title level={1} className="info-page-title">
                    CHÍNH SÁCH BẢO MẬT
                </Title>
                
                <div className="info-sections">
                    <div className="info-section">
                        <Title level={2}>I. THU THẬP THÔNG TIN</Title>
                        <Paragraph>
                            <strong>1.1.</strong> Thông tin cá nhân<br/>
                            Chúng tôi thu thập thông tin cá nhân khi bạn đăng ký tài khoản, bao gồm: họ tên, email, số điện thoại, địa chỉ.
                        </Paragraph>
                        <Paragraph>
                            <strong>1.2.</strong> Thông tin tự động<br/>
                            Website tự động thu thập một số thông tin như địa chỉ IP, trình duyệt, thiết bị truy cập để cải thiện dịch vụ.
                        </Paragraph>
                    </div>

                    <div className="info-section">
                        <Title level={2}>II. SỬ DỤNG THÔNG TIN</Title>
                        <Paragraph>
                            <strong>2.1.</strong> Mục đích sử dụng<br/>
                            - Cung cấp và cải thiện dịch vụ<br/>
                            - Xử lý giao dịch và yêu cầu của người dùng<br/>
                            - Gửi thông báo, cập nhật về dịch vụ<br/>
                            - Ngăn chặn gian lận và đảm bảo an ninh
                        </Paragraph>
                        <Paragraph>
                            <strong>2.2.</strong> Chia sẻ thông tin<br/>
                            Chúng tôi không bán, cho thuê hoặc chia sẻ thông tin cá nhân của bạn cho bên thứ ba, trừ khi có yêu cầu của cơ quan pháp luật.
                        </Paragraph>
                    </div>

                    <div className="info-section">
                        <Title level={2}>III. BẢO MẬT THÔNG TIN</Title>
                        <Paragraph>
                            <strong>3.1.</strong> Biện pháp bảo mật<br/>
                            - Mã hóa dữ liệu khi truyền tải<br/>
                            - Sử dụng công nghệ bảo mật tiên tiến<br/>
                            - Giới hạn quyền truy cập thông tin<br/>
                            - Kiểm tra và cập nhật hệ thống thường xuyên
                        </Paragraph>
                        <Paragraph>
                            <strong>3.2.</strong> Trách nhiệm của người dùng<br/>
                            - Bảo mật thông tin đăng nhập<br/>
                            - Không chia sẻ tài khoản với người khác<br/>
                            - Thông báo ngay khi phát hiện vi phạm bảo mật
                        </Paragraph>
                    </div>

                    <div className="info-section">
                        <Title level={2}>IV. QUYỀN CỦA NGƯỜI DÙNG</Title>
                        <Paragraph>
                            <strong>4.1.</strong> Quyền truy cập<br/>
                            Bạn có quyền xem, chỉnh sửa thông tin cá nhân của mình bất cứ lúc nào.
                        </Paragraph>
                        <Paragraph>
                            <strong>4.2.</strong> Quyền xóa dữ liệu<br/>
                            Bạn có quyền yêu cầu xóa thông tin cá nhân khỏi hệ thống, trừ những thông tin chúng tôi có nghĩa vụ lưu trữ theo quy định pháp luật.
                        </Paragraph>
                        <Paragraph>
                            <strong>4.3.</strong> Quyền từ chối<br/>
                            Bạn có quyền từ chối nhận email quảng cáo, thông tin marketing từ website.
                        </Paragraph>
                    </div>

                    <div className="info-section">
                        <Title level={2}>V. COOKIES</Title>
                        <Paragraph>
                            Website sử dụng cookies để cải thiện trải nghiệm người dùng. Bạn có thể tắt cookies trong cài đặt trình duyệt, nhưng điều này có thể ảnh hưởng đến một số tính năng của website.
                        </Paragraph>
                    </div>

                    <div className="info-section">
                        <Title level={2}>VI. THAY ĐỔI CHÍNH SÁCH</Title>
                        <Paragraph>
                            Chúng tôi có quyền thay đổi chính sách bảo mật này. Mọi thay đổi sẽ được thông báo trên website. Việc bạn tiếp tục sử dụng website sau khi có thay đổi được coi là bạn đã chấp nhận chính sách mới.
                        </Paragraph>
                    </div>

                    <div className="info-section">
                        <Title level={2}>VII. LIÊN HỆ</Title>
                        <Paragraph>
                            Nếu bạn có câu hỏi về chính sách bảo mật, vui lòng liên hệ:<br/>
                            <strong>Email:</strong> support@triet.com<br/>
                            <strong>Điện thoại:</strong> 0901 887 19<br/>
                            <strong>Địa chỉ:</strong> HCM 19 Đường số 23, Phường 10, Quận 6, TP. HCM
                        </Paragraph>
                    </div>
                </div>

                <ProvincesSection />
            </div>
            <HomeFooter />
        </div>
    );
};

export default ChinhSachBaoMatPage;


import React from 'react';
import { Typography, Divider } from 'antd';
import HomeHeader from '../components/layout/HomeHeader';
import HomeFooter from '../components/layout/HomeFooter';
import ProvincesSection from '../components/layout/ProvincesSection';
import '../styles/info-pages.css';

const { Title, Paragraph } = Typography;

const GioiThieuPage = () => {
    return (
        <div className="info-page-container">
            <HomeHeader />
            <div className="info-page-content">
                <Title level={1} className="info-page-title">
                    GIỚI THIỆU WEB
                </Title>
                
                <Paragraph className="info-intro">
                    Triet.com là hệ thống website cung cấp thông tin phòng trọ, nhà cho thuê, tìm trọ và ở ghép trên toàn quốc, website thuê trọ tốt có hiệu quả và uy tín nhất!
                </Paragraph>

                <div className="info-sections">
                    <div className="info-section">
                        <Title level={3}>1. Mục tiêu hoạt động</Title>
                        <Paragraph>
                            - Cung cấp nền tảng kết nối hiệu quả giữa chủ trọ và người thuê<br/>
                            - Tạo môi trường minh bạch, an toàn cho giao dịch cho thuê phòng trọ<br/>
                            - Hỗ trợ người dùng tìm kiếm phòng trọ phù hợp với nhu cầu và ngân sách<br/>
                            - Xây dựng cộng đồng người thuê trọ và chủ trọ uy tín
                        </Paragraph>
                    </div>

                    <div className="info-section">
                        <Title level={3}>2. Nguyên tắc hoạt động</Title>
                        <Paragraph>
                            - Tuân thủ pháp luật Việt Nam về cho thuê nhà ở<br/>
                            - Đảm bảo tính minh bạch và trung thực trong thông tin<br/>
                            - Tôn trọng quyền riêng tư và bảo mật thông tin người dùng<br/>
                            - Cung cấp dịch vụ chất lượng, hỗ trợ người dùng tận tâm
                        </Paragraph>
                    </div>

                    <div className="info-section">
                        <Title level={3}>3. Đối tượng sử dụng</Title>
                        <Paragraph>
                            - Sinh viên, người đi làm cần tìm phòng trọ<br/>
                            - Chủ trọ, chủ nhà muốn đăng tin cho thuê<br/>
                            - Người tìm bạn ở ghép<br/>
                            - Các đối tác, nhà đầu tư trong lĩnh vực bất động sản
                        </Paragraph>
                    </div>

                    <div className="info-section">
                        <Title level={3}>4. Vai trò của Triet.com</Title>
                        <Paragraph>
                            - Cầu nối giữa người cho thuê và người thuê<br/>
                            - Cung cấp công cụ quản lý hiệu quả cho chủ trọ<br/>
                            - Hỗ trợ tìm kiếm và so sánh các lựa chọn phòng trọ<br/>
                            - Xây dựng cộng đồng và chia sẻ kinh nghiệm
                        </Paragraph>
                    </div>

                    <div className="info-section">
                        <Title level={3}>5. Cam kết của hệ thống</Title>
                        <Paragraph>
                            - Cam kết bảo mật thông tin cá nhân của người dùng<br/>
                            - Đảm bảo chất lượng thông tin đăng tải<br/>
                            - Hỗ trợ khách hàng 24/7<br/>
                            - Liên tục cải thiện và nâng cấp dịch vụ
                        </Paragraph>
                    </div>

                    <div className="info-section">
                        <Title level={3}>6. Thông tin liên hệ</Title>
                        <Paragraph>
                            <strong>Địa chỉ:</strong> HCM 19 Đường số 23, Phường 10, Quận 6, TP. HCM<br/>
                            <strong>Điện thoại:</strong> 0901 887 19<br/>
                            <strong>Email:</strong> info@triet.com
                        </Paragraph>
                    </div>
                </div>

                <ProvincesSection />
            </div>
            <HomeFooter />
        </div>
    );
};

export default GioiThieuPage;


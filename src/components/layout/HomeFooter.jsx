import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/authcontext';
import '../../styles/HomeFooter.css';
import iconTikTok from '../../images/icontt.png';
import iconFacebook from '../../images/iconfb.png';
import iconInstagram from '../../images/iconig.png';

const HomeFooter = () => {
    const { isAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleDangTin = (e) => {
        e.preventDefault();
        if (isAuthenticated) {
            navigate('/Thêm bài đăng');
        } else {
            navigate('/register');
        }
    };

    return (
        <footer className="homepage-footer">
            <div className="footer-content">
                {/* Cột 1: Trọ tốt */}
                <div className="footer-column">
                    <div className="footer-column-header">
                        <h4>Trọ tốt</h4>
                        <span className="footer-dots">•••</span>
                    </div>
                    <p className="footer-description">
                        Nền tảng tìm kiếm và cho thuê phòng trọ hàng đầu Việt Nam. Kết nối chủ trọ và người thuê một cách nhanh chóng, hiệu quả.
                    </p>
                </div>

                {/* Cột 2: Dịch vụ và Thông tin */}
                <div className="footer-column">
                    <div className="footer-section">
                        <h4>Dịch vụ</h4>
                        <Link to="/" className="footer-link">Tìm nhà trọ nhanh chóng</Link>
                        <a href="#" className="footer-link" onClick={handleDangTin}>Đăng tin cho thuê</a>
                        <Link to="/danh-sach/review" className="footer-link">Video review</Link>
                    </div>
                    <div className="footer-section" style={{ marginTop: '24px' }}>
                        <h4>Thông tin</h4>
                        <Link to="/gioi-thieu" className="footer-link">Giới thiệu web</Link>
                        <Link to="/dieu-khoan-su-dung" className="footer-link">Điều khoản sử dụng</Link>
                        <Link to="/chinh-sach-bao-mat" className="footer-link">Chính sách bảo mật</Link>
                    </div>
                </div>

                {/* Cột 3: Liên hệ */}
                <div className="footer-column">
                    <h4>Liên hệ</h4>
                    <div className="contact-item">
                        <svg className="contact-icon" viewBox="0 0 24 24" fill="none" stroke="#0045A8" strokeWidth="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                        </svg>
                        <span>09651423745</span>
                    </div>
                    <div className="contact-item">
                        <svg className="contact-icon" viewBox="0 0 24 24" fill="none" stroke="#0045A8" strokeWidth="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                            <polyline points="22,6 12,13 2,6"/>
                        </svg>
                        <span>Support@trotot.com</span>
                    </div>
                    <div className="contact-item">
                        <svg className="contact-icon" viewBox="0 0 24 24" fill="none" stroke="#0045A8" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                        </svg>
                        <span>Hocmon-TTP.Hồ chí Minh</span>
                    </div>
                    <div className="social-icons">
                        <a href="#" className="social-icon" title="TikTok">
                            <img src={iconTikTok} alt="TikTok" className="social-icon-image" />
                        </a>
                        <a href="#" className="social-icon" title="Facebook">
                            <img src={iconFacebook} alt="Facebook" className="social-icon-image" />
                        </a>
                        <a href="#" className="social-icon" title="Instagram">
                            <img src={iconInstagram} alt="Instagram" className="social-icon-image" />
                        </a>
                    </div>
                </div>
            </div>
            {}
            <div className="footer-bottom-bar"></div>
        </footer>
    );
};

export default HomeFooter;


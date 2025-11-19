import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../../styles/HomeHeader.css';

const NAV_ITEMS = [
    { id: 'phongtro', label: 'Phòng trọ' },
    { id: 'canho', label: 'Căn hộ' },
    { id: 'nguyencan', label: 'Nguyên căn' },
    { id: 'kyttucxa', label: 'Ký túc xá' },
    { id: 'review', label: 'Review' },
];

const HomeHeader = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const currentCategory = (() => {
        const match = location.pathname.match(/\/danh-sach\/([^/]+)/i);
        if (match && match[1]) return match[1];
        return null;
    })();

    const handleClick = (event, id) => {
        event.preventDefault();
        navigate(`/danh-sach/${id}`);
    };

    return (
        <header className="home-header">
            <div className="home-header-content">
                <Link to="/" className="home-logo" aria-label="Trở về trang chủ">
                    <img src="/src/images/Logo.png" alt="TRỌ TỐT Logo" className="home-logo-image" />
                </Link>

                <nav className="home-header-nav">
                    {NAV_ITEMS.map((item, index) => (
                        <React.Fragment key={item.id}>
                            <a
                                href={`#${item.id}`}
                                className={`home-nav-link ${currentCategory === item.id ? 'active' : ''}`}
                                onClick={(e) => handleClick(e, item.id)}
                                aria-current={currentCategory === item.id ? 'page' : undefined}
                            >
                                {item.label}
                            </a>
                            {index < NAV_ITEMS.length - 1 && <span className="nav-separator">|</span>}
                        </React.Fragment>
                    ))}
                </nav>

                <div className="home-header-actions">
                    <Link to="/Dangnhap" className="home-login-link">
                        <svg className="home-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                        <span>Đăng nhập</span>
                    </Link>
                    <Link to="/register" className="home-register-link">
                        <svg className="home-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
                        </svg>
                        <span>Đăng ký</span>
                    </Link>
                    <Link to="/dang-ky-chu-tro" className="home-post-button">
                        Đăng tin tìm phòng
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default HomeHeader;


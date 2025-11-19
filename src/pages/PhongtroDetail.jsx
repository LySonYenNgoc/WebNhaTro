import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Tag, Skeleton, Empty } from 'antd';
import {
    EnvironmentOutlined,
    ShareAltOutlined,
    ArrowLeftOutlined,
    CheckCircleFilled,
    PhoneOutlined,
    CalendarOutlined,
    TeamOutlined,
    SendOutlined,
} from '@ant-design/icons';

import HomeHeader from '../components/layout/HomeHeader';
import HomeFooter from '../components/layout/HomeFooter';
import { getBaidangAPI } from '../../util/api';
import '../styles/detail.css';

const placeholderImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='500'%3E%3Crect width='800' height='500' fill='%23f2f4f8'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='26' fill='%2399a5b1'%3EChưa có hình ảnh%3C/text%3E%3C/svg%3E";

const iconMap = {
    wifi: new URL('../images/iconwifi.png', import.meta.url).href,
    maylanh: new URL('../images/iconmaylanh.png', import.meta.url).href,
    maygiat: new URL('../images/iconmaygiat.png', import.meta.url).href,
    thangmay: new URL('../images/iconthangmay.png', import.meta.url).href,
    khoangrua: new URL('../images/iconkhonggian.png', import.meta.url).href,
    baove: new URL('../images/iconconnguoi.png', import.meta.url).href,
    xe: new URL('../images/iconxe.png', import.meta.url).href,
    gia: new URL('../images/icongia.png', import.meta.url).href,
};

const formatPrice = (gia) => {
    if (!gia) return 'Liên hệ';
    if (typeof gia === 'string') {
        if (gia.toLowerCase().includes('triệu') || gia.toLowerCase().includes('vnđ')) {
            return gia;
        }
        const num = parseFloat(gia);
        if (!isNaN(num)) {
            return `${num.toLocaleString('vi-VN')} triệu/tháng`;
        }
        return gia;
    }
    const num = Number(gia);
    if (Number.isFinite(num)) {
        if (num >= 1000000) {
            return `${(num / 1000000).toFixed(2)} triệu/tháng`;
        }
        return `${num.toLocaleString('vi-VN')} đ/tháng`;
    }
    return 'Liên hệ';
};

const normalizeImagePath = (rawPath) => {
    if (!rawPath || typeof rawPath !== 'string') return null;
    const trimmed = rawPath.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
        return trimmed;
    }
    const normalized = trimmed
        .replace(/^\.?\/?src\/images\/?/i, '')
        .replace(/^\.?\/?images\/?/i, '')
        .replace(/\\/g, '/');
    try {
        return new URL(`../images/${normalized}`, import.meta.url).href;
    } catch (err) {
        return `/src/images/${normalized}`;
    }
};

const extractImages = (baidang) => {
    const raw = baidang?.Hinhanh || baidang?.Anh || '';
    if (!raw) {
        return [placeholderImage];
    }

    if (Array.isArray(raw)) {
        const resolved = raw
            .map((item) => normalizeImagePath(item) || placeholderImage)
            .filter(Boolean);
        return resolved.length > 0 ? resolved : [placeholderImage];
    }

    if (typeof raw === 'string') {
        try {
            const maybeJson = JSON.parse(raw);
            if (Array.isArray(maybeJson)) {
                return maybeJson.map((item) => normalizeImagePath(item) || placeholderImage);
            }
        } catch (error) {
            // ignore json parse errors
        }
        const parts = raw
            .split(/[\n,;]+/)
            .map((item) => normalizeImagePath(item))
            .filter(Boolean);
        if (parts.length > 0) {
            return parts;
        }
        const resolved = normalizeImagePath(raw);
        return [resolved || placeholderImage];
    }

    return [placeholderImage];
};

const formatDateTime = (value) => {
    if (!value) return 'Đang cập nhật';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Đang cập nhật';
    return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

const PropertyDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                setLoading(true);
                setError('');
                const res = await getBaidangAPI();
                if (!res?.data || res.data.error) {
                    throw new Error(res?.data?.message || 'Không thể tải dữ liệu');
                }
                const list = Array.isArray(res.data.data) ? res.data.data : [];
                const found = list.find((item) => String(item._id || item.id) === String(id));
                if (!found) {
                    setError('Không tìm thấy bài đăng bạn yêu cầu.');
                }
                setSelected(found || null);
            } catch (err) {
                setError(err?.message || 'Đã xảy ra lỗi khi tải dữ liệu.');
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    const galleryImages = useMemo(() => extractImages(selected || {}), [selected]);

    const quickStats = [
        {
            label: 'Loại chỗ ở',
            value: selected?.Loai || 'Phòng trọ cao cấp',
        },
        {
            label: 'Diện tích',
            value: selected?.Dientich || 'Đang cập nhật',
        },
        {
            label: 'Tình trạng',
            value: selected?.Trangthai === 'Da phe duyet' ? 'Sẵn sàng' : (selected?.Trangthai || 'Đang cập nhật'),
        },
        {
            label: 'Mã phòng',
            value: selected?.MaTro || selected?.MaBD || 'Đang cập nhật',
        },
    ];

    const detailHighlights = [
        {
            icon: <TeamOutlined />,
            label: 'Sức chứa đề xuất',
            value: selected?.Succhua || '6 - 8 người',
        },
        {
            icon: <CalendarOutlined />,
            label: 'Thời hạn tối thiểu',
            value: selected?.Thoihan || 'Tối thiểu 6 tháng',
        },
        {
            icon: <SendOutlined />,
            label: 'Đặt cọc',
            value: selected?.Datcoc || '1 tháng',
        },
    ];

    const amenities = [
        { label: 'Wifi tốc độ cao', icon: iconMap.wifi },
        { label: 'Máy lạnh', icon: iconMap.maylanh },
        { label: 'Máy giặt chung', icon: iconMap.maygiat },
        { label: 'Thang máy', icon: iconMap.thangmay },
        { label: 'Không gian sinh hoạt', icon: iconMap.khoangrua },
        { label: 'Bảo vệ 24/7', icon: iconMap.baove },
        { label: 'Chỗ để xe', icon: iconMap.xe },
        { label: 'Giá nước/điện minh bạch', icon: iconMap.gia },
    ];

    const descriptionText =
        selected?.Noidung ||
        selected?.Mota ||
        'Phòng trọ được thiết kế hiện đại, đầy đủ tiện nghi, phù hợp cho sinh viên và người đi làm. Khu vực an ninh, gần các trường đại học, chỉ mất 5 phút tới các tuyến đường lớn.';

    return (
        <div className="detail-page">
            <HomeHeader />

            <div className="detail-content">
                <button className="back-button" onClick={() => navigate(-1)}>
                    <ArrowLeftOutlined /> Quay lại
                </button>

                {loading && (
                    <div className="detail-loading">
                        <Skeleton active paragraph={{ rows: 8 }} />
                    </div>
                )}

                {!loading && error && (
                    <div className="detail-error">
                        <Empty description={error} />
                        <Button style={{ marginTop: 16 }} onClick={() => navigate('/')}>
                            Về trang chủ
                        </Button>
                    </div>
                )}

                {!loading && !error && selected && (
                    <>
                        <section className="detail-hero">
                            <div>
                                <Tag color="blue">{selected?.Loai || 'Phòng trọ'}</Tag>
                                <h1>{selected?.Tieude || 'Phòng trọ tiện nghi giá rẻ'}</h1>
                                <p className="detail-address">
                                    <EnvironmentOutlined /> {selected?.Diachi || 'Đang cập nhật địa chỉ'}
                                </p>
                                <div className="quick-stats">
                                    {quickStats.map((item) => (
                                        <div key={item.label} className="quick-stat-item">
                                            <p className="stat-label">{item.label}</p>
                                            <p className="stat-value">{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="price-card">
                                <p className="price-label">Giá thuê</p>
                                <p className="price-value">{formatPrice(selected?.Gia)}</p>
                                <p className="price-note">Đã bao gồm các tiện ích cơ bản</p>
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<PhoneOutlined />}
                                    href={`tel:${selected?.SDT || '0900000000'}`}
                                    style={{ width: '100%', marginBottom: 12 }}
                                >
                                    Liên hệ ngay
                                </Button>
                                <Button icon={<ShareAltOutlined />} block>
                                    Chia sẻ bài đăng
                                </Button>
                                <p className="update-note">
                                    Cập nhật lần cuối: {formatDateTime(selected?.updatedAt || selected?.Ngaydang)}
                                </p>
                            </div>
                        </section>

                        <section className="detail-gallery">
                            <div className="main-image">
                                <img src={galleryImages[0]} alt={selected?.Tieude || 'Phòng trọ'} />
                            </div>
                            <div className="thumbnail-grid">
                                {galleryImages.slice(1, 5).map((img, idx) => (
                                    <div key={idx} className="thumb">
                                        <img src={img} alt={`Ảnh ${idx + 2}`} />
                                    </div>
                                ))}
                                {galleryImages.length > 5 && (
                                    <div className="thumb more">
                                        +{galleryImages.length - 5}
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="detail-highlights">
                            {detailHighlights.map((item) => (
                                <div key={item.label} className="highlight-card">
                                    <div className="icon-wrapper">{item.icon}</div>
                                    <div>
                                        <p className="highlight-label">{item.label}</p>
                                        <p className="highlight-value">{item.value}</p>
                                    </div>
                                </div>
                            ))}
                        </section>

                        <section className="detail-description">
                            <h2>Thông tin mô tả</h2>
                            <p>{descriptionText}</p>
                            <div className="description-list">
                                <p>
                                    <CheckCircleFilled /> Nội thất đầy đủ: giường tầng, tủ đồ cá nhân, bàn học, máy lạnh.
                                </p>
                                <p>
                                    <CheckCircleFilled /> Khu vực bếp và phòng tắm dùng chung rộng rãi, vệ sinh hàng ngày.
                                </p>
                                <p>
                                    <CheckCircleFilled /> An ninh 24/7, thang máy, thẻ từ ra vào từng tầng.
                                </p>
                            </div>
                        </section>

                        <section className="detail-amenities">
                            <h2>Tiện ích nổi bật</h2>
                            <div className="amenities-grid">
                                {amenities.map((item) => (
                                    <div key={item.label} className="amenity-card">
                                        <img src={item.icon} alt={item.label} />
                                        <p>{item.label}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="detail-host">
                            <div>
                                <h2>Thông tin liên hệ</h2>
                                <p className="host-name">{selected?.Nguoidang || selected?.TenDN || 'Chủ trọ'}</p>
                                <p className="host-phone">
                                    <PhoneOutlined /> {selected?.SDT || '0900 000 000'}
                                </p>
                                <p>Email: {selected?.Email || 'support@tro247.vn'}</p>
                                <Tag color="green" style={{ marginTop: 8 }}>
                                    Đã xác thực
                                </Tag>
                            </div>
                            <div className="host-cta">
                                <Button type="primary" size="large" icon={<PhoneOutlined />} block href={`tel:${selected?.SDT || '0900000000'}`}>
                                    Gọi ngay
                                </Button>
                                <Button size="large" block>
                                    Nhắn tin Zalo
                                </Button>
                            </div>
                        </section>
                    </>
                )}
            </div>

            <HomeFooter />
        </div>
    );
};

export default PropertyDetailPage;


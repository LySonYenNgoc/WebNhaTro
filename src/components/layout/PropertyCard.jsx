import React from 'react';
import '../../styles/home.css';

const PropertyCard = ({ baidang = {}, variant = 'grid', onClick }) => {
    const normalizePriceString = (value) => {
        if (!value) return null;
        const lower = value.toLowerCase();
        if (lower.includes('triệu')) {
            return value.replace(/đ|vnđ/gi, 'tr').replace(/triệu/gi, 'tr');
        }
        if (lower.includes('đ')) {
            return value.replace(/đ|vnđ/gi, 'tr');
        }
        return value;
    };

    const formatPrice = (gia) => {
        if (!gia) return 'Giá thỏa thuận';
        if (typeof gia === 'string') {
            const normalized = normalizePriceString(gia);
            if (normalized) return normalized;
            const num = parseFloat(gia);
            if (!Number.isNaN(num)) {
                return `${(num / 1000000).toFixed(2)} tr/tháng`;
            }
            return gia;
        }
        const num = Number(gia);
        if (Number.isFinite(num)) {
            if (num >= 1000000) {
                return `${(num / 1000000).toFixed(2)} tr/tháng`;
            }
            return `${num.toLocaleString('vi-VN')} tr/tháng`;
        }
        return 'Giá thỏa thuận';
    };

    const formatDateShort = (value) => {
        if (!value) return 'Đang cập nhật';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return 'Đang cập nhật';
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const getImageUrl = () => {
        const imagePath = baidang?.Hinhanh || baidang?.Anh || '';
        if (!imagePath) {
            return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200'%3E%3Crect width='300' height='200' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='16' fill='%23999'%3EKhông có ảnh%3C/text%3E%3C/svg%3E";
        }
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
            return imagePath;
        }
        const normalizedPath = imagePath
            .replace(/^\.?\/?src\/images\/?/i, '')
            .replace(/^\.?\/?images\/?/i, '')
            .replace(/\\/g, '/');
        try {
            return new URL(`../../images/${normalizedPath}`, import.meta.url).href;
        } catch (error) {
            return `/src/images/${normalizedPath}`;
        }
    };

    const className = [
        'property-card',
        variant === 'list' ? 'property-card-list' : 'property-card-grid',
    ].join(' ');

    return (
        <div className={className} onClick={onClick}>
            <div className="card-image-wrapper">
                <img
                    src={getImageUrl()}
                    alt={baidang?.Tieude || 'Phòng trọ'}
                    className="card-image"
                    loading="lazy"
                />
            </div>

            <div className="card-content">
                <h3 className="card-title">{baidang?.Tieude || baidang?.Loai || 'Chưa có tiêu đề'}</h3>
                <p className="card-price">{formatPrice(baidang?.Gia)}</p>

                {variant === 'list' ? (
                    <>
                        <div className="card-meta-row">
                            <span>{baidang?.Loai || 'Loại phòng'}</span>
                            <span>•</span>
                            <span>Diện tích: {baidang?.Dientich || 'Đang cập nhật'} m²</span>
                        </div>
                        <p className="card-location">
                            <span className="location-icon">📍</span>
                            {baidang?.Diachi || 'Chưa có địa chỉ'}
                        </p>
                        <div className="card-extra-row">
                            <span>Đăng lúc: {formatDateShort(baidang?.updatedAt || baidang?.Ngaydang || baidang?.createdAt)}</span>
                        </div>
                    </>
                ) : (
                    <>
                        {baidang?.Loai && <p className="card-type">{baidang.Loai}</p>}
                        <p className="card-location">
                            <span className="location-icon">📍</span>
                            {baidang?.Diachi || 'Chưa có địa chỉ'}
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};

export default PropertyCard;
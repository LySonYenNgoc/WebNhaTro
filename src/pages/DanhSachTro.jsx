import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Skeleton, Empty } from 'antd';
import HomeHeader from '../components/layout/HomeHeader';
import HomeFooter from '../components/layout/HomeFooter';
import SearchBar from '../components/layout/SearchBar';
import ProvincesSection from '../components/layout/ProvincesSection';
import PropertyCard from '../components/layout/PropertyCard';
import { getBaidangAPI } from '../../util/api';
import '../styles/listing.css';

const CATEGORY_CONFIG = {
    phongtro: {
        title: 'Tìm phòng trọ giá rẻ, mới nhất',
        subtitle: 'Ưu tiên khu vực trung tâm, phù hợp sinh viên và người đi làm',
        keywords: ['phòng trọ', 'phòng', 'trọ', 'phong tro'],
    },
    canho: {
        title: 'Căn hộ nổi bật cập nhật hôm nay',
        subtitle: 'Căn hộ dịch vụ, căn hộ mini đầy đủ tiện nghi',
        keywords: ['căn hộ', 'can ho', 'apartment'],
    },
    nguyencan: {
        title: 'Nhà nguyên căn đáng thuê',
        subtitle: 'Không gian riêng tư, phù hợp hộ gia đình, nhóm bạn',
        keywords: ['nhà nguyên căn', 'nguyên căn', 'nha nguyen can'],
    },
    kyttucxa: {
        title: 'Ký túc xá giá tốt',
        subtitle: 'Giải pháp tiết kiệm với đầy đủ tiện ích chung',
        keywords: ['ký túc xá', 'ktx', 'ky tuc xa', 'ky tuc'],
    },
    review: {
        title: 'Review phòng trọ mới',
        subtitle: 'Các bài đánh giá chất lượng phòng trọ cập nhật',
        keywords: [],
    },
};

const normalize = (value) => (value || '').toLowerCase();

const parsePriceToMillions = (value) => {
    if (!value) return null;
    if (typeof value === 'number') {
        return value / 1_000_000;
    }
    const digits = String(value).replace(/[^0-9.,]/g, '').replace(',', '.');
    if (!digits) return null;
    const num = parseFloat(digits);
    if (Number.isNaN(num)) return null;
    if (num > 1000) return num / 1_000_000;
    return num;
};

const matchPriceFilter = (gia, filter) => {
    const price = parsePriceToMillions(gia);
    if (price == null) return filter === 'Giá tốt';
    switch (filter) {
        case 'Dưới 2 triệu':
            return price <= 2;
        case '2-5 triệu':
            return price >= 2 && price <= 5;
        case '5-10 triệu':
            return price >= 5 && price <= 10;
        case 'Trên 10 triệu':
            return price > 10;
        default:
            return true;
    }
};

const DanhSachTroPage = () => {
    const { category = 'phongtro' } = useParams();
    const [searchParams] = useSearchParams();
    const provinceParam = searchParams.get('province');
    
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [priceFilter, setPriceFilter] = useState('Giá tốt');
    const [locationFilter, setLocationFilter] = useState(provinceParam || 'Địa điểm');
    const [sizeFilter, setSizeFilter] = useState('any');
    const [displayedListings, setDisplayedListings] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError('');
                const res = await getBaidangAPI();
                if (!res?.data || res.data.error) {
                    throw new Error(res?.data?.message || 'Không thể tải dữ liệu');
                }
                setListings(Array.isArray(res.data.data) ? res.data.data : []);
            } catch (err) {
                setError(err?.message || 'Đã xảy ra lỗi khi tải dữ liệu');
                setListings([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.phongtro;

    const filteredListings = useMemo(() => {
        if (!config.keywords || config.keywords.length === 0) {
            return listings;
        }
        const filtered = listings.filter((item) => {
            const type = normalize(item.Loai);
            return config.keywords.some((keyword) => type.includes(keyword));
        });
        return filtered.length > 0 ? filtered : listings;
    }, [listings, config]);

    const todayLabel = useMemo(() => {
        const now = new Date();
        const day = now.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
        const monthCode = `T${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
        return { day, monthCode };
    }, []);

    useEffect(() => {
        setDisplayedListings(filteredListings);
        setSizeFilter('any');
    }, [filteredListings]);

    // Tự động filter theo tỉnh thành khi có query parameter
    useEffect(() => {
        if (provinceParam) {
            setLocationFilter(provinceParam);
            // Tự động apply filter khi có province param
            const keywordLower = normalize(provinceParam);
            const result = filteredListings.filter((item) => {
                const matchesLocation = normalize(item.Diachi || '').includes(keywordLower);
                const matchesPrice = matchPriceFilter(item.Gia, priceFilter);
                const matchesSize = matchSizeFilter(item.Dientich, sizeFilter);
                return matchesLocation && matchesPrice && matchesSize;
            });
            setDisplayedListings(result);
        }
    }, [provinceParam, filteredListings, priceFilter, sizeFilter]);

    const provinceSuggestions = useMemo(() => {
        const set = new Set();
        listings.forEach((item) => {
            if (item?.Diachi) {
                set.add(item.Diachi);
            }
        });
        return Array.from(set).slice(0, 12);
    }, [listings]);

    const parseArea = (value) => {
        if (!value) return null;
        const digits = String(value).replace(/[^0-9.,]/g, '').replace(',', '.');
        if (!digits) return null;
        const num = parseFloat(digits);
        if (Number.isNaN(num)) return null;
        return num;
    };

    const matchSizeFilter = (dientich, filter) => {
        if (!dientich || filter === 'any') return true;
        const area = parseArea(dientich);
        if (area == null) return true;
        switch (filter) {
            case 'under20':
                return area <= 20;
            case '20-30':
                return area >= 20 && area <= 30;
            case '30-50':
                return area >= 30 && area <= 50;
            case 'over50':
                return area > 50;
            default:
                return true;
        }
    };

    const breadcrumbLabel = `Trang chủ / ${config.title}`;

    const applySearchFilters = ({
        keyword = searchQuery,
        price = priceFilter,
        location = locationFilter,
        size = sizeFilter,
    } = {}) => {
        setSearchQuery(keyword || '');
        setPriceFilter(price || 'Giá tốt');
        setLocationFilter(location || 'Địa điểm');
        setSizeFilter(size || 'any');

        const keywordLower = normalize(keyword);

        const result = filteredListings.filter((item) => {
            const matchesKeyword =
                !keywordLower ||
                normalize(item.Tieude).includes(keywordLower) ||
                normalize(item.Diachi).includes(keywordLower) ||
                normalize(item.Loai).includes(keywordLower);

            const matchesLocation =
                location === 'Địa điểm' || normalize(item.Diachi).includes(normalize(location));

            const matchesPrice = matchPriceFilter(item.Gia, price);
            const matchesSize = matchSizeFilter(item.Dientich, size);

            return matchesKeyword && matchesLocation && matchesPrice && matchesSize;
        });

        setDisplayedListings(result);
    };

    const handleSearch = (payload) => {
        applySearchFilters(payload);
    };

    return (
        <div className="listing-page">
            <HomeHeader />

            <div className="listing-container">
                <div className="listing-search-bar">
                    <SearchBar
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        priceFilter={priceFilter}
                        setPriceFilter={setPriceFilter}
                        locationFilter={locationFilter}
                        setLocationFilter={setLocationFilter}
                        sizeFilter={sizeFilter}
                        setSizeFilter={setSizeFilter}
                        suggestions={provinceSuggestions}
                        onSearch={handleSearch}
                        categories={[
                            { id: 'phongtro', label: 'Tất cả' },
                            { id: 'nhatro', label: 'Nhà trọ, phòng trọ' },
                            { id: 'nhanguyencan', label: 'Nhà nguyên căn' },
                            { id: 'canho', label: 'Căn hộ' },
                            { id: 'kytucxa', label: 'Ký túc xá' },
                        ]}
                        activeCategory={category}
                        onCategoryChange={(cat) => {
                            if (cat === category) return;
                            window.location.href = `/danh-sach/${cat}`;
                        }}
                        suggestionId="listing-suggestions"
                    />
                </div>

                {loading && (
                    <div className="listing-loading">
                        <Skeleton active paragraph={{ rows: 6 }} />
                    </div>
                )}

                {!loading && error && (
                    <div className="listing-error">
                        <Empty description={error} />
                    </div>
                )}

                {!loading && !error && filteredListings.length === 0 && (
                    <div className="listing-empty">
                        <Empty description="Chưa có bài đăng nào phù hợp" />
                    </div>
                )}

                {!loading && !error && displayedListings.length > 0 && (
                    <div className="listing-results-card">
                        <div className="listing-header-block">
                            <div>
                                <p className="listing-breadcrumb">{breadcrumbLabel}</p>
                                <p className="listing-head-title">
                                    {config.title} {todayLabel.monthCode}
                                </p>
                                <p className="listing-head-sub">{config.subtitle}</p>
                            </div>
                        </div>
                        <span className="listing-result-pill">Tổng {displayedListings.length} kết quả</span>

                        <div className="listing-card-list">
                            {displayedListings.map((item) => (
                                <Link
                                    key={item._id || item.id}
                                    to={`/phongtro/${item._id || item.id}`}
                                    className="listing-card-link"
                                >
                                    <PropertyCard baidang={item} variant="list" />
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {!loading && !error && filteredListings.length > 0 && displayedListings.length === 0 && (
                    <div className="listing-empty">
                        <Empty description="Chưa có bài viết nào phù hợp với bộ lọc" />
                    </div>
                )}
            </div>

            <ProvincesSection />
            <HomeFooter />
        </div>
    );
};

export default DanhSachTroPage;


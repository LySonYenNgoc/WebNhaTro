import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getBaidangAPI } from '../../util/api';
import HomeHeader from '../components/layout/HomeHeader';
import HomeFooter from '../components/layout/HomeFooter';
import SearchBar from '../components/layout/SearchBar';
import PropertyCard from '../components/layout/PropertyCard';
import ProvincesSection from '../components/layout/ProvincesSection';
import '../styles/home.css';

const Homepage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [priceFilter, setPriceFilter] = useState('Giá tốt');
    const [locationFilter, setLocationFilter] = useState('Địa điểm');
    const [sizeFilter, setSizeFilter] = useState('any');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [allBaidangs, setAllBaidangs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const isFetchingRef = useRef(false);
    const [searchResults, setSearchResults] = useState([]);
    const [searchExecuted, setSearchExecuted] = useState(false);

    // Tải danh sách bài đăng
    const fetchBaidangs = useCallback(async () => {
        if (isFetchingRef.current) {
            return;
        }
        
        try {
            isFetchingRef.current = true;
            setLoading(true);
            setError(null);
            const response = await getBaidangAPI();
            
            if (response?.data && !response.data.error) {
                const baidangs = response.data.data || [];
                setAllBaidangs(baidangs);
            } else {
                throw new Error(response?.data?.message || 'Không thể tải dữ liệu');
            }
        } catch (err) {
            setError('Không thể tải dữ liệu bài đăng. Vui lòng thử lại sau.');
            setAllBaidangs([]);
        } finally {
            setLoading(false);
            isFetchingRef.current = false;
        }
    }, []);

    useEffect(() => {
        let isMounted = true;
        let focusTimeout;
        
        const loadData = async () => {
            if (isMounted && !isFetchingRef.current) {
                await fetchBaidangs();
            }
        };
        
        loadData();
        
        const handleFocus = () => {
            if (isMounted && !isFetchingRef.current) {
                if (focusTimeout) {
                    clearTimeout(focusTimeout);
                }
                focusTimeout = setTimeout(() => {
                    if (isMounted && !isFetchingRef.current) {
                        fetchBaidangs();
                    }
                }, 500);
            }
        };
        
        window.addEventListener('focus', handleFocus);
        
        return () => {
            isMounted = false;
            if (focusTimeout) {
                clearTimeout(focusTimeout);
            }
            window.removeEventListener('focus', handleFocus);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Lọc theo loại phòng
    const filterByLoai = (loai) => {
        return allBaidangs.filter(bd => {
            const loaiLower = (bd.Loai || '').toLowerCase();
            const searchLoai = loai.toLowerCase();
            return loaiLower.includes(searchLoai);
        });
    };

    // Trả về danh sách hợp lệ
    const getVisibleBaidangs = (baidangs) => {
        if (!Array.isArray(baidangs) || baidangs.length === 0) {
            return [];
        }
        return baidangs;
    };

    // Lấy danh sách hiển thị
    const allVisibleBaidangs = getVisibleBaidangs(allBaidangs);
    
    // Chia nhóm bài đăng
    const hotRoomsFiltered = getVisibleBaidangs(
        filterByLoai('Ký túc xá').concat(
            filterByLoai('Phòng trọ')
        )
    );
    
    // Dùng fallback khi nhóm rỗng
    const hotRooms = hotRoomsFiltered.length > 0 
        ? hotRoomsFiltered.slice(0, 4)
        : allVisibleBaidangs.slice(0, 4);

    const apartmentsFiltered = getVisibleBaidangs(
        filterByLoai('Căn hộ')
    );
    
    const apartments = apartmentsFiltered.length > 0 
        ? apartmentsFiltered.slice(0, 4)
        : allVisibleBaidangs.slice(4, 8);

    const housesFiltered = getVisibleBaidangs(
        filterByLoai('Nhà nguyên căn')
    );
    
    const houses = housesFiltered.length > 0 
        ? housesFiltered.slice(0, 4)
        : allVisibleBaidangs.slice(8, 12);



    const parsePriceToMillions = (value) => {
        if (!value) return null;
        if (typeof value === 'number') return value / 1_000_000;
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

    const categoryKeywords = {
        all: [],
        nhatro: ['nhà trọ', 'phòng trọ'],
        nhanguyencan: ['nhà nguyên căn'],
        canho: ['căn hộ', 'apartment'],
        kytucxa: ['ký túc xá', 'ktx'],
    };

    const normalizeValue = (val) => (val ? String(val).toLowerCase() : '');

    const handleSearch = (filters = {}) => {
        const keyword = normalizeValue(filters.keyword ?? searchQuery);
        const price = filters.priceFilter ?? priceFilter;
        const location = filters.locationFilter ?? locationFilter;
        const size = filters.sizeFilter ?? sizeFilter;
        const category = filters.category ?? categoryFilter;

        const results = allVisibleBaidangs.filter((item) => {
            const title = normalizeValue(item.Tieude);
            const type = normalizeValue(item.Loai);
            const addr = normalizeValue(item.Diachi);

            const matchesKeyword =
                !keyword || title.includes(keyword) || type.includes(keyword) || addr.includes(keyword);

            const matchesLocation =
                !location || location === 'Địa điểm' || addr.includes(normalizeValue(location));

            const matchesPrice = matchPriceFilter(item.Gia, price);
            const matchesSize = matchSizeFilter(item.Dientich, size);

            const catKeywords = categoryKeywords[category] || [];
            const matchesCategory =
                category === 'all' ||
                catKeywords.some((kw) => type.includes(kw) || title.includes(kw));

            return matchesKeyword && matchesLocation && matchesPrice && matchesSize && matchesCategory;
        });

        setSearchQuery(filters.keyword ?? searchQuery);
        setPriceFilter(price);
        setLocationFilter(location);
        setSizeFilter(size);
        setCategoryFilter(category);
        setSearchResults(results);
        setSearchExecuted(true);
    };

    const clearSearchResults = () => {
        setSearchExecuted(false);
        setSearchResults([]);
    };

    const provinceSuggestions = useMemo(() => {
        const set = new Set();
        allVisibleBaidangs.forEach((item) => {
            if (item?.Diachi) {
                set.add(item.Diachi);
            }
        });
        return Array.from(set).slice(0, 10);
    }, [allVisibleBaidangs]);

    return (
        <div className="homepage-container">
            
            {/* Header */}
            <HomeHeader />

            {/* Hero Section với banner */}
            <section className="hero-section">
                <div className="hero-background">
                    <div className="stars-overlay"></div>
                </div>
            </section>

            {/* Thanh tìm kiếm ngay dưới banner - full width */}
            <SearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                priceFilter={priceFilter}
                setPriceFilter={setPriceFilter}
                locationFilter={locationFilter}
                setLocationFilter={setLocationFilter}
                sizeFilter={sizeFilter}
                setSizeFilter={setSizeFilter}
                categories={[
                    { id: 'all', label: 'Tất cả' },
                    { id: 'nhatro', label: 'Nhà trọ, phòng trọ' },
                    { id: 'nhanguyencan', label: 'Nhà nguyên căn' },
                    { id: 'canho', label: 'Căn hộ' },
                    { id: 'kytucxa', label: 'Ký túc xá' },
                ]}
                activeCategory={categoryFilter}
                onCategoryChange={(cat) => {
                    setCategoryFilter(cat);
                    if (searchExecuted) {
                        handleSearch({ category: cat });
                    }
                }}
                suggestions={provinceSuggestions}
                onSearch={handleSearch}
            />

            {searchExecuted && (
                <section className="search-results-panel">
                    <div className="search-results-header">
                        <div>
                            <p className="search-results-title">
                                Kết quả tìm kiếm ({searchResults.length})
                            </p>
                            <p className="search-results-sub">
                                Hiển thị các phòng phù hợp với tiêu chí bạn đã chọn
                            </p>
                        </div>
                        <button className="search-results-reset" onClick={clearSearchResults}>
                            Xóa kết quả
                        </button>
                    </div>
                    {searchResults.length === 0 ? (
                        <p className="search-results-empty">
                            Không tìm thấy phòng nào phù hợp. Vui lòng thử lại tiêu chí khác.
                        </p>
                    ) : (
                        <div className="search-results-list">
                            {searchResults.slice(0, 5).map((item) => (
                                <Link
                                    key={item._id || item.id}
                                    to={`/phongtro/${item._id || item.id}`}
                                    className="search-results-card"
                                >
                                    <PropertyCard baidang={item} variant="list" />
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
            )}

            {/* Loading state */}
            {loading && (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <p>Đang tải dữ liệu...</p>
                </div>
            )}

            {/* Error state */}
            {error && !loading && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#e74c3c' }}>
                    <p>{error}</p>
                    <button 
                        onClick={fetchBaidangs}
                        style={{
                            marginTop: '10px',
                            padding: '10px 20px',
                            background: '#0045A8',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        Thử lại
                    </button>
                </div>
            )}

            {/* Lựa chọn chỗ HOT */}
            {!loading && !error && (
                <>
                    <section className="content-section">
                        <h2 className="section-title section-title-left">LỰA CHỌN CHỖ HOT</h2>
                        {hotRooms.length > 0 ? (
                            <div className="card-grid">
                                {hotRooms.map((room) => (
                                    <Link
                                        key={room._id || room.id}
                                        to={`/phongtro/${room._id || room.id}`}
                                        className="property-card-link"
                                        aria-label={`Xem chi tiết ${room.Tieude || 'phòng trọ'}`}
                                    >
                                        <PropertyCard baidang={room} />
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                                Chưa có bài đăng nào. Hãy đăng bài đầu tiên!
                            </p>
                        )}
                    </section>

                    {/* Căn hộ */}
                    <section className="content-section">
                        <h2 className="section-title section-title-left">CĂN HỘ</h2>
                        {apartments.length > 0 ? (
                            <div className="card-grid">
                                {apartments.map((apt) => (
                                    <Link
                                        key={apt._id || apt.id}
                                        to={`/phongtro/${apt._id || apt.id}`}
                                        className="property-card-link"
                                        aria-label={`Xem chi tiết ${apt.Tieude || 'căn hộ'}`}
                                    >
                                        <PropertyCard baidang={apt} />
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                                Chưa có căn hộ nào.
                            </p>
                        )}
                    </section>

                    {/* Nhà nguyên căn */}
                    <section className="content-section">
                        <h2 className="section-title section-title-left">NHÀ NGUYÊN CĂN</h2>
                        {houses.length > 0 ? (
                            <div className="card-grid">
                                {houses.map((house) => (
                                    <Link
                                        key={house._id || house.id}
                                        to={`/phongtro/${house._id || house.id}`}
                                        className="property-card-link"
                                        aria-label={`Xem chi tiết ${house.Tieude || 'nhà nguyên căn'}`}
                                    >
                                        <PropertyCard baidang={house} />
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                                Chưa có nhà nguyên căn nào.
                            </p>
                        )}
                    </section>
                </>
            )}

            {/* Khám phá trọ các tỉnh thành */}
            <ProvincesSection />

            {/* Footer */}
            <HomeFooter />
        </div>
    );
};

export default Homepage;

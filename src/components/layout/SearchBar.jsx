import React from 'react';
import '../../styles/SearchBar.css';

const sizeOptions = [
    { value: 'any', label: 'Diện tích' },
    { value: 'under20', label: 'Dưới 20 m²' },
    { value: '20-30', label: '20 - 30 m²' },
    { value: '30-50', label: '30 - 50 m²' },
    { value: 'over50', label: 'Trên 50 m²' },
];

const SearchBar = ({
    searchQuery,
    setSearchQuery,
    priceFilter,
    setPriceFilter,
    sizeFilter,
    setSizeFilter,
    locationFilter,
    setLocationFilter,
    onSearch,
    suggestions = [],
    suggestionId = 'search-suggestions',
}) => {
    const handleSubmit = () => {
        if (typeof onSearch === 'function') {
            onSearch({
                keyword: searchQuery,
                priceFilter,
                locationFilter,
                sizeFilter,
                category: activeCategory,
            });
        }
    };

    return (
        <section className="search-section">
            <div className="search-container-full">
                <div className="search-box-wrapper">
                    <div className="search-box-full">
                        <div className="search-input-wrapper">
                            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8" />
                                <path d="m21 21-4.35-4.35" />
                            </svg>
                            <input
                                type="text"
                                list={suggestionId}
                                placeholder="Bạn muốn tìm trọ ở đâu?"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="search-input"
                            />
                            {suggestions.length > 0 && (
                                <datalist id={suggestionId}>
                                    {suggestions.map((item) => (
                                        <option key={item} value={item} />
                                    ))}
                                </datalist>
                            )}
                        </div>
                        <select
                            value={priceFilter}
                            onChange={(e) => setPriceFilter(e.target.value)}
                            className="search-filter"
                        >
                            <option value="Giá tốt">Mức giá</option>
                            <option value="Dưới 2 triệu">Dưới 2 triệu</option>
                            <option value="2-5 triệu">2 - 5 triệu</option>
                            <option value="5-10 triệu">5 - 10 triệu</option>
                            <option value="Trên 10 triệu">Trên 10 triệu</option>
                        </select>
                        <select
                            value={sizeFilter}
                            onChange={(e) => setSizeFilter(e.target.value)}
                            className="search-filter"
                        >
                            {sizeOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                        <select
                            value={locationFilter}
                            onChange={(e) => setLocationFilter(e.target.value)}
                            className="search-filter"
                        >
                            <option value="Địa điểm">Loại phòng</option>
                            <option value="nhatro">Nhà trọ, phòng trọ</option>
                            <option value="nhanguyencan">Nhà nguyên căn</option>
                            <option value="canho">Căn hộ</option>
                            <option value="kytucxa">Ký túc xá</option>
                        </select>
                        <button onClick={handleSubmit} className="search-button">
                            Tìm kiếm
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SearchBar;
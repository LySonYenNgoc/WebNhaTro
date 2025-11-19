import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBaidangAPI } from '../../../util/api';
import '../../styles/home.css';

/**
 * Component hiển thị section khám phá trọ các tỉnh thành
 */
const ProvincesSection = () => {
    const navigate = useNavigate();
    const [provinces, setProvinces] = useState([
        {
            name: 'Hồ Chí Minh',
            count: 0
        },
        {
            name: 'Bình Dương',
            count: 0
        },
        {
            name: 'Đồng Nai',
            count: 0
        },
        {
            name: 'Đà Nẵng',
            count: 0
        },
        {
            name: 'Cần Thơ',
            count: 0
        },
        {
            name: 'Hà Nội',
            count: 0
        },
        {
            name: 'Bà Rịa, Vũng Tàu',
            count: 0
        }
    ]);

    // Tính số lượng bài đăng thực tế từ database
    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const res = await getBaidangAPI();
                if (res?.data && !res.data.error && Array.isArray(res.data.data)) {
                    const baidangs = res.data.data;
                    const normalized = (str) => (str || '').toLowerCase().trim();
                    
                    const provinceNames = [
                        'Hồ Chí Minh',
                        'Bình Dương',
                        'Đồng Nai',
                        'Đà Nẵng',
                        'Cần Thơ',
                        'Hà Nội',
                        'Bà Rịa, Vũng Tàu'
                    ];
                    
                    const updatedProvinces = provinceNames.map(provinceName => {
                        const count = baidangs.filter(item => {
                            const diachi = normalized(item.Diachi || '');
                            const normalizedProvince = normalized(provinceName);
                            // Kiểm tra nếu địa chỉ chứa tên tỉnh thành
                            return diachi.includes(normalizedProvince) || 
                                   normalizedProvince.split(',').some(part => diachi.includes(normalized(part)));
                        }).length;
                        return { name: provinceName, count };
                    });
                    
                    setProvinces(updatedProvinces);
                }
            } catch (error) {
                console.error('Error fetching province counts:', error);
            }
        };
        
        fetchCounts();
    }, []);

    const handleProvinceClick = (provinceName) => {
        // Navigate đến trang danh sách với filter theo tỉnh thành
        navigate(`/danh-sach/phongtro?province=${encodeURIComponent(provinceName)}`);
    };

    // Chia provinces thành 3 cột
    const column1 = provinces.slice(0, 3);
    const column2 = provinces.slice(3, 6);
    const column3 = provinces.slice(6);

    return (
        <section className="provinces-section">
            <h2 className="provinces-title">KHÁM PHÁ TRỌ CÁC TỈNH THÀNH</h2>
            <p className="provinces-subtitle">Cùng trọ tôt khám phá trọ ở các tỉnh thành được quan tâm nhất....</p>
            <div className="provinces-content">
                <div className="provinces-column">
                    {column1.map((province, index) => (
                        <div 
                            key={index} 
                            className="province-item"
                            onClick={() => handleProvinceClick(province.name)}
                            style={{ cursor: 'pointer' }}
                        >
                            <span className="province-name">{province.name}</span>
                            <span className="province-count">{province.count} bài đăng</span>
                        </div>
                    ))}
                </div>
                <div className="provinces-column">
                    {column2.map((province, index) => (
                        <div 
                            key={index} 
                            className="province-item"
                            onClick={() => handleProvinceClick(province.name)}
                            style={{ cursor: 'pointer' }}
                        >
                            <span className="province-name">{province.name}</span>
                            <span className="province-count">{province.count} bài đăng</span>
                        </div>
                    ))}
                </div>
                <div className="provinces-column">
                    {column3.map((province, index) => (
                        <div 
                            key={index} 
                            className="province-item"
                            onClick={() => handleProvinceClick(province.name)}
                            style={{ cursor: 'pointer' }}
                        >
                            <span className="province-name">{province.name}</span>
                            <span className="province-count">{province.count} bài đăng</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ProvincesSection;


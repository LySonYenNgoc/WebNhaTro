import React, { useContext } from 'react';
import { Layout } from 'antd';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/authcontext';

const { Header } = Layout;

const ChutroHeader = ({ collapsed, setCollapsed }) => {
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);

    const handleLogout = () => {
        if (logout) {
            logout();
        }
        navigate('/');
    };

    return (
        <Header style={{
            padding: '0 24px',
            background: '#0045A8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span
                    onClick={() => setCollapsed(!collapsed)}
                    style={{
                        cursor: 'pointer',
                        color: '#fff',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        padding: '4px 8px',
                    }}
                >
                    ☰
                </span>
                <span style={{
                    color: '#fff',
                    fontSize: '18px',
                    fontWeight: 'bold',
                }}>
                    Trotot.com
                </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span 
                    onClick={handleLogout}
                    style={{
                        cursor: 'pointer',
                        color: '#fff',
                        fontWeight: 'bold',
                        padding: '4px 8px',
                    }}
                >
                    Đăng xuất
                </span>
            </div>
        </Header>
    );
};

export default ChutroHeader;


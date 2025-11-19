import React, { useContext } from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/authcontext';
import ChutroHeader from './ChutroHeader';
import '../../styles/ChutroLayout.css';

const { Sider, Content } = Layout;

const ChutroLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useContext(AuthContext);
    const [collapsed, setCollapsed] = React.useState(false);
    const [openKeys, setOpenKeys] = React.useState(['sub2']);
    
    // Cập nhật openKeys khi location thay đổi
    React.useEffect(() => {
        const path = location.pathname;
        if (path.includes('Tất cả bài viết') || path.includes('Đăng bài viết mới')) {
            setOpenKeys(['sub1']);
        } else if (path.includes('Danh sách khách thuê') || path.includes('Danh sách phòng trọ')) {
            setOpenKeys(['sub2']);
        } else if (path.includes('Chỉ số điện') || path.includes('Chỉ số nước')) {
            setOpenKeys(['sub3']);
        } else if (path.includes('Tính tiền')) {
            setOpenKeys(['sub4']);
        }
    }, [location.pathname]);

    const menuItems = [
        {
            key: 'sub1',
            label: 'Quản lý bài viết',
            children: [
                {
                    key: '/Chutro/Tất cả bài viết',
                    label: 'Tất cả bài viết',
                },
                {
                    key: '/Chutro/Đăng bài viết mới',
                    label: 'Đăng bài viết mới',
                },
            ],
        },
        {
            key: 'sub2',
            label: 'Quản lý phòng',
            children: [
                {
                    key: '/Chutro/Danh sách khách thuê',
                    label: 'Danh sách khách thuê',
                },
                {
                    key: '/Chutro/Danh sách phòng trọ',
                    label: 'Danh sách phòng trọ',
                },
            ],
        },
        {
            key: 'sub3',
            label: 'Quản lý dịch vụ',
            children: [
                {
                    key: '/Chutro/Chỉ số điện',
                    label: 'Chỉ số điện',
                },
                {
                    key: '/Chutro/Chỉ số nước',
                    label: 'Chỉ số nước',
                },
            ],
        },
        {
            key: 'sub4',
            label: 'Doanh thu',
            children: [
                {
                    key: '/Chutro/Tính tiền',
                    label: 'Tính tiền',
                },
            ],
        },
        {
            key: 'logout',
            label: 'Đăng xuất',
            danger: true,
        },
    ];

    const handleMenuClick = ({ key }) => {
        if (key === 'logout') {
            if (logout) {
                logout();
            }
            navigate('/');
        } else if (key.startsWith('/')) {
            navigate(key);
        }
    };

    const getSelectedKeys = () => {
        const path = location.pathname;
        if (path.includes('Tất cả bài viết')) return ['/Chutro/Tất cả bài viết'];
        if (path.includes('Đăng bài viết mới')) return ['/Chutro/Đăng bài viết mới'];
        if (path.includes('Danh sách khách thuê')) return ['/Chutro/Danh sách khách thuê'];
        if (path.includes('Danh sách phòng trọ')) return ['/Chutro/Danh sách phòng trọ'];
        if (path.includes('Chỉ số điện')) return ['/Chutro/Chỉ số điện'];
        if (path.includes('Chỉ số nước')) return ['/Chutro/Chỉ số nước'];
        if (path.includes('Tính tiền')) return ['/Chutro/Tính tiền'];
        return [];
    };

    const handleOpenChange = (keys) => {
        setOpenKeys(keys);
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider 
                trigger={null} 
                collapsible 
                collapsed={collapsed}
                style={{
                    background: '#0045A8',
                }}
            >
                <div style={{
                    height: '64px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: collapsed ? '16px' : '20px',
                    fontWeight: 'bold',
                    borderBottom: '1px solid rgba(255,255,255,0.2)',
                }}>
                    {collapsed ? 'TT' : 'Trotot.com'}
                </div>
                <div style={{
                    padding: '16px',
                    textAlign: 'center',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    borderBottom: '1px solid rgba(255,255,255,0.2)',
                }}>
                    CHỦ TRỌ
                </div>
                <Menu
                    mode="inline"
                    selectedKeys={getSelectedKeys()}
                    openKeys={openKeys}
                    onOpenChange={handleOpenChange}
                    items={menuItems}
                    onClick={handleMenuClick}
                    style={{
                        background: '#0045A8',
                        color: 'white',
                        borderRight: 0,
                    }}
                    className="chutro-menu"
                />
            </Sider>
            <Layout>
                <ChutroHeader collapsed={collapsed} setCollapsed={setCollapsed} />
                <Content style={{
                    margin: 0,
                    padding: 0,
                    background: 'white',
                    minHeight: 'calc(100vh - 64px)',
                }}>
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
};

export default ChutroLayout;


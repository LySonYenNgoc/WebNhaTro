import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import AdminHeader from './AdminHeader';
import '../../styles/ChutroLayout.css';

const { Sider, Content } = Layout;

const AdminLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = React.useState(false);
    const [openKeys, setOpenKeys] = React.useState(['sub1']);
    
    // Cập nhật openKeys khi location thay đổi
    React.useEffect(() => {
        const path = location.pathname;
        if (path === '/admin' || path.includes('Tất cả bài đăng') || path.includes('Bài viết cho phê duyệt')) {
            setOpenKeys(['sub1']);
        } else if (path.includes('Nguoidung')) {
            setOpenKeys(['sub2']);
        } else if (path.includes('Quản lý tiêu chí tìm kiếm')) {
            setOpenKeys(['sub3']);
        }
    }, [location.pathname]);

    const menuItems = [
        {
            key: 'sub1',
            label: 'Quản lý bài viết',
            children: [
                {
                    key: '/Tất cả bài đăng',
                    label: 'Tất cả bài đăng',
                },
                {
                    key: '/Bài viết cho phê duyệt',
                    label: 'Bài viết cho phê duyệt',
                },
            ],
        },
        {
            key: 'sub2',
            label: 'Quản lý tài khoản',
            children: [
                {
                    key: '/Nguoidung',
                    label: 'Danh sách tài khoản',
                },
            ],
        },
        {
            key: 'sub3',
            label: 'Quản lý tiêu chí tìm kiếm',
        },
        {
            key: 'logout',
            label: 'Đăng xuất',
            danger: true,
        },
    ];

    const handleMenuClick = ({ key }) => {
        if (key === 'logout') {
            navigate('/');
        } else if (key.startsWith('/')) {
            navigate(key);
        }
    };

    const getSelectedKeys = () => {
        const path = location.pathname;
        // Nếu đang ở route /admin hoặc /Tất cả bài đăng, highlight "Tất cả bài đăng"
        if (path === '/admin' || path.includes('Tất cả bài đăng')) return ['/Tất cả bài đăng'];
        if (path.includes('Bài viết cho phê duyệt')) return ['/Bài viết cho phê duyệt'];
        if (path.includes('Nguoidung')) return ['/Nguoidung'];
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
                    ADMIN
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
                <AdminHeader collapsed={collapsed} setCollapsed={setCollapsed} />
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

export default AdminLayout;


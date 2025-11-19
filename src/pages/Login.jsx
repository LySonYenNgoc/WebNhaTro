import React, { useState, useContext } from 'react';
import { Form, Input, Button, Card, Typography, notification } from 'antd';
import { useNavigate } from 'react-router-dom';
import { loginAPI } from '../../util/api';
import { AuthContext } from '../context/authcontext';

const { Title } = Typography;

const LoginPage = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { setAuth } = useContext(AuthContext);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const { tenDN, matKhau } = values;
            const res = await loginAPI(tenDN, matKhau);

            if (res?.data?.EC === 0) {
                // Lưu token và user info
                const token = res.data.access_token;
                const userInfo = res.data.Nguoidung;
                
                localStorage.setItem('token', token);
                localStorage.setItem('user_info', JSON.stringify(userInfo));
                
                // Set auth context
                setAuth(true, userInfo);

                notification.success({
                    message: 'Đăng nhập thành công!',
                    description: 'Chào mừng bạn trở lại!',
                });

                // Redirect based on role (case-insensitive)
                // Normalize role: chuyển về lowercase và trim, xử lý cả Role và role
                const rawRole = userInfo?.Role || userInfo?.role || '';
                const userRole = String(rawRole).toLowerCase().trim();
                console.log(' User logged in with role:', userRole, 'Raw role:', rawRole, 'Full userInfo:', userInfo);
                
                // Redirect đến trang mặc định của từng role
                if (userRole === 'admin') {
                    // Admin → trang admin
                    console.log(' Redirecting admin to /admin');
                    navigate('/admin', { replace: true });
                } else if (userRole === 'host') {
                    // Host → trang Chutro (sẽ tự động redirect đến "Danh sách khách thuê")
                    console.log(' Redirecting host to /Chutro');
                    navigate('/Chutro', { replace: true });
                } else {
                    // User thường → trang chủ
                    console.log(' Redirecting user to homepage');
                    navigate('/', { replace: true });
                }
            } else {
                notification.error({
                    message: 'Đăng nhập thất bại',
                    description: res?.data?.EM || 'Vui lòng kiểm tra lại thông tin đăng nhập.',
                });
            }
        } catch (error) {
            console.error('Login error:', error);
            notification.error({
                message: 'Đăng nhập thất bại',
                description: error?.response?.data?.EM || error?.message || 'Lỗi không xác định',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '20px'
        }}>
            <Card style={{ width: '100%', maxWidth: 400, boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
                <Title level={2} style={{ textAlign: 'center', marginBottom: '30px' }}>
                    Đăng Nhập
                </Title>
                <Form
                    form={form}
                    name="login"
                    onFinish={onFinish}
                    layout="vertical"
                    autoComplete="off"
                >
                    <Form.Item
                        label="Tên đăng nhập"
                        name="tenDN"
                        rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
                    >
                        <Input size="large" placeholder="Nhập tên đăng nhập" />
                    </Form.Item>

                    <Form.Item
                        label="Mật khẩu"
                        name="matKhau"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                    >
                        <Input.Password size="large" placeholder="Nhập mật khẩu" />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            block
                            size="large"
                            style={{ marginTop: '10px' }}
                        >
                            Đăng Nhập
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default LoginPage;


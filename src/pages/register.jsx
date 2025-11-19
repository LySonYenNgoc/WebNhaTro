import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, notification } from 'antd';
import { useNavigate } from 'react-router-dom';
import { CreateNguoidungApi } from '../../util/api.js';

const { Title } = Typography;

const RegisterPage = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onFinish = async (values) => {
        setLoading(true);
        try {
        const { tenDN, email, sdt, matKhau } = values;
            const res = await CreateNguoidungApi(tenDN, email, sdt, matKhau);

            if (res?.data?.error === false) {
            notification.success({
                message: 'Đăng ký thành công!',
                description: 'Bạn đã đăng ký tài khoản thành công.',
            });
                navigate('/Dangnhap');
        } else {
                notification.error({
                    message: 'Đăng ký thất bại!',
                    description: res?.data?.message || 'Vui lòng kiểm tra lại thông tin đăng ký.',
                });
            }
        } catch (error) {
            notification.error({
                message: 'Đăng ký thất bại!',
                description: error?.response?.data?.message || error?.message || 'Lỗi không xác định',
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
            <Card style={{ width: '100%', maxWidth: 500, boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
                <Title level={2} style={{ textAlign: 'center', marginBottom: '30px' }}>
                    Đăng Ký
                </Title>
            <Form
                    form={form}
                    name="register"
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
                    label="Email"
                    name="email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email!' },
                            { type: 'email', message: 'Email không hợp lệ!' }
                        ]}
                >
                        <Input size="large" placeholder="Nhập email" />
                </Form.Item>

                <Form.Item
                        label="Số điện thoại"
                    name="sdt"
                        rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                >
                        <Input size="large" placeholder="Nhập số điện thoại" />
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
                            Đăng Ký
                    </Button>
                </Form.Item>
            </Form>
            </Card>
        </div>
    );
};

export default RegisterPage;

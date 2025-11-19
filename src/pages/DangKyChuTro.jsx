import React, { useState, useEffect, useContext } from 'react';
import { Form, Input, Button, Card, Typography, notification, Checkbox, Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/authcontext';
import HomeHeader from '../components/layout/HomeHeader';
import HomeFooter from '../components/layout/HomeFooter';
import '../styles/DangKyChuTro.css';

const { Title } = Typography;

const DangKyChuTroPage = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { user, setAuth } = useContext(AuthContext);
    const [isHost, setIsHost] = useState(false);

    useEffect(() => {
        // Nếu chưa đăng nhập, redirect về trang đăng nhập
        if (!user) {
            notification.warning({
                message: 'Vui lòng đăng nhập',
                description: 'Bạn cần đăng nhập để đăng ký làm chủ trọ',
            });
            navigate('/Dangnhap');
            return;
        }

        // Kiểm tra role
        const rawRole = user?.Role || user?.role || '';
        const userRole = String(rawRole).toLowerCase().trim();

        // Nếu role là "chutro" (chủ trọ), redirect đến đăng nhập
        if (userRole === 'chutro' || userRole === 'host') {
            notification.info({
                message: 'Bạn đã là chủ trọ',
                description: 'Đang chuyển đến trang quản lý...',
            });
            navigate('/Dangnhap');
            return;
        }

        // Chỉ cho phép admin và user đăng ký làm chủ trọ
        if (userRole !== 'admin' && userRole !== 'user') {
            notification.warning({
                message: 'Không có quyền',
                description: 'Chỉ admin và user mới có thể đăng ký làm chủ trọ',
            });
            navigate('/');
            return;
        }

        // Điền thông tin user vào form
        if (user) {
            form.setFieldsValue({
                tenDN: user.TenDN || user.tenDN || '',
                hoTen: user.HoTen || user.hoTen || '',
                ngaySinh: user.NgaySinh || user.ngaySinh || '',
                sdt: user.SDT || user.sdt || '',
                email: user.Email || user.email || '',
                diaChi: user.DiaChi || user.diaChi || '',
            });
        }
    }, [user, form, navigate]);

    const onFinish = async (values) => {
        if (!isHost) {
            notification.warning({
                message: 'Vui lòng xác nhận',
                description: 'Bạn cần tích vào "Thành chủ trọ" để tiếp tục',
            });
            return;
        }

        setLoading(true);
        try {
            const userId = user?._id || user?.id;
            if (!userId) {
                throw new Error('Không tìm thấy thông tin người dùng');
            }

            console.log('🔄 Updating user role to host, userId:', userId);
            console.log('📝 Current user role:', user?.Role || user?.role);

            // Gọi API cập nhật role thành "host" (từ "user" sang "host")
            const { updateNguoidungAPI } = await import('../../util/api');
            const updateData = {
                Role: 'host',
                HoTen: values.hoTen || user.HoTen || user.hoTen || '',
                NgaySinh: values.ngaySinh || user.NgaySinh || user.ngaySinh || '',
                SDT: values.sdt || user.SDT || user.sdt || '',
                Email: values.email || user.Email || user.email || '',
                DiaChi: values.diaChi || user.DiaChi || user.diaChi || '',
            };
            
            console.log('📤 Sending update request to:', `/v1/api/nguoidungs/${userId}`);
            console.log('📤 Update data:', updateData);
            
            const res = await updateNguoidungAPI(userId, updateData);
            console.log('📥 Update response:', res?.data);

            if (res?.data && !res?.data?.error) {
                // Cập nhật user trong context với dữ liệu từ server
                const serverUser = res.data.data || res.data;
                const updatedUser = {
                    ...user,
                    ...serverUser,
                    Role: 'host',
                    role: 'host',
                    HoTen: serverUser.HoTen || updateData.HoTen,
                    NgaySinh: serverUser.NgaySinh || updateData.NgaySinh,
                    SDT: serverUser.SDT || updateData.SDT,
                    Email: serverUser.Email || updateData.Email,
                    DiaChi: serverUser.DiaChi || updateData.DiaChi,
                };
                
                // Lưu vào localStorage
                localStorage.setItem('user_info', JSON.stringify(updatedUser));
                setAuth(true, updatedUser);

                notification.success({
                    message: 'Đăng ký thành công!',
                    description: 'Bạn đã trở thành chủ trọ. Đang chuyển đến trang quản lý...',
                    duration: 2,
                });

                // Redirect đến trang chủ trọ ngay lập tức
                setTimeout(() => {
                    navigate('/Chutro', { replace: true });
                }, 500);
            } else {
                throw new Error(res?.data?.message || 'Có lỗi xảy ra khi cập nhật');
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
        <div className="dangky-chutro-container">
            <HomeHeader />
            <div className="dangky-chutro-content">
                <Row gutter={[40, 40]} align="middle">
                    <Col xs={24} md={8} className="logo-section">
                        <div className="large-logo">
                            <img src="/src/images/Logo.png" alt="TRỌ TỐT Logo" className="large-logo-image" />
                        </div>
                    </Col>
                    <Col xs={24} md={16}>
                        <Card className="dangky-chutro-card">
                            <Title level={2} className="dangky-chutro-title">
                                THÔNG TIN CHỦ TRỌ
                            </Title>
                            <Form
                                form={form}
                                name="dangkyChuTro"
                                onFinish={onFinish}
                                layout="vertical"
                                autoComplete="off"
                                className="dangky-chutro-form"
                            >
                                <Row gutter={16}>
                                    <Col xs={24} sm={12}>
                                        <Form.Item
                                            label="Tên đăng nhập"
                                            name="tenDN"
                                        >
                                            <Input size="large" disabled />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item
                                            label="Họ và tên"
                                            name="hoTen"
                                        >
                                            <Input size="large" />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Row gutter={16}>
                                    <Col xs={24} sm={12}>
                                        <Form.Item
                                            label="Ngày sinh"
                                            name="ngaySinh"
                                        >
                                            <Input size="large" placeholder="dd/mm/yyyy" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item
                                            label="Sdt"
                                            name="sdt"
                                        >
                                            <Input size="large" />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Row gutter={16}>
                                    <Col xs={24} sm={12}>
                                        <Form.Item
                                            label="Email"
                                            name="email"
                                        >
                                            <Input size="large" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item
                                            label="Địa chỉ"
                                            name="diaChi"
                                        >
                                            <Input size="large" />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Form.Item>
                                    <Checkbox
                                        checked={isHost}
                                        onChange={(e) => setIsHost(e.target.checked)}
                                        className="host-checkbox"
                                    >
                                        Thành chủ trọ
                                    </Checkbox>
                                </Form.Item>

                                <Form.Item>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        loading={loading}
                                        size="large"
                                        className="confirm-button"
                                    >
                                        Xác nhận
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Card>
                    </Col>
                </Row>
            </div>
            <HomeFooter />
        </div>
    );
};

export default DangKyChuTroPage;


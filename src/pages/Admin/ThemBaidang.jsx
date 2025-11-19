import React, { useState, useContext, useEffect } from "react";
import { Form, Input, Button, notification, Typography, Card, Select } from "antd";
import { useNavigate } from "react-router-dom";
import { createBaidangAPI, getTroAPI } from "../../../util/api";
import { AuthContext } from "../../context/authcontext";

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// Trang thêm bài đăng mới
const ThemBaidangPage = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const { user } = useContext(AuthContext);
    const [roomList, setRoomList] = useState([]);
    const [loadingRooms, setLoadingRooms] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    
    // Map loại phòng sang thư mục ảnh
    const roomTypeImageMap = {
        'Căn hộ': {
            folder: 'canho'
        },
        'Nhà nguyên căn': {
            folder: 'nhanguyencan'
        },
        'Ký túc xá': {
            folder: 'kytucxa'
        },
        'Phòng trọ': {
            folder: 'anhtro'
        }
    };
    

    // Xử lý submit form
    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            const currentUser = user || JSON.parse(localStorage.getItem('user_info') || '{}');
            const tenDN = currentUser?.TenDN || currentUser?.tenDN || '';
            const userId = currentUser?._id || currentUser?.id || null;

            if (!selectedRoom) {
                notification.error({
                    message: "Lỗi",
                    description: "Vui lòng chọn phòng trọ trước khi đăng bài!",
                });
                setLoading(false);
                return;
            }

            const imageFileName = values.hinhanh || '';
            const imagePath = imageFileName ? imageFileName.trim() : '';

            const postData = {
                Tieude: values.tieude,
                Mota: values.noidung || '',
                Noidung: values.noidung || '',
                Anh: imagePath,
                Hinhanh: imagePath,
                Trangthai: 'Da phe duyet',
                MaTro: selectedRoom.MaTro || values.matro || '',
                TenDN: tenDN,
                Nguoidung: userId,
                Dientich: selectedRoom.Dientich || selectedRoom.DienTich || '',
                Gia: selectedRoom.Gia || '',
                Diachi: selectedRoom.Diachi || selectedRoom.DiaChi || '',
                Loai: selectedRoom.Loai || selectedRoom.LoaiPhong || ''
            };

            const res = await createBaidangAPI(
                postData.Tieude,
                postData.Mota,
                postData.Noidung,
                postData.Anh,
                postData.Hinhanh,
                postData.Trangthai,
                postData.MaTro,
                postData.Dientich,
                postData.Gia,
                postData.Diachi,
                postData.Loai,
                postData.TenDN,
                postData.Nguoidung
            );

            if (res?.data && !res?.data?.error) {
                notification.success({
                    message: "Đăng bài thành công",
                    description: res?.data?.message || "Bài đăng đã được tạo thành công và đã được đăng lên trang chủ!",
                    duration: 3,
                    placement: "topRight",
                });
                
                // Reset form sau khi thành công
                form.resetFields();
                setImagePreview(null);
                setSelectedRoom(null);
                
                // Điều hướng về trang chủ sau 1 giây
                setTimeout(() => {
                    navigate('/');
                }, 1000);
            } else {
                throw new Error(res?.data?.message || "Có lỗi xảy ra khi tạo bài đăng");
            }
        } catch (error) {
            const errorMsg = error?.response?.data?.message || error?.message || "Lỗi không xác định";
            notification.error({
                message: "Tạo bài đăng thất bại",
                description: errorMsg,
                duration: 4,
            });
        } finally {
            setLoading(false);
        }
    };

    // Lấy danh sách phòng trọ từ API
    const fetchRooms = async () => {
        setLoadingRooms(true);
        try {
            const currentUser = user || JSON.parse(localStorage.getItem('user_info') || '{}');
            const tenDN = currentUser?.TenDN || currentUser?.tenDN || '';
            const cleanTenDN = tenDN ? String(tenDN).trim().replace(/[:]/g, '') : null;
            
            const res = await getTroAPI(cleanTenDN || null);
            let list = [];
            if (res?.data) {
                if (Array.isArray(res.data.data)) {
                    list = res.data.data;
                } else if (Array.isArray(res.data)) {
                    list = res.data;
                }
            }
            
            setRoomList(list);
        } catch (error) {
            notification.error({
                message: "Lỗi",
                description: "Không thể tải danh sách phòng trọ",
            });
        } finally {
            setLoadingRooms(false);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    // Lấy thư mục ảnh dựa trên loại phòng
    const getFolderByRoomType = (roomType) => {
        if (!roomType) {
            return '';
        }
        
        const normalizedType = roomType.trim();
        const typeKey = Object.keys(roomTypeImageMap).find(
            key => key.toLowerCase() === normalizedType.toLowerCase()
        );
        
        if (typeKey && roomTypeImageMap[typeKey]) {
            return roomTypeImageMap[typeKey].folder;
        }
        
        return '';
    };

    // Xử lý khi chọn phòng trọ
    const handleRoomChange = (value) => {
        const room = roomList.find(r => r.MaTro === value);
        if (room) {
            setSelectedRoom(room);
            const roomType = room.Loai || room.LoaiPhong || '';
            
            form.setFieldsValue({
                matro: room.MaTro,
                loai: roomType,
                dientich: room.Dientich || room.DienTich || '',
                gia: room.Gia || '',
                diachi: room.Diachi || room.DiaChi || '',
                hinhanh: undefined // Reset ảnh khi đổi phòng
            });
            setImagePreview(null);
        } else {
            setSelectedRoom(null);
            setImagePreview(null);
            form.setFieldsValue({
                hinhanh: undefined
            });
        }
    };

    // Xử lý nhập tên ảnh
    const handleImageNameChange = (e) => {
        const imageName = e.target.value.trim();
        if (!imageName) {
            setImagePreview(null);
            return;
        }

        if (!selectedRoom) {
            return;
        }
        const roomType = selectedRoom.Loai || selectedRoom.LoaiPhong || '';
        const folder = getFolderByRoomType(roomType);
        
        // Xây dựng đường dẫn ảnh đầy đủ
        let fullImagePath = '';
        if (folder) {
            // Giữ đường dẫn đầy đủ nếu đã có thư mục
            if (imageName.includes('/')) {
                fullImagePath = imageName;
            } else {
                fullImagePath = `${folder}/${imageName}`;
            }
        } else {
            // Không tìm thấy thư mục thì giữ nguyên tên file
            fullImagePath = imageName;
        }

        // Render preview ảnh
        try {
            const imagePath = new URL(`../../images/${fullImagePath}`, import.meta.url).href;
            setImagePreview(imagePath);
            // Cập nhật form với đường dẫn chuẩn hóa
            form.setFieldsValue({
                hinhanh: fullImagePath
            });
        } catch (error) {
            try {
                const imagePath = `/src/images/${fullImagePath}`;
                setImagePreview(imagePath);
                form.setFieldsValue({
                    hinhanh: fullImagePath
                });
            } catch (err) {
                setImagePreview(null);
            }
        }
    };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <Title level={2} style={{
                textAlign: 'center',
                color: '#0045A8',
                marginBottom: '30px',
                textTransform: 'uppercase'
            }}>
                THÊM BÀI ĐĂNG
            </Title>

            <Card style={{
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    autoComplete="off"
                >
                    <Form.Item
                        label="Chọn phòng trọ"
                        name="matro"
                        rules={[
                            { required: true, message: 'Vui lòng chọn phòng trọ!' },
                        ]}
                    >
                        <Select
                            placeholder="Chọn phòng trọ (bắt buộc)"
                            size="large"
                            loading={loadingRooms}
                            onChange={handleRoomChange}
                            showSearch
                            filterOption={(input, option) =>
                                (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                        >
                            {roomList.map((room) => (
                                <Option key={room._id} value={room.MaTro}>
                                    {room.MaTro} - {room.TenPhong || 'Chưa có tên'} - {room.Diachi || room.DiaChi || 'Chưa có địa chỉ'}
                                </Option>
                            ))}
                        </Select>
                        {roomList.length === 0 && !loadingRooms && (
                            <div style={{ color: '#ff4d4f', marginTop: '8px', fontSize: '12px' }}>
                                Chưa có phòng trọ nào. Vui lòng thêm phòng trọ trước khi đăng bài.
                            </div>
                        )}
                    </Form.Item>

                    {selectedRoom && (
                        <div style={{
                            padding: '16px',
                            background: '#f0f0f0',
                            borderRadius: '6px',
                            marginBottom: '24px'
                        }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '12px', color: '#333' }}>
                                Thông tin phòng trọ đã chọn:
                            </div>
                            <div style={{ fontSize: '14px', color: '#666' }}>
                                <div><strong>Mã trọ:</strong> {selectedRoom.MaTro}</div>
                                <div><strong>Địa chỉ:</strong> {selectedRoom.Diachi || selectedRoom.DiaChi || 'Chưa có'}</div>
                                <div><strong>Diện tích:</strong> {selectedRoom.Dientich || selectedRoom.DienTich || 'Chưa có'}</div>
                                <div><strong>Giá:</strong> {selectedRoom.Gia || 'Chưa có'}</div>
                                <div><strong>Loại:</strong> {selectedRoom.Loai || selectedRoom.LoaiPhong || 'Chưa có'}</div>
                            </div>
                        </div>
                    )}

                    <Form.Item
                        label="Tiêu đề bài viết"
                        name="tieude"
                        rules={[
                            { required: true, message: 'Vui lòng nhập tiêu đề bài viết!' },
                            { max: 200, message: 'Tiêu đề không được quá 200 ký tự!' }
                        ]}
                    >
                        <Input placeholder="Nhập tiêu đề bài viết" size="large" />
                    </Form.Item>

                    <Form.Item
                        label="Nội dung bài viết"
                        name="noidung"
                        rules={[
                            { required: true, message: 'Vui lòng nhập nội dung bài viết!' },
                        ]}
                    >
                        <TextArea
                            rows={10}
                            placeholder="Nhập nội dung chi tiết bài viết"
                            showCount
                            maxLength={5000}
                        />
                    </Form.Item>

                    <Form.Item name="loai" hidden>
                        <Input />
                    </Form.Item>
                    <Form.Item name="dientich" hidden>
                        <Input />
                    </Form.Item>
                    <Form.Item name="gia" hidden>
                        <Input />
                    </Form.Item>
                    <Form.Item name="diachi" hidden>
                        <Input />
                    </Form.Item>

                    <Form.Item 
                        label="Tên file ảnh" 
                        name="hinhanh"
                        help={selectedRoom ? `Nhập tên file ảnh (ví dụ: ch1.png). Hệ thống tự động thêm đường dẫn thư mục "${getFolderByRoomType(selectedRoom.Loai || selectedRoom.LoaiPhong || '')}" cho loại phòng "${selectedRoom.Loai || selectedRoom.LoaiPhong || 'Chưa có'}"` : "Vui lòng chọn phòng trọ trước để nhập tên ảnh"}
                    >
                        <Input
                            placeholder={selectedRoom ? `Nhập tên file ảnh (ví dụ: ch1.png, nnc2.png, ktx1.png)` : "Vui lòng chọn phòng trọ trước"}
                            size="large"
                            onChange={handleImageNameChange}
                            allowClear
                            disabled={!selectedRoom}
                        />
                    </Form.Item>
                    
                    {!selectedRoom && (
                        <div style={{ color: '#ff4d4f', marginTop: '-16px', marginBottom: '16px', fontSize: '12px' }}>
                            Vui lòng chọn phòng trọ trước để nhập tên ảnh
                        </div>
                    )}
                    {selectedRoom && (
                        <div style={{ color: '#1890ff', marginTop: '-16px', marginBottom: '16px', fontSize: '12px' }}>
                            Chỉ cần nhập tên file (ví dụ: ch1.png), hệ thống tự động thêm thư mục "{getFolderByRoomType(selectedRoom.Loai || selectedRoom.LoaiPhong || '')}"
                        </div>
                    )}
                    {imagePreview && (
                        <div style={{ marginTop: '12px', marginBottom: '16px' }}>
                            <div style={{ 
                                marginBottom: '8px', 
                                fontSize: '14px', 
                                color: '#666' 
                            }}>
                                Preview:
                            </div>
                            <img
                                src={imagePreview}
                                alt="Preview"
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '300px',
                                    border: '1px solid #d9d9d9',
                                    borderRadius: '4px',
                                    padding: '8px',
                                    background: '#fafafa'
                                }}
                                onError={() => {
                                    setImagePreview(null);
                                }}
                            />
                        </div>
                    )}

                    <Form.Item style={{ marginBottom: 0, marginTop: '30px' }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            block
                            size="large"
                            style={{
                                height: '50px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                backgroundColor: '#0045A8',
                                borderColor: '#0045A8'
                            }}
                        >
                            Đăng bài
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default ThemBaidangPage;

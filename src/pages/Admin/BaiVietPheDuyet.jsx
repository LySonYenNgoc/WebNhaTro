// ...existing code...
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader, Image, Row, Col, Card, Typography, Tag, Button, Divider, List, Spin, message } from "antd";
import { PhoneOutlined, ClockCircleOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { getBaidangByIdAPI } from "../../../util/api";

const { Title, Text, Paragraph } = Typography;

/**
 * Detail layout optimized to resemble the provided screenshots.
 * - Prefer semantic tags (section/article/header/aside/footer) over raw <div>.
 * - Uses Ant Design layout components for consistent spacing.
 */

const formatDateTime = (date) => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return String(date);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")} ${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

const normalize = (res) => {
    const data = res?.data ?? res;
    const item = data?.DT ?? data?.data ?? data;
    return item || null;
};

const BaiVietPheDuyet = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!id) return;
        const fetch = async () => {
            setLoading(true);
            try {
                const res = await getBaidangByIdAPI(id);
                const data = normalize(res);
                setItem(data);
            } catch (err) {
                message.error(err?.response?.data?.EM || err?.message || "Lỗi khi tải bài đăng");
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [id]);

    if (loading) return <Spin style={{ margin: 40 }} />;

    if (!item) return <section style={{ padding: 24 }}><Text>Không tìm thấy bài đăng.</Text></section>;

    const images = Array.isArray(item.Anh) ? item.Anh.filter(Boolean) : item.Anh ? [item.Anh] : [];
    const priceText = item.Gia || item.GiaThue || item.Price || "Liên hệ";
    const locationText = item.Diachi || item.DiaChi || item.Dia_chi || item.Dia_chi_full || item.TinhThanh || "";

    return (
        <section style={{ padding: 24, maxWidth: 1100, margin: "0 auto", fontFamily: "Arial, sans-serif" }}>
            <header>
                <PageHeader
                    onBack={() => navigate(-1)}
                    title={<Title level={3} style={{ margin: 0 }}>{item.Tieude || item.TieuDe || "Bài đăng"}</Title>}
                    subTitle={<Text type="secondary">{locationText}</Text>}
                />
            </header>

            <main>
                <article>
                    <Row gutter={[24, 24]}>
                        <Col xs={24} md={14}>
                            <Card bordered={false} bodyStyle={{ padding: 12 }}>
                                <Image.PreviewGroup>
                                    {images.length ? (
                                        <Row gutter={[8, 8]}>
                                            <Col span={24}>
                                                <Image src={images[0]} alt="cover" style={{ width: "100%", maxHeight: 420, objectFit: "cover" }} />
                                            </Col>
                                            {images.slice(1).map((src, idx) => (
                                                <Col xs={12} md={8} key={idx}>
                                                    <Image src={src} alt={`img-${idx}`} style={{ width: "100%", height: 120, objectFit: "cover" }} />
                                                </Col>
                                            ))}
                                        </Row>
                                    ) : (
                                        <div style={{ height: 300, display: "grid", placeItems: "center", color: "#999" }}>No image</div>
                                    )}
                                </Image.PreviewGroup>

                                <Divider />

                                <section aria-label="price-and-meta" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                                    <div>
                                        <Title level={4} style={{ margin: 0, color: "#d9480f" }}>{priceText}</Title>
                                        <Text type="secondary" style={{ display: "block" }}>{item.KhoangCach || item.DienTich ? `${item.DienTich || ""} ${item.KhoangCach || ""}` : ""}</Text>
                                    </div>
                                    <aside>
                                        <Tag icon={<ClockCircleOutlined />} color="default">{formatDateTime(item.Ngaydang || item.NgayDang || item.createdAt)}</Tag>
                                        <Tag icon={<EnvironmentOutlined />} color="default">{item.MaTro || item.MaBD || ""}</Tag>
                                    </aside>
                                </section>

                                <Divider />

                                <section aria-label="description">
                                    <Title level={5}>Mô tả</Title>
                                    <Paragraph>{item.Mota || item.MoTa || item.Description || "Không có mô tả"}</Paragraph>

                                    <List size="small" bordered={false} split={false} dataSource={[
                                        { label: "Mã bài đăng", value: item.MaBD || item._id || "" },
                                        { label: "Mã trọ", value: item.MaTro || "" },
                                        { label: "Diện tích", value: item.DienTich || item.KichThuoc || "" },
                                        { label: "Tiện nghi", value: (item.TienNghi || item.Tien_nghi || []).join?.(", ") || item.TienNghi || "—" },
                                    ]} renderItem={row => (
                                        <List.Item style={{ paddingLeft: 0, paddingRight: 0 }}>
                                            <Text strong style={{ width: 120, display: "inline-block" }}>{row.label}</Text>
                                            <Text>{row.value}</Text>
                                        </List.Item>
                                    )} />
                                </section>
                            </Card>
                        </Col>

                        <Col xs={24} md={10}>
                            <Card bordered={false} bodyStyle={{ padding: 12 }}>
                                <section aria-label="host-info">
                                    <Title level={5}>Người liên hệ</Title>
                                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        <div style={{ width: 56, height: 56, borderRadius: 8, background: "#f5f5f5", display: "grid", placeItems: "center" }}>
                                            <Text strong>{(item.Nguoidung?.TenDN || item.TenDN || "Ng")?.slice(0, 2).toUpperCase()}</Text>
                                        </div>
                                        <div>
                                            <Text strong>{item.Nguoidung?.HoTen || item.TenDN || "Chủ trọ"}</Text>
                                            <div><Text type="secondary">{item.Nguoidung?.Email || item.Email || ""}</Text></div>
                                        </div>
                                    </div>

                                    <Divider />

                                    <section aria-label="contact-actions" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                        <Button type="primary" icon={<PhoneOutlined />} size="large" block onClick={() => window.open(`tel:${item.Nguoidung?.Sdt || item.Sdt || item.phone || ""}`)}>
                                            Gọi ngay
                                        </Button>
                                        <Button size="default" block onClick={() => message.info("Mở chat (chưa triển khai)")}>Nhắn tin</Button>
                                        <Button danger ghost block onClick={() => message.info("Báo cáo (chưa triển khai)")}>Báo cáo vi phạm</Button>
                                    </section>

                                    <Divider />

                                    <section aria-label="location">
                                        <Title level={5}>Vị trí</Title>
                                        <Paragraph>{locationText || "Không có địa chỉ đầy đủ"}</Paragraph>
                                        {item.ToaDo && <Paragraph type="secondary">Toạ độ: {item.ToaDo}</Paragraph>}
                                    </section>
                                </section>
                            </Card>

                            <Card style={{ marginTop: 16 }}>
                                <Title level={5}>Thông tin thêm</Title>
                                <List size="small" bordered={false} split>
                                    <List.Item>Trạng thái: <Text strong>{item.Trangthai || item.TrangThai || "Chưa cập nhật"}</Text></List.Item>
                                    <List.Item>Ngày đăng: <Text>{formatDateTime(item.Ngaydang || item.NgayDang || item.createdAt)}</Text></List.Item>
                                    <List.Item>Liên hệ: <Text>{item.Nguoidung?.Sdt || item.Sdt || item.phone || "—"}</Text></List.Item>
                                </List>
                            </Card>
                        </Col>
                    </Row>
                </article>
            </main>

            <footer style={{ marginTop: 24, textAlign: "center", color: "#999" }}>
                <Text>© 2025 - Ứng dụng quản lý trọ</Text>
            </footer>
        </section>
    );
};

export default BaiVietPheDuyet;
// ...existing code...
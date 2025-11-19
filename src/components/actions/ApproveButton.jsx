import React from 'react';
import { Button } from 'antd';


const ApproveButton = ({ onClick, loading = false }) => {
    return (
        <Button
            type="primary"
            onClick={onClick}
            loading={loading}
            style={{
                backgroundColor: '#52c41a',
                borderColor: '#52c41a',
            }}
        >
            Phê duyệt
        </Button>
    );
};

export default ApproveButton;

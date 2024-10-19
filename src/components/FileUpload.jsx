import { useState, useCallback, useEffect } from 'react';
import { Upload, FileText, Image as ImageIcon, File, Video } from 'lucide-react';
import { Alert, Card, Input, Tabs, Tag, Button, Progress, Typography, Space } from 'antd';
import { UploadOutlined, DownloadOutlined, SearchOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;
const { Text, Title } = Typography;

export default function FileUpload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState('');
  const [fileContent, setFileContent] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [retrieveCid, setRetrieveCid] = useState('');
  const [retrieving, setRetrieving] = useState(false);

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'download';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setError('');
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleUpload = useCallback(async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      setError('');

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:31003/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      setUploadResult(result);
      //await fetchAndRenderFile(result.metadataCid);
    } catch (err) {
      setError(err.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  }, [file]);

  const handleRetrieve = async () => {
    if (!retrieveCid.trim()) {
      setError('Please enter a CID');
      return;
    }

    try {
      setRetrieving(true);
      setError('');
      await fetchAndRenderFile(retrieveCid.trim());
    } catch (err) {
      setError('Failed to retrieve file');
    } finally {
      setRetrieving(false);
    }
  };

  const fetchAndRenderFile = async (cid) => {
    try {
      const response = await fetch(`http://localhost:31003/api/file/${cid}`);
      if (!response.ok) {
        throw new Error('Failed to fetch file');
      }
      
      const blob = await response.blob();
      setFileType(blob.type);

      if (blob.type === 'application/octet-stream') {
        setFileContent(blob);
      } else if (blob.type.startsWith('image/') || blob.type.startsWith('video/') || blob.type === 'application/pdf') {
        const mediaUrl = URL.createObjectURL(blob);
        setFileContent(mediaUrl);
      } else if (blob.type.startsWith('text/') || blob.type === 'application/json') {
        const text = await blob.text();
        setFileContent(text);
      } else {
        setFileContent(blob);
      }
    } catch (err) {
      setError('Failed to fetch file');
      setFileContent(null);
      setFileType(null);
    }
  };

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
      if (fileContent && typeof fileContent === 'string' && fileContent.startsWith('blob:')) {
        URL.revokeObjectURL(fileContent);
      }
    };
  }, [preview, fileContent]);

  const FileViewer = ({ content, type }) => {
    if (!content) return null;

    if (type?.startsWith('video/')) {
      return (
        <Card>
          <video 
            controls 
            style={{ maxWidth: '100%', height: 'auto' }}
            controlsList="nodownload"
          >
            <source src={content} type={type} />
            Your browser does not support the video element.
          </video>
          <Space style={{ marginTop: '16px' }}>
            <Button 
              type="primary"
              icon={<DownloadOutlined />}
              onClick={() => downloadBlob(new Blob([content], { type }), file?.name || 'video')}
            >
              Download Video
            </Button>
          </Space>
        </Card>
      );
    }

    if (type === 'application/octet-stream' || (!type?.startsWith('image/') && !type?.startsWith('text/') && !type?.startsWith('video/') && type !== 'application/pdf' && type !== 'application/json')) {
      return (
        <Card style={{ textAlign: 'center' }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <File className="w-16 h-16" style={{ color: '#8c8c8c' }} />
            <div>
              <Title level={4} style={{ marginBottom: 8 }}>Binary File</Title>
              <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                {formatBytes(content.size)}
              </Text>
              <Tag color="blue" style={{ marginBottom: 16 }}>
                {type || 'application/octet-stream'}
              </Tag>
              <div>
                <Button 
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={() => downloadBlob(content, file?.name || 'download')}
                >
                  Download File
                </Button>
              </div>
            </div>
          </Space>
        </Card>
      );
    }

    if (type?.startsWith('image/')) {
      return (
        <Card>
          <img 
            src={content} 
            alt="Uploaded content" 
            style={{ maxWidth: '100%', height: 'auto' }} 
          />
        </Card>
      );
    }

    if (type === 'application/pdf') {
      return (
        <Card>
          <iframe
            src={content}
            title="PDF Viewer"
            style={{ width: '100%', height: '600px', border: 'none' }}
          />
        </Card>
      );
    }

    if (type?.startsWith('text/') || type === 'application/json') {
      return (
        <Card>
          <pre style={{ 
            whiteSpace: 'pre-wrap', 
            fontSize: '14px',
            fontFamily: 'monospace',
            background: '#f5f5f5',
            padding: '16px',
            borderRadius: '4px',
            overflow: 'auto'
          }}>
            {content}
          </pre>
        </Card>
      );
    }

    return (
      <Card style={{ textAlign: 'center' }}>
        <File style={{ width: 64, height: 64, color: '#8c8c8c', marginBottom: 8 }} />
        <Text type="secondary">This file type cannot be previewed</Text>
      </Card>
    );
  };

  const UploadTab = () => (
    <div
      style={{
        border: '2px dashed #d9d9d9',
        borderRadius: '8px',
        padding: '32px',
        textAlign: 'center',
        background: file ? '#f0f5ff' : '#fafafa',
        borderColor: file ? '#1890ff' : '#d9d9d9'
      }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <FileTypeIcon type={fileType} />
        </div>
        
        <div>
          <input
            type="file"
            onChange={handleFileSelect}
            disabled={uploading}
            style={{ 
              width: '100%',
              marginBottom: '16px'
            }}
          />
          
          {file && (
            <Text type="secondary">
              Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </Text>
          )}
        </div>

        {uploading && (
          <Progress percent={uploadProgress} status="active" />
        )}

        <Button
          type="primary"
          onClick={handleUpload}
          disabled={!file || uploading}
          icon={<UploadOutlined />}
          loading={uploading}
        >
          {uploading ? 'Uploading...' : 'Upload File'}
        </Button>
      </Space>
    </div>
  );

  const RetrieveTab = () => (
    <Card>
      <Space.Compact style={{ width: '100%' }}>
        <Input
          placeholder="Enter CID to retrieve file"
          value={retrieveCid}
          onChange={(e) => setRetrieveCid(e.target.value)}
          onPressEnter={handleRetrieve}
          disabled={retrieving}
        />
        <Button
          type="primary"
          onClick={handleRetrieve}
          disabled={retrieving || !retrieveCid.trim()}
          loading={retrieving}
          icon={<SearchOutlined />}
        >
          {retrieving ? 'Retrieving...' : 'Retrieve'}
        </Button>
      </Space.Compact>
    </Card>
  );

  const FileTypeIcon = ({ type }) => {
    if (type?.startsWith('image/')) return <ImageIcon style={{ width: 48, height: 48, color: '#8c8c8c' }} />;
    if (type?.startsWith('video/')) return <Video style={{ width: 48, height: 48, color: '#8c8c8c' }} />;
    if (type?.startsWith('text/')) return <FileText style={{ width: 48, height: 48, color: '#8c8c8c' }} />;
    return <Upload style={{ width: 48, height: 48, color: '#8c8c8c' }} />;
  };

  return (
    <div style={{ maxWidth: '800px', margin: '24px auto', padding: '24px' }}>
      <Tabs defaultActiveKey="1">
        <TabPane tab="Upload File" key="1">
          <UploadTab />
        </TabPane>
        <TabPane tab="Retrieve File" key="2">
          <RetrieveTab />
        </TabPane>
      </Tabs>

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginTop: '24px' }}
        />
      )}

      {uploadResult && (
        <Alert
          message="Success"
          description={`File uploaded successfully! CID: ${uploadResult.metadataCid}`}
          type="success"
          showIcon
          style={{ marginTop: '24px' }}
        />
      )}

      {fileContent && (
        <div style={{ marginTop: '24px' }}>
          <FileViewer content={fileContent} type={fileType} />
        </div>
      )}
    </div>
  );
}
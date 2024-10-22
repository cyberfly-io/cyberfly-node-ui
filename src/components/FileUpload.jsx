import { useState, useCallback, useEffect, useRef } from 'react';
import { File, Music } from 'lucide-react';
import { Alert, Card, Input, Tabs, Tag, Button, Progress,Upload, Typography, Space } from 'antd';
import { UploadOutlined, DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import { getHost } from '../services/node-services';
const { TabPane } = Tabs;
const { Text, Title, Paragraph } = Typography;

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
  const [fileList, setFileList] = useState([]);
  const[tab, setTab] = useState("1")

  const [cid, setCid] = useState(null);

  const CHUNK_SIZE =   800 * 1024; // 1MB chunks

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


  useEffect(() => {
    // Get CID on component mount
    getCIDParam();
    if(cid){
        setRetrieveCid(cid)
        setTab("2")
        setRetrieving(true)

        fetchAndRenderFile(cid).then(()=>{
            setRetrieving(false)

        })
    }
  }, [cid]);

  const getCIDParam = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const cidValue = urlParams.get('cid');
    setCid(cidValue);
  };


  const props = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      setFileList([...fileList, file]);
      setFile(file);
      setError('');
      setFileType(file.type);
      return false;
    },
    fileList,
  };

  const uploadChunk = async (chunk, chunkIndex, totalChunks, fileName) => {
    const formData = new FormData();
    formData.append('file', chunk);
    formData.append('fileName', fileName);
    formData.append('chunkIndex', chunkIndex);
    formData.append('totalChunks', totalChunks);

    const host = getHost();
    const protocol = window.location.protocol;
    const url = `${protocol}//${host}/api/upload`;

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Chunk ${chunkIndex} upload failed`);
    }

    return response.json();
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

      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      let uploadedChunks = 0;

      // Upload chunks
      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        await uploadChunk(chunk, chunkIndex, totalChunks, file.name);
        
        uploadedChunks++;
        const progress = (uploadedChunks / totalChunks) * 100;
        setUploadProgress(progress);
      }

      // Notify server that upload is complete
      const host = getHost();
      const protocol = window.location.protocol;
      const completeUrl = `${protocol}//${host}/api/upload/complete`;
      
      const completeResponse = await fetch(completeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type || 'application/octet-stream',
          totalChunks,
        }),
      });

      if (!completeResponse.ok) {
        throw new Error('Failed to complete upload');
      }

      const result = await completeResponse.json();
      setUploadResult(result);
      setUploadProgress(100);
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
      const protocol = window.location.protocol;
      const host = getHost();
      
      // First fetch metadata to get content type
      const metadataUrl = `${protocol}//${host}/api/metadata/${cid}`;
      const metadataResponse = await fetch(metadataUrl);
      
      if (!metadataResponse.ok) {
        throw new Error('Failed to fetch file metadata');
      }
      
      const metadata = await metadataResponse.json();
      setFileType(metadata.contentType);

      // For video files, we'll just set the URL for streaming
      if (metadata.contentType.startsWith('video/')) {
        const streamUrl = `${protocol}//${host}/api/file/${cid}`;
        setFileContent(streamUrl);
        return;
      }

      // For other file types, keep existing logic
      const url = `${protocol}//${host}/api/file/${cid}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch file');
      }
      
      const blob = await response.blob();
      
      if (blob.type === 'application/octet-stream') {
        setFileContent(blob);
      } else if (blob.type.startsWith('image/') || 
                 blob.type.startsWith('audio/') || 
                 blob.type === 'application/pdf') {
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

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // 4. Add this new VideoPlayer component
  const VideoPlayer = ({ src, type }) => {
    const videoRef = useRef(null);
    const [isBuffering, setIsBuffering] = useState(false);
    const [error, setError] = useState(null);
    const [loaded, setLoaded] = useState(false);
  
    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;
  
      const handleWaiting = () => setIsBuffering(true);
      const handlePlaying = () => setIsBuffering(false);
      const handleError = (e) => setError('Error loading video');
      const handleCanPlay = () => setLoaded(true);
  
      video.addEventListener('waiting', handleWaiting);
      video.addEventListener('playing', handlePlaying);
      video.addEventListener('error', handleError);
      video.addEventListener('canplay', handleCanPlay);
  
      // Optional: preload metadata
      video.preload = 'metadata';
  
      return () => {
        video.removeEventListener('waiting', handleWaiting);
        video.removeEventListener('playing', handlePlaying);
        video.removeEventListener('error', handleError);
        video.removeEventListener('canplay', handleCanPlay);
      };
    }, []);
  
    return (
      <Card>
        <div className="video-container" style={{ position: 'absolute' }}>
          <video
            ref={videoRef}
            controls
            style={{ width: '100%', height: 'auto', backgroundColor: '#000' }}
            playsInline // Better mobile support
          >
            <source src={src} type={type} />
            Your browser does not support the video tag.
          </video>
          
          {isBuffering && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(0,0,0,0.7)',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '4px',
              zIndex: 2
            }}>
              Buffering...
            </div>
          )}
          
          {error && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(255,0,0,0.7)',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '4px',
              zIndex: 2
            }}>
              {error}
            </div>
          )}
        </div>
      </Card>
    );
  };

  const FileViewer = ({ content, type }) => {
    if (!content) return null;

    if (type?.startsWith('audio/')) {
      return (
        <Card>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Music style={{ width: 48, height: 48, color: '#8c8c8c' }} />
            <audio 
              controls 
              style={{ width: '100%' }}
              controlsList="nodownload"
            >
              <source src={content} type={type} />
              Your browser does not support the audio element.
            </audio>
            <Button 
              type="primary"
              icon={<DownloadOutlined />}
              onClick={() => downloadBlob(new Blob([content], { type }), file?.name || 'audio')}
            >
              Download Audio
            </Button>
          </Space>
        </Card>
      );
    }

    if (type?.startsWith('video/')) {
        return <VideoPlayer src={content} type={type} />;
      }

    if (type === 'application/octet-stream' || 
        (!type?.startsWith('image/') && 
         !type?.startsWith('text/') && 
         !type?.startsWith('video/') && 
         !type?.startsWith('audio/') && 
         type !== 'application/pdf' && 
         type !== 'application/json')) {
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
   <>
     <Upload {...props} maxCount={1}>
        <Button icon={<UploadOutlined />}>Select File</Button>
      </Upload>
      <Button
        type="primary"
        onClick={handleUpload}
        disabled={fileList.length === 0}
        loading={uploading}
        style={{
          marginTop: 16,
        }}
      >
        {uploading ? 'Uploading' : 'Start Upload'}
      </Button>
      </>
    
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


  return (
    <div style={{ maxWidth: '800px', margin: '24px auto', padding: '24px' }}>
      <Tabs defaultActiveKey="1" activeKey={tab} onChange={(key=>{setTab(key)})}>
        <TabPane tab="Upload File" key="1">
          <UploadTab />
          {uploadProgress > 0 && (    
            <Progress percent={uploadProgress.toFixed()} percentPosition={{ align: 'center', type: 'inner' }} size={[400, 20]} />

)}
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
          description={  <Paragraph
            copyable={{
              text: `${window.location.protocol}//${window.location.host}/files?cid=${uploadResult.metadataCid}`,
            }}
          >
            <Text strong>
            File uploaded successfully! File link: {`${window.location.protocol}//${window.location.host}/files?cid=${uploadResult.metadataCid}`}
             </Text>
          </Paragraph>}  
          type="success"
          showIcon
          style={{ marginTop: '24px' }}
        />
      )}
        </TabPane>
        <TabPane tab="Retrieve File" key="2">
          <RetrieveTab />
          {fileContent && (
        <div style={{ marginTop: '24px' }}>
          <FileViewer content={fileContent} type={fileType} />
        </div>
      )}
        </TabPane>
      </Tabs>

    

  
    </div>
  );
}
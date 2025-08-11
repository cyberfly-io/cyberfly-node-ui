import { useState, useCallback, useEffect, useRef } from 'react';
import { File, Music } from 'lucide-react';
import { Alert, Card, Input, Tabs, Tag, Button, Progress,Upload, Typography, Space } from 'antd';
import { UploadOutlined, DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import { createHelia } from 'helia'
import { unixfs } from '@helia/unixfs'
import { getHost } from '../services/node-services';
import { signFileCID } from '../services/pact-services';
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

  // NEW: byte-accurate progress states
  const [uploadBytes, setUploadBytes] = useState(0);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadBytes, setDownloadBytes] = useState(0);
  const [downloadTotal, setDownloadTotal] = useState(0);
  const [downloadName, setDownloadName] = useState('');
  const [downloadBlobData, setDownloadBlobData] = useState(null);

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
      setFile(null);
      setUploadProgress(0);
      setUploadBytes(0);
    },
    beforeUpload: (file) => {
      setFileList([...fileList, file]);
      setFile(file);
      setError('');
      setFileType(file.type);
      // reset upload progress
      setUploadProgress(0);
      setUploadBytes(0);
      return false;
    },
    fileList,
  };
  
  async function getFileHashOnly(info) {
    const file = info?.fileList[0]?.originFileObj
    
    if (!file) {
      throw new Error('No file provided')
    }
  
    const helia = await createHelia()
    const fs = unixfs(helia)
    
    try {
      // Convert File to bytes
      const fileBuffer = new Uint8Array(await file.arrayBuffer())
      
      // Get CID using addBytes (matches server-side logic)
      const cid = await fs.addBytes(fileBuffer)
      
      return cid
    } catch (error) {
      console.error('Detailed error:', error)
      throw new Error(`Failed to calculate hash: ${error.message}`)
    } finally {
      await helia.stop()
    }
  }

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
      setUploadBytes(0);
      setError('');

      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      let uploadedBytes = 0;

      // Upload chunks
      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        await uploadChunk(chunk, chunkIndex, totalChunks, file.name);

        uploadedBytes += (end - start);
        setUploadBytes(uploadedBytes);
        const progress = (uploadedBytes / file.size) * 100;
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
      setUploadBytes(file.size);
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
      setDownloadName(metadata?.fileName || metadata?.filename || metadata?.name || cid);
      setDownloadBytes(0);
      setDownloadProgress(0);
      setDownloadTotal(Number(metadata?.size) || 0);

      // For video files, use streaming URL (progress not tracked for streaming)
      if (metadata.contentType.startsWith('video/')) {
        const streamUrl = `${protocol}//${host}/api/file/${cid}`;
        setFileContent(streamUrl);
        return;
      }

      // For other file types, fetch with progress
      const url = `${protocol}//${host}/api/file/${cid}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch file');
      }

     // Try to extract filename from Content-Disposition header (if present)
     const cd = response.headers.get('Content-Disposition');
     if (cd) {
       const match = /filename\*=UTF-8''([^;]+)|filename="?([^"]+)"?/i.exec(cd);
       const headerName = match ? decodeURIComponent(match[1] || match[2]) : null;
       if (headerName) setDownloadName(headerName);
     }

      const totalFromHeader = Number(response.headers.get('Content-Length')) || 0;
      const total = totalFromHeader || Number(metadata?.size) || 0;
      if (total) setDownloadTotal(total);

      // If stream is not readable, fallback to normal blob (no progress)
      if (!response.body || !response.body.getReader) {
        const blob = await response.blob();
        setDownloadBytes(blob.size || total);
        setDownloadProgress(100);
        setDownloadBlobData(blob);
        await handleBlobToViewer(blob, metadata.contentType);
        return;
      }

      const reader = response.body.getReader();
      const chunks = [];
      let received = 0;

      // ReadableStream loop
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;
        setDownloadBytes(received);
        if (total) {
          setDownloadProgress((received / total) * 100);
        }
      }

      const blob = new Blob(chunks, { type: metadata.contentType || response.headers.get('Content-Type') || 'application/octet-stream' });
      if (!total) {
        setDownloadTotal(blob.size);
        setDownloadProgress(100);
      }
      setDownloadBlobData(blob);
      await handleBlobToViewer(blob, metadata.contentType);
    } catch (err) {
      setError('Failed to fetch file');
      setFileContent(null);
      setFileType(null);
      setDownloadProgress(0);
      setDownloadBytes(0);
      setDownloadTotal(0);
      setDownloadBlobData(null);
    }
  };

  // Helper to convert blob to appropriate viewer content
  const handleBlobToViewer = async (blob, mime) => {
    // Keep a copy of the blob for accurate downloads with filename
    try { setDownloadBlobData(blob); } catch {}
    if (mime === 'application/octet-stream') {
      setFileContent(blob);
      return;
    }
    if (mime?.startsWith('image/') || mime?.startsWith('audio/') || mime === 'application/pdf') {
      const mediaUrl = URL.createObjectURL(blob);
      setFileContent(mediaUrl);
      return;
    }
    if (mime?.startsWith('text/') || mime === 'application/json') {
      const text = await blob.text();
      setFileContent(text);
      return;
    }
    setFileContent(blob);
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
      const handleError = () => setError('Error loading video');
      const handleCanPlay = () => setLoaded(true);
  
      video.addEventListener('waiting', handleWaiting);
      video.addEventListener('playing', handlePlaying);
      video.addEventListener('error', handleError);
      video.addEventListener('canplay', handleCanPlay);
  
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
        <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%' }}>
          <video
            ref={videoRef}
            controls
            style={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: '#000'
            }}
            playsInline
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
              padding: '8px 16px',
              borderRadius: '4px',
              zIndex: 10
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
              padding: '8px 16px',
              borderRadius: '4px',
              zIndex: 10
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
            <div style={{ textAlign: 'center' }}>
              <Music style={{ width: 48, height: 48, color: '#bfbfbf' }} />
            </div>
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
              block
              onClick={() => downloadBlob(
                downloadBlobData || new Blob([], { type }),
                downloadName || 'audio'
              )}
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
        <Card>
          <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center' }}>
            <File style={{ width: 64, height: 64, color: '#bfbfbf', margin: '0 auto' }} />
            <div>
              <Title level={4} style={{ marginBottom: 8 }}>Binary File</Title>
              <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                {downloadBlobData ? formatBytes(downloadBlobData.size) : '-'}
              </Text>
              <Tag color="blue" style={{ marginBottom: 16 }}>
                {type || 'application/octet-stream'}
              </Tag>
              <Button 
                type="primary"
                icon={<DownloadOutlined />}
                onClick={() => downloadBlob(downloadBlobData || content, downloadName || 'download')}
                block
              >
                Download File
              </Button>
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
            style={{ width: '100%', height: 'auto' }} 
          />
         <Button
           style={{ marginTop: 12 }}
           icon={<DownloadOutlined />}
           onClick={() => downloadBlob(downloadBlobData, downloadName || 'image')}
           block
         >
           Download Image
         </Button>
        </Card>
      );
    }

    if (type === 'application/pdf') {
      return (
        <Card>
          <iframe
            src={content}
            title="PDF Viewer"
            style={{ 
              width: '100%', 
              height: '600px',
              border: 'none',
              '@media (max-width: 768px)': {
                height: '400px'
              }
            }}
          />
         <Button
           style={{ marginTop: 12 }}
           icon={<DownloadOutlined />}
           onClick={() => downloadBlob(downloadBlobData, downloadName || 'document.pdf')}
           block
         >
           Download PDF
         </Button>
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
            overflow: 'auto',
            maxHeight: '600px'
          }}>
            {content}
          </pre>
         <Button
           style={{ marginTop: 12 }}
           icon={<DownloadOutlined />}
           onClick={() => downloadBlob(downloadBlobData, downloadName || 'text.txt')}
           block
         >
           Download File
         </Button>
        </Card>
      );
    }

    return (
      <Card style={{ textAlign: 'center' }}>
        <File style={{ width: 64, height: 64, color: '#bfbfbf', marginBottom: 8 }} />
        <Text type="secondary">This file type cannot be previewed</Text>
      </Card>
    );
  };

  const UploadTab = () => (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Upload {...props} maxCount={1} onChange={(fil)=>{
        /*getFileHashOnly(fil).then(cid=>{console.log(cid.toString())
          signFileCID(cid.toString()).then((signed)=>{
            console.log(signed)
          })
        })*/
      }}>
        <Button icon={<UploadOutlined />} block>Select File</Button>
      </Upload>

      {file && (
        <Card size="small">
          <Space size="small" wrap>
            <Text strong>{file.name}</Text>
            <Tag>{fileType || file.type || 'unknown'}</Tag>
            <Text type="secondary">{formatBytes(file.size)}</Text>
          </Space>
        </Card>
      )}

      <Button
        type="primary"
        onClick={handleUpload}
        disabled={fileList.length === 0}
        loading={uploading}
        block
      >
        {uploading ? 'Uploading' : 'Start Upload'}
      </Button>
    </Space>
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

      {(retrieving || downloadProgress > 0) && (
        <div style={{ marginTop: 16 }}>
          <Text type="secondary">
            Downloading {downloadName || retrieveCid}
          </Text>
          <Progress
            percent={Number(downloadProgress.toFixed())}
            status={retrieving ? 'active' : 'normal'}
            format={() =>
              `${formatBytes(downloadBytes)}${downloadTotal ? ' / ' + formatBytes(downloadTotal) : ''}`
            }
          />
        </div>
      )}
    </Card>
  );


  return (
    <div style={{ maxWidth: 800, margin: '24px auto', padding: '16px' }}>
      <Tabs defaultActiveKey="1" activeKey={tab} onChange={key => setTab(key)}>
        <TabPane tab="Upload File" key="1">
          <UploadTab />
          {uploadProgress > 0 && (
            <div style={{ marginTop: 16 }}>
              <Progress 
                percent={Number(uploadProgress.toFixed())}
                status="active"
                format={() =>
                  `${formatBytes(uploadBytes)}${file ? ' / ' + formatBytes(file.size) : ''}`
                }
              />
            </div>
          )}
          {error && (
            <Alert
              message="Error"
              description={error}
              type="error"
              showIcon
              style={{ marginTop: 24 }}
            />
          )}
          {uploadResult && (
            <Alert
              message="Success"
              description={
                <Paragraph
                  copyable={{
                    text: `${window.location.protocol}//${window.location.host}/files?cid=${uploadResult.metadataCid}`,
                  }}
                  style={{ wordBreak: 'break-all' }}
                >
                  <Text strong>
                    File uploaded successfully! File link: {`${window.location.protocol}//${window.location.host}/files?cid=${uploadResult.metadataCid}`}
                  </Text>
                </Paragraph>
              }
              type="success"
              showIcon
              style={{ marginTop: 24 }}
            />
          )}
        </TabPane>
        <TabPane tab="Retrieve File" key="2">
          <RetrieveTab />
          {fileContent && (
            <div style={{ marginTop: 24 }}>
              <FileViewer content={fileContent} type={fileType} />
            </div>
          )}
        </TabPane>
      </Tabs>
    </div>
  );
}
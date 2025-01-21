import { PageContainer } from '@ant-design/pro-components'
import { Button, Result,  message as msg } from 'antd';
import { genKeyPair } from '@kadena/cryptography-utils';

import React, { useEffect, useState } from 'react'
import { Modal } from 'antd';
import { Card } from 'antd';


const KadenaTools = () => {
const [messageApi, contextHolder] = msg.useMessage();

  const [keypair, setKeypair] = useState(null)

  function saveAsFile(text, filename) {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = filename;
    
    // Append link, click it, and remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL
    URL.revokeObjectURL(url);
}
  return (
   <PageContainer title="Kadena Tools">
{contextHolder}
<Result
    title="Generate a private key for a node"
    extra={
      <Button type="primary" key="privatekey" onClick={() => {
        const keypair = genKeyPair();
        setKeypair(keypair)
        saveAsFile(keypair.secretKey, `privatekey-${keypair.secretKey.substr(0, 10)}.txt`)
      }}>
       Generate
      </Button>
    }
  />

<Modal title="Save private Key in safe place" open={keypair} okText="Copy" onOk={() => {
  navigator.clipboard.writeText(keypair.secretKey)
  messageApi.open({type:"success", content:"Copied to clipboard"})
}} onCancel={() => setKeypair(null)}>

<Card>
  <p>Private Key: { keypair? keypair.secretKey.substr(0, 20) + '...':''}</p>
</Card>
</Modal>

   </PageContainer>
  )
}

export default KadenaTools
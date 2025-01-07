import { PageContainer } from '@ant-design/pro-components'
import React, { useState } from 'react'
import { notification } from 'antd';
import { useDarkMode } from '../contexts/DarkModeContext';

const NodeList = () => {
  const [api, contextHolder] = notification.useNotification();
  const [peerInfo, setPeerInfo] = useState(null)
  const { isDarkMode } = useDarkMode();



  return (
   <PageContainer title="Active Nodes">


   </PageContainer>
  )
}

export default NodeList
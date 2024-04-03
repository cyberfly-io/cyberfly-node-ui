import { PageContainer } from '@ant-design/pro-components'
import React, { useEffect, useState } from 'react'
import { getNode } from '../services/pact-services'
import { getNodeInfo } from '../services/node-services'

const Settings = () => {
  const [nodeInfo, setNodeInfo] = useState(null)

  useEffect(()=>{
  getNodeInfo().then((data)=>{
   setNodeInfo(data)
  })
  },[])

  useEffect(()=>{
   if(nodeInfo){
    getNode(nodeInfo.peerId).then((data)=>{
      console.log(data);
    })
   }
  }, [nodeInfo])
  return (
    <PageContainer title="settings">

    </PageContainer>
  )
}

export default Settings
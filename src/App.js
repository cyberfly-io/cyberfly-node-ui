import {  Flex, Layout, ConfigProvider, theme, notification } from 'antd'
import React, { useEffect, useState } from 'react'
import { Route, BrowserRouter, Routes } from 'react-router-dom';
import Tools from './pages/tools'
import Settings from './pages/settings'
import Sidebar from './components/Sidebar'
import "./App.css"
import CustomHeader from './components/CustomHeader'
import MainContent from './components/MainContent'
import { useDarkMode } from './contexts/DarkModeContext';
import PubSubPage from './pages/pubsub';
import { startLibp2pNode } from './services/libp2p-services';
import { useLibp2p } from './contexts/Libp2pContext';
import { multiaddr } from '@multiformats/multiaddr'
import { bootStrapNode } from './constants/contextConstants';
import { toString } from 'uint8arrays/to-string'


const {Sider, Header, Content} = Layout
const { defaultAlgorithm, darkAlgorithm } = theme;




const App = () => {
  const [collapsed, setCollapsed] = useState(false)
  const { isDarkMode } = useDarkMode();
  const { libp2pState ,setLibp2pState, topics, setSignal, signal }  = useLibp2p();
  const [api, contextHolder] = notification.useNotification();

  useEffect(()=>{
    async function startLibp2p (){
      const lib = await startLibp2pNode()
      setLibp2pState(lib)
    }
    startLibp2p();
  },[])

  useEffect(()=>{
if(libp2pState){
  const ma = multiaddr(bootStrapNode)
  libp2pState.dial(ma).then((data)=>{
    console.log(data)
    api.success({message:"Connected"})
  })
  libp2pState.addEventListener('peer:connect', (evt) => {
    const peerId = evt.detail
    setSignal(signal+1)
    console.log('Connection established to:', peerId.toString()) // Emitted when a peer has been found
  })
  
  libp2pState.addEventListener('peer:discovery', (evt) => {
    const peerInfo = evt.detail
    setSignal(signal+1)
    console.log('Discovered:', peerInfo.id.toString())
    console.log(peerInfo)
  })
  libp2pState.addEventListener('peer:disconnect', (evt) => {
    const peerInfo = evt.detail
    setSignal(signal+1)
  })
}


  },[libp2pState])

  useEffect(()=>{
 if(libp2pState){
  libp2pState.services.pubsub.addEventListener('message', event => {
    const topic = event.detail.topic
    const message = toString(event.detail.data)
   if(topics.includes(topic)){
    api.info({message:`message received for topic- ${topic}`, description:message,placement:"topRight"})
   }
   else{

   }

  })
 }
  }, [topics])
 

  return (
    <BrowserRouter>
      <ConfigProvider theme={{algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm}}>

    <Layout>
      {contextHolder}
      <Sider collapsible   
 collapsed={collapsed} theme={isDarkMode? 'dark':'light'} className='sider' onCollapse={(value) => setCollapsed(value)}
 >
        <Sidebar/>

        </Sider>
      <Layout>
        <Header className='header' style={{backgroundColor:isDarkMode? '#000':'#fff'}}>
          <CustomHeader/>
        </Header>
        <Content className='content'>
          <Flex gap={'large'}>
        
         <Routes>
         <Route path="/">
      <Route index element={<MainContent />} />
      <Route path="/tools" element={<Tools />} />
      <Route path='/pubsub' element={<PubSubPage/>} />
      <Route path="/settings" element={<Settings />} />
    </Route>
    </Routes>
        
           
          </Flex>
        </Content>
      </Layout>
    </Layout>
    </ConfigProvider>

    </BrowserRouter>
  )
}

export default App

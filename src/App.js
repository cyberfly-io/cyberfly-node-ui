import {  Flex, ConfigProvider, theme, notification, Button, Avatar, Dropdown, Modal, Typography } from 'antd'
import React, { useEffect, useState } from 'react'
import { Route, BrowserRouter, Routes, Link } from 'react-router-dom';
import Tools from './pages/tools'
import Settings from './pages/settings'
import "./App.css"
import MainContent from './components/MainContent'
import { useDarkMode } from './contexts/DarkModeContext';
import PubSubPage from './pages/pubsub';
import { startLibp2pNode } from './services/libp2p-services';
import { useLibp2p } from './contexts/Libp2pContext';
import { multiaddr } from '@multiformats/multiaddr'
import { bootStrapNode } from './constants/contextConstants';
import { toString } from 'uint8arrays/to-string'
import ProLayout from '@ant-design/pro-layout';
import defaultProps from './components/defaultprops';
import {SunOutlined, MoonOutlined, UserOutlined, WalletOutlined} from '@ant-design/icons'
import { useEckoWalletContext } from "./contexts/eckoWalletContext";
import { TrackerCard } from '@kadena/react-ui';
import Dialer from './pages/dialer';
const { defaultAlgorithm, darkAlgorithm } = theme;

const { Paragraph } = Typography;



const App = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { libp2pState ,setLibp2pState, topics, setSignal, signal }  = useLibp2p();
  const [api, contextHolder] = notification.useNotification();
  const [pathname, setPathname] = useState('/');

  useEffect(()=>{
    async function startLibp2p (){
      const lib = await startLibp2pNode()
      setLibp2pState(lib)
    }
    startLibp2p();
  // eslint-disable-next-line
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
    console.log('Disconnected:', peerInfo)
    setSignal(signal+1)
  })
}


  // eslint-disable-next-line 
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topics])
 
  const [open, setOpen] = useState(false);
  const showModal = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };
  const {initializeEckoWallet, account, disconnectWallet  } = useEckoWalletContext()
 
  const items = [
    {
      label: account? <Button type="primary" onClick={showModal} icon={<Avatar size={24} icon={<UserOutlined />}/>}>Account</Button>:<Button onClick={async ()=>{
        initializeEckoWallet()
      }}  icon={<Avatar size={24} src={<img src={"https://wallet.ecko.finance/icon_eckoWALLET.svg?v=2"} alt="avatar" />} />}>EckoWallet</Button>,
      key: '0',
    },
  ];

  return (
    <BrowserRouter>
      <ConfigProvider theme={{algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm}}>

    <ProLayout {...defaultProps}
 title="Cyberfly Node" logo="https://cyberfly.io/assets/images/newlogo.png"
 location={{
  pathname,
}}
 onMenuHeaderClick={(e) => console.log(e)}
 menuItemRender={(item, dom) => (
  <Link to={item.path} onClick={() => {
    setPathname(item.path || '/');
  }}>{dom}</Link>
 )}
actionsRender={(props)=>{
  return (<>  <Button onClick={toggleDarkMode} icon={isDarkMode? <SunOutlined />: <MoonOutlined />}/>
  <Dropdown
  menu={{
    items,
  }}
  trigger={['click']}
>
 <Button icon={<WalletOutlined />}></Button>
</Dropdown></>)
}}

    >
      {contextHolder}
    
  
   
       
    <Flex gap={'large'}>
  
   <Routes>
   <Route path="/">
<Route index element={<MainContent />} />
<Route path="/tools" element={<Tools />} />
<Route path='/pubsub' element={<PubSubPage/>} />
<Route path="/settings" element={<Settings />} />
<Route path="/dialer" element={<Dialer />} />

</Route>
</Routes>
  
     
    </Flex>
    
   
    </ProLayout>
    <Modal title="Account" open={open} onCancel={onClose} cancelText="Cancel" okText="LogOut" onOk={()=>{
          setOpen(false)
          disconnectWallet()
        }}>
       

       <TrackerCard
  icon="KadenaOverview"
  labelValues={[
    {
      isAccount: true,
      label: 'Account',
      value: account
    },
   {
    label: <Paragraph copyable={{ text: account }} style={{float:"right"}}/>
   }
  ]}
  variant="vertical"
/>

      </Modal>
    </ConfigProvider>

    </BrowserRouter>
  )
}

export default App

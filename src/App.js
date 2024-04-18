import {  Flex, ConfigProvider, theme, Button, Avatar, Dropdown, Modal, Typography } from 'antd'
import React, { useState } from 'react'
import { Route, BrowserRouter, Routes, Link } from 'react-router-dom';
import Tools from './pages/tools'
import Settings from './pages/settings'
import "./App.css"
import MainContent from './components/MainContent'
import { useDarkMode } from './contexts/DarkModeContext';
import PubSubPage from './pages/pubsub';

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
  const [pathname, setPathname] = useState('/');

 
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
token={{bgLayout: isDarkMode? "linear-gradient(62deg, rgba(64,85,143,0.8155637254901961) 0%, rgba(48,20,66,0.9416141456582633) 100%)":"linear-gradient(62deg, #E0C3FC 0%, #8EC5FC 100%)"}}
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

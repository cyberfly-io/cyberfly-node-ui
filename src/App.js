import {  Flex, ConfigProvider, theme, Button, Avatar, Dropdown, Modal, Typography } from 'antd'
import React, { useState } from 'react'
import { Route, BrowserRouter, Routes, Link } from 'react-router-dom';
import Tools from './pages/db-tools'
import Settings from './pages/settings'
import "./App.css"
import MainContent from './components/MainContent'
import { useDarkMode } from './contexts/DarkModeContext';
import PubSubPage from './pages/pubsub';
import ProLayout from '@ant-design/pro-layout';
import defaultProps from './components/defaultprops';
import {SunOutlined, MoonOutlined, UserOutlined, WalletOutlined, MenuUnfoldOutlined, MenuFoldOutlined} from '@ant-design/icons'
import { useKadenaWalletContext } from "./contexts/kadenaWalletContext";
import { TrackerCard } from '@kadena/kode-ui';
import Dialer from './pages/dialer';
import NodeMap from './pages/node-map';
import WebcamStreaming from './pages/stream';
import MyNode from './pages/mynode';
import enUS from 'antd/locale/en_US';
import Faucet from './pages/faucet';
import Files from './pages/files';
import KadenaTools from './pages/kadena-tools';
import NodeList from './pages/nodelist';
import NodeDetail from './pages/node';
import BLEPage from './pages/ble';

const { defaultAlgorithm, darkAlgorithm } = theme;

const { Paragraph } = Typography;



const App = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [pathname, setPathname] = useState('/');
  const [open, setOpen] = useState(false);
  const bg = isDarkMode ? "linear-gradient(135deg, #000066 0%, #003366 50%, #004d4d 100%)" : "linear-gradient(135deg, #0061ff 0%, #60efff 50%, #00ff87  100%);";
  const showModal = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };
  const {initializeKadenaWallet, account, disconnectWallet  } = useKadenaWalletContext()
  
  const items = [
    {
      label: account? <Button type="primary" onClick={showModal} icon={<Avatar size={24} icon={<UserOutlined />}/>}>Account</Button>:<><Button onClick={()=>initializeKadenaWallet("eckoWallet")}  icon={<Avatar size={24} src={<img src={"https://wallet.ecko.finance/icon_eckoWALLET.svg?v=2"} alt="avatar" />} />}>EckoWallet</Button></>,
      key: '0',
    },
  ];

  return (
    <BrowserRouter>
      <ConfigProvider theme={{algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm}} locale={enUS}>

    <ProLayout {...defaultProps}
 title="Cyberfly Node" logo="https://cyberfly.io/assets/images/newlogo.png"
 location={{
  pathname,
}}
token={{bgLayout: bg}}
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

</Dropdown>
</>)
}}

    >
    
  
   
       
    <Flex gap={'large'}>
  
   <Routes>
   <Route path="/">
<Route index element={<MainContent />} />
<Route path='/mynode' element={<MyNode/>} />
<Route path="/tools" element={<Tools />} />
<Route path="/files" element={<Files />} />
<Route path='/pubsub' element={<PubSubPage/>} />
<Route path="/settings" element={<Settings />} />
<Route path="/dialer" element={<Dialer />} />
<Route path='/ble' element={<BLEPage />} />

<Route path="/map" element={<NodeMap />} />
<Route path="/stream" element={<WebcamStreaming />} />
<Route path="/faucet" element={<Faucet />} />
<Route path="/kadena-tools" element={<KadenaTools />} />
<Route path="/nodes" element={<NodeList />} />
<Route path="/node/:peerId" element={<NodeDetail />} />







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

  ]
  }
  variant="horizontal"
/>

      </Modal>
    </ConfigProvider>

    </BrowserRouter>
  )
}

export default App

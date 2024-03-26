import {  Flex, Layout, ConfigProvider, theme } from 'antd'
import React, { useState } from 'react'
import { Route, BrowserRouter, Routes } from 'react-router-dom';
import Tools from './pages/tools'
import Settings from './pages/settings'
import Sidebar from './components/Sidebar'
import "./App.css"
import CustomHeader from './components/CustomHeader'
import MainContent from './components/MainContent'
import { useDarkMode } from './contexts/DarkModeContext';
import PubSubPage from './pages/pubsub';



const {Sider, Header, Content} = Layout
const { defaultAlgorithm, darkAlgorithm } = theme;




const App = () => {
  const [collapsed, setCollapsed] = useState(false)
  const { isDarkMode } = useDarkMode();


  return (
    <BrowserRouter>
      <ConfigProvider theme={{algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm}}>

    <Layout>
      <Sider collapsible collapsed={collapsed} theme={isDarkMode? 'dark':'light'} className='sider' onCollapse={(value) => setCollapsed(value)}>
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

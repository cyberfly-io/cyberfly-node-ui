import { DashboardOutlined, DatabaseOutlined, MessageOutlined } from '@ant-design/icons';
import { Flex, Menu, Image } from 'antd'
import React from 'react'
import { Outlet, Link } from 'react-router-dom';
import { useDarkMode } from '../contexts/DarkModeContext';

const Sidebar = () => {
  const { isDarkMode } = useDarkMode();

  return (
    <div>
 
      <Flex align='center' justify='center'>
        <div className="logo"><Image preview={false} height={80} src='https://cyberfly.io/assets/images/newlogo.png'></Image>
      
        </div>
     
      </Flex>
   

      <Menu mode='inline' defaultSelectedKeys={['1']} className='menu-bar'
      theme={isDarkMode? 'dark':'light'}
      
      items={[
        {
            key:'1',
            icon: <DashboardOutlined />,
            label: <Link to="/">Dashboard</Link>,
        },
        {
            key:'2',
            icon: <DatabaseOutlined />,
            label: <Link to="/tools">DB Tools</Link>,
        },
        {
          key:'3',
          icon: <MessageOutlined />,
          label: <Link to="/pubsub">Pub Sub</Link>,
      }
      ]}
      />
      <Outlet/>
    </div>
  )
}

export default Sidebar

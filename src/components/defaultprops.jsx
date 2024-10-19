import {
    MessageOutlined,
    DatabaseOutlined,
    DashboardOutlined,
    ArrowsAltOutlined,
    VideoCameraOutlined,
    CloudServerOutlined,
    TransactionOutlined,
    FileAddOutlined
    } from '@ant-design/icons';
    import { FiMapPin } from "react-icons/fi";

const config = {
  route: {
    path: '/',
    routes: [
      {
        path: '/',
        name: 'Dashboard',
        icon: <DashboardOutlined />,
        component: './MainContent',
      },
      {
        path: '/mynode',
        name: 'My Node',
        icon: <CloudServerOutlined />,
        component: '../pages/mynode',
      },
      {
        path: '/map',
        name: 'Node Map',
        icon: <FiMapPin />,
        component: '../pages/tools',
      },
      {
        path: '/tools',
        name: 'DB tools',
        icon: <DatabaseOutlined />,
        component: '../pages/tools',
      },
  
      {
        path: '/pubsub',
        name: 'Pub Sub',
        icon: <MessageOutlined />,
        component: '../pages/tools',
      },
      {
        path: '/files',
        name: 'Files',
        icon: < FileAddOutlined/>,
        component: '../pages/files',
      },
      /*{
        path: '/stream',
        name: 'Stream',
        icon: <VideoCameraOutlined />,
        component: '../pages/stream',
      },*/
      {
        path: '/dialer',
        name: 'Connection checker',
        icon: <ArrowsAltOutlined />,
        component: '../pages/dialer',
      },
      {
        path: '/faucet',
        name: 'Testnet Faucet',
        icon: <TransactionOutlined />,
        component: '../pages/faucet',
      },
    ],
  },
  location: {
    pathname: '/',
  },
  appList: [
    {
      icon: 'https://dev.cyberfly.io/cfly-logo-twitter.png',
      title: 'Cyberfly Testnet app',
      desc: 'Decentralised IoT platform',
      url: 'https://dev.cyberfly.io/',
    },
    
  ],
};


  export default config
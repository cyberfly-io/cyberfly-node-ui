import {
   
    MessageOutlined,
    DatabaseOutlined,
    DashboardOutlined
  } from '@ant-design/icons';
  
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
        path: '/tools',
        name: 'Db tools',
        icon: <DatabaseOutlined />,
        component: '../pages/tools',
      },
      {
        path: '/pubsub',
        name: 'Pub Sub',
        icon: <MessageOutlined />,
        component: '../pages/tools',
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
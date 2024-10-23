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
      icon: 'https://cyberfly.io/assets/images/newlogo.png',
      title: 'Cyberfly IoT Testnet app',
      desc: 'Decentralised IoT platform',
      url: 'https://dev.cyberfly.io/',
    },

    {
      icon: 'https://upload.wikimedia.org/wikipedia/commons/1/17/GraphQL_Logo.svg',
      title: 'Cyberfly Node GraphQL',
      desc: 'Decentralised database query',
      url: 'https://node.cyberfly.io/graphql',
    },
  ],
};


  export default config
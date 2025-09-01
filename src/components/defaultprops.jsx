import {
    Dashboard,
    Message,
    Storage,
    Hub,
    Call,
    Cloud,
    Receipt,
    UploadFile,
    Lan
    } from '@mui/icons-material';
import { FiMapPin } from "react-icons/fi";
import { KRoundedKdacolorBlack } from '@kadena/kode-icons/brand'
import { getHost } from '../services/node-services';

const config = {
  route: {
    path: '/',
    routes: [
      {
        path: '/',
        name: 'Dashboard',
        icon: <Dashboard />,
        component: './MainContent',
      },
      {
        path: '/mynode',
        name: 'My Nodes',
        icon: <Cloud />,
        component: '../pages/mynode',
      },
      {
        path: '/nodes',
        name: 'Nodes',
        icon: <Lan />,
        component: '../pages/nodelist',
      },
      {
        path: '/tools',
        name: 'DB tools',
        icon: <Storage />,
        component: '../pages/db-tools',
      },
  
      {
        path: '/pubsub',
        name: 'Pub Sub',
        icon: <Message />,
        component: '../pages/pubsub',
      },
       /*{
        path: '/files',
        name: 'Files',
        icon: < FileAddOutlined/>,
        component: '../pages/files',
      },
     
      {
        path: '/map',
        name: 'Node Map',
        icon: <FiMapPin />,
        component: '../pages/tools',
      },
      {
        path: '/stream',
        name: 'Stream',
        icon: <VideoCameraOutlined />,
        component: '../pages/stream',
      },*/
      {
        path: '/dialer',
        name: 'Connection checker',
        icon: <Call />,
        component: '../pages/dialer',
      },
      /*{
        path: '/faucet',
        name: 'Testnet Faucet',
        icon: <TransactionOutlined />,
        component: '../pages/faucet',
      },*/
      {
        path: '/kadena-tools',
        name: 'Kadena tools',
        icon: <KRoundedKdacolorBlack/>,
        component: '../pages/kadena-tools',
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
      url: `${window.location.protocol}//${getHost()}/graphql`,
    },
  ],
  // Mobile responsive settings
  siderWidth: 280,
  collapsedWidth: 0,
  breakpoint: 'lg',
  collapsedButtonRender: false,
  menu: {
    type: 'group',
    autoClose: false,
  },
  header: {
    height: 64,
  },
  content: {
    style: {
      padding: '24px',
      '@media (max-width: 768px)': {
        padding: '16px',
      },
      '@media (max-width: 480px)': {
        padding: '12px',
      },
    },
  },
};


  export default config
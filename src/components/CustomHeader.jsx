import {
  WalletOutlined,
    MoonOutlined,
    SunOutlined,
    UserOutlined
  } from "@ant-design/icons";
  import { Dropdown, Flex, Typography, Button,Modal , Avatar} from "antd";

  import React,{useState} from "react";
  import { useDarkMode } from '../contexts/DarkModeContext';
import { useEckoWalletContext } from "../contexts/eckoWalletContext";
import { TrackerCard } from '@kadena/react-ui';
const { Paragraph } = Typography;

  const CustomHeader = () => {
    const { isDarkMode, toggleDarkMode } = useDarkMode();
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
   
      <Flex className="center" justify="space-between">
        <Typography.Title level={4} >Cyberfly node</Typography.Title>
  
        <Flex align="center" gap={"3rem"}>
          <Flex align="cneter" gap={"10px"}>
    
      <Button onClick={toggleDarkMode} icon={isDarkMode? <SunOutlined />: <MoonOutlined />}/>
      

      <Dropdown
    menu={{
      items,
    }}
    trigger={['click']}
  >
   <Button icon={<WalletOutlined />}></Button>
  </Dropdown>
          </Flex>
        </Flex>
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
      </Flex>
    );
  };
  
  export default CustomHeader;
  
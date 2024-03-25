import {

    UserOutlined,
    MoonOutlined,
    SunOutlined
  } from "@ant-design/icons";
  import { Avatar, Flex, Typography, Button } from "antd";

  import React from "react";
  import { useDarkMode } from '../contexts/DarkModeContext';

  const CustomHeader = () => {
    const { isDarkMode, toggleDarkMode } = useDarkMode();

    return (
   
      <Flex className="center" justify="space-between">
        <Typography.Title level={4} >Cyberfly node</Typography.Title>
  
        <Flex align="center" gap={"3rem"}>
          <Flex align="cneter" gap={"10px"}>
    
      <Button onClick={toggleDarkMode} icon={isDarkMode? <SunOutlined />: <MoonOutlined />}/>
      

            <Avatar icon={<UserOutlined />} />
          </Flex>
        </Flex>
      </Flex>
    );
  };
  
  export default CustomHeader;
  
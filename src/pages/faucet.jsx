import { PageContainer } from '@ant-design/pro-components'
import React, { useState } from 'react'
import { claimCreateFaucet, claimFaucet, returnFaucet } from '../services/pact-services'
import { Button, Result, Segmented, Row, Col, Space, Card, Typography, Alert, Statistic, Divider } from 'antd'
import {WalletOutlined, PlusCircleOutlined, MoneyCollectOutlined, UndoOutlined, LoadingOutlined, ThunderboltOutlined} from "@ant-design/icons"
import { useKadenaWalletContext } from '../contexts/kadenaWalletContext';
import { useDarkMode } from '../contexts/DarkModeContext';

const { Title, Text, Paragraph } = Typography;

const Faucet = () => {
  const {initializeKadenaWallet, account  } = useKadenaWalletContext()
  const { isDarkMode } = useDarkMode();
  const [old, setOld] = useState(false)
  const [rtrn, setRtrn] = useState(true)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  const handleClaim = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      let result
      if(old){
        result = await claimFaucet(account)
      }
      else if(!old && !rtrn){
        result = await claimCreateFaucet(account)
      }
      else{
        result = await returnFaucet(account)
      }

      console.log(result)
      setSuccess(true)
    } catch (err) {
      console.error('Faucet claim failed:', err)
      setError('Failed to claim tokens. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getActionText = () => {
    if (rtrn) return "Return"
    if (old) return "Claim Existing"
    return "Claim New"
  }

  const getActionDescription = () => {
    if (rtrn) return "Return 50,000 CFLY tokens to the faucet"
    if (old) return "Claim 50,000 CFLY tokens (existing account)"
    return "Claim 50,000 CFLY tokens (new account)"
  }

  return (
    <PageContainer
      title={
        <Space>
          <ThunderboltOutlined />
          <span>Testnet Faucet</span>
        </Space>
      }
      subTitle="Get CFLY tokens for testing on the Cyberfly testnet"
      header={{
        style: {
          padding: '16px 0',
          background: isDarkMode
            ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '8px',
          marginBottom: '24px'
        }
      }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Wallet Connection Status */}
        {!account ? (
          <Card
            bordered={false}
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center' }}
          >
            <Result
              icon={<WalletOutlined style={{ fontSize: 64, color: '#1890ff' }} />}
              title="Connect Your Wallet"
              subTitle="Please connect your Kadena wallet to claim testnet CFLY tokens"
              extra={
                <Button
                  type="primary"
                  size="large"
                  icon={<WalletOutlined />}
                  onClick={()=>initializeKadenaWallet("eckoWallet")}
                >
                  Connect EckoWallet
                </Button>
              }
            />
          </Card>
        ) : (
          <>
            {/* Account Info */}
            <Card
              bordered={false}
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            >
              <Row gutter={[24, 24]} align="middle">
                <Col xs={24} sm={12}>
                  <Space direction="vertical" size="small">
                    <Text strong>Connected Account</Text>
                    <Paragraph
                      copyable={{ text: account }}
                      style={{ margin: 0, fontSize: 14 }}
                    >
                      <Text code>{account}</Text>
                    </Paragraph>
                  </Space>
                </Col>
                <Col xs={24} sm={12}>
                  <Statistic
                    title="Testnet CFLY"
                    value="50,000"
                    prefix={<MoneyCollectOutlined />}
                    suffix="tokens"
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Col>
              </Row>
            </Card>

            {/* Action Selection */}
            <Card
              title="Select Action"
              bordered={false}
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            >
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div>
                  <Text strong style={{ display: 'block', marginBottom: 12 }}>Account Type</Text>
                  <Segmented
                    value={old ? 'existing' : 'new'}
                    onChange={(value) => setOld(value === 'existing')}
                    options={[
                      { label: 'New Account', value: 'new' },
                      { label: 'Existing Account', value: 'existing' }
                    ]}
                    size="large"
                  />
                </div>

                <div>
                  <Text strong style={{ display: 'block', marginBottom: 12 }}>Action Type</Text>
                  <Segmented
                    value={rtrn ? 'return' : 'claim'}
                    onChange={(value) => setRtrn(value === 'return')}
                    options={[
                      { label: 'Claim Tokens', value: 'claim' },
                      { label: 'Return Tokens', value: 'return' }
                    ]}
                    size="large"
                  />
                </div>

                <Divider />

                <div style={{ textAlign: 'center', padding: '20px', background: '#f8f9fa', borderRadius: 8 }}>
                  <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                    {getActionText()} 50,000 CFLY
                  </Title>
                  <Paragraph style={{ margin: '8px 0 16px 0', color: '#666' }}>
                    {getActionDescription()}
                  </Paragraph>
                  <Button
                    type="primary"
                    size="large"
                    icon={loading ? <LoadingOutlined /> : rtrn ? <UndoOutlined /> : <PlusCircleOutlined />}
                    onClick={handleClaim}
                    loading={loading}
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : `${getActionText()} Tokens`}
                  </Button>
                </div>
              </Space>
            </Card>

            {/* Status Messages */}
            {success && (
              <Alert
                message="Success!"
                description={`Successfully ${rtrn ? 'returned' : 'claimed'} 50,000 CFLY tokens.`}
                type="success"
                showIcon
                closable
                onClose={() => setSuccess(false)}
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
              />
            )}

            {error && (
              <Alert
                message="Transaction Failed"
                description={error}
                type="error"
                showIcon
                closable
                onClose={() => setError(null)}
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
              />
            )}

            {/* Information Card */}
            <Card
              title="Faucet Information"
              bordered={false}
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
              size="small"
            >
              <Space direction="vertical" size="small">
                <Text strong>Testnet Faucet Rules:</Text>
                <ul style={{ paddingLeft: 20, margin: 0 }}>
                  <li>Maximum 50,000 CFLY tokens per claim</li>
                  <li>Tokens are for testing purposes only</li>
                  <li>New accounts receive initial setup tokens</li>
                  <li>Existing accounts can claim additional tokens</li>
                  <li>You can return tokens back to the faucet if needed</li>
                </ul>
                <Divider style={{ margin: '12px 0' }} />
                <Text type="secondary">
                  <strong>Note:</strong> These tokens have no real-world value and are only usable on the Cyberfly testnet.
                </Text>
              </Space>
            </Card>
          </>
        )}
      </Space>
    </PageContainer>
  )
}

export default Faucet
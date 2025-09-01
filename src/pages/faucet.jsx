import React, { useState } from 'react'
import { claimCreateFaucet, claimFaucet, returnFaucet } from '../services/pact-services'
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  Chip,
  Avatar,
  Container,
  Grid,
  Paper,
  Fade,
  Grow,
  Zoom,
  CircularProgress,
  LinearProgress,
  Divider,
  Stack,
  useTheme,
  useMediaQuery
} from '@mui/material'
import {
  Wallet,
  AddCircle,
  AccountBalanceWallet,
  Undo,
  CheckCircle,
  Error,
  ElectricBolt as Thunderbolt,
  Info,
  AccountCircle,
  Refresh
} from '@mui/icons-material'
import { useKadenaWalletContext } from '../contexts/kadenaWalletContext'
import { useDarkMode } from '../contexts/DarkModeContext'

const Faucet = () => {
  const { initializeKadenaWallet, account } = useKadenaWalletContext()
  const { isDarkMode } = useDarkMode()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const [old, setOld] = useState(false)
  const [rtrn, setRtrn] = useState(true)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState(0)

  const handleClaim = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)
    setProgress(0)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      let result
      if (old) {
        result = await claimFaucet(account)
      } else if (!old && !rtrn) {
        result = await claimCreateFaucet(account)
      } else {
        result = await returnFaucet(account)
      }

      clearInterval(progressInterval)
      setProgress(100)
      console.log(result)
      setSuccess(true)

      // Reset progress after success
      setTimeout(() => setProgress(0), 2000)
    } catch (err) {
      console.error('Faucet claim failed:', err)
      setError('Failed to process transaction. Please check your connection and try again.')
      setProgress(0)
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
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      {/* Enhanced Header */}
      <Fade in={true} timeout={800}>
        <Paper
          elevation={6}
          sx={{
            p: { xs: 3, md: 4 },
            mb: { xs: 3, md: 4 },
            background: isDarkMode
              ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 4,
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: isDarkMode
              ? '0 20px 60px rgba(0, 0, 0, 0.4)'
              : '0 20px 60px rgba(102, 126, 234, 0.3)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              width: 200,
              height: 200,
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              transform: 'translate(50px, -50px)',
            }
          }}
        >
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 2,
            position: 'relative',
            zIndex: 1
          }}>
            <Avatar
              sx={{
                mr: 2,
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                width: 56,
                height: 56
              }}
            >
              <Thunderbolt sx={{ fontSize: 28 }} />
            </Avatar>
            <Box>
              <Typography
                variant="h4"
                sx={{
                  mb: 1,
                  fontWeight: 700,
                  fontSize: { xs: '1.8rem', md: '2.2rem' }
                }}
              >
                Testnet Faucet
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  opacity: 0.9,
                  fontSize: { xs: '0.9rem', md: '1rem' }
                }}
              >
                Get CFLY tokens for testing on the Cyberfly testnet
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
            <Chip
              icon={<CheckCircle />}
              label="Free Test Tokens"
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                color: 'white',
                '& .MuiChip-icon': { color: 'white' }
              }}
            />
            <Chip
              icon={<CheckCircle />}
              label="Instant Claims"
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                color: 'white',
                '& .MuiChip-icon': { color: 'white' }
              }}
            />
            <Chip
              icon={<CheckCircle />}
              label="Testnet Only"
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                color: 'white',
                '& .MuiChip-icon': { color: 'white' }
              }}
            />
          </Box>
        </Paper>
      </Fade>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 3, md: 4 } }}>
        {/* Wallet Connection Status */}
        {!account ? (
          <Grow in={true} timeout={1000} style={{ transitionDelay: '200ms' }}>
            <Card
              elevation={4}
              sx={{
                background: isDarkMode
                  ? 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)'
                  : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                borderRadius: 4,
                border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
                boxShadow: isDarkMode
                  ? '0 15px 45px rgba(0, 0, 0, 0.2)'
                  : '0 15px 45px rgba(0, 0, 0, 0.08)',
                textAlign: 'center',
                p: 4
              }}
            >
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: 'primary.main',
                  mx: 'auto',
                  mb: 3
                }}
              >
                <Wallet sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography
                variant="h5"
                sx={{
                  mb: 2,
                  fontWeight: 700,
                  color: isDarkMode ? '#ffffff' : '#1a1a1a'
                }}
              >
                Connect Your Wallet
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  mb: 4,
                  color: isDarkMode ? '#b0b0b0' : '#666'
                }}
              >
                Please connect your Kadena wallet to claim testnet CFLY tokens
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<Wallet />}
                onClick={() => initializeKadenaWallet("eckoWallet")}
                sx={{
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: '0 4px 20px rgba(25, 118, 210, 0.3)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 30px rgba(25, 118, 210, 0.4)',
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Connect EckoWallet
              </Button>
            </Card>
          </Grow>
        ) : (
          <>
            {/* Account Info */}
            <Grow in={true} timeout={1000} style={{ transitionDelay: '400ms' }}>
              <Card
                elevation={4}
                sx={{
                  background: isDarkMode
                    ? 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)'
                    : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                  borderRadius: 4,
                  border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
                  boxShadow: isDarkMode
                    ? '0 15px 45px rgba(0, 0, 0, 0.2)'
                    : '0 15px 45px rgba(0, 0, 0, 0.08)'
                }}
              >
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                  <Grid container spacing={4} alignItems="center">
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar
                          sx={{
                            mr: 2,
                            bgcolor: 'success.main',
                            width: 48,
                            height: 48
                          }}
                        >
                          <AccountCircle />
                        </Avatar>
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{
                              color: isDarkMode ? '#b0b0b0' : '#666',
                              fontWeight: 500
                            }}
                          >
                            Connected Account
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: 600,
                              color: isDarkMode ? '#ffffff' : '#1a1a1a',
                              fontFamily: 'monospace',
                              fontSize: '0.9rem'
                            }}
                          >
                            {account}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ textAlign: isMobile ? 'left' : 'right' }}>
                        <Typography
                          variant="body2"
                          sx={{
                            color: isDarkMode ? '#b0b0b0' : '#666',
                            fontWeight: 500,
                            mb: 1
                          }}
                        >
                          Available Tokens
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'flex-start' : 'flex-end' }}>
                          <AccountBalanceWallet sx={{ mr: 1, color: 'success.main' }} />
                          <Typography
                            variant="h5"
                            sx={{
                              fontWeight: 700,
                              color: 'success.main'
                            }}
                          >
                            50,000 CFLY
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grow>

            {/* Action Selection */}
            <Grow in={true} timeout={1000} style={{ transitionDelay: '600ms' }}>
              <Card
                elevation={4}
                sx={{
                  background: isDarkMode
                    ? 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)'
                    : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                  borderRadius: 4,
                  border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
                  boxShadow: isDarkMode
                    ? '0 15px 45px rgba(0, 0, 0, 0.2)'
                    : '0 15px 45px rgba(0, 0, 0, 0.08)'
                }}
              >
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                  <Typography
                    variant="h5"
                    sx={{
                      mb: 4,
                      fontWeight: 700,
                      color: isDarkMode ? '#ffffff' : '#1a1a1a',
                      textAlign: 'center'
                    }}
                  >
                    Select Action
                  </Typography>

                  <Stack spacing={4}>
                    {/* Account Type Selection */}
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{
                          mb: 3,
                          fontWeight: 600,
                          color: isDarkMode ? '#ffffff' : '#1a1a1a'
                        }}
                      >
                        Account Type
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Button
                          variant={!old ? 'contained' : 'outlined'}
                          onClick={() => setOld(false)}
                          sx={{
                            flex: 1,
                            minWidth: 140,
                            py: 2,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600
                          }}
                        >
                          New Account
                        </Button>
                        <Button
                          variant={old ? 'contained' : 'outlined'}
                          onClick={() => setOld(true)}
                          sx={{
                            flex: 1,
                            minWidth: 140,
                            py: 2,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600
                          }}
                        >
                          Existing Account
                        </Button>
                      </Box>
                    </Box>

                    {/* Action Type Selection */}
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{
                          mb: 3,
                          fontWeight: 600,
                          color: isDarkMode ? '#ffffff' : '#1a1a1a'
                        }}
                      >
                        Action Type
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Button
                          variant={!rtrn ? 'contained' : 'outlined'}
                          onClick={() => setRtrn(false)}
                          startIcon={<AddCircle />}
                          sx={{
                            flex: 1,
                            minWidth: 140,
                            py: 2,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600
                          }}
                        >
                          Claim Tokens
                        </Button>
                        <Button
                          variant={rtrn ? 'contained' : 'outlined'}
                          onClick={() => setRtrn(true)}
                          startIcon={<Undo />}
                          sx={{
                            flex: 1,
                            minWidth: 140,
                            py: 2,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600
                          }}
                        >
                          Return Tokens
                        </Button>
                      </Box>
                    </Box>

                    <Divider sx={{
                      borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'
                    }} />

                    {/* Action Summary */}
                    <Box sx={{
                      p: 4,
                      borderRadius: 3,
                      background: isDarkMode
                        ? 'rgba(25, 118, 210, 0.1)'
                        : 'rgba(25, 118, 210, 0.05)',
                      border: isDarkMode ? '1px solid rgba(25, 118, 210, 0.2)' : '1px solid rgba(25, 118, 210, 0.1)',
                      textAlign: 'center'
                    }}>
                      <Typography
                        variant="h4"
                        sx={{
                          mb: 2,
                          fontWeight: 800,
                          color: 'primary.main'
                        }}
                      >
                        {rtrn ? 'Return' : 'Claim'} 50,000 CFLY
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          mb: 4,
                          color: isDarkMode ? '#b0b0b0' : '#666'
                        }}
                      >
                        {rtrn ? 'Return 50,000 CFLY tokens to the faucet' : old ? 'Claim 50,000 CFLY tokens (existing account)' : 'Claim 50,000 CFLY tokens (new account)'}
                      </Typography>

                      {/* Progress Bar */}
                      {loading && (
                        <Box sx={{ mb: 3 }}>
                          <LinearProgress
                            variant="determinate"
                            value={progress}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 4,
                                backgroundColor: 'primary.main'
                              }
                            }}
                          />
                          <Typography
                            variant="body2"
                            sx={{
                              mt: 1,
                              color: isDarkMode ? '#b0b0b0' : '#666'
                            }}
                          >
                            Processing transaction... {progress}%
                          </Typography>
                        </Box>
                      )}

                      <Button
                        variant="contained"
                        size="large"
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : rtrn ? <Undo /> : <AddCircle />}
                        onClick={handleClaim}
                        disabled={loading}
                        sx={{
                          px: 6,
                          py: 2,
                          borderRadius: 3,
                          fontWeight: 700,
                          textTransform: 'none',
                          fontSize: '1.1rem',
                          boxShadow: '0 4px 20px rgba(25, 118, 210, 0.3)',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 30px rgba(25, 118, 210, 0.4)',
                          },
                          '&:disabled': {
                            opacity: 0.7,
                            transform: 'none'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {loading ? 'Processing...' : `${rtrn ? 'Return' : 'Claim'} Tokens`}
                      </Button>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grow>

            {/* Status Messages */}
            <Zoom in={success} timeout={600}>
              <Alert
                icon={<CheckCircle />}
                severity="success"
                sx={{
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(76, 175, 80, 0.2)',
                  '& .MuiAlert-icon': {
                    fontSize: '1.5rem'
                  }
                }}
                onClose={() => setSuccess(false)}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Success!
                </Typography>
                <Typography variant="body2">
                  Successfully {rtrn ? 'returned' : 'claimed'} 50,000 CFLY tokens.
                </Typography>
              </Alert>
            </Zoom>

            <Zoom in={!!error} timeout={600}>
              <Alert
                icon={<Error />}
                severity="error"
                sx={{
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(244, 67, 54, 0.2)',
                  '& .MuiAlert-icon': {
                    fontSize: '1.5rem'
                  }
                }}
                onClose={() => setError(null)}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Transaction Failed
                </Typography>
                <Typography variant="body2">
                  {error}
                </Typography>
              </Alert>
            </Zoom>

            {/* Information Card */}
            <Grow in={true} timeout={1000} style={{ transitionDelay: '800ms' }}>
              <Card
                elevation={4}
                sx={{
                  background: isDarkMode
                    ? 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)'
                    : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                  borderRadius: 4,
                  border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
                  boxShadow: isDarkMode
                    ? '0 15px 45px rgba(0, 0, 0, 0.2)'
                    : '0 15px 45px rgba(0, 0, 0, 0.08)'
                }}
              >
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar
                      sx={{
                        mr: 2,
                        bgcolor: 'info.main',
                        width: 48,
                        height: 48
                      }}
                    >
                      <Info />
                    </Avatar>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        color: isDarkMode ? '#ffffff' : '#1a1a1a'
                      }}
                    >
                      Faucet Information
                    </Typography>
                  </Box>

                  <Stack spacing={3}>
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{
                          mb: 2,
                          fontWeight: 600,
                          color: 'primary.main'
                        }}
                      >
                        Testnet Faucet Rules:
                      </Typography>
                      <Box component="ul" sx={{
                        pl: 3,
                        m: 0,
                        '& li': {
                          mb: 1,
                          color: isDarkMode ? '#e0e0e0' : '#333'
                        }
                      }}>
                        <li>Maximum 50,000 CFLY tokens per claim</li>
                        <li>Tokens are for testing purposes only</li>
                        <li>New accounts receive initial setup tokens</li>
                        <li>Existing accounts can claim additional tokens</li>
                        <li>You can return tokens back to the faucet if needed</li>
                      </Box>
                    </Box>

                    <Divider sx={{
                      borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'
                    }} />

                    <Box sx={{
                      p: 3,
                      borderRadius: 2,
                      background: isDarkMode
                        ? 'rgba(255,152,0,0.1)'
                        : 'rgba(255,152,0,0.05)',
                      border: isDarkMode ? '1px solid rgba(255,152,0,0.2)' : '1px solid rgba(255,152,0,0.1)'
                    }}>
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 600,
                          color: 'warning.main',
                          textAlign: 'center'
                        }}
                      >
                        💡 Note: These tokens have no real-world value and are only usable on the Cyberfly testnet.
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grow>
          </>
        )}
      </Box>
    </Container>
  )
}

export default Faucet
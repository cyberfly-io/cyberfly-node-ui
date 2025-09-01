import React, { useState } from 'react'
import FileUpload from '../components/FileUpload';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  Grid,
  Container,
  Paper,
  Chip,
  Avatar,
  Button,
  Fade,
  Grow,
  Zoom,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  FilePresent,
  CloudUpload,
  Info,
  NoteAdd,
  Security,
  Speed,
  Share,
  CheckCircle,
  ArrowForward
} from '@mui/icons-material';
import { useDarkMode } from '../contexts/DarkModeContext';

const Files = () => {
  const { isDarkMode } = useDarkMode();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [hoveredCard, setHoveredCard] = useState(null);
  const [animationDelay, setAnimationDelay] = useState(0);

  const features = [
    {
      icon: <Speed sx={{ fontSize: 48 }} />,
      title: 'Lightning Fast',
      description: 'Optimized chunking for large files with parallel uploads',
      color: 'primary.main',
      bgColor: isDarkMode ? 'rgba(25, 118, 210, 0.1)' : 'rgba(25, 118, 210, 0.05)'
    },
    {
      icon: <Security sx={{ fontSize: 48 }} />,
      title: 'Military-Grade Security',
      description: 'End-to-end encryption with integrity verification',
      color: 'success.main',
      bgColor: isDarkMode ? 'rgba(76, 175, 80, 0.1)' : 'rgba(76, 175, 80, 0.05)'
    },
    {
      icon: <Share sx={{ fontSize: 48 }} />,
      title: 'Seamless Sharing',
      description: 'Share files with peers or make them publicly accessible',
      color: 'warning.main',
      bgColor: isDarkMode ? 'rgba(255, 152, 0, 0.1)' : 'rgba(255, 152, 0, 0.05)'
    }
  ];
  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
      {/* Enhanced Header Section */}
      <Fade in={true} timeout={800}>
        <Paper
          elevation={4}
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
              width: 300,
              height: 300,
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
              <FilePresent sx={{ fontSize: 28 }} />
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
                File Management Hub
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  opacity: 0.9,
                  fontSize: { xs: '0.9rem', md: '1rem' }
                }}
              >
                Upload and manage files on the Cyberfly decentralized network
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
            <Chip
              icon={<CheckCircle />}
              label="Decentralized Storage"
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                color: 'white',
                '& .MuiChip-icon': { color: 'white' }
              }}
            />
            <Chip
              icon={<CheckCircle />}
              label="End-to-End Encrypted"
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                color: 'white',
                '& .MuiChip-icon': { color: 'white' }
              }}
            />
            <Chip
              icon={<CheckCircle />}
              label="IPFS Powered"
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
        {/* Enhanced Hero Card */}
        <Grow in={true} timeout={1000} style={{ transitionDelay: '200ms' }}>
          <Card
            elevation={6}
            sx={{
              background: isDarkMode
                ? 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)'
                : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              borderRadius: 4,
              overflow: 'hidden',
              position: 'relative',
              border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
              boxShadow: isDarkMode
                ? '0 20px 60px rgba(0, 0, 0, 0.3)'
                : '0 20px 60px rgba(0, 0, 0, 0.1)',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                right: 0,
                width: 200,
                height: 200,
                background: isDarkMode
                  ? 'rgba(25, 118, 210, 0.1)'
                  : 'rgba(25, 118, 210, 0.05)',
                borderRadius: '50%',
                transform: 'translate(50px, -50px)',
              }
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 4 }, position: 'relative', zIndex: 1 }}>
              <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} md={7}>
                  <Box>
                    <Typography
                      variant="h3"
                      sx={{
                        mb: 2,
                        fontWeight: 800,
                        background: isDarkMode
                          ? 'linear-gradient(45deg, #ffffff 30%, #e0e0e0 90%)'
                          : 'linear-gradient(45deg, #1a1a1a 30%, #666 90%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontSize: { xs: '2rem', md: '2.5rem' }
                      }}
                    >
                      File Upload Center
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        mb: 3,
                        color: isDarkMode ? '#b0b0b0' : '#666',
                        fontWeight: 400,
                        lineHeight: 1.6
                      }}
                    >
                      Upload files to the decentralized Cyberfly network for secure, distributed storage and sharing
                    </Typography>
                    <Button
                      variant="contained"
                      size="large"
                      endIcon={<ArrowForward />}
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
                      Get Started
                    </Button>
                  </Box>
                </Grid>
                <Grid item xs={12} md={5} sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Zoom in={true} timeout={1200} style={{ transitionDelay: '400ms' }}>
                    <Box
                      sx={{
                        p: 3,
                        borderRadius: '50%',
                        background: isDarkMode
                          ? 'rgba(76, 175, 80, 0.1)'
                          : 'rgba(76, 175, 80, 0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <CloudUpload
                        sx={{
                          fontSize: { xs: 80, md: 100 },
                          color: 'success.main',
                          opacity: 0.8
                        }}
                      />
                    </Box>
                  </Zoom>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grow>

        {/* Enhanced File Upload Component */}
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
                : '0 15px 45px rgba(0, 0, 0, 0.08)',
              overflow: 'hidden'
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 3,
                p: 2,
                borderRadius: 2,
                background: isDarkMode
                  ? 'rgba(25, 118, 210, 0.1)'
                  : 'rgba(25, 118, 210, 0.05)'
              }}>
                <Avatar
                  sx={{
                    mr: 2,
                    bgcolor: 'primary.main',
                    width: 48,
                    height: 48
                  }}
                >
                  <CloudUpload />
                </Avatar>
                <Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      color: isDarkMode ? '#ffffff' : '#1a1a1a'
                    }}
                  >
                    Upload Files
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: isDarkMode ? '#b0b0b0' : '#666'
                    }}
                  >
                    Drag & drop or click to select files
                  </Typography>
                </Box>
              </Box>
              <FileUpload />
            </CardContent>
          </Card>
        </Grow>

        {/* Enhanced Information Section */}
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
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 4,
                p: 2,
                borderRadius: 2,
                background: isDarkMode
                  ? 'rgba(156, 39, 176, 0.1)'
                  : 'rgba(156, 39, 176, 0.05)'
              }}>
                <Avatar
                  sx={{
                    mr: 2,
                    bgcolor: 'secondary.main',
                    width: 48,
                    height: 48
                  }}
                >
                  <Info />
                </Avatar>
                <Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      color: isDarkMode ? '#ffffff' : '#1a1a1a'
                    }}
                  >
                    How It Works
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: isDarkMode ? '#b0b0b0' : '#666'
                    }}
                  >
                    Understanding the Cyberfly file storage system
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Box sx={{
                  p: 3,
                  borderRadius: 3,
                  background: isDarkMode
                    ? 'rgba(255,255,255,0.05)'
                    : 'rgba(0,0,0,0.02)',
                  border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)'
                }}>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 2,
                      fontWeight: 700,
                      color: 'primary.main',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Security sx={{ mr: 1 }} />
                    Decentralized File Storage
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: isDarkMode ? '#e0e0e0' : '#333',
                      lineHeight: 1.7
                    }}
                  >
                    Files uploaded to Cyberfly are stored across the decentralized network using IPFS and Libp2p protocols,
                    ensuring high availability, censorship resistance, and data persistence.
                  </Typography>
                </Box>

                <Divider sx={{
                  borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'
                }} />

                <Box sx={{
                  p: 3,
                  borderRadius: 3,
                  background: isDarkMode
                    ? 'rgba(255,255,255,0.05)'
                    : 'rgba(0,0,0,0.02)',
                  border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)'
                }}>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 2,
                      fontWeight: 700,
                      color: 'success.main',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <FilePresent sx={{ mr: 1 }} />
                    Supported File Types
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: isDarkMode ? '#e0e0e0' : '#333',
                      lineHeight: 1.7
                    }}
                  >
                    You can upload various file types including documents, images, videos, and archives.
                    Large files are automatically chunked for efficient transfer and storage.
                  </Typography>
                </Box>

                <Divider sx={{
                  borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'
                }} />

                <Box sx={{
                  p: 3,
                  borderRadius: 3,
                  background: isDarkMode
                    ? 'rgba(255,255,255,0.05)'
                    : 'rgba(0,0,0,0.02)',
                  border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)'
                }}>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 2,
                      fontWeight: 700,
                      color: 'warning.main',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Share sx={{ mr: 1 }} />
                    Security & Privacy
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: isDarkMode ? '#e0e0e0' : '#333',
                      lineHeight: 1.7
                    }}
                  >
                    All files are encrypted during transfer and can be shared with specific peers or made publicly accessible.
                    You maintain full control over your data with advanced access management.
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grow>

        {/* Enhanced Features Grid */}
        <Grow in={true} timeout={1000} style={{ transitionDelay: '1000ms' }}>
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
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 4,
                p: 2,
                borderRadius: 2,
                background: isDarkMode
                  ? 'rgba(255, 193, 7, 0.1)'
                  : 'rgba(255, 193, 7, 0.05)'
              }}>
                <Avatar
                  sx={{
                    mr: 2,
                    bgcolor: 'warning.main',
                    width: 48,
                    height: 48
                  }}
                >
                  <CheckCircle />
                </Avatar>
                <Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      color: isDarkMode ? '#ffffff' : '#1a1a1a'
                    }}
                  >
                    Key Features
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: isDarkMode ? '#b0b0b0' : '#666'
                    }}
                  >
                    Discover the benefits of our decentralized file storage system
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={4}>
                {features.map((feature, index) => (
                  <Grid item xs={12} md={4} key={index}>
                    <Zoom in={true} timeout={800} style={{ transitionDelay: `${1200 + index * 200}ms` }}>
                      <Card
                        elevation={hoveredCard === index ? 12 : 2}
                        onMouseEnter={() => setHoveredCard(index)}
                        onMouseLeave={() => setHoveredCard(null)}
                        sx={{
                          height: '100%',
                          background: isDarkMode
                            ? 'rgba(255,255,255,0.05)'
                            : 'rgba(255,255,255,0.9)',
                          border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
                          borderRadius: 3,
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          transform: hoveredCard === index ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
                          boxShadow: hoveredCard === index
                            ? (isDarkMode
                                ? '0 20px 60px rgba(0, 0, 0, 0.4)'
                                : '0 20px 60px rgba(0, 0, 0, 0.15)')
                            : (isDarkMode
                                ? '0 8px 32px rgba(0, 0, 0, 0.2)'
                                : '0 8px 32px rgba(0, 0, 0, 0.08)'),
                          '&:hover': {
                            background: feature.bgColor
                          }
                        }}
                      >
                        <CardContent sx={{
                          p: 3,
                          textAlign: 'center',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          height: '100%'
                        }}>
                          <Box
                            sx={{
                              mb: 3,
                              p: 2,
                              borderRadius: '50%',
                              background: feature.bgColor,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.3s ease',
                              transform: hoveredCard === index ? 'scale(1.1)' : 'scale(1)'
                            }}
                          >
                            <Box sx={{ color: feature.color }}>
                              {feature.icon}
                            </Box>
                          </Box>
                          <Typography
                            variant="h6"
                            sx={{
                              mb: 2,
                              fontWeight: 700,
                              color: isDarkMode ? '#ffffff' : '#1a1a1a'
                            }}
                          >
                            {feature.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: isDarkMode ? '#b0b0b0' : '#666',
                              lineHeight: 1.6,
                              flexGrow: 1
                            }}
                          >
                            {feature.description}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Zoom>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grow>
      </Box>
    </Container>
  )
}

export default Files
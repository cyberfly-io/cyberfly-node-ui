import React, { useState, useEffect, useRef } from 'react'
import {
  Box, Container, TextField, Button, Chip, Divider, Card, CardContent,
  Grid, Stack, Typography, Avatar, Badge, List, ListItem, ListItemAvatar,
  ListItemText, Alert, Snackbar, IconButton, Paper
} from '@mui/material'
import {
  Wifi, Send, Notifications, Public, Message, ElectricBolt, LinkOff,
  CheckCircle, Schedule, Delete, Close
} from '@mui/icons-material'
import { io } from "socket.io-client"
import { getHost } from '../services/node-services'
import { useDarkMode } from '../contexts/DarkModeContext'
import GradientHeader from '../components/GradientHeader'

const PubSubPage = () => {

const [topics, setTopics] = useState([])
const [connectionStatus, setConnectionStatus] = useState('connecting')
const [messageHistory, setMessageHistory] = useState([])
const { isDarkMode } = useDarkMode()
const socketRef = useRef(null)

// MUI Snackbar states
const [snackbarOpen, setSnackbarOpen] = useState(false)
const [snackbarMessage, setSnackbarMessage] = useState('')
const [snackbarSeverity, setSnackbarSeverity] = useState('success')

// Form states for MUI
const [subscribeTopic, setSubscribeTopic] = useState('')
const [publishTopic, setPublishTopic] = useState('')
const [publishMessage, setPublishMessage] = useState('')

const showMessage = (message, severity = 'success') => {
  setSnackbarMessage(message);
  setSnackbarSeverity(severity);
  setSnackbarOpen(true);
};

const handleSnackbarClose = () => {
  setSnackbarOpen(false);
};

const host = getHost(); // Get the host without protocol
const protocol = window.location.protocol; // Get the current protocol
let url = `${protocol}//${host}`
if(protocol==="https:"&&host.includes('3100')){
  url = host.replace("31000", "31003")
}
else if(protocol==="http:"){
  url = "https://node.cyberfly.io"
}
console.log(url)

// Initialize socket
if (!socketRef.current) {
  socketRef.current = io(url);
}

const socket = socketRef.current;

useEffect(() => {
  socket.on("connect",()=>{
    setConnectionStatus('connected');
    showMessage("WebSocket connected successfully", "success");
  })

  socket.on("disconnect", () => {
    setConnectionStatus('disconnected');
    showMessage("WebSocket disconnected", "warning");
  })

  socket.on("onmessage", (data)=>{
    const {topic, message} = data
    console.log(topic, message)

    // Add to message history
    setMessageHistory(prev => [{
      id: Date.now(),
      topic,
      message,
      timestamp: new Date(),
      type: 'received'
    }, ...prev.slice(0, 49)]) // Keep last 50 messages

    showMessage(`Message received for topic: ${topic}`, "info");
  })

  return () => {
    socket.off("connect");
    socket.off("disconnect");
    socket.off("onmessage");
  }
}, [socket])

const handleSubscribe = () => {
  if (!subscribeTopic.trim()) {
    showMessage("Please enter a topic name", "error");
    return;
  }

  const updatedTopics = [...topics, subscribeTopic];
  socket.emit("subscribe", subscribeTopic);
  showMessage(`Subscribed to ${subscribeTopic}`, "success");
  setTopics(updatedTopics);
  setSubscribeTopic('');
};

const handlePublish = () => {
  if (!publishTopic.trim() || !publishMessage.trim()) {
    showMessage("Please fill in both topic and message", "error");
    return;
  }

  socket.emit("publish", {topic: publishTopic, message: publishMessage});

  // Add to message history
  setMessageHistory(prev => [{
    id: Date.now(),
    topic: publishTopic,
    message: publishMessage,
    timestamp: new Date(),
    type: 'sent'
  }, ...prev.slice(0, 49)]);

  showMessage("Message published successfully", "success");
};

// Unsubscribe from a topic
const handleUnsubscribe = (topicToRemove) => {
  setTopics(prev => prev.filter(topic => topic !== topicToRemove));
  if (socket) {
    socket.emit('unsubscribe', topicToRemove);
  }
  showMessage(`Unsubscribed from ${topicToRemove}`, 'info');
};

// Clear message history
const clearMessageHistory = () => {
  setMessageHistory([]);
  showMessage('Message history cleared', 'info');
};

return (
  <Container maxWidth="xl" sx={{ py: 3 }}>
    <GradientHeader
      icon={<ElectricBolt sx={{ fontSize: 28 }} />}
      title="PubSub Messaging"
      subtitle="Real-time topic-based messaging system"
      chips={[
        { label: `Status: ${connectionStatus}` },
        { label: `Topics: ${topics.length}` },
        { label: `Messages: ${messageHistory.length}` }
      ]}
    />
    {/* Connection Status Card */}
    <Card
      sx={{
        mb: 3,
        borderRadius: 3,
        boxShadow: isDarkMode
          ? '0 4px 12px rgba(0,0,0,0.3)'
          : '0 4px 12px rgba(0,0,0,0.1)',
        background: isDarkMode
          ? 'linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 100%)'
          : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
      }}
    >
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              bgcolor: connectionStatus === 'connected' ? 'success.main' :
                       connectionStatus === 'connecting' ? 'warning.main' : 'error.main'
            }}
          >
            {connectionStatus === 'connected' ? <ElectricBolt /> :
             connectionStatus === 'connecting' ? <Wifi /> :
             <LinkOff />}
          </Avatar>
          <Box flex={1}>
            <Typography variant="h5" sx={{ mb: 1, color: isDarkMode ? '#e0e0e0' : 'inherit' }}>
              WebSocket Connection
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ color: isDarkMode ? '#b0b0b0' : 'inherit' }}>
              {connectionStatus === 'connected' ? 'Connected to CyberFly node' :
               connectionStatus === 'connecting' ? 'Establishing connection...' :
               'Connection lost - attempting to reconnect'}
            </Typography>
          </Box>
          <Chip
            label={
              connectionStatus === 'connected' ? 'Online' :
              connectionStatus === 'connecting' ? 'Connecting' : 'Offline'
            }
            color={
              connectionStatus === 'connected' ? 'success' :
              connectionStatus === 'connecting' ? 'warning' : 'error'
            }
            icon={
              connectionStatus === 'connected' ? <CheckCircle /> :
              connectionStatus === 'connecting' ? <Schedule /> :
              <LinkOff />
            }
            size="small"
          />
        </Stack>
      </CardContent>
    </Card>
  <Grid container spacing={3}>
        {/* Subscribe Section */}
        <Grid item xs={12} lg={6}>
          <Card
            sx={{
              height: '100%',
              borderRadius: 3,
              boxShadow: isDarkMode
                ? '0 4px 12px rgba(0,0,0,0.3)'
                : '0 4px 12px rgba(0,0,0,0.1)'
            }}
          >
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                <Notifications />
                <Typography variant="h6">Subscribe to Topics</Typography>
              </Stack>

              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Topic Name"
                  value={subscribeTopic}
                  onChange={(e) => setSubscribeTopic(e.target.value)}
                  placeholder="Enter topic to subscribe"
                  size="small"
                  sx={{
                    '& .MuiInputBase-root': {
                      bgcolor: isDarkMode ? '#1f1f1f' : 'inherit',
                      color: isDarkMode ? '#e0e0e0' : 'inherit'
                    }
                  }}
                />

                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleSubscribe}
                  startIcon={<Notifications />}
                  sx={{
                    height: 48,
                    background: isDarkMode
                      ? 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)'
                      : 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
                    '&:hover': {
                      background: isDarkMode
                        ? 'linear-gradient(135deg, #40a9ff 0%, #1890ff 100%)'
                        : 'linear-gradient(135deg, #40a9ff 0%, #1890ff 100%)'
                    }
                  }}
                >
                  Subscribe to Topic
                </Button>
              </Stack>

              {/* Subscribed Topics */}
              {topics.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2, color: isDarkMode ? '#e0e0e0' : 'inherit' }}>
                    Active Subscriptions ({topics.length})
                  </Typography>
                  <Stack direction="row" flexWrap="wrap" spacing={1}>
                    {topics.map((topic, index) => (
                      <Chip
                        key={index}
                        label={topic}
                        onDelete={() => handleUnsubscribe(topic)}
                        size="small"
                        sx={{
                          bgcolor: isDarkMode ? '#1f1f1f' : 'inherit',
                          color: isDarkMode ? '#e0e0e0' : 'inherit',
                          borderColor: isDarkMode ? '#444' : 'inherit'
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Publish Section */}
        <Grid item xs={12} lg={6}>
          <Card
            sx={{
              height: '100%',
              borderRadius: 3,
              boxShadow: isDarkMode
                ? '0 4px 12px rgba(0,0,0,0.3)'
                : '0 4px 12px rgba(0,0,0,0.1)'
            }}
          >
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                <Send />
                <Typography variant="h6">Publish Messages</Typography>
              </Stack>

              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Topic"
                  value={publishTopic}
                  onChange={(e) => setPublishTopic(e.target.value)}
                  placeholder="Enter topic to publish to"
                  size="small"
                  sx={{
                    '& .MuiInputBase-root': {
                      bgcolor: isDarkMode ? '#1f1f1f' : 'inherit',
                      color: isDarkMode ? '#e0e0e0' : 'inherit'
                    }
                  }}
                />

                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Message"
                  value={publishMessage}
                  onChange={(e) => setPublishMessage(e.target.value)}
                  placeholder="Enter your message"
                  size="small"
                  sx={{
                    '& .MuiInputBase-root': {
                      bgcolor: isDarkMode ? '#1f1f1f' : 'inherit',
                      color: isDarkMode ? '#e0e0e0' : 'inherit'
                    }
                  }}
                />

                <Button
                  fullWidth
                  variant="contained"
                  onClick={handlePublish}
                  startIcon={<Send />}
                  sx={{
                    height: 48,
                    background: isDarkMode
                      ? 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)'
                      : 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                    '&:hover': {
                      background: isDarkMode
                        ? 'linear-gradient(135deg, #73d13d 0%, #52c41a 100%)'
                        : 'linear-gradient(135deg, #73d13d 0%, #52c41a 100%)'
                    }
                  }}
                >
                  Publish Message
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Message History */}
      {messageHistory.length > 0 && (
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: isDarkMode
              ? '0 4px 12px rgba(0,0,0,0.3)'
              : '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          <CardContent>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Message />
                <Typography variant="h6">Message History</Typography>
                <Badge badgeContent={messageHistory.length} color="primary" />
              </Stack>
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={clearMessageHistory}
              >
                Clear History
              </Button>
            </Stack>

            <List>
              {messageHistory.map((item) => (
                <ListItem
                  key={item.id}
                  sx={{
                    mb: 1,
                    bgcolor: isDarkMode ? '#1f1f1f' : '#fafafa',
                    borderRadius: 2,
                    border: `1px solid ${isDarkMode ? '#333' : '#f0f0f0'}`
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor: item.type === 'sent' ? 'success.main' : 'primary.main'
                      }}
                    >
                      {item.type === 'sent' ? <Send /> : <Notifications />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="body2" sx={{ color: isDarkMode ? '#e0e0e0' : 'inherit' }}>
                          Topic: <Typography component="span" variant="body2" sx={{ fontFamily: 'monospace' }}>{item.topic}</Typography>
                        </Typography>
                        <Chip
                          label={item.type === 'sent' ? 'Sent' : 'Received'}
                          color={item.type === 'sent' ? 'success' : 'primary'}
                          size="small"
                        />
                      </Stack>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" sx={{ color: isDarkMode ? '#b0b0b0' : '#666', mb: 1 }}>
                          {item.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.timestamp.toLocaleString()}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Empty State for Message History */}
      {messageHistory.length === 0 && (
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: isDarkMode
              ? '0 4px 12px rgba(0,0,0,0.3)'
              : '0 4px 12px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}
        >
          <CardContent>
            <Stack spacing={2} alignItems="center">
              <Message sx={{ fontSize: 48, color: 'text.secondary' }} />
              <Box>
                <Typography variant="h6" sx={{ color: isDarkMode ? '#e0e0e0' : 'inherit' }}>
                  No messages yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ color: isDarkMode ? '#b0b0b0' : 'inherit' }}>
                  Subscribe to topics and publish messages to see them here
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  )
}

export default PubSubPage
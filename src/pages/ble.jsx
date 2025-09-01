import React from 'react';
import { Container, Card, CardContent, Typography, Alert } from '@mui/material';
import { Wifi } from '@mui/icons-material';
import GradientHeader from '../components/GradientHeader';

// Simplified placeholder BLE page (original detailed logic pending refactor)
const BLEPage = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <GradientHeader
        icon={<Wifi sx={{ fontSize: 28 }} />}
        title="BLE Device Provisioning"
        subtitle="Configure and manage Bluetooth Low Energy device connections"
      />
      <Card sx={{ maxWidth: 640, mx: 'auto', borderRadius: 4 }}>
        <CardContent sx={{ textAlign: 'center', py: 5 }}>
          <Typography variant="h5" gutterBottom fontWeight={700}>
            BLE Provisioning (Preview)
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
            Enhanced BLE provisioning tools are coming soon. This placeholder preserves routing.
          </Typography>
          <Alert severity="info" sx={{ textAlign: 'left' }}>
            Live scan, connection, and provisioning features will be reintroduced with the new UI.
          </Alert>
        </CardContent>
      </Card>
    </Container>
  );
};

export default BLEPage;

import React from 'react';
import { Paper, Box, Avatar, Typography, Chip, Stack } from '@mui/material';
import { useDarkMode } from '../contexts/DarkModeContext';

/**
 * GradientHeader
 * Unified page header matching Faucet page gradient & layout.
 * Props:
 *  icon: React element placed inside circular avatar
 *  title: string / node
 *  subtitle: string / node
 *  chips: array of { label, icon } (optional)
 *  actions: React node rendered at far right (optional)
 *  sx: additional sx overrides for Paper
 */
const GradientHeader = ({ icon, title, subtitle, chips = [], actions = null, sx = {} }) => {
  const { isDarkMode } = useDarkMode();

  return (
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
        },
        ...sx,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: chips.length ? 2 : 0, position: 'relative', zIndex: 1 }}>
        {icon && (
          <Avatar
            sx={{
              mr: 2,
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              width: 56,
              height: 56
            }}
          >
            {icon}
          </Avatar>
        )}
        <Box sx={{ flexGrow: 1 }}>
          {title && (
            <Typography
              variant="h4"
              sx={{
                mb: subtitle ? 1 : 0,
                fontWeight: 700,
                fontSize: { xs: '1.8rem', md: '2.2rem' }
              }}
            >
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography
              variant="body1"
              sx={{
                opacity: 0.9,
                fontSize: { xs: '0.9rem', md: '1rem' }
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
        {actions && (
          <Box sx={{ ml: 2, position: 'relative', zIndex: 1 }}>
            {actions}
          </Box>
        )}
      </Box>
      {!!chips.length && (
        <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ position: 'relative', zIndex: 1 }}>
          {chips.map((c, i) => (
            <Chip
              key={i}
              icon={c.icon}
              label={c.label}
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                color: 'white',
                '& .MuiChip-icon': { color: 'white' }
              }}
            />
          ))}
        </Stack>
      )}
    </Paper>
  );
};

export default GradientHeader;

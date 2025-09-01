import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const KeyValueTable = ({ data }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Convert data into a format for MUI Table
  const dataSource = Object.keys(data).map(key => ({
    key,
    value: data[key]
  }));

  return (
    <TableContainer component={Paper} sx={{
      maxHeight: isMobile ? 'calc(100vh - 400px)' : 'calc(100vh - 300px)',
      overflow: 'auto'
    }}>
      <Table size={isMobile ? 'small' : 'medium'}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold', width: isMobile ? 120 : 200 }}>
              <Typography variant="subtitle2" sx={{ fontSize: isMobile ? '12px' : '14px' }}>
                Key
              </Typography>
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>
              <Typography variant="subtitle2" sx={{ fontSize: isMobile ? '12px' : '14px' }}>
                Value
              </Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {dataSource.map((row) => (
            <TableRow key={row.key}>
              <TableCell>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: isMobile ? '12px' : '14px',
                    fontWeight: 'bold',
                    fontFamily: 'monospace'
                  }}
                >
                  {row.key}
                </Typography>
              </TableCell>
              <TableCell>
                <Box sx={{
                  fontSize: isMobile ? '12px' : '14px',
                  wordBreak: 'break-all',
                  fontFamily: 'monospace'
                }}>
                  {typeof row.value === 'object' ? row.value.timep : row.value}
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default KeyValueTable;

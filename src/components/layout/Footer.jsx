// src/components/Footer.jsx
import React from 'react';
import { Stack, Typography, Link, Box } from '@mui/material';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto', // pushes footer to bottom
        py: 2,
        px: { xs: 2, sm: 4 },
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="center"
        alignItems="center"
        spacing={1.5}
      >
        {/* center side: Copyright */}
        <Typography variant="caption" color="text.secondary">
          &copy; {new Date().getFullYear()} <a href='https://www.race.net.bd/' target='_blank'>Race Online Ltd</a> - Software Division
        </Typography>
      </Stack>
    </Box>
  );
}

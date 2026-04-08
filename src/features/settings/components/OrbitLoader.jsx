import React from 'react';
import { Box, Typography } from '@mui/material';

const injectKeyframes = () => {
  if (document.getElementById('orbit-loader-keyframes')) return;

  const style = document.createElement('style');
  style.id = 'orbit-loader-keyframes';
  style.textContent = `
    @keyframes rotationBack {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(-360deg);
      }
    }
  `;

  document.head.appendChild(style);
};

export default function OrbitLoader({
  title = 'Loading data',
  subtitle = 'Preparing your records and syncing the latest updates.',
  minHeight = 180,
}) {
  React.useEffect(() => {
    injectKeyframes();
  }, []);

  return (
    <Box
      sx={{
        minHeight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
      }}
    >
      <Box sx={{ textAlign: 'center' }}>
        <Box
          component="span"
          sx={{
            width: 60,
            height: 40,
            position: 'relative',
            display: 'inline-block',
            '--base-color': '#ffffff',
            mb: 2.5,
            '&::before': {
              content: '""',
              left: 0,
              top: 0,
              position: 'absolute',
              width: 36,
              height: 36,
              borderRadius: '50%',
              backgroundColor: '#727272ab',
              backgroundImage:
                'radial-gradient(circle 8px at 18px 18px, var(--base-color) 100%, transparent 0), radial-gradient(circle 4px at 18px 0px, var(--base-color) 100%, transparent 0), radial-gradient(circle 4px at 0px 18px, var(--base-color) 100%, transparent 0), radial-gradient(circle 4px at 36px 18px, var(--base-color) 100%, transparent 0), radial-gradient(circle 4px at 18px 36px, var(--base-color) 100%, transparent 0), radial-gradient(circle 4px at 30px 5px, var(--base-color) 100%, transparent 0), radial-gradient(circle 4px at 30px 5px, var(--base-color) 100%, transparent 0), radial-gradient(circle 4px at 30px 30px, var(--base-color) 100%, transparent 0), radial-gradient(circle 4px at 5px 30px, var(--base-color) 100%, transparent 0), radial-gradient(circle 4px at 5px 5px, var(--base-color) 100%, transparent 0)',
              backgroundRepeat: 'no-repeat',
              boxSizing: 'border-box',
              animation: 'rotationBack 3s linear infinite',
            },
            '&::after': {
              content: '""',
              left: 35,
              top: 15,
              position: 'absolute',
              width: 24,
              height: 24,
              borderRadius: '50%',
              backgroundColor: '#727272ab',
              backgroundImage:
                'radial-gradient(circle 5px at 12px 12px, var(--base-color) 100%, transparent 0), radial-gradient(circle 2.5px at 12px 0px, var(--base-color) 100%, transparent 0), radial-gradient(circle 2.5px at 0px 12px, var(--base-color) 100%, transparent 0), radial-gradient(circle 2.5px at 24px 12px, var(--base-color) 100%, transparent 0), radial-gradient(circle 2.5px at 12px 24px, var(--base-color) 100%, transparent 0), radial-gradient(circle 2.5px at 20px 3px, var(--base-color) 100%, transparent 0), radial-gradient(circle 2.5px at 20px 3px, var(--base-color) 100%, transparent 0), radial-gradient(circle 2.5px at 20px 20px, var(--base-color) 100%, transparent 0), radial-gradient(circle 2.5px at 3px 20px, var(--base-color) 100%, transparent 0), radial-gradient(circle 2.5px at 3px 3px, var(--base-color) 100%, transparent 0)',
              backgroundRepeat: 'no-repeat',
              boxSizing: 'border-box',
              animation: 'rotationBack 4s linear infinite reverse',
            },
          }}
        />

        <Typography variant="h6" fontWeight={800} color="#0f172a">
          {title}
        </Typography>
        <Typography
          variant="body2"
          color="#64748b"
          sx={{ mt: 0.75, maxWidth: 290, mx: 'auto' }}
        >
          {subtitle}
        </Typography>
      </Box>
    </Box>
  );
}

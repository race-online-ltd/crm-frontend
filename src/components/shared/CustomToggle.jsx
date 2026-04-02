// src/components/shared/CustomToggle.jsx
import React from 'react';
import { Switch, Stack, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledSwitch = styled(Switch)(({ theme, ownerState }) => {
  const { sizeProp } = ownerState;
  
  // Professional Ratio Mapping
  const sizes = {
    xl: { width: 72, height: 36, thumb: 28, translate: 36, padding: 4 },
    lg: { width: 58, height: 30, thumb: 24, translate: 28, padding: 3 },
    md: { width: 46, height: 24, thumb: 18, translate: 22, padding: 3 },
    sm: { width: 36, height: 20, thumb: 14, translate: 16, padding: 3 },
    xs: { width: 28, height: 16, thumb: 10, translate: 12, padding: 3 },
  };

  const s = sizes[sizeProp] || sizes.md;

  return {
    width: s.width,
    height: s.height,
    padding: 0,
    borderRadius: s.height / 2,
    '& .MuiSwitch-switchBase': {
      padding: s.padding,
      transitionDuration: '300ms',
      '&.Mui-checked': {
        transform: `translateX(${s.translate}px)`,
        color: '#fff',
        '& + .MuiSwitch-track': {
          backgroundColor: theme.palette.primary.main,
          opacity: 1,
          border: 0,
        },
        '&.Mui-disabled + .MuiSwitch-track': {
          opacity: 0.5,
        },
      },
      '&.Mui-focusVisible .MuiSwitch-thumb': {
        color: '#33cf4d',
        border: '6px solid #fff',
      },
      '&.Mui-disabled .MuiSwitch-thumb': {
        color: theme.palette.grey[100],
      },
      '&.Mui-disabled + .MuiSwitch-track': {
        opacity: 0.3,
      },
    },
    '& .MuiSwitch-thumb': {
      boxSizing: 'border-box',
      width: s.thumb,
      height: s.thumb,
      boxShadow: '0 2px 4px rgba(0, 35, 11, 0.2)',
    },
    '& .MuiSwitch-track': {
      borderRadius: s.height / 2,
      backgroundColor: '#E9E9EA',
      opacity: 1,
      transition: theme.transitions.create(['background-color'], {
        duration: 500,
      }),
    },
  };
});

const CustomToggle = ({ size = 'md', label, ...props }) => {
  return (
    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ display: 'inline-flex' }}>
      <StyledSwitch ownerState={{ sizeProp: size }} {...props} />
      {label && (
        <Typography 
          sx={{ 
            fontSize: size === 'xs' || size === 'sm' ? '0.75rem' : '0.875rem', 
            fontWeight: 500, 
            color: '#334155',
            userSelect: 'none'
          }}
        >
          {label}
        </Typography>
      )}
    </Stack>
  );
};

export default CustomToggle;
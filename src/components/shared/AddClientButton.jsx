import React from 'react';
import { Button } from '@mui/material';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';

export default function AddClientButton({ onClick, children = 'Add Client', sx = {}, ...props }) {
  return (
    <Button
      variant="contained"
      startIcon={<PersonAddAltIcon sx={{ fontSize: 18 }} />}
      onClick={onClick}
      sx={{
        height: '45px',
        fontWeight: 600,
        fontSize: '0.8rem',
        bgcolor: '#2563eb',
        borderRadius: '8px',
        boxShadow: 'none',
        whiteSpace: 'nowrap',
        px: 2,
        '&:hover': {
          bgcolor: '#1d4ed8',
          boxShadow: 'none',
        },
        ...sx,
      }}
      {...props}
    >
      {children}
    </Button>
  );
}

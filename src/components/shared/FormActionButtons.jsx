import React from 'react';
import { Box, Button } from '@mui/material';

const baseButtonSx = {
  flex: 1,
  width: '100%',
  height: 36,
  textTransform: 'none',
  fontWeight: 600,
  borderRadius: '10px',
};

export default function FormActionButtons({
  cancelLabel = 'Cancel',
  submitLabel,
  onCancel,
  submitType = 'submit',
  submitIcon,
  loading = false,
  disabled = false,
  width = { xs: '100%', sm: '30%' },
  mt = 5,
  containerSx = {},
  cancelSx = {},
  submitSx = {},
}) {
  const showCancel = typeof onCancel === 'function' && Boolean(cancelLabel);
  const showSubmit = Boolean(submitLabel);

  if (!showCancel && !showSubmit) {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2,
        mt,
        width,
        ml: 'auto',
        ...containerSx,
      }}
    >
      {showCancel && (
        <Button
          variant="outlined"
          onClick={onCancel}
          sx={{
            ...baseButtonSx,
            borderColor: '#e2e8f0',
            color: '#64748b',
            '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' },
            ...cancelSx,
          }}
        >
          {cancelLabel}
        </Button>
      )}
      {showSubmit && (
        <Button
          type={submitType}
          variant="contained"
          startIcon={submitIcon}
          disabled={disabled || loading}
          sx={{
            ...baseButtonSx,
            bgcolor: '#2563eb',
            boxShadow: 'none',
            '&:hover': { bgcolor: '#1d4ed8', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' },
            '&.Mui-disabled': { bgcolor: '#e2e8f0', color: '#94a3b8' },
            ...submitSx,
          }}
        >
          {submitLabel}
        </Button>
      )}
    </Box>
  );
}

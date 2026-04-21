import React from 'react';
import PropTypes from 'prop-types';
import { 
  Drawer, 
  Box, 
  Typography, 
  IconButton, 
  Divider, 
  Stack 
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

/**
 * A reusable right-aligned drawer for forms, filters, and details.
 */
const AppDrawer = ({ 
  open, 
  onClose, 
  title, 
  children, 
  width = 400, 
  footerActions,
  paperProps = {},
  contentSx = {},
}) => {
  const { sx: paperSx, ...restPaperProps } = paperProps;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      // This ensures the drawer sits on top of other elements correctly
      PaperProps={{
        ...restPaperProps,
        sx: { 
          width: { xs: '100%', sm: width }, 
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          maxHeight: '100vh',
          overflow: 'hidden',
          ...paperSx,
        }
      }}
    >
      {/* 1. Header */}
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        bgcolor: 'grey.50'
      }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>
      
      <Divider />

      {/* 2. Content (Scrollable) */}
      <Box sx={{ 
        flex: 1, 
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        p: 3,
        ...contentSx,
      }}>
        {children}
      </Box>

      {/* 3. Footer Actions (Sticky) */}
      {footerActions && (
        <>
          <Divider />
          <Box sx={{ p: 2, bgcolor: 'white', flexShrink: 0 }}>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              {footerActions}
            </Stack>
          </Box>
        </>
      )}
    </Drawer>
  );
};

AppDrawer.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  footerActions: PropTypes.node,
  paperProps: PropTypes.object,
  contentSx: PropTypes.object,
};

export default AppDrawer;

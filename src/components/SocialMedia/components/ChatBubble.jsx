// src/components/messaging/ChatBubble.jsx
import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';

/**
 * @param {string} text - The message content
 * @param {boolean} isMe - If true, aligns to right (blue). If false, aligns to left (grey).
 */
export default function ChatBubble({ text, isMe }) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isMe ? 'flex-end' : 'flex-start',
        mb: 2, // Space between bubbles
        width: '100%',
      }}
    >
      <Box
        sx={{
          p: 1.5,
          px: 2.5,
          maxWidth: '75%',
          position: 'relative',
          // Blue for "Me", Light Grey for "Them"
          bgcolor: isMe ? 'primary.main' : '#f1f5f9', 
          color: isMe ? '#fff' : 'text.primary',
          borderRadius: 3,
          // Custom corners to create a "tail" effect
          borderBottomRightRadius: isMe ? 0 : 12,
          borderBottomLeftRadius: isMe ? 12 : 0,
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        }}
      >
        <Typography 
          variant="body1" 
          sx={{ 
            fontSize: '0.95rem',
            lineHeight: 1.5,
            wordBreak: 'break-word' 
          }}
        >
          {text}
        </Typography>
        
        {/* Optional: Add a tiny timestamp here if needed */}
      </Box>
    </Box>
  );
}
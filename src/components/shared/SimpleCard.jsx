// src/components/shared/SimpleCard.jsx
import React from 'react';
import { Paper, Box, Typography, Avatar } from '@mui/material';

const SimpleCard = ({ 
  title, 
  value, 
  icon: Icon, 
  iconColor = '#6366f1', 
  subtitle = '', 
  percentage = '',
  iconSize = { xs: 20, sm: 24, md: 28 },     // ✅ responsive icon size
  iconBoxSize = { xs: 40, sm: 48, md: 56 },  // ✅ responsive icon box size
}) => {

  const isReactIcon = Icon && typeof Icon === "function";

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.5, sm: 2, md: 2.5 },
        borderRadius: { xs: '10px', md: '12px' },
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        gap: { xs: 1.2, sm: 1.8, md: 2.2 },
        width: '100%',
        backgroundColor: '#fff',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: { xs: 'none', md: '0px 6px 20px rgba(0,0,0,0.06)' },
          borderColor: iconColor,
          transform: { md: 'translateY(-3px)' },
        },
      }}
    >
      {/* Icon Box */}
      <Avatar
        sx={{
          bgcolor: `${iconColor}15`,
          color: iconColor,
          width: iconBoxSize,
          height: iconBoxSize,
          borderRadius: { xs: '8px', md: '10px' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {Icon && (
          isReactIcon ? (
            <Icon size={iconSize.md || 28} color={iconColor} />
          ) : (
            <Icon sx={{ fontSize: iconSize }} />
          )
        )}
      </Avatar>

      {/* Text Section */}
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        {/* Title Row */}
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 0.5,
            flexWrap: 'wrap',
          }}
        >
          <Typography 
            sx={{ 
              color: '#64748b', 
              fontWeight: 600,
              fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.9rem' },
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {title}
          </Typography>

          {subtitle && (
            <Typography 
              sx={{ 
                color: '#3b82f6', 
                fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' },
                fontWeight: 500,
                whiteSpace: 'nowrap',
              }}
            >
              ({subtitle})
            </Typography>
          )}
        </Box>

        {/* Value Row */}
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'baseline', 
            gap: { xs: 0.4, sm: 0.7, md: 1 },
            mt: 0.3,
            flexWrap: 'wrap',
          }}
        >
          <Typography 
            sx={{ 
              fontWeight: 800, 
              color: '#0f172a',
              fontSize: { xs: '1.05rem', sm: '1.3rem', md: '1.6rem' },
              lineHeight: 1.2,
            }}
          >
            {value}
          </Typography>

          {percentage && (
            <Typography
              sx={{
                fontWeight: 700,
                color: percentage.startsWith('-') ? '#ef4444' : '#10b981',
                fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.9rem' },
                whiteSpace: 'nowrap',
              }}
            >
              {percentage}
            </Typography>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default SimpleCard;
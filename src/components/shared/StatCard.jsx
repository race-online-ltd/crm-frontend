// src/components/shared/StatCard.jsx
import React from "react";
import { Card, CardContent, Box, Typography, Avatar, Divider } from "@mui/material";

const StatCard = ({ 
  icon, 
  iconBg, 
  iconColor, 
  title, 
  value, 
  percentage, 
  footerLabel, 
  footerValue 
}) => {
  return (
    <Card variant="outlined" sx={{ borderRadius: 2, height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ 
        p: 2, 
        flexGrow: 1, 
        display: "flex", 
        flexDirection: "column",
        "&:last-child": { pb: 2 } 
      }}>
        
        {/* Top Section: Fixed height ensures Dividers align */}
        <Box sx={{ minHeight: 80, display: "flex", alignItems: "flex-start", gap: 2 }}>
          <Avatar
            sx={{
              bgcolor: iconBg,
              color: iconColor,
              width: 44,
              height: 44,
              borderRadius: 2,
            }}
          >
            {icon}
          </Avatar>

          <Box sx={{ flexGrow: 1 }}>
            <Typography 
              variant="caption" 
              sx={{ 
                textTransform: "uppercase", 
                fontWeight: 700, 
                color: "text.secondary",
                letterSpacing: 0.5,
                display: "block",
                lineHeight: 1.2,
                mb: 0.5,
                minHeight: 32 // ✅ Forces titles to take 2 lines worth of space
              }}
            >
              {title}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              {value}
            </Typography>
          </Box>

          {percentage !== undefined && (
            <Typography 
              variant="caption" 
              sx={{ color: "text.secondary", fontWeight: "bold" }}
            >
              — {percentage}%
            </Typography>
          )}
        </Box>

        {/* This Divider will now always be at the same vertical position */}
        <Divider sx={{ my: 1.5, borderStyle: "dashed" }} />

        {/* Bottom Section: mt: "auto" pushes it to the bottom of the card */}
        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="center" 
          sx={{ mt: "auto" }} 
        >
          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>
            {footerLabel}
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 700 }}>
            {footerValue}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard;
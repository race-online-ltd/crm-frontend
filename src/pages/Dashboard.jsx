// src/pages/Dashboard.jsx
import React from "react";
import { Box, Typography, Grid, Paper, Stack } from "@mui/material";
import GroupIcon from "@mui/icons-material/Group";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TargetIcon from "@mui/icons-material/Adjust"; 
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import CancelIcon from "@mui/icons-material/Cancel";
import StatCard from "../components/shared/StatCard";

export default function Dashboard() {
  const dashboardStats = [
    { title: "Total KAMs", value: "5", icon: <GroupIcon />, iconBg: "#eef2ff", iconColor: "#4f46e5", footerLabel: "Active accounts", footerValue: "5 active" },
    { title: "Pipeline Value (Current Month)", value: "৳0", icon: <TrendingUpIcon />, iconBg: "#eff6ff", iconColor: "#3b82f6", footerLabel: "Last month", footerValue: "৳0" },
    { title: "Active Leads", value: "4", icon: <TargetIcon />, iconBg: "#fff7ed", iconColor: "#f97316", footerLabel: "In progress", footerValue: "4 leads" },
    { title: "Won Leads (Current Month)", value: "0 (৳0)", icon: <EmojiEventsIcon />, iconBg: "#f0fdf4", iconColor: "#22c55e", footerLabel: "Last month", footerValue: "0 (৳0)" },
    { title: "Lost Leads (Current Month)", value: "0 (৳0)", icon: <CancelIcon />, iconBg: "#fef2f2", iconColor: "#ef4444", footerLabel: "Last month", footerValue: "0 (৳0)" },
  ];

  return (
    <Box sx={{ 
      width: "100%", 
      maxWidth: "100%", // Ensures it never exceeds parent
      overflowX: "hidden", // Safety net for x-scroll
    }}>
      <Typography variant="h5" sx={{ fontWeight: "bold", mb: 3 }}>
        Dashboard Overview
      </Typography>

      {/* Responsive Stats Cards Grid */}
      <Box
        sx={{
          display: "grid",
          gap: 2,
          mb: 4,
          gridTemplateColumns: {
            xs: "1fr",                  // 1 column on mobile
            sm: "repeat(2, 1fr)",       // 2 columns on small tablets
            md: "repeat(3, 1fr)",       // 3 columns on desktops/tablets
            lg: "repeat(5, 1fr)",       // 5 columns on large screens
          },
        }}
      >
        {dashboardStats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </Box>

      {/* Main Content: Charts & Quick Summary */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper sx={{ p: 3, minHeight: 400, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              Sales Overview
            </Typography>
            <Box
              sx={{
                mt: 2,
                height: { xs: 250, md: 320 },
                bgcolor: "#fcfcfc",
                border: "1px dashed #e0e0e0",
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#999",
              }}
            >
              Chart component will go here
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              Quick Summary
            </Typography>
            <Stack spacing={2.5} sx={{ mt: 2 }}>
              {[
                { label: "Total Users", val: "120" },
                { label: "Active Reports", val: "45" },
                { label: "Pending Tasks", val: "12" },
                { label: "Revenue", val: "৳12,000" },
              ].map((item) => (
                <Box key={item.label} display="flex" justifyContent="space-between">
                  <Typography color="text.secondary">{item.label}</Typography>
                  <Typography fontWeight="bold">{item.val}</Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

    </Box>
  );
}
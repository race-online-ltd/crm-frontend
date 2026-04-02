// src/components/layout/Layout.jsx
import React, { useState } from "react";
import { Box, CssBaseline, useTheme, useMediaQuery } from "@mui/material";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";

const SIDEBAR_WIDTH_OPEN  = 240;
const SIDEBAR_WIDTH_CLOSE = 60;

export default function Layout() {
  const theme    = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Mobile starts closed, desktop starts open
  const [open, setOpen] = useState(!isMobile);
  const handleToggle = () => setOpen((prev) => !prev);

  const sidebarWidth = isMobile ? 0 : open ? SIDEBAR_WIDTH_OPEN : SIDEBAR_WIDTH_CLOSE;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <CssBaseline />

      {/* Nav slot — zero width on mobile since drawer is overlaid */}
      <Box
        component="nav"
        sx={{
          width: sidebarWidth,
          flexShrink: 0,
          transition: "width 0.25s ease",
        }}
      >
        {/* ↓ handleToggle now passed so mobile close/toggle works */}
        <Sidebar open={open} handleToggle={handleToggle} />
      </Box>

      {/* Right column */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        <Topbar open={open} handleToggle={handleToggle} />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            // AppBar is 56px on mobile, 64px on desktop
            mt: { xs: "56px", sm: "64px" },
            p: 0,
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <Outlet />
        </Box>

        <Footer />
      </Box>
    </Box>
  );
}
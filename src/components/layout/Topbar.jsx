

// src/components/layout/Topbar.jsx
import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
  Badge,
  Menu,
  MenuItem,
  Divider,
  Avatar,
  ListItemIcon,
} from "@mui/material";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useLocation } from "react-router-dom";

const drawerWidth  = 240;
const collapsedWidth = 60;

export default function Topbar({ open, handleToggle }) {
  const theme    = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [anchorNotif,  setAnchorNotif]  = useState(null);
  const [anchorAvatar, setAnchorAvatar] = useState(null);

  const pageTitle =
    location.pathname.replace("/", "").toUpperCase() || "DASHBOARD";

  // On mobile the sidebar is hidden (width 0), on desktop account for it
  const sidebarWidth = isMobile ? 0 : open ? drawerWidth : collapsedWidth;

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.appBar,
        width: `calc(100% - ${sidebarWidth}px)`,
        ml: `${sidebarWidth}px`,
        transition: theme.transitions.create(["width", "margin"], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        bgcolor: "#F9F9F9",
        color: "#757272",
        // Flat bottom edge — no rounded corners that create a gap
        borderRadius: 0,
        boxShadow: "0px 0px 10px #e0e0e0",
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={handleToggle}
          sx={{ mr: 2, "&:focus": { outline: "none", boxShadow: "none" } }}
        >
          {open && !isMobile ? <MenuOpenIcon /> : <MenuIcon />}
        </IconButton>

        {/* <Typography variant="h6" noWrap sx={{ fontWeight: 600 }}>
          {pageTitle}
        </Typography> */}

        <Box sx={{ flexGrow: 1 }} />

        {/* Notifications */}
        <IconButton
          color="inherit"
          onClick={(e) => setAnchorNotif(e.currentTarget)}
          sx={{ "&:focus": { outline: "none", boxShadow: "none" } }}
        >
          <Badge badgeContent={3} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <Menu
          anchorEl={anchorNotif}
          open={Boolean(anchorNotif)}
          onClose={() => setAnchorNotif(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <MenuItem>📩 New message from Admin</MenuItem>
          <MenuItem>✅ Task completed</MenuItem>
          <MenuItem>⚠️ Server warning</MenuItem>
          <Divider />
          <MenuItem sx={{ justifyContent: "center", fontWeight: 600 }}>
            View All Notifications
          </MenuItem>
        </Menu>

        {/* Avatar */}
        <IconButton
          onClick={(e) => setAnchorAvatar(e.currentTarget)}
          sx={{ ml: 1, "&:focus": { outline: "none", boxShadow: "none" } }}
        >
          <Avatar sx={{ bgcolor: "#2563eb", width: 36, height: 36 }}>U</Avatar>
        </IconButton>
        <Menu
          anchorEl={anchorAvatar}
          open={Boolean(anchorAvatar)}
          onClose={() => setAnchorAvatar(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          PaperProps={{ sx: { width: 260, p: 1 } }}
        >
          <Box sx={{ px: 2, py: 1 }}>
            <Typography fontWeight={600}>John Doe</Typography>
            <Typography variant="body2" color="text.secondary">
              📧 john@gmail.com
            </Typography>
            <Typography variant="body2" color="text.secondary">
              📞 +880 1234-567890
            </Typography>
          </Box>
          <Divider />
          <MenuItem>
            <ListItemIcon><AccountCircleIcon fontSize="small" /></ListItemIcon>
            Profile
          </MenuItem>
          <MenuItem>
            <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
            Settings
          </MenuItem>
          <Divider />
          <MenuItem sx={{ color: "red" }}>
            <ListItemIcon><LogoutIcon fontSize="small" sx={{ color: "red" }} /></ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
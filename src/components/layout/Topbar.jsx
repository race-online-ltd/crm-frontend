

// src/components/layout/Topbar.jsx
import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Stack,
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
import LogoutIcon from "@mui/icons-material/Logout";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { useNavigate } from "react-router-dom";
import { useUserProfile } from "../../features/settings/context/UserProfileContext";

const drawerWidth  = 240;
const collapsedWidth = 60;

export default function Topbar({ open, handleToggle }) {
  const theme    = useTheme();
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [anchorNotif,  setAnchorNotif]  = useState(null);
  const [anchorAvatar, setAnchorAvatar] = useState(null);

  const handleLogout = () => {
    setAnchorAvatar(null);
    setAnchorNotif(null);
    navigate('/login', { replace: true });
  };

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
          PaperProps={{ sx: { width: 300, p: 1 } }}
        >
          <Box sx={{ position: "relative", px: 2, py: 2, pr: 6 }}>
           <IconButton
  onClick={() => {
    setAnchorAvatar(null);
    navigate("/settings/user-profile");
  }}
  sx={{
    position: "absolute",
    top: 28,
    right: 8,
    // width: 32, <-- Remove these to allow expansion
    // height: 32, 
    borderRadius: "8px", // Make it slightly rounded instead of a circle
    px: 1, 
    py: 0.5,
    bgcolor: "#eff6ff",
    border: "1px solid #bfdbfe",
    gap: 0.5, // Adds space between icon and text
    "&:hover": { bgcolor: "#dbeafe" },
  }}
>
  <EditOutlinedIcon sx={{ fontSize: 17, color: "#2563eb" }} />
  <Typography sx={{ fontSize: 12, color: "#2563eb", fontWeight: 500 }}>
    Profile
  </Typography>
</IconButton>

            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar
                src={profile.avatar || ''}
                sx={{ bgcolor: "#2563eb", width: 48, height: 48, fontWeight: 700 }}
              >
                {!profile.avatar ? profile.fullName?.charAt(0) || 'U' : null}
              </Avatar>
              <Box>
                <Typography fontWeight={700}>{profile.fullName}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {profile.role}
                </Typography>
              </Box>
            </Stack>

            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Email: {profile.email}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Mobile: {profile.mobile}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Phone: {profile.phone}
              </Typography>
            </Box>
          </Box>
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ color: "red" }}>
            <ListItemIcon><LogoutIcon fontSize="small" sx={{ color: "red" }} /></ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

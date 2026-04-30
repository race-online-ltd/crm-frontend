

// src/components/layout/Topbar.jsx
import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Stack,
  Button,
  useTheme,
  useMediaQuery,
  Badge,
  Menu,
  MenuItem,
  Divider,
  Avatar,
} from "@mui/material";
import LogoutIcon from '@mui/icons-material/Logout';
import EditIcon from '@mui/icons-material/Edit';
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import { useNavigate } from "react-router-dom";
import { useUserProfile } from "../../features/settings/context/UserProfileContext";

const drawerWidth  = 240;
const collapsedWidth = 60;

export default function Topbar({ open, handleToggle }) {
  const theme    = useTheme();
  const navigate = useNavigate();
  const { profile, logout } = useUserProfile();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [anchorNotif,  setAnchorNotif]  = useState(null);
  const [anchorAvatar, setAnchorAvatar] = useState(null);

  const handleLogout = async () => {
    setAnchorAvatar(null);
    setAnchorNotif(null);

    try {
      await logout();
    } finally {
      navigate('/login', { replace: true });
    }
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

        {!isMobile && profile?.role ? (
          <Box
            sx={{
              mr: 1.5,
              px: 1.5,
              py: 0.75,
              borderRadius: "999px",
              border: "1px solid #dbe4ee",
              bgcolor: "#ffffff",
              color: "#475569",
              fontSize: "0.78rem",
              fontWeight: 700,
              lineHeight: 1,
              whiteSpace: "nowrap",
            }}
          >
            {profile.role}
          </Box>
        ) : null}

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
          PaperProps={{
            sx: {
              width: { xs: 'calc(100vw - 16px)', sm: 320 },
              maxWidth: 360,
              p: 1,
            },
          }}
        >
          <Box sx={{ position: "relative", px: 2, py: 2, pr: 6 }}>

            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0, pr: 2.5 }}>
              <Avatar
                src={profile.avatar || ''}
                sx={{ bgcolor: "#2563eb", width: 48, height: 48, fontWeight: 700 }}
              >
                {!profile.avatar ? profile.fullName?.charAt(0) || 'U' : null}
              </Avatar>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  fontWeight={800}
                  sx={{
                    fontSize: 15,
                    lineHeight: 1.25,
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                    display: '-webkit-box',
                    WebkitBoxOrient: 'vertical',
                    WebkitLineClamp: 2,
                    overflow: 'hidden',
                  }}
                >
                  {profile.fullName}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                    display: '-webkit-box',
                    WebkitBoxOrient: 'vertical',
                    WebkitLineClamp: 2,
                    overflow: 'hidden',
                  }}
                >
                  ID: {profile.userName}
                </Typography>
              </Box>
            </Stack>

            <Box sx={{ mt: 2, display: 'grid', gap: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                <EmailOutlinedIcon sx={{ fontSize: 17, color: '#64748b', flexShrink: 0 }} />
                <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
                  {profile.email || 'Not available'}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                <PhoneOutlinedIcon sx={{ fontSize: 17, color: '#64748b', flexShrink: 0 }} />
                <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
                  {profile.mobile || 'Not available'}
                </Typography>
              </Stack>
            </Box>
          </Box>
          <Divider />
          <Box sx={{ px: 2, py: 1.5, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.25 }}>
            <Button
              variant="outlined"
              onClick={() => {
                setAnchorAvatar(null);
                navigate("/profile");
              }}
              startIcon={<EditIcon />}
              sx={{
                justifyContent: 'center',
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 700,
                color: '#2563eb',
                borderColor: '#bfdbfe',
                bgcolor: '#eff6ff',
                '&:hover': {
                  borderColor: '#93c5fd',
                  bgcolor: '#dbeafe',
                },
              }}
            >
              Profile
            </Button>
            <Button
              variant="contained"
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
              sx={{
                justifyContent: 'center',
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 700,
                bgcolor: '#ef4444',
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: '#dc2626',
                  boxShadow: 'none',
                },
              }}
            >
              Logout
            </Button>
          </Box>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

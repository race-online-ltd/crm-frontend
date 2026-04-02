
// src/components/layout/Sidebar.jsx
import React from "react";
import {
  Drawer,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import ForumIcon from '@mui/icons-material/Forum';
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import BarChartIcon from "@mui/icons-material/BarChart";
import SettingsIcon from "@mui/icons-material/Settings";
import DragIndicatorOutlinedIcon from '@mui/icons-material/DragIndicatorOutlined';
import { Link, useLocation } from "react-router-dom";
import { Box } from "@mui/material";
import logo from "../../assets/earth.png";

const drawerWidth = 240;
const collapsedWidth = 60;

const menuItems = [
  { text: "Dashboard",  icon: <DashboardIcon />,             path: "/" },
  { text: "Users",      icon: <PeopleIcon />,                path: "/users" },
  { text: "Reports",    icon: <BarChartIcon />,              path: "/reports" },
  { text: "Social",     icon: <ForumIcon />,                 path: "/social" },
  { text: "Social V1",  icon: <ForumIcon />,                 path: "/social_v1" },
  { text: "Components", icon: <DragIndicatorOutlinedIcon />, path: "/components" },
  { text: "Settings",   icon: <SettingsIcon />,              path: "/settings" },
  { text: "Leads",      icon: <PeopleIcon />,                path: "/leads/new" },
  { text: "Tasks",      icon: <BarChartIcon />,              path: "/tasks" },
];

const sharedPaperSx = {
  overflowX: "hidden",
  boxSizing: "border-box",
  backgroundColor: "#F9F9F9",
  // Remove rounded corners so it butts flush against the topbar
  borderRadius: 0,
  borderRight: "1px solid #e0e0e0",
};

export default function Sidebar({ open, handleToggle }) {
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const drawerContent = (
    <>
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          px: 2,
          minHeight: { xs: 56, sm: 64 },
        }}
      >
        <Box
          component="img"
          src={logo}
          alt="Logo"
          sx={{
            height: open ? 54 : 36,
            width: open ? 'auto' : 45,
            objectFit: 'contain',
            transition: "all 0.25s ease",
          }}
        />
      </Toolbar>

      <Divider />

      <List>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.text}
            component={Link}
            to={item.path}
            selected={location.pathname === item.path}
            onClick={isMobile ? handleToggle : undefined}
            sx={{
              justifyContent: open ? "initial" : "center",
              px: 2.5,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 3 : "auto",
                justifyContent: "center",
              }}
            >
              {item.icon}
            </ListItemIcon>
            {open && <ListItemText primary={item.text} />}
          </ListItemButton>
        ))}
      </List>
    </>
  );

  // ── Mobile: temporary drawer (fully hidden, slides in on toggle) ──────────
if (isMobile) {
  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={handleToggle}
      ModalProps={{ keepMounted: true }}
      sx={{
        // Sit below the AppBar so the topbar toggle button is always tappable
        zIndex: (theme) => theme.zIndex.appBar - 1,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          // Push content down so it doesn't hide behind the AppBar
          mt: { xs: '56px', sm: '64px' },
          height: { xs: 'calc(100% - 56px)', sm: 'calc(100% - 64px)' },
          ...sharedPaperSx,
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}

  // ── Desktop: permanent collapsible drawer ─────────────────────────────────
  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        width: open ? drawerWidth : collapsedWidth,
        flexShrink: 0,
        whiteSpace: "nowrap",
        "& .MuiDrawer-paper": {
          width: open ? drawerWidth : collapsedWidth,
          transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          ...sharedPaperSx,
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}
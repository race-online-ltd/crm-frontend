
// src/components/layout/Sidebar.jsx
import React, { useState } from "react";
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
  Collapse,
} from "@mui/material";
import ForumIcon from '@mui/icons-material/Forum';
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import BarChartIcon from "@mui/icons-material/BarChart";
import InsightsIcon from "@mui/icons-material/Insights";
import SettingsIcon from "@mui/icons-material/Settings";
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import RequestQuoteOutlinedIcon from "@mui/icons-material/RequestQuoteOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import GroupIcon from "@mui/icons-material/Group";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import Groups2Icon from "@mui/icons-material/Groups2";
import HubIcon from "@mui/icons-material/Hub";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import { Link, useLocation } from "react-router-dom";
import { Box } from "@mui/material";
import logo from "../../assets/earth.png";

const drawerWidth = 240;
const collapsedWidth = 60;

const menuItems = [
  // { text: "Dashboard",  icon: <DashboardIcon />,             path: "/" },
  // { text: "Users",      icon: <PeopleIcon />,                path: "/users" },
  // { text: "Reports",    icon: <BarChartIcon />,              path: "/reports" },
  { text: "Social",     icon: <ForumIcon />,                 path: "/social" },
  { text: "Performance", icon: <InsightsIcon />,             path: "/performance" },
  { text: "Target",     icon: <TrackChangesIcon />,           path: "/target" },
  { text: "Leads",      icon: <LeaderboardIcon />,            path: "/leads" },
  { text: "Tasks",      icon: <TaskAltIcon />,                path: "/tasks" },
  { text: "Price Proposal", icon: <RequestQuoteOutlinedIcon />, path: "/price-proposal" },
  { text: "Price History", icon: <HistoryOutlinedIcon />, path: "/price-history" },
  { text: "Approval Requests", icon: <AssignmentTurnedInOutlinedIcon />, path: "/approval/requests" },
  { text: "Components", icon: <GridViewRoundedIcon />,               path: "/components" },
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
  const [settingsOpen, setSettingsOpen] = useState(location.pathname.startsWith("/settings"));

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

        {/* Settings with collapsible subtabs */}
        <ListItemButton
          onClick={() => setSettingsOpen((prev) => !prev)}
          sx={{ justifyContent: open ? "initial" : "center", px: 2.5 }}
        >
          <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : "auto", justifyContent: "center" }}>
            <SettingsIcon />
          </ListItemIcon>
          {open && <ListItemText primary="Settings" />}
          {open && (settingsOpen ? <ExpandLess /> : <ExpandMore />)}
        </ListItemButton>

        {/* <Collapse in={settingsOpen && open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton
              component={Link}
              to="/settings/users"
              selected={location.pathname === "/settings/users"}
              onClick={isMobile ? handleToggle : undefined}
              sx={{ pl: 7 }}
            >
              <ListItemIcon sx={{ minWidth: 0, mr: 2 }}>
                <GroupIcon sx={{ fontSize: '1.2rem' }} />
              </ListItemIcon>
              <ListItemText primary="System Users" primaryTypographyProps={{ fontSize: '0.85rem' }} />
            </ListItemButton>
            <ListItemButton
              component={Link}
              to="/settings/data-access-control"
              selected={location.pathname === "/settings/data-access-control"}
              onClick={isMobile ? handleToggle : undefined}
              sx={{ pl: 7 }}
            >
              <ListItemIcon sx={{ minWidth: 0, mr: 2 }}>
                <LockOutlinedIcon sx={{ fontSize: '1.2rem' }} />
              </ListItemIcon>
              <ListItemText primary="Data Access Control" primaryTypographyProps={{ fontSize: '0.85rem' }} />
            </ListItemButton>
            <ListItemButton
              component={Link}
              to="/settings/social"
              selected={location.pathname === "/settings/social"}
              to="/settings/team"
              selected={location.pathname === "/settings/team"}
              onClick={isMobile ? handleToggle : undefined}
              sx={{ pl: 7 }}
            >
              <ListItemIcon sx={{ minWidth: 0, mr: 2 }}>
                <HubOutlinedIcon sx={{ fontSize: '1.2rem' }} />
              </ListItemIcon>
              <ListItemText primary="Social Settings" primaryTypographyProps={{ fontSize: '0.85rem' }} />
                <Groups2Icon sx={{ fontSize: '1.2rem' }} />
              </ListItemIcon>
              <ListItemText primary="Team" primaryTypographyProps={{ fontSize: '0.85rem' }} />
            </ListItemButton>
            <ListItemButton
              component={Link}
              to="/settings/group"
              selected={location.pathname === "/settings/group"}
              onClick={isMobile ? handleToggle : undefined}
              sx={{ pl: 7 }}
            >
              <ListItemIcon sx={{ minWidth: 0, mr: 2 }}>
                <HubIcon sx={{ fontSize: '1.2rem' }} />
              </ListItemIcon>
              <ListItemText primary="Group" primaryTypographyProps={{ fontSize: '0.85rem' }} />
            </ListItemButton>
          </List> */}
          <Collapse in={settingsOpen && open} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton
                component={Link}
                to="/settings/users"
                selected={location.pathname === "/settings/users"}
                onClick={isMobile ? handleToggle : undefined}
                sx={{ pl: 7 }}
              >
                <ListItemIcon sx={{ minWidth: 0, mr: 2 }}>
                  <GroupIcon sx={{ fontSize: '1.2rem' }} />
                </ListItemIcon>
                <ListItemText primary="System Users" primaryTypographyProps={{ fontSize: '0.85rem' }} />
              </ListItemButton>

           

              <ListItemButton
                component={Link}
                to="/settings/data-access-control"
                selected={location.pathname === "/settings/data-access-control"}
                onClick={isMobile ? handleToggle : undefined}
                sx={{ pl: 7 }}
              >
                <ListItemIcon sx={{ minWidth: 0, mr: 2 }}>
                  <LockOutlinedIcon sx={{ fontSize: '1.2rem' }} />
                </ListItemIcon>
                <ListItemText primary="Access Control" primaryTypographyProps={{ fontSize: '0.85rem' }} />
              </ListItemButton>

              <ListItemButton
                component={Link}
                to="/settings/role-mapping"
                selected={location.pathname === "/settings/role-mapping"}
                onClick={isMobile ? handleToggle : undefined}
                sx={{ pl: 7 }}
              >
                <ListItemIcon sx={{ minWidth: 0, mr: 2 }}>
                  <SecurityOutlinedIcon sx={{ fontSize: '1.2rem' }} />
                </ListItemIcon>
                <ListItemText primary="Role Mapping" primaryTypographyProps={{ fontSize: '0.85rem' }} />
              </ListItemButton>

              {/* Fixed Social Settings */}
              <ListItemButton
                component={Link}
                to="/settings/social"
                selected={location.pathname === "/settings/social"}
                onClick={isMobile ? handleToggle : undefined}
                sx={{ pl: 7 }}
              >
                <ListItemIcon sx={{ minWidth: 0, mr: 2 }}>
                  <HubOutlinedIcon sx={{ fontSize: '1.2rem' }} />
                </ListItemIcon>
                <ListItemText primary="Social Settings" primaryTypographyProps={{ fontSize: '0.85rem' }} />
              </ListItemButton>

              {/* Fixed Team Settings */}
              <ListItemButton
                component={Link}
                to="/settings/team"
                selected={location.pathname === "/settings/team"}
                onClick={isMobile ? handleToggle : undefined}
                sx={{ pl: 7 }}
              >
                <ListItemIcon sx={{ minWidth: 0, mr: 2 }}>
                  <Groups2Icon sx={{ fontSize: '1.2rem' }} />
                </ListItemIcon>
                <ListItemText primary="Team" primaryTypographyProps={{ fontSize: '0.85rem' }} />
              </ListItemButton>

              <ListItemButton
                component={Link}
                to="/settings/group"
                selected={location.pathname === "/settings/group"}
                onClick={isMobile ? handleToggle : undefined}
                sx={{ pl: 7 }}
              >
                <ListItemIcon sx={{ minWidth: 0, mr: 2 }}>
                  <HubIcon sx={{ fontSize: '1.2rem' }} />
                </ListItemIcon>
                <ListItemText primary="Group" primaryTypographyProps={{ fontSize: '0.85rem' }} />
              </ListItemButton>
            </List>
          </Collapse>
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

import { FaHome, FaServer, FaChartLine, FaCog, FaList } from 'react-icons/fa';

export const sidebarMenu = [
  {
    title: 'Home',
    path: '/admin/home',
    icon: <FaHome />,
  },
  {
    title: 'Dashboard',
    path: '/admin/dashboard',
    icon: <FaChartLine />,
  },
  {
    title: 'Reports',
    icon: <FaList />,
    submenu: [
      {
        title: 'Device List',
        path: '/admin/reports/device-list',
      },
      {
        title: 'Log',
        path: '/admin/reports/log',
      },
      {
        title: 'Alarm Log',
        path: '/admin/reports/alarm',
      },
    ],
  },
  {
    title: 'Servers',
    path: '/admin/servers',
    icon: <FaServer />,
  },

  {
    title: 'Settings',
    icon: <FaCog />,
    submenu: [
      {
        title: 'User Management',
        icon: <FaCog />,
        submenu: [
          {
            title: 'Users',
            path: '/admin/users',
          },
          {
            title: 'Role List',
            path: '/admin/roles',
          },
        ],
      },
      {
        title: 'Data Center',
        submenu: [
          {
            title: 'Data Center',
            path: '/admin/settings/datacenter-show',
          },
          {
            title: 'Device',
            path: '/admin/settings/devices-list',
          },
          {
            title: 'Sensor',
            path: '/admin/settings/sensor-lists',
          },
          {
            title: 'Partner',
            path: '/admin/settings/partner-list',
          },
          {
            title: 'Division',
            path: '/admin/settings/division',
          },
        ],
      },
      {
        title: 'Configuration',
        submenu: [
          {
            title: 'Threshold Types',
            path: '/admin/settings/threshold-types',
          },
          {
            title: 'Threshold',
            path: '/admin/settings/threshold-values',
          },
          {
            title: 'State',
            path: '/admin/settings/state-configs',
          },
          {
            title: 'DO',
            path: '/admin/settings/control-config',
          },
        ],
      },
      {
        title: 'Mappings',
        submenu: [
          {
            title: 'Dashboard',
            path: '/admin/settings/dashboart-tab-mappings',
          },
          {
            title: 'DC User',
            path: '/admin/settings/dc-user-mapping',
          },
          {
            title: 'DC Partner',
            path: '/admin/settings/dc-partner-mapping',
          },
        ],
      },
      {
        title: 'SLD',
        submenu: [
          {
            title: 'Upload',
            path: '/admin/settings/svguploader',
          },
          {
            title: 'Preview',
            path: '/admin/settings/svgpreviewer',
          },
        ],
      },
    ],
  },
];

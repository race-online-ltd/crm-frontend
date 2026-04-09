export const INITIAL_ROLE_OPTIONS = [
  { id: 'admin', label: 'Admin' },
  { id: 'manager', label: 'Manager' },
  { id: 'executive', label: 'Executive' },
  { id: 'viewer', label: 'Viewer' },
];

export const ROLE_MAPPING_PAGES = [
  {
    id: 'page_social',
    label: 'Social',
    type: 'Sidebar Tab',
    routeGroup: 'Main Navigation',
    buttons: [
      { id: 'social_convert_to_task', label: 'Convert to Task' },
      { id: 'social_convert_to_lead', label: 'Convert to Lead' },
    ],
  },
  {
    id: 'page_performance',
    label: 'Performance',
    type: 'Sidebar Tab',
    routeGroup: 'Main Navigation',
    buttons: [],
  },
  {
    id: 'page_target',
    label: 'Target',
    type: 'Sidebar Tab',
    routeGroup: 'Main Navigation',
    buttons: [
      { id: 'target_set_target', label: 'Set Target' },
    ],
  },
  {
    id: 'page_leads',
    label: 'Leads',
    type: 'Sidebar Tab',
    routeGroup: 'Main Navigation',
    buttons: [
      { id: 'lead_list_add_lead', label: 'Add Lead' },
      { id: 'lead_list_filter', label: 'Filter' },
    ],
  },
  {
    id: 'page_tasks',
    label: 'Tasks',
    type: 'Sidebar Tab',
    routeGroup: 'Main Navigation',
    buttons: [
      { id: 'tasks_add_task', label: 'Add Task' },
      { id: 'tasks_filter', label: 'Filter' },
    ],
  },
  {
    id: 'page_components',
    label: 'Components',
    type: 'Sidebar Tab',
    routeGroup: 'Main Navigation',
    buttons: [],
  },
  {
    id: 'page_settings_users',
    label: 'System Users',
    type: 'Settings Subtab',
    routeGroup: 'Settings',
    buttons: [
      { id: 'system_users_add_user', label: 'Add User' },
      { id: 'system_users_edit_user', label: 'Edit User' },
      { id: 'system_users_assign_mapping', label: 'Assign Mapping' },
    ],
  },
  {
    id: 'page_settings_access_control',
    label: 'Access Control',
    type: 'Settings Subtab',
    routeGroup: 'Settings',
    buttons: [
      { id: 'data_access_edit', label: 'Edit Permissions' },
    ],
  },
  {
    id: 'page_settings_role_mapping',
    label: 'Role Mapping',
    type: 'Settings Subtab',
    routeGroup: 'Settings',
    buttons: [
      { id: 'role_mapping_add_role', label: 'Add Role' },
      { id: 'role_mapping_save', label: 'Save Access' },
    ],
  },
  {
    id: 'page_settings_social',
    label: 'Social Settings',
    type: 'Settings Subtab',
    routeGroup: 'Settings',
    buttons: [
      { id: 'social_settings_add_configuration', label: 'Add Configuration' },
      { id: 'social_settings_save_configuration', label: 'Save Configuration' },
    ],
  },
  {
    id: 'page_settings_team',
    label: 'Team',
    type: 'Settings Subtab',
    routeGroup: 'Settings',
    buttons: [],
  },
  {
    id: 'page_settings_group',
    label: 'Group',
    type: 'Settings Subtab',
    routeGroup: 'Settings',
    buttons: [],
  },
  {
    id: 'page_user_mapping',
    label: 'User Mapping',
    type: 'Page',
    routeGroup: 'Settings Flow',
    buttons: [
      { id: 'user_mapping_save', label: 'Save Mapping' },
    ],
  },
];

export function buildDefaultRolePermissions() {
  return ROLE_MAPPING_PAGES.reduce((acc, page) => {
    acc[page.id] = false;
    page.buttons.forEach((button) => {
      acc[button.id] = false;
    });
    return acc;
  }, {});
}

export const INITIAL_ROLE_PERMISSIONS = {
  admin: ROLE_MAPPING_PAGES.reduce((acc, page) => {
    acc[page.id] = true;
    page.buttons.forEach((button) => {
      acc[button.id] = true;
    });
    return acc;
  }, {}),
  manager: {
    ...buildDefaultRolePermissions(),
    page_social: true,
    page_performance: true,
    page_target: true,
    page_leads: true,
    page_tasks: true,
    page_settings_users: true,
    page_settings_access_control: true,
    page_settings_role_mapping: true,
    page_settings_social: true,
    page_user_mapping: true,
    system_users_add_user: true,
    system_users_edit_user: true,
    system_users_assign_mapping: true,
    data_access_edit: true,
    role_mapping_save: true,
    social_settings_add_configuration: true,
    social_settings_save_configuration: true,
    social_convert_to_task: true,
    social_convert_to_lead: true,
    user_mapping_save: true,
    lead_list_add_lead: true,
    tasks_add_task: true,
    target_set_target: true,
  },
  executive: {
    ...buildDefaultRolePermissions(),
    page_social: true,
    page_target: true,
    page_leads: true,
    page_tasks: true,
    social_convert_to_task: true,
    social_convert_to_lead: true,
    lead_list_add_lead: true,
    tasks_add_task: true,
  },
  viewer: {
    ...buildDefaultRolePermissions(),
    page_social: true,
    page_leads: true,
    page_tasks: true,
  },
};

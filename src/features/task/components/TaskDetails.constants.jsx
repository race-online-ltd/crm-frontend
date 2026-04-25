import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PhoneIcon from '@mui/icons-material/Phone';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import ReplayIcon from '@mui/icons-material/Replay';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import BlockIcon from '@mui/icons-material/Block';

export const TYPE_CONFIG = {
  call: { label: 'Call', icon: <PhoneIcon sx={{ fontSize: 11 }} />, color: '#6d28d9', bg: '#f5f3ff', border: '#ddd6fe' },
  physical_meeting: { label: 'Physical Meeting', icon: <PeopleAltOutlinedIcon sx={{ fontSize: 11 }} />, color: '#0369a1', bg: '#f0f9ff', border: '#bae6fd' },
  virtual_meeting: { label: 'Virtual Meeting', icon: <VideocamOutlinedIcon sx={{ fontSize: 11 }} />, color: '#7c3aed', bg: '#faf5ff', border: '#e9d5ff' },
  follow_up: { label: 'Follow Up', icon: <ReplayIcon sx={{ fontSize: 11 }} />, color: '#92400e', bg: '#fffbeb', border: '#fde68a' },
};

export const STATUS_CONFIG = {
  overdue: { label: 'Overdue', color: '#b45309', bg: '#fef3c7', border: '#fcd34d', icon: <AccessTimeIcon sx={{ fontSize: 11 }} /> },
  pending: { label: 'Pending', color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe', icon: <AccessTimeIcon sx={{ fontSize: 11 }} /> },
  completed: { label: 'Completed', color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0', icon: <TaskAltIcon sx={{ fontSize: 11 }} /> },
  cancelled: { label: 'Cancelled', color: '#b91c1c', bg: '#fef2f2', border: '#fecaca', icon: <BlockIcon sx={{ fontSize: 11 }} /> },
};

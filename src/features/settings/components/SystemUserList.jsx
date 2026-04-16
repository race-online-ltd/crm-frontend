import React, { useMemo } from 'react';
import { Chip } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import BaseTable from '../../../components/shared/BaseTable';

export default function SystemUserList({
  users = [],
  onEdit,
  onAssign,
  onConnectAccounts,
  loading = false,
  page = 0,
  rowsPerPage = 10,
  totalCount = 0,
  onPageChange,
  onRowsPerPageChange,
}) {
  const columns = [
    { id: 'fullName', label: 'Full Name' },
    { id: 'userName', label: 'User Name' },
    { id: 'email', label: 'Email' },
    { id: 'phone', label: 'Phone' },
    { id: 'roleDisplay', label: 'Role' },
    { id: 'statusDisplay', label: 'Status' },
  ];

  const rows = useMemo(() => (
    users.map((user) => ({
      ...user,
      roleDisplay: (
        <Chip
          label={user.roleName || user.role_name || 'N/A'}
          size="small"
          sx={{
            fontSize: 11,
            fontWeight: 700,
            bgcolor: '#eff6ff',
            color: '#2563eb',
            border: '1px solid #bfdbfe',
          }}
        />
      ),
      statusDisplay: (
        <Chip
          label={user.status ? 'Active' : 'Inactive'}
          size="small"
          sx={{
            fontSize: 11,
            fontWeight: 700,
            bgcolor: user.status ? '#dcfce7' : '#fee2e2',
            color: user.status ? '#16a34a' : '#dc2626',
            border: `1px solid ${user.status ? '#bbf7d0' : '#fecaca'}`,
          }}
        />
      ),
    }))
  ), [users]);

  return (
    <BaseTable
      title="System Users Directory"
      columns={columns}
      rows={rows}
      selectable={false}
      hasAction
      onEditRow={(row) => onEdit?.(users.find((user) => user.id === row.id) || row)}
      renderRowActions={(row) => (
        <>
          <Tooltip title="Assign Mapping">
            <IconButton
              size="small"
              onClick={(event) => {
                event.stopPropagation();
                onAssign?.(users.find((user) => user.id === row.id) || row);
              }}
            >
              <AssignmentIndOutlinedIcon sx={{ color: '#2563eb', fontSize: '1.15rem' }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Connect System Accounts">
            <IconButton
              size="small"
              onClick={(event) => {
                event.stopPropagation();
                onConnectAccounts?.(users.find((user) => user.id === row.id) || row);
              }}
            >
              <HubOutlinedIcon sx={{ color: '#0f766e', fontSize: '1.15rem' }} />
            </IconButton>
          </Tooltip>
        </>
      )}
      showDeleteAction={false}
      showToolbar={false}
      showDenseToggle={false}
      loading={loading}
      manualPagination
      totalCount={totalCount}
      page={page}
      rowsPerPage={rowsPerPage}
      onPageChange={onPageChange}
      onRowsPerPageChange={onRowsPerPageChange}
    />
  );
}

import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Chip, InputAdornment, Stack, Typography } from '@mui/material';
import HubIcon from '@mui/icons-material/Hub';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import SearchIcon from '@mui/icons-material/Search';

import TextInputField from '../../../components/shared/TextInputField';
import BaseTable from '../../../components/shared/BaseTable';
import OrbitLoader from './OrbitLoader';

const buildLabelMap = (options) =>
  options.reduce((acc, option) => {
    acc[option.id] = option.label;
    return acc;
  }, {});

function ChipGroup({ ids, labels }) {
  return (
    <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
      {ids.map((id) => (
        <Chip
          key={id}
          label={labels[id] || id}
          size="small"
          sx={{
            fontSize: 11,
            fontWeight: 700,
            bgcolor: '#eff6ff',
            color: '#2563eb',
            border: '1px solid #bfdbfe',
          }}
        />
      ))}
    </Stack>
  );
}

export default function GroupTable({
  groups = [],
  supervisorOptions = [],
  teamOptions = [],
  onAddNew,
  onEdit,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const supervisorLabels = useMemo(() => buildLabelMap(supervisorOptions), [supervisorOptions]);
  const teamLabels = useMemo(() => buildLabelMap(teamOptions), [teamOptions]);

  const filteredGroups = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return groups.filter((group) => {
      if (!query) return true;

      const searchText = [
        group.groupName,
        ...group.supervisor.map((id) => supervisorLabels[id] || ''),
        ...group.teamName.map((id) => teamLabels[id] || ''),
      ]
        .join(' ')
        .toLowerCase();

      return searchText.includes(query);
    });
  }, [groups, searchQuery, supervisorLabels, teamLabels]);

  const rows = useMemo(
    () =>
      filteredGroups.map((group) => ({
        ...group,
        supervisorDisplay: <ChipGroup ids={group.supervisor} labels={supervisorLabels} />,
        teamNameDisplay: <ChipGroup ids={group.teamName} labels={teamLabels} />,
        statusDisplay: (
          <Chip
            label={group.status ? 'Active' : 'Inactive'}
            size="small"
            sx={{
              fontSize: 11,
              fontWeight: 700,
              bgcolor: group.status ? '#dcfce7' : '#fee2e2',
              color: group.status ? '#16a34a' : '#dc2626',
              border: `1px solid ${group.status ? '#bbf7d0' : '#fecaca'}`,
            }}
          />
        ),
      })),
    [filteredGroups, supervisorLabels, teamLabels]
  );

  const columns = [
    { id: 'groupName', label: 'Group Name' },
    { id: 'supervisorDisplay', label: 'Supervisor' },
    { id: 'teamNameDisplay', label: 'Team Name' },
    { id: 'statusDisplay', label: 'Status' },
  ];

  return (
    <>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        sx={{ mb: 3 }}
        gap={2}
      >
        <Box>
          <Stack direction="row" alignItems="center" spacing={1.5} mb={0.75}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: '12px',
                bgcolor: '#eff6ff',
                border: '1px solid #bfdbfe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <HubIcon sx={{ fontSize: 22, color: '#2563eb' }} />
            </Box>
            <Typography variant="h5" fontWeight={800} color="#111827" letterSpacing="-0.3px">
              Group
            </Typography>
          </Stack>
        </Box>

        <Button
          variant="contained"
          startIcon={<GroupAddIcon />}
          onClick={onAddNew}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 700,
            fontSize: 13,
            px: 2.5,
            py: 1,
            boxShadow: '0 1px 3px rgba(37,99,235,0.25)',
            whiteSpace: 'nowrap',
            alignSelf: { xs: 'stretch', sm: 'auto' },
          }}
        >
          Add New
        </Button>
      </Stack>

      <Box sx={{ mb: 2, width: '100%', maxWidth: { xs: '100%', sm: 420 } }}>
        <TextInputField
          name="group-search"
          // label="Search Group"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by group, supervisor, or team"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <BaseTable
        title="Group Directory"
        columns={columns}
        rows={isLoading ? [] : rows}
        selectable={false}
        hasAction
        onEditRow={(row) => onEdit?.(groups.find((group) => group.id === row.id) || row)}
        showDeleteAction={false}
        showToolbar={false}
        showDenseToggle={false}
        emptyMessage="No data found"
        loading={isLoading}
        loadingContent={(
          <OrbitLoader
            title="Loading group directory"
            subtitle="The globe is syncing group, supervisor, and team information."
            minHeight={220}
          />
        )}
      />
    </>
  );
}

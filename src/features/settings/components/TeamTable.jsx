import React, { useMemo, useState } from 'react';
import { Box, Button, Chip, InputAdornment, Stack, Typography } from '@mui/material';
import Groups2Icon from '@mui/icons-material/Groups2';
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

function ChipGroup({ ids = [], labels }) {
  return (
    <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
      {ids.length > 0 ? ids.map((id) => (
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
      )) : (
        <Typography variant="caption" color="#94a3b8">
          Not assigned
        </Typography>
      )}
    </Stack>
  );
}

export default function TeamTable({
  teams = [],
  supervisorOptions = [],
  kamOptions = [],
  onAddNew,
  onEdit,
  loading = false,
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const supervisorLabels = useMemo(() => buildLabelMap(supervisorOptions), [supervisorOptions]);
  const kamLabels = useMemo(() => buildLabelMap(kamOptions), [kamOptions]);

  const filteredTeams = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return teams.filter((team) => {
      if (!query) return true;

      const searchText = [
        team.teamName,
        ...team.supervisor.map((id) => supervisorLabels[id] || ''),
        ...team.assignKAM.map((id) => kamLabels[id] || ''),
      ]
        .join(' ')
        .toLowerCase();

      return searchText.includes(query);
    });
  }, [teams, searchQuery, supervisorLabels, kamLabels]);

  const rows = useMemo(
    () =>
      filteredTeams.map((team) => ({
        ...team,
        supervisorDisplay: <ChipGroup ids={team.supervisor} labels={supervisorLabels} />,
        assignKAMDisplay: <ChipGroup ids={team.assignKAM} labels={kamLabels} />,
        statusDisplay: (
          <Chip
            label={team.status ? 'Active' : 'Inactive'}
            size="small"
            sx={{
              fontSize: 11,
              fontWeight: 700,
              bgcolor: team.status ? '#dcfce7' : '#fee2e2',
              color: team.status ? '#16a34a' : '#dc2626',
              border: `1px solid ${team.status ? '#bbf7d0' : '#fecaca'}`,
            }}
          />
        ),
      })),
    [filteredTeams, supervisorLabels, kamLabels],
  );

  const columns = [
    { id: 'teamName', label: 'Team Name' },
    { id: 'supervisorDisplay', label: 'Supervisor' },
    { id: 'assignKAMDisplay', label: 'Assign KAM' },
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
              <Groups2Icon sx={{ fontSize: 22, color: '#2563eb' }} />
            </Box>
            <Typography variant="h5" fontWeight={800} color="#111827" letterSpacing="-0.3px">
              Team
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
          name="team-search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by team, supervisor, or KAM"
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
        title="Team Directory"
        columns={columns}
        rows={loading ? [] : rows}
        selectable={false}
        hasAction
        onEditRow={(row) => onEdit?.(teams.find((team) => team.id === row.id) || row)}
        showDeleteAction={false}
        showToolbar={false}
        showDenseToggle={false}
        emptyMessage="No data found"
        loading={loading}
        loadingContent={(
          <OrbitLoader
            title="Loading team directory"
            subtitle="syncing team, supervisor, and KAM data...."
            minHeight={220}
          />
        )}
      />
    </>
  );
}

import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Chip, InputAdornment, Stack, Typography } from '@mui/material';
import ApartmentIcon from '@mui/icons-material/Apartment';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import SearchIcon from '@mui/icons-material/Search';

import TextInputField from '../../../components/shared/TextInputField';
import BaseTable from '../../../components/shared/BaseTable';
import OrbitLoader from './OrbitLoader';

function buildRows(entities = []) {
  return entities.map((entity) => ({
    ...entity,
    statusDisplay: (
      <Chip
        label={entity.status ? 'Active' : 'Inactive'}
        size="small"
        sx={{
          fontSize: 11,
          fontWeight: 700,
          bgcolor: entity.status ? '#dcfce7' : '#fee2e2',
          color: entity.status ? '#16a34a' : '#dc2626',
          border: `1px solid ${entity.status ? '#bbf7d0' : '#fecaca'}`,
        }}
      />
    ),
  }));
}

export default function BusinessEntityTable({
  businessEntities = [],
  onAddNew,
  onEdit,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const filteredEntities = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return businessEntities;
    }

    return businessEntities.filter((entity) => {
      return [
        entity.name,
        entity.status ? 'active' : 'inactive',
      ].join(' ').toLowerCase().includes(query);
    });
  }, [businessEntities, searchQuery]);

  const rows = useMemo(() => buildRows(filteredEntities), [filteredEntities]);

  const columns = [
    { id: 'name', label: 'Business Entity Name' },
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
              <ApartmentIcon sx={{ fontSize: 22, color: '#2563eb' }} />
            </Box>
            <Typography variant="h5" fontWeight={800} color="#111827" letterSpacing="-0.3px">
              Business Entity
            </Typography>
          </Stack>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddBusinessIcon />}
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
          name="business-entity-search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by business entity name"
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
        title="Business Entity Directory"
        columns={columns}
        rows={isLoading ? [] : rows}
        selectable={false}
        hasAction
        onEditRow={(row) => onEdit?.(businessEntities.find((entity) => entity.id === row.id) || row)}
        showDeleteAction={false}
        showToolbar={false}
        showDenseToggle={false}
        emptyMessage="No data found"
        loading={isLoading}
        loadingContent={(
          <OrbitLoader
            title="Loading business entities"
            subtitle="syncing business entity data...."
            minHeight={220}
          />
        )}
      />
    </>
  );
}

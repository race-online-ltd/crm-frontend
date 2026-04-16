import React, { useEffect, useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import ApartmentIcon from '@mui/icons-material/Apartment';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import BusinessEntityForm from '../components/BusinessEntityForm';
import BusinessEntityTable from '../components/BusinessEntityTable';
import {
  createBusinessEntity,
  fetchBusinessEntities,
  updateBusinessEntity,
} from '../api/settingsApi';

const initialBusinessEntities = [
  { id: 'be1', name: 'Race Online Ltd.', status: true },
  { id: 'be2', name: 'Earth Telecommunication', status: true },
  { id: 'be3', name: 'Orbit Internet', status: true },
  { id: 'be4', name: 'Creative Communications', status: false },
];

function mapBusinessEntityToForm(entity) {
  return {
    id: entity.id,
    name: entity.name || '',
    status: Boolean(entity.status),
  };
}

export default function BusinessEntityPage() {
  const [view, setView] = useState('list');
  const [businessEntities, setBusinessEntities] = useState(initialBusinessEntities);
  const [editingBusinessEntity, setEditingBusinessEntity] = useState(null);

  useEffect(() => {
    let active = true;

    const loadBusinessEntities = async () => {
      try {
        const data = await fetchBusinessEntities();
        if (!active) return;
        setBusinessEntities(data.map(mapBusinessEntityToForm));
      } catch {
        if (active) {
          setBusinessEntities(initialBusinessEntities);
        }
      }
    };

    loadBusinessEntities();

    return () => {
      active = false;
    };
  }, []);

  const handleSave = async (values) => {
    if (editingBusinessEntity) {
      const updatedBusinessEntity = mapBusinessEntityToForm(
        await updateBusinessEntity(editingBusinessEntity.id, values)
      );

      setBusinessEntities((prev) =>
        prev.map((entity) => (entity.id === editingBusinessEntity.id ? updatedBusinessEntity : entity))
      );
    } else {
      const nextBusinessEntity = mapBusinessEntityToForm(await createBusinessEntity(values));
      setBusinessEntities((prev) => [nextBusinessEntity, ...prev]);
    }

    setEditingBusinessEntity(null);
    setView('list');
  };

  const handleCreate = () => {
    setEditingBusinessEntity(null);
    setView('form');
  };

  const handleEdit = (entity) => {
    setEditingBusinessEntity(entity);
    setView('form');
  };

  const handleCancel = () => {
    setEditingBusinessEntity(null);
    setView('list');
  };

  if (view === 'form') {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#ffffff', px: { xs: 2, sm: 3, md: 3 }, py: { xs: 3, sm: 3 } }}>
        <Box mb={3}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              onClick={() => setView('list')}
              sx={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#475569',
                flexShrink: 0,
                '&:hover': {
                  bgcolor: '#f1f5f9',
                },
              }}
            >
              <ArrowBackIcon sx={{ fontSize: 18 }} />
            </Box>

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
                flexShrink: 0,
              }}
            >
              <ApartmentIcon sx={{ fontSize: 22, color: '#2563eb' }} />
            </Box>

            <Box>
              <Typography variant="h5" fontWeight={700} color="#0f172a" lineHeight={1.2}>
                {editingBusinessEntity ? 'Edit Business Entity' : 'Create Business Entity'}
              </Typography>
            </Box>
          </Stack>
        </Box>

        <BusinessEntityForm
          initialValues={editingBusinessEntity}
          onCancel={handleCancel}
          onSave={handleSave}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#ffffff', px: { xs: 2, sm: 3, md: 3 }, py: { xs: 3, sm: 3 } }}>
      <BusinessEntityTable
        businessEntities={businessEntities}
        onAddNew={handleCreate}
        onEdit={handleEdit}
      />
    </Box>
  );
}

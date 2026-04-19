import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import SyncOutlinedIcon from '@mui/icons-material/SyncOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ClientsTable from '../components/ClientsTable';
import { deleteClient, fetchClient, fetchClients } from '../api/clientApi';
import AddClientButton from '../../../components/shared/AddClientButton';
import FilterButton from '../../../components/shared/FilterButton';

function mapClientToRow(client) {
  return {
    id: client.id,
    business_entity_id: client.business_entity_id,
    client_id: client.client_id,
    client_name: client.client_name,
    business_entity_name: client.business_entity_name,
    contact_person: client.contact_person,
    contact_no: client.contact_no,
    email: client.email,
    address: client.address,
    division_name: client.division?.name || client.division_name,
    district_name: client.district?.name || client.district_name,
    thana_name: client.thana?.name || client.thana_name,
    licence: client.licence,
    status: client.status,
    created_at: client.created_at,
  };
}

export default function ClientsPage() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1,
    from: null,
    to: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const loadClients = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError('');
      const response = await fetchClients({
        page: page + 1,
        per_page: rowsPerPage,
      });

      const clientRows = Array.isArray(response?.data) ? response.data : [];
      setClients(clientRows.map(mapClientToRow));
      setPagination(response?.meta || {
        current_page: page + 1,
        per_page: rowsPerPage,
        total: clientRows.length,
        last_page: 1,
        from: clientRows.length ? 1 : null,
        to: clientRows.length || null,
      });
    } catch (error) {
      setClients([]);
      setLoadError(error?.message || 'Unable to load clients.');
    } finally {
      setIsLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const handleEditClient = useCallback((client) => {
    navigate('/clients/new', {
      state: {
        returnTo: '/clients',
        client,
        mode: 'edit',
      },
    });
  }, [navigate]);

  const handleDeleteClient = useCallback((client) => {
    setDeleteTarget(client);
  }, []);

  const handleSyncClient = useCallback(async (client) => {
    try {
      const refreshedClient = await fetchClient(client.id);
      if (!refreshedClient) {
        return;
      }

      setClients((prevClients) => prevClients.map((row) => (
        row.id === client.id ? mapClientToRow(refreshedClient) : row
      )));
      toast.success('Client synced successfully.');
    } catch (error) {
      toast.error(error?.message || 'Unable to sync client.');
    }
  }, []);

  const confirmDeleteClient = useCallback(async () => {
    if (!deleteTarget?.id) {
      return;
    }

    try {
      await deleteClient(deleteTarget.id);
      toast.success('Client deleted successfully.');
      setDeleteTarget(null);
      await loadClients();
    } catch (error) {
      toast.error(error?.message || 'Unable to delete client.');
    }
  }, [deleteTarget, loadClients]);

  const clientColumns = useMemo(() => ([
    { key: 'client_id', header: 'Client ID', minWidth: 140, wrap: false },
    { key: 'client_name', header: 'Client Name', minWidth: 220 },
    { key: 'business_entity_name', header: 'Business Entity', minWidth: 180 },
    { key: 'contact_person', header: 'Contact Person', minWidth: 180 },
    { key: 'contact_no', header: 'Contact No', minWidth: 150, wrap: false },
    { key: 'email', header: 'Email', minWidth: 220 },
    { key: 'address', header: 'Address', minWidth: 260 },
    { key: 'division_name', header: 'Division', minWidth: 140 },
    { key: 'district_name', header: 'District', minWidth: 140 },
    { key: 'thana_name', header: 'Thana', minWidth: 140 },
    { key: 'licence', header: 'Licence', minWidth: 120 },
    { key: 'status', header: 'Status', minWidth: 120, type: 'status' },
    {
      key: 'actions',
      header: 'Action',
      minWidth: 160,
      wrap: false,
      render: (_, client) => (
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Tooltip title="Sync">
            <IconButton
              size="small"
              onClick={() => handleSyncClient(client)}
              sx={{ color: '#0f766e' }}
            >
              <SyncOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => handleEditClient(client)}
              sx={{ color: '#475569' }}
            >
              <EditOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={() => handleDeleteClient(client)}
              sx={{ color: '#dc2626' }}
            >
              <DeleteOutlineIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ]), [handleDeleteClient, handleEditClient, handleSyncClient]);

  const visibleClients = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return clients;
    }

    return clients.filter((client) => {
      const searchableValues = [
        client.client_id,
        client.client_name,
        client.business_entity_name,
        client.contact_person,
        client.contact_no,
        client.email,
        client.address,
        client.division_name,
        client.district_name,
        client.thana_name,
        client.licence,
        client.status,
      ];

      return searchableValues
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [clients, searchQuery]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#ffffff', px: { xs: 2, sm: 3, md: 3 }, py: { xs: 3, sm: 3 } }}>
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
              <PeopleAltIcon sx={{ fontSize: 22, color: '#2563eb' }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={800} color="#111827" letterSpacing="-0.3px">
                Clients
              </Typography>
              <Typography variant="body2" color="#64748b">
                Browse client records and open the client creation form when needed.
              </Typography>
            </Box>
          </Stack>
        </Box>

        <AddClientButton
          onClick={() => navigate('/clients/new', { state: { returnTo: '/clients' } })}
          sx={{ alignSelf: { xs: 'stretch', sm: 'auto' } }}
        />
      </Stack>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1.5}
        alignItems={{ xs: 'stretch', md: 'center' }}
        sx={{ mb: 2.5 }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Search clients…"
          value={searchQuery}
          onChange={(event) => {
            setSearchQuery(event.target.value);
            setPage(0);
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: '#94a3b8' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '10px',
              bgcolor: '#fff',
            },
          }}
        />

        <Tooltip title="Sync clients">
          <IconButton
            onClick={loadClients}
            sx={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              border: '1px solid #dbe3ee',
              bgcolor: '#fff',
              color: '#0f766e',
              flexShrink: 0,
              '&:hover': {
                borderColor: '#2563eb',
                bgcolor: '#eff6ff',
              },
            }}
          >
            <SyncOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <FilterButton
          onClick={() => {}}
          label="Filter"
          sx={{
            height: 40,
            minWidth: { xs: '100%', md: 120 },
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 600,
            borderColor: '#dbe3ee',
            color: '#334155',
            bgcolor: '#fff',
            '&:hover': {
              borderColor: '#2563eb',
              bgcolor: '#eff6ff',
            },
          }}
        />
      </Stack>

      {loadError && (
        <Box
          sx={{
            mb: 2,
            p: 2,
            borderRadius: '12px',
            border: '1px solid #fecaca',
            bgcolor: '#fef2f2',
            color: '#b91c1c',
            fontWeight: 600,
          }}
        >
          {loadError}
        </Box>
      )}

      <ClientsTable
        data={visibleClients}
        columns={clientColumns}
        loading={isLoading}
        pagination={{
          count: pagination.total,
          page,
          rowsPerPage,
          onPageChange: (_, nextPage) => setPage(nextPage),
          onRowsPerPageChange: (event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          },
          rowsPerPageOptions: [5, 10, 25],
        }}
      />

      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        PaperProps={{ sx: { borderRadius: '14px', minWidth: { xs: 'auto', sm: 420 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#111827' }}>
          Delete Client
        </DialogTitle>
        <DialogContent sx={{ color: '#475569', pt: 1 }}>
          Are you sure you want to delete <strong>{deleteTarget?.client_name || 'this client'}</strong>? This action cannot be undone.
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            variant="outlined"
            onClick={() => setDeleteTarget(null)}
            sx={{ textTransform: 'none', borderRadius: '10px' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={confirmDeleteClient}
            sx={{ textTransform: 'none', borderRadius: '10px' }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

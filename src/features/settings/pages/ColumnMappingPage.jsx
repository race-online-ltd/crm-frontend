import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SelectDropdownSingle from '../../../components/shared/SelectDropdownSingle';
import OrbitLoader from '../../../components/shared/OrbitLoader';
import useInitialTableLoading from '../../../components/shared/useInitialTableLoading';
import {
  fetchBusinessEntities,
  fetchColumnItems,
  fetchColumnMappings,
  fetchPageNavigationItems,
  fetchTableItems,
  storeColumnMapping,
} from '../api/settingsApi';

function normalizeId(value) {
  if (value === '' || value === null || value === undefined) {
    return null;
  }

  const numericValue = Number(value);
  return Number.isNaN(numericValue) ? value : numericValue;
}

export default function ColumnMappingPage() {
  const isLoading = useInitialTableLoading();
  const [businessEntities, setBusinessEntities] = useState([]);
  const [pageNavigationItems, setPageNavigationItems] = useState([]);
  const [tableItems, setTableItems] = useState([]);
  const [columnItems, setColumnItems] = useState([]);
  const [columnMappings, setColumnMappings] = useState([]);
  const [selectedEntityId, setSelectedEntityId] = useState('');
  const [selectedPageId, setSelectedPageId] = useState('');
  const [selectedTableId, setSelectedTableId] = useState('');
  const [selectedColumnId, setSelectedColumnId] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const entityLabelMap = useMemo(
    () => new Map(businessEntities.map((item) => [Number(item.id), item.label])),
    [businessEntities],
  );
  const pageLabelMap = useMemo(
    () => new Map(pageNavigationItems.map((item) => [Number(item.id), item.label])),
    [pageNavigationItems],
  );
  const tableLabelMap = useMemo(
    () => new Map(tableItems.map((item) => [Number(item.id), item.label])),
    [tableItems],
  );
  const columnLabelMap = useMemo(
    () => new Map(columnItems.map((item) => [Number(item.id), item.label])),
    [columnItems],
  );

  const loadColumnMappings = useCallback(async () => {
    try {
      const mappings = await fetchColumnMappings();
      setColumnMappings(Array.isArray(mappings) ? mappings : []);
    } catch (error) {
      console.error('Failed to fetch column mappings:', error);
      setColumnMappings([]);
    }
  }, []);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [entities, pages, tables, columns] = await Promise.all([
          fetchBusinessEntities(),
          fetchPageNavigationItems(),
          fetchTableItems(),
          fetchColumnItems(),
        ]);

        setBusinessEntities(Array.isArray(entities) ? entities : []);
        setPageNavigationItems(Array.isArray(pages) ? pages : []);
        setTableItems(Array.isArray(tables) ? tables : []);
        setColumnItems(Array.isArray(columns) ? columns : []);

        if (entities?.length > 0) {
          setSelectedEntityId(entities[0].id);
        }
        if (pages?.length > 0) {
          setSelectedPageId(pages[0].id);
        }
        if (tables?.length > 0) {
          setSelectedTableId(tables[0].id);
        }
        if (columns?.length > 0) {
          setSelectedColumnId(columns[0].id);
        }
      } catch (error) {
        console.error('Failed to load column mapping dependencies:', error);
        setBusinessEntities([]);
        setPageNavigationItems([]);
        setTableItems([]);
        setColumnItems([]);
      }
    }

    loadInitialData();
    loadColumnMappings();
  }, [loadColumnMappings]);

  const fetchEntityOptions = useCallback(async () => businessEntities, [businessEntities]);
  const fetchPageOptions = useCallback(async () => pageNavigationItems, [pageNavigationItems]);
  const fetchTableOptions = useCallback(async () => tableItems, [tableItems]);
  const fetchColumnOptions = useCallback(async () => columnItems, [columnItems]);

  async function handleSaveMapping() {
    if (!selectedEntityId) {
      return;
    }

    setIsSaving(true);
    try {
      await storeColumnMapping({
        entity_id: normalizeId(selectedEntityId),
        page_id: normalizeId(selectedPageId),
        table_id: normalizeId(selectedTableId),
        column_id: normalizeId(selectedColumnId),
      });

      await loadColumnMappings();
    } catch (error) {
      console.error('Failed to store column mapping:', error);
    } finally {
      setIsSaving(false);
    }
  }

  const tableRows = useMemo(
    () => columnMappings.map((mapping) => ({
      id: mapping.id,
      entityLabel: entityLabelMap.get(Number(mapping.entity_id)) || mapping.entity_id || '—',
      pageLabel: pageLabelMap.get(Number(mapping.page_id)) || '—',
      tableLabel: tableLabelMap.get(Number(mapping.table_id)) || '—',
      columnLabel: columnLabelMap.get(Number(mapping.column_id)) || '—',
    })),
    [columnMappings, columnLabelMap, entityLabelMap, pageLabelMap, tableLabelMap],
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#ffffff', px: { xs: 2, sm: 3, md: 3 }, py: { xs: 3, sm: 3 } }}>
      <Box mb={3}>
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
            <AdminPanelSettingsIcon sx={{ fontSize: 22, color: '#2563eb' }} />
          </Box>
          <Typography variant="h5" fontWeight={800} color="#111827" letterSpacing="-0.3px">
            Table Wise Column Mapping
          </Typography>
        </Stack>
      </Box>

      <Box
        sx={{
          mb: 3,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
          gap: '16px 20px',
        }}
      >
        <SelectDropdownSingle
          name="entityId"
          label="Business Entity *"
          placeholder="Select business entity"
          fetchOptions={fetchEntityOptions}
          value={selectedEntityId}
          onChange={setSelectedEntityId}
        />

        <SelectDropdownSingle
          name="pageId"
          label="Page Elements"
          placeholder="Select page element"
          fetchOptions={fetchPageOptions}
          value={selectedPageId}
          onChange={setSelectedPageId}
        />

        <SelectDropdownSingle
          name="tableId"
          label="Table Name"
          placeholder="Select table name"
          fetchOptions={fetchTableOptions}
          value={selectedTableId}
          onChange={setSelectedTableId}
        />

        <SelectDropdownSingle
          name="columnId"
          label="Column Name"
          placeholder="Select column name"
          fetchOptions={fetchColumnOptions}
          value={selectedColumnId}
          onChange={setSelectedColumnId}
        />
      </Box>

      <Stack direction="row" justifyContent="flex-end" mb={2}>
        <Button
          variant="contained"
          onClick={handleSaveMapping}
          disabled={!selectedEntityId || isSaving}
          sx={{ minWidth: 140, textTransform: 'none', fontWeight: 700 }}
        >
          {isSaving ? 'Saving...' : 'Save Mapping'}
        </Button>
      </Stack>

      <Paper
        elevation={0}
        sx={{
          borderRadius: '14px',
          overflow: 'hidden',
          border: '1px solid #d1d9e0',
          bgcolor: '#fff',
        }}
      >
        <TableContainer>
          {isLoading ? (
            <OrbitLoader title="Loading mappings" minHeight={260} />
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, minWidth: 90 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 700, minWidth: 180 }}>Business Entity</TableCell>
                  <TableCell sx={{ fontWeight: 700, minWidth: 180 }}>Page Element</TableCell>
                  <TableCell sx={{ fontWeight: 700, minWidth: 180 }}>Table Name</TableCell>
                  <TableCell sx={{ fontWeight: 700, minWidth: 180 }}>Column Name</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tableRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6, color: '#64748b' }}>
                      No mappings found.
                    </TableCell>
                  </TableRow>
                ) : (
                  tableRows.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell sx={{ color: '#0f172a', fontWeight: 600 }}>{row.id}</TableCell>
                      <TableCell sx={{ color: '#475569' }}>{row.entityLabel}</TableCell>
                      <TableCell sx={{ color: '#475569' }}>{row.pageLabel}</TableCell>
                      <TableCell sx={{ color: '#475569' }}>{row.tableLabel}</TableCell>
                      <TableCell sx={{ color: '#475569' }}>{row.columnLabel}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      </Paper>
    </Box>
  );
}
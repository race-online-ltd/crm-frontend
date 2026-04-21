


// import React, { useCallback, useEffect, useMemo, useState } from 'react';
// import {
//   Box,
//   Button,
//   Paper,
//   Stack,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Typography,
//   Checkbox,
//   Alert,
//   CircularProgress,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
// } from '@mui/material';
// import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
// import EditIcon from '@mui/icons-material/Edit';
// import SelectDropdownSingle from '../../../components/shared/SelectDropdownSingle';
// import OrbitLoader from '../../../components/shared/OrbitLoader';
// import useInitialTableLoading from '../../../components/shared/useInitialTableLoading';
// import {
//   fetchBusinessEntities,
//   fetchColumnItems,
//   fetchPageNavigationItems,
//   fetchTableItems,
//   storeColumnMapping,
//   updateColumnMapping,
//   fetchEntityWiseTableColumn,
// } from '../api/settingsApi';

// function normalizeId(value) {
//   if (value === '' || value === null || value === undefined) {
//     return null;
//   }
//   const numericValue = Number(value);
//   return Number.isNaN(numericValue) ? value : numericValue;
// }

// export default function ColumnMappingPage() {
//   const isLoading = useInitialTableLoading();
//   const [businessEntities, setBusinessEntities] = useState([]);
//   const [pageNavigationItems, setPageNavigationItems] = useState([]);
//   const [tableItems, setTableItems] = useState([]);
//   const [columnItems, setColumnItems] = useState([]);
//   const [selectedPageId, setSelectedPageId] = useState('');
//   const [selectedTableId, setSelectedTableId] = useState('');
//   const [isSaving, setIsSaving] = useState(false);
//   const [saveMessage, setSaveMessage] = useState('');
//   const [saveError, setSaveError] = useState('');
//   const [isLoadingMappings, setIsLoadingMappings] = useState(false);

//   // State for checkbox selections: { [entityId]: { [columnId]: true/false } }
//   const [columnSelections, setColumnSelections] = useState({});

//   // State for tracking existing mappings with their IDs
//   const [existingMappings, setExistingMappings] = useState({});

//   // Track if initial mappings have been loaded
//   const [mappingsLoaded, setMappingsLoaded] = useState(false);

//   // State for edit dialog
//   const [editDialog, setEditDialog] = useState({
//     open: false,
//     mappingId: null,
//     entityId: null,
//     columnId: null,
//   });

//   // Initial load of all data
//   useEffect(() => {
//     async function loadInitialData() {
//       try {
//         const [entities, pages, tables, columns] = await Promise.all([
//           fetchBusinessEntities(),
//           fetchPageNavigationItems(),
//           fetchTableItems(),
//           fetchColumnItems(),
//         ]);

//         const entitiesData = Array.isArray(entities) ? entities : [];
//         const pagesData = Array.isArray(pages) ? pages : [];
//         const tablesData = Array.isArray(tables) ? tables : [];
//         const columnsData = Array.isArray(columns) ? columns : [];

//         console.log('Loaded data:', { entitiesData, pagesData, tablesData, columnsData });

//         setBusinessEntities(entitiesData);
//         setPageNavigationItems(pagesData);
//         setTableItems(tablesData);
//         setColumnItems(columnsData);

//         // Initialize column selections state
//         const initialSelections = {};
//         entitiesData.forEach((entity) => {
//           initialSelections[entity.id] = {};
//           columnsData.forEach((column) => {
//             initialSelections[entity.id][column.id] = false;
//           });
//         });
//         setColumnSelections(initialSelections);

//         if (pagesData?.length > 0) {
//           setSelectedPageId(pagesData[0].id);
//         }
//         if (tablesData?.length > 0) {
//           setSelectedTableId(tablesData[0].id);
//         }
//       } catch (error) {
//         console.error('Failed to load column mapping dependencies:', error);
//         setBusinessEntities([]);
//         setPageNavigationItems([]);
//         setTableItems([]);
//         setSaveError('Failed to load data. Please refresh the page.');
//       }
//     }

//     loadInitialData();
//   }, []);

//   // Function to load existing mappings
//   const loadExistingMappings = useCallback(async () => {
//     if (!selectedPageId || !selectedTableId) {
//       // Reset selections when no page/table is selected
//       const resetSelections = {};
//       businessEntities.forEach((entity) => {
//         resetSelections[entity.id] = {};
//         columnItems.forEach((column) => {
//           resetSelections[entity.id][column.id] = false;
//         });
//       });
//       setColumnSelections(resetSelections);
//       setExistingMappings({});
//       setMappingsLoaded(true);
//       return;
//     }

//     setIsLoadingMappings(true);
//     try {
//       const mappingData = await fetchEntityWiseTableColumn({
//         page_id: normalizeId(selectedPageId),
//         table_id: normalizeId(selectedTableId),
//       });

//       console.log('Existing mappings for page/table:', { selectedPageId, selectedTableId, mappingData });

//       // Reset all selections first
//       const resetSelections = {};
//       businessEntities.forEach((entity) => {
//         resetSelections[entity.id] = {};
//         columnItems.forEach((column) => {
//           resetSelections[entity.id][column.id] = false;
//         });
//       });

//       const mappingMap = {};

//       // Apply existing mappings
//       if (Array.isArray(mappingData) && mappingData.length > 0) {
//         mappingData.forEach((mapping) => {
//           const entityId = mapping.entity_id;
//           const columnId = mapping.column_id;

//           if (resetSelections[entityId]) {
//             resetSelections[entityId][columnId] = true;
//           }

//           const key = `${entityId}-${columnId}`;
//           mappingMap[key] = mapping.id;
//         });
//       }

//       setColumnSelections(resetSelections);
//       setExistingMappings(mappingMap);
//       setMappingsLoaded(true);
//     } catch (error) {
//       console.error('Failed to load existing mappings:', error);
//       setMappingsLoaded(true);
//     } finally {
//       setIsLoadingMappings(false);
//     }
//   }, [selectedPageId, selectedTableId, businessEntities, columnItems]);

//   // Load existing mappings when page or table changes
//   useEffect(() => {
//     if (businessEntities.length > 0 && columnItems.length > 0) {
//       loadExistingMappings();
//     }
//   }, [selectedPageId, selectedTableId, businessEntities.length, columnItems.length, loadExistingMappings]);

//   const fetchPageOptions = useCallback(async () => pageNavigationItems, [pageNavigationItems]);
//   const fetchTableOptions = useCallback(async () => tableItems, [tableItems]);

//   const handleColumnToggle = (entityId, columnId) => {
//     setColumnSelections((prev) => ({
//       ...prev,
//       [entityId]: {
//         ...prev[entityId],
//         [columnId]: !prev[entityId]?.[columnId],
//       },
//     }));
//   };

//   const handleEditMapping = (entityId, columnId, mappingId) => {
//     setEditDialog({
//       open: true,
//       mappingId,
//       entityId,
//       columnId,
//     });
//   };

//   const handleCloseEditDialog = () => {
//     setEditDialog({
//       open: false,
//       mappingId: null,
//       entityId: null,
//       columnId: null,
//     });
//   };

//   const handleUpdateMapping = async () => {
//     if (!editDialog.mappingId) {
//       return;
//     }

//     setIsSaving(true);
//     setSaveError('');
//     setSaveMessage('');

//     try {
//       await updateColumnMapping(editDialog.mappingId, {
//         entity_id: normalizeId(editDialog.entityId),
//         page_id: normalizeId(selectedPageId),
//         table_id: normalizeId(selectedTableId),
//         column_id: normalizeId(editDialog.columnId),
//       });

//       setSaveMessage('Mapping updated successfully');
//       handleCloseEditDialog();

//       // Reload mappings to reflect changes
//       await loadExistingMappings();
//     } catch (error) {
//       console.error('Failed to update mapping:', error);
//       setSaveError(
//         error.response?.data?.message || 'Failed to update mapping. Please try again.'
//       );
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const getSelectedMappingsCount = () => {
//     let count = 0;
//     businessEntities.forEach((entity) => {
//       columnItems.forEach((column) => {
//         if (columnSelections[entity.id]?.[column.id]) {
//           count++;
//         }
//       });
//     });
//     return count;
//   };

//   async function handleSaveMapping() {
//     if (!selectedPageId || !selectedTableId) {
//       setSaveError('Please select both Page Elements and Table Name');
//       return;
//     }

//     const mappings = [];

//     businessEntities.forEach((entity) => {
//       columnItems.forEach((column) => {
//         if (columnSelections[entity.id]?.[column.id]) {
//           mappings.push({
//             entity_id: normalizeId(entity.id),
//             column_id: normalizeId(column.id),
//           });
//         }
//       });
//     });

//     if (mappings.length === 0) {
//       setSaveError('Please select at least one column mapping');
//       return;
//     }

//     setIsSaving(true);
//     setSaveError('');
//     setSaveMessage('');

//     try {
//       await updateColumnMapping({
//         page_id: normalizeId(selectedPageId),
//         table_id: normalizeId(selectedTableId),
//         mappings,
//       });

//       setSaveMessage('Mappings updated successfully');
      
//       // Reload mappings to reflect changes
//       await loadExistingMappings();
//     } catch (error) {
//       console.error(error);
//       setSaveError('Failed to update mappings');
//     } finally {
//       setIsSaving(false);
//     }
//   }

//   const getMappingKey = (entityId, columnId) => `${entityId}-${columnId}`;
//   const isMappingExisting = (entityId, columnId) =>
//     existingMappings[getMappingKey(entityId, columnId)] !== undefined;

//   // Show loading when dependencies are loading
//   if (isLoading) {
//     return <OrbitLoader title="Loading column mapping..." minHeight={400} />;
//   }

//   return (
//     <Box sx={{ minHeight: '100vh', bgcolor: '#ffffff', px: { xs: 2, sm: 3, md: 3 }, py: { xs: 3, sm: 3 } }}>
//       {/* Header */}
//       <Box mb={3}>
//         <Stack direction="row" alignItems="center" spacing={1.5} mb={0.75}>
//           <Box
//             sx={{
//               width: 42,
//               height: 42,
//               borderRadius: '12px',
//               bgcolor: '#eff6ff',
//               border: '1px solid #bfdbfe',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//             }}
//           >
//             <AdminPanelSettingsIcon sx={{ fontSize: 22, color: '#2563eb' }} />
//           </Box>
//           <Typography variant="h5" fontWeight={800} color="#111827" letterSpacing="-0.3px">
//             Table Wise Column Mapping
//           </Typography>
//         </Stack>
//       </Box>

//       {/* Alerts */}
//       {saveError && (
//         <Alert severity="error" sx={{ mb: 2 }} onClose={() => setSaveError('')}>
//           {saveError}
//         </Alert>
//       )}
//       {saveMessage && (
//         <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSaveMessage('')}>
//           {saveMessage}
//         </Alert>
//       )}

//       {/* Dropdowns - Only 2 dropdowns */}
//       <Box
//         sx={{
//           mb: 3,
//           display: 'grid',
//           gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
//           gap: '16px 20px',
//         }}
//       >
//         <SelectDropdownSingle
//           name="pageId"
//           label="Page Elements *"
//           placeholder="Select page element"
//           fetchOptions={fetchPageOptions}
//           value={selectedPageId}
//           onChange={(newValue) => {
//             setSelectedPageId(newValue);
//             // Reset mappings loaded state to show loading indicator
//             setMappingsLoaded(false);
//           }}
//         />

//         <SelectDropdownSingle
//           name="tableId"
//           label="Table Name *"
//           placeholder="Select table name"
//           fetchOptions={fetchTableOptions}
//           value={selectedTableId}
//           onChange={(newValue) => {
//             setSelectedTableId(newValue);
//             // Reset mappings loaded state to show loading indicator
//             setMappingsLoaded(false);
//           }}
//         />
//       </Box>

//       {/* Mapping Table */}
//       <Paper
//         elevation={0}
//         sx={{
//           borderRadius: '14px',
//           overflow: 'hidden',
//           border: '1px solid #d1d9e0',
//           bgcolor: '#fff',
//           mb: 3,
//         }}
//       >
//         <TableContainer>
//           {isLoadingMappings || !mappingsLoaded ? (
//             <OrbitLoader title="Loading column mappings..." minHeight={260} />
//           ) : (
//             <Table>
//               <TableHead>
//                 <TableRow sx={{ bgcolor: '#f8fafc' }}>
//                   <TableCell sx={{ fontWeight: 700, minWidth: 200, bgcolor: '#f1f5f9' }}>
//                     Column Name
//                   </TableCell>
//                   {businessEntities.map((entity) => (
//                     <TableCell
//                       key={entity.id}
//                       align="center"
//                       sx={{
//                         fontWeight: 700,
//                         minWidth: 150,
//                         bgcolor: '#f1f5f9',
//                         color: '#2563eb',
//                       }}
//                     >
//                       {entity.label}
//                     </TableCell>
//                   ))}
//                 </TableRow>
//               </TableHead>
//               <TableBody>
//                 {columnItems.length === 0 ? (
//                   <TableRow>
//                     <TableCell
//                       colSpan={businessEntities.length + 1}
//                       align="center"
//                       sx={{ py: 6, color: '#64748b' }}
//                     >
//                       No columns found.
//                     </TableCell>
//                   </TableRow>
//                 ) : (
//                   columnItems.map((column) => (
//                     <TableRow key={column.id} hover sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
//                       <TableCell sx={{ color: '#0f172a', fontWeight: 600, bgcolor: '#fafbfc' }}>
//                         {column.label}
//                       </TableCell>
//                       {businessEntities.map((entity) => {
//                         const isChecked = columnSelections[entity.id]?.[column.id] || false;
//                         const isExisting = isMappingExisting(entity.id, column.id);
//                         const mappingId = existingMappings[getMappingKey(entity.id, column.id)];

//                         return (
//                           <TableCell key={entity.id} align="center">
//                             <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
//                               <Checkbox
//                                 checked={isChecked}
//                                 onChange={() => handleColumnToggle(entity.id, column.id)}
//                                 size="medium"
//                                 sx={{
//                                   color: '#cbd5e1',
//                                   '&.Mui-checked': {
//                                     color: '#2563eb',
//                                   },
//                                 }}
//                               />
//                               {isExisting && isChecked && (
//                                 <Button
//                                   size="small"
//                                   variant="text"
//                                   sx={{
//                                     minWidth: 'auto',
//                                     p: 0.5,
//                                     color: '#2563eb',
//                                     '&:hover': { bgcolor: '#eff6ff' },
//                                   }}
//                                   onClick={() =>
//                                     handleEditMapping(entity.id, column.id, mappingId)
//                                   }
//                                 >
//                                   <EditIcon sx={{ fontSize: 18 }} />
//                                 </Button>
//                               )}
//                             </Stack>
//                           </TableCell>
//                         );
//                       })}
//                     </TableRow>
//                   ))
//                 )}
//               </TableBody>
//             </Table>
//           )}
//         </TableContainer>
//       </Paper>

//       {/* Info and Save Button */}
//       <Stack direction="row" justifyContent="space-between" alignItems="center">
//         <Typography variant="body2" sx={{ color: '#64748b' }}>
//           Selected mappings: <strong>{getSelectedMappingsCount()}</strong>
//         </Typography>
//         <Button
//           variant="contained"
//           onClick={handleSaveMapping}
//           disabled={isSaving || isLoadingMappings || !mappingsLoaded}
//           sx={{
//             minWidth: 140,
//             textTransform: 'none',
//             fontWeight: 700,
//             bgcolor: '#2563eb',
//             '&:hover': { bgcolor: '#1d4ed8' },
//             '&:disabled': { bgcolor: '#cbd5e1', color: '#fff' },
//           }}
//         >
//           {isSaving ? (
//             <Stack direction="row" alignItems="center" spacing={1}>
//               <CircularProgress size={20} sx={{ color: 'inherit' }} />
//               <span>Saving...</span>
//             </Stack>
//           ) : (
//             'Save Mapping'
//           )}
//         </Button>
//       </Stack>

//       {/* Edit Dialog */}
//       <Dialog open={editDialog.open} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
//         <DialogTitle sx={{ fontWeight: 700, color: '#111827' }}>
//           Edit Column Mapping
//         </DialogTitle>
//         <DialogContent sx={{ pt: 2 }}>
//           <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>
//             Mapping will be updated for the selected page and table.
//           </Typography>
//           <Typography variant="body2" sx={{ color: '#0f172a', fontWeight: 600 }}>
//             Are you sure you want to update this mapping?
//           </Typography>
//         </DialogContent>
//         <DialogActions sx={{ p: 2, gap: 1 }}>
//           <Button
//             onClick={handleCloseEditDialog}
//             variant="outlined"
//             sx={{
//               textTransform: 'none',
//               fontWeight: 600,
//               borderColor: '#d1d9e0',
//               color: '#0f172a',
//               '&:hover': { borderColor: '#2563eb', bgcolor: 'transparent' },
//             }}
//           >
//             Cancel
//           </Button>
//           <Button
//             onClick={handleUpdateMapping}
//             variant="contained"
//             disabled={isSaving}
//             sx={{
//               textTransform: 'none',
//               fontWeight: 600,
//               bgcolor: '#2563eb',
//               '&:hover': { bgcolor: '#1d4ed8' },
//               '&:disabled': { bgcolor: '#cbd5e1' },
//             }}
//           >
//             {isSaving ? (
//               <Stack direction="row" alignItems="center" spacing={1}>
//                 <CircularProgress size={16} sx={{ color: 'inherit' }} />
//                 <span>Updating...</span>
//               </Stack>
//             ) : (
//               'Update'
//             )}
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// }







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
  Checkbox,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import EditIcon from '@mui/icons-material/Edit';
import SelectDropdownSingle from '../../../components/shared/SelectDropdownSingle';
import OrbitLoader from '../../../components/shared/OrbitLoader';
import useInitialTableLoading from '../../../components/shared/useInitialTableLoading';
import {
  fetchBusinessEntities,
  fetchColumnItems,
  fetchPageNavigationItems,
  fetchTableItems,
  storeColumnMapping,
  updateColumnMapping,
  fetchEntityWiseTableColumn,
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
  const [selectedPageId, setSelectedPageId] = useState('');
  const [selectedTableId, setSelectedTableId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState('');
  const [isLoadingMappings, setIsLoadingMappings] = useState(false);

  // State for checkbox selections: { [entityId]: { [columnId]: true/false } }
  const [columnSelections, setColumnSelections] = useState({});

  // State for row selection (select all columns for a row)
  const [rowSelections, setRowSelections] = useState({});

  // State for tracking existing mappings with their IDs
  const [existingMappings, setExistingMappings] = useState({});

  // Track if initial mappings have been loaded
  const [mappingsLoaded, setMappingsLoaded] = useState(false);

  // State for edit dialog
  const [editDialog, setEditDialog] = useState({
    open: false,
    mappingId: null,
    entityId: null,
    columnId: null,
  });

  // Initial load of all data
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [entities, pages, tables, columns] = await Promise.all([
          fetchBusinessEntities(),
          fetchPageNavigationItems(),
          fetchTableItems(),
          fetchColumnItems(),
        ]);

        const entitiesData = Array.isArray(entities) ? entities : [];
        const pagesData = Array.isArray(pages) ? pages : [];
        const tablesData = Array.isArray(tables) ? tables : [];
        const columnsData = Array.isArray(columns) ? columns : [];

        console.log('Loaded data:', { entitiesData, pagesData, tablesData, columnsData });

        setBusinessEntities(entitiesData);
        setPageNavigationItems(pagesData);
        setTableItems(tablesData);
        setColumnItems(columnsData);

        // Initialize column selections state
        const initialSelections = {};
        const initialRowSelections = {};
        
        entitiesData.forEach((entity) => {
          initialSelections[entity.id] = {};
          columnsData.forEach((column) => {
            initialSelections[entity.id][column.id] = false;
          });
        });
        
        columnsData.forEach((column) => {
          initialRowSelections[column.id] = false;
        });
        
        setColumnSelections(initialSelections);
        setRowSelections(initialRowSelections);

        if (pagesData?.length > 0) {
          setSelectedPageId(pagesData[0].id);
        }
        if (tablesData?.length > 0) {
          setSelectedTableId(tablesData[0].id);
        }
      } catch (error) {
        console.error('Failed to load column mapping dependencies:', error);
        setBusinessEntities([]);
        setPageNavigationItems([]);
        setTableItems([]);
        setSaveError('Failed to load data. Please refresh the page.');
      }
    }

    loadInitialData();
  }, []);

  // Function to load existing mappings
  const loadExistingMappings = useCallback(async () => {
    if (!selectedPageId || !selectedTableId) {
      // Reset selections when no page/table is selected
      const resetSelections = {};
      const resetRowSelections = {};
      
      businessEntities.forEach((entity) => {
        resetSelections[entity.id] = {};
        columnItems.forEach((column) => {
          resetSelections[entity.id][column.id] = false;
        });
      });
      
      columnItems.forEach((column) => {
        resetRowSelections[column.id] = false;
      });
      
      setColumnSelections(resetSelections);
      setRowSelections(resetRowSelections);
      setExistingMappings({});
      setMappingsLoaded(true);
      return;
    }

    setIsLoadingMappings(true);
    try {
      const mappingData = await fetchEntityWiseTableColumn({
        page_id: normalizeId(selectedPageId),
        table_id: normalizeId(selectedTableId),
      });

      console.log('Existing mappings for page/table:', { selectedPageId, selectedTableId, mappingData });

      // Reset all selections first
      const resetSelections = {};
      const resetRowSelections = {};
      
      businessEntities.forEach((entity) => {
        resetSelections[entity.id] = {};
        columnItems.forEach((column) => {
          resetSelections[entity.id][column.id] = false;
        });
      });
      
      columnItems.forEach((column) => {
        resetRowSelections[column.id] = false;
      });

      const mappingMap = {};

      // Apply existing mappings
      if (Array.isArray(mappingData) && mappingData.length > 0) {
        mappingData.forEach((mapping) => {
          const entityId = mapping.entity_id;
          const columnId = mapping.column_id;

          if (resetSelections[entityId]) {
            resetSelections[entityId][columnId] = true;
          }

          const key = `${entityId}-${columnId}`;
          mappingMap[key] = mapping.id;
        });
      }

      // Update row selections based on column selections
      columnItems.forEach((column) => {
        let allSelected = true;
        businessEntities.forEach((entity) => {
          if (!resetSelections[entity.id]?.[column.id]) {
            allSelected = false;
          }
        });
        resetRowSelections[column.id] = allSelected;
      });

      setColumnSelections(resetSelections);
      setRowSelections(resetRowSelections);
      setExistingMappings(mappingMap);
      setMappingsLoaded(true);
    } catch (error) {
      console.error('Failed to load existing mappings:', error);
      setMappingsLoaded(true);
    } finally {
      setIsLoadingMappings(false);
    }
  }, [selectedPageId, selectedTableId, businessEntities, columnItems]);

  // Load existing mappings when page or table changes
  useEffect(() => {
    if (businessEntities.length > 0 && columnItems.length > 0) {
      loadExistingMappings();
    }
  }, [selectedPageId, selectedTableId, businessEntities.length, columnItems.length, loadExistingMappings]);

  const fetchPageOptions = useCallback(async () => pageNavigationItems, [pageNavigationItems]);
  const fetchTableOptions = useCallback(async () => tableItems, [tableItems]);

  const handleColumnToggle = (entityId, columnId) => {
    setColumnSelections((prev) => {
      const newSelections = {
        ...prev,
        [entityId]: {
          ...prev[entityId],
          [columnId]: !prev[entityId]?.[columnId],
        },
      };
      
      // Update row selection for this column
      let allSelected = true;
      businessEntities.forEach((entity) => {
        if (!newSelections[entity.id]?.[columnId]) {
          allSelected = false;
        }
      });
      
      setRowSelections((prevRow) => ({
        ...prevRow,
        [columnId]: allSelected,
      }));
      
      return newSelections;
    });
  };

  const handleRowSelection = (columnId, checked) => {
    setRowSelections((prev) => ({
      ...prev,
      [columnId]: checked,
    }));
    
    // Update all checkboxes in this row
    setColumnSelections((prev) => {
      const newSelections = { ...prev };
      businessEntities.forEach((entity) => {
        if (!newSelections[entity.id]) {
          newSelections[entity.id] = {};
        }
        newSelections[entity.id][columnId] = checked;
      });
      return newSelections;
    });
  };

  const handleEditMapping = (entityId, columnId, mappingId) => {
    setEditDialog({
      open: true,
      mappingId,
      entityId,
      columnId,
    });
  };

  const handleCloseEditDialog = () => {
    setEditDialog({
      open: false,
      mappingId: null,
      entityId: null,
      columnId: null,
    });
  };

  const handleUpdateMapping = async () => {
    if (!editDialog.mappingId) {
      return;
    }

    setIsSaving(true);
    setSaveError('');
    setSaveMessage('');

    try {
      await updateColumnMapping(editDialog.mappingId, {
        entity_id: normalizeId(editDialog.entityId),
        page_id: normalizeId(selectedPageId),
        table_id: normalizeId(selectedTableId),
        column_id: normalizeId(editDialog.columnId),
      });

      setSaveMessage('Mapping updated successfully');
      handleCloseEditDialog();

      // Reload mappings to reflect changes
      await loadExistingMappings();
    } catch (error) {
      console.error('Failed to update mapping:', error);
      setSaveError(
        error.response?.data?.message || 'Failed to update mapping. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const getSelectedMappingsCount = () => {
    let count = 0;
    businessEntities.forEach((entity) => {
      columnItems.forEach((column) => {
        if (columnSelections[entity.id]?.[column.id]) {
          count++;
        }
      });
    });
    return count;
  };

  async function handleSaveMapping() {
    if (!selectedPageId || !selectedTableId) {
      setSaveError('Please select both Page Elements and Table Name');
      return;
    }

    const mappings = [];

    businessEntities.forEach((entity) => {
      columnItems.forEach((column) => {
        if (columnSelections[entity.id]?.[column.id]) {
          mappings.push({
            entity_id: normalizeId(entity.id),
            column_id: normalizeId(column.id),
          });
        }
      });
    });

    if (mappings.length === 0) {
      setSaveError('Please select at least one column mapping');
      return;
    }

    setIsSaving(true);
    setSaveError('');
    setSaveMessage('');

    try {
      await updateColumnMapping({
        page_id: normalizeId(selectedPageId),
        table_id: normalizeId(selectedTableId),
        mappings,
      });

      setSaveMessage('Mappings updated successfully');
      
      // Reload mappings to reflect changes
      await loadExistingMappings();
    } catch (error) {
      console.error(error);
      setSaveError('Failed to update mappings');
    } finally {
      setIsSaving(false);
    }
  }

  const getMappingKey = (entityId, columnId) => `${entityId}-${columnId}`;
  const isMappingExisting = (entityId, columnId) =>
    existingMappings[getMappingKey(entityId, columnId)] !== undefined;

  // Show loading when dependencies are loading
  if (isLoading) {
    return <OrbitLoader title="Loading column mapping..." minHeight={400} />;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#ffffff', px: { xs: 2, sm: 3, md: 3 }, py: { xs: 3, sm: 3 } }}>
      {/* Header */}
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

      {/* Alerts */}
      {saveError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setSaveError('')}>
          {saveError}
        </Alert>
      )}
      {saveMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSaveMessage('')}>
          {saveMessage}
        </Alert>
      )}

      {/* Dropdowns - Only 2 dropdowns */}
      <Box
        sx={{
          mb: 3,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
          gap: '16px 20px',
        }}
      >
        <SelectDropdownSingle
          name="pageId"
          label="Page Elements *"
          placeholder="Select page element"
          fetchOptions={fetchPageOptions}
          value={selectedPageId}
          onChange={(newValue) => {
            setSelectedPageId(newValue);
            // Reset mappings loaded state to show loading indicator
            setMappingsLoaded(false);
          }}
        />

        <SelectDropdownSingle
          name="tableId"
          label="Table Name *"
          placeholder="Select table name"
          fetchOptions={fetchTableOptions}
          value={selectedTableId}
          onChange={(newValue) => {
            setSelectedTableId(newValue);
            // Reset mappings loaded state to show loading indicator
            setMappingsLoaded(false);
          }}
        />
      </Box>

      {/* Mapping Table */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '14px',
          overflow: 'hidden',
          border: '1px solid #d1d9e0',
          bgcolor: '#fff',
          mb: 3,
        }}
      >
        <TableContainer>
          {isLoadingMappings || !mappingsLoaded ? (
            <OrbitLoader title="Loading column mappings..." minHeight={260} />
          ) : (
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 700, minWidth: 200, bgcolor: '#f1f5f9' }}>
                    Column Name
                  </TableCell>
                  {businessEntities.map((entity) => (
                    <TableCell
                      key={entity.id}
                      align="center"
                      sx={{
                        fontWeight: 700,
                        minWidth: 150,
                        bgcolor: '#f1f5f9',
                        color: '#2563eb',
                      }}
                    >
                      {entity.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {columnItems.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={businessEntities.length + 1}
                      align="center"
                      sx={{ py: 6, color: '#64748b' }}
                    >
                      No columns found.
                    </TableCell>
                  </TableRow>
                ) : (
                  columnItems.map((column) => (
                    <TableRow key={column.id} hover sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                      <TableCell sx={{ color: '#0f172a', fontWeight: 600, bgcolor: '#fafbfc' }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Checkbox
                            checked={rowSelections[column.id] || false}
                            onChange={(e) => handleRowSelection(column.id, e.target.checked)}
                            size="medium"
                            sx={{
                              color: '#cbd5e1',
                              '&.Mui-checked': {
                                color: '#2563eb',
                              },
                            }}
                          />
                          <Typography>{column.label}</Typography>
                        </Stack>
                      </TableCell>
                      {businessEntities.map((entity) => {
                        const isChecked = columnSelections[entity.id]?.[column.id] || false;
                        const isExisting = isMappingExisting(entity.id, column.id);
                        const mappingId = existingMappings[getMappingKey(entity.id, column.id)];

                        return (
                          <TableCell key={entity.id} align="center">
                            <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
                              <Checkbox
                                checked={isChecked}
                                onChange={() => handleColumnToggle(entity.id, column.id)}
                                size="medium"
                                sx={{
                                  color: '#cbd5e1',
                                  '&.Mui-checked': {
                                    color: '#2563eb',
                                  },
                                }}
                              />
                              {isExisting && isChecked && (
                                <Button
                                  size="small"
                                  variant="text"
                                  sx={{
                                    minWidth: 'auto',
                                    p: 0.5,
                                    color: '#2563eb',
                                    '&:hover': { bgcolor: '#eff6ff' },
                                  }}
                                  onClick={() =>
                                    handleEditMapping(entity.id, column.id, mappingId)
                                  }
                                >
                                  <EditIcon sx={{ fontSize: 18 }} />
                                </Button>
                              )}
                            </Stack>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      </Paper>

      {/* Info and Save Button */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="body2" sx={{ color: '#64748b' }}>
          Selected mappings: <strong>{getSelectedMappingsCount()}</strong>
        </Typography>
        <Button
          variant="contained"
          onClick={handleSaveMapping}
          disabled={isSaving || isLoadingMappings || !mappingsLoaded}
          sx={{
            minWidth: 140,
            textTransform: 'none',
            fontWeight: 700,
            bgcolor: '#2563eb',
            '&:hover': { bgcolor: '#1d4ed8' },
            '&:disabled': { bgcolor: '#cbd5e1', color: '#fff' },
          }}
        >
          {isSaving ? (
            <Stack direction="row" alignItems="center" spacing={1}>
              <CircularProgress size={20} sx={{ color: 'inherit' }} />
              <span>Saving...</span>
            </Stack>
          ) : (
            'Save Mapping'
          )}
        </Button>
      </Stack>

      {/* Edit Dialog */}
      <Dialog open={editDialog.open} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#111827' }}>
          Edit Column Mapping
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>
            Mapping will be updated for the selected page and table.
          </Typography>
          <Typography variant="body2" sx={{ color: '#0f172a', fontWeight: 600 }}>
            Are you sure you want to update this mapping?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={handleCloseEditDialog}
            variant="outlined"
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderColor: '#d1d9e0',
              color: '#0f172a',
              '&:hover': { borderColor: '#2563eb', bgcolor: 'transparent' },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateMapping}
            variant="contained"
            disabled={isSaving}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              bgcolor: '#2563eb',
              '&:hover': { bgcolor: '#1d4ed8' },
              '&:disabled': { bgcolor: '#cbd5e1' },
            }}
          >
            {isSaving ? (
              <Stack direction="row" alignItems="center" spacing={1}>
                <CircularProgress size={16} sx={{ color: 'inherit' }} />
                <span>Updating...</span>
              </Stack>
            ) : (
              'Update'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
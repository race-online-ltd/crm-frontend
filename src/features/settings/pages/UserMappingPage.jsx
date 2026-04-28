




// import React, { useMemo, useCallback, useEffect, useState } from 'react';
// import { useFormik } from 'formik';
// import { useLocation, useNavigate } from 'react-router-dom';
// import {
//   Box,
//   Button,
//   Stack,
//   Typography,
//   IconButton,
//   Divider,
//   Alert,
// } from '@mui/material';
// import ArrowBackIcon from '@mui/icons-material/ArrowBack';
// import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
// import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
// import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
// import BusinessIcon from '@mui/icons-material/Business';
// import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
// import SelectDropdownMultiple from '../../../components/shared/SelectDropdownMultiple';
// import SelectDropdownSingle from '../../../components/shared/SelectDropdownSingle';
// import CustomToggle from '../../../components/shared/CustomToggle';
// import { fetchBusinessEntities, fetchTeams, fetchGroups, fetchSystemUsers } from '../api/settingsApi';
// import { fetchClientsByBusinessEntity, fetchDivisions, storeUserMappings } from '../api/clientsUsersmappingApi';

// // ---------------------------------------------------------------------------
// // Initial / empty values
// // ---------------------------------------------------------------------------

// const EMPTY_ENTITY_KAM_ROW = () => ({
//   id: crypto.randomUUID(),
//   entityId: '',
//   kamIds: [],
//   clientOptions: [], // Store client options for each row
//   loadingClients: false, // Track loading state for clients
// });

// const EMPTY_MAPPING_VALUES = {
//   entityKamBindings: [EMPTY_ENTITY_KAM_ROW()],
//   defaultEntityId: '',
//   defaultKamId: '',
//   teamSelectAll: false,
//   teamIds: [],
//   defaultTeamId: '',
//   groupSelectAll: false,
//   groupIds: [],
//   defaultGroupId: '',
//   divisionSelectAll: false,
//   divisionIds: [],
//   defaultDivisionId: '',
// };

// // ---------------------------------------------------------------------------
// // Normalize incoming mapping data
// // ---------------------------------------------------------------------------

// function normalizeMapping(mapping) {
//   const safeMapping = mapping ?? {};

//   const rawBindings = safeMapping.entityKamBindings;
//   const entityKamBindings =
//     Array.isArray(rawBindings) && rawBindings.length > 0
//       ? rawBindings.map((b) => ({
//           id: b.id || crypto.randomUUID(),
//           entityId: b.entityId || '',
//           kamIds: Array.isArray(b.kamIds) ? b.kamIds : [],
//           clientOptions: [],
//           loadingClients: false,
//         }))
//       : [EMPTY_ENTITY_KAM_ROW()];

//   return {
//     entityKamBindings,
//     defaultEntityId: safeMapping.defaultEntityId || '',
//     defaultKamId: safeMapping.defaultKamId || '',
//     teamSelectAll: Boolean(safeMapping.teams?.selectAll),
//     teamIds: Array.isArray(safeMapping.teams?.ids) ? safeMapping.teams.ids : [],
//     defaultTeamId: safeMapping.teams?.defaultId || '',
//     groupSelectAll: Boolean(safeMapping.groups?.selectAll),
//     groupIds: Array.isArray(safeMapping.groups?.ids) ? safeMapping.groups.ids : [],
//     defaultGroupId: safeMapping.groups?.defaultId || '',
//     divisionSelectAll: Boolean(safeMapping.divisions?.selectAll),
//     divisionIds: Array.isArray(safeMapping.divisions?.ids) ? safeMapping.divisions.ids : [],
//     defaultDivisionId: safeMapping.divisions?.defaultId || '',
//   };
// }

// // ---------------------------------------------------------------------------
// // Helpers
// // ---------------------------------------------------------------------------

// function getSelectedOptions(selectAll, selectedIds, options) {
//   return selectAll
//     ? options
//     : options.filter((option) => selectedIds.includes(option.id));
// }

// // ---------------------------------------------------------------------------
// // Section label component
// // ---------------------------------------------------------------------------

// function SectionLabel({ icon, title, subtitle }) {
//   return (
//     <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
//       <Box
//         sx={{
//           width: 34,
//           height: 34,
//           borderRadius: '9px',
//           bgcolor: '#f0f9ff',
//           border: '1px solid #bae6fd',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           flexShrink: 0,
//         }}
//       >
//         {icon}
//       </Box>
//       <Box>
//         <Typography variant="subtitle1" fontWeight={700} color="#0f172a" lineHeight={1.2}>
//           {title}
//         </Typography>
//         {subtitle && (
//           <Typography variant="caption" color="#64748b">
//             {subtitle}
//           </Typography>
//         )}
//       </Box>
//     </Stack>
//   );
// }

// // ---------------------------------------------------------------------------
// // EntityKamBindingRow — one row in the binding section
// // ---------------------------------------------------------------------------

// function EntityKamBindingRow({
//   row,
//   rowIndex,
//   totalRows,
//   businessEntities, // Pass business entities from parent
//   usedEntityIds,   // entity ids already selected in OTHER rows (for disabling)
//   onEntityChange,
//   onKamChange,
//   onRemove,
//   onAdd,
// }) {
//   // Filter and prepare entity options from fetched data
//   const entityOptions = useMemo(() => {
//     if (!businessEntities || businessEntities.length === 0) return [];
    
//     return businessEntities.map((entity) => ({
//       id: entity.id,
//       label: entity.name, // Using 'name' from backend
//       disabled: usedEntityIds.includes(entity.id),
//     }));
//   }, [businessEntities, usedEntityIds]);

//   const entityFetcher = useMemo(() => async () => entityOptions, [entityOptions]);
  
//   // Prepare client options for the dropdown
//   const clientOptions = useMemo(() => {
//     if (!row.clientOptions || row.clientOptions.length === 0) return [];
//     return row.clientOptions.map((client) => ({
//       id: client.id,
//       label: client.client_name,
//     }));
//   }, [row.clientOptions]);
  
//   const isKamSelectAll = row.kamIds?.length === clientOptions.length && clientOptions.length > 0;

//   return (
//     <Box
//       sx={{
//         display: 'grid',
//         gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr) 36px',
//         alignItems: 'start',
//         gap: 1.5,
//       }}
//     >
//       {/* Business Entity — single select */}
//       <SelectDropdownSingle
//         name={`entityKamBindings[${rowIndex}].entityId`}
//         label="Business Entity"
//         fetchOptions={entityFetcher}
//         value={row.entityId}
//         onChange={(id) => onEntityChange(rowIndex, id)}
//       />

//       <Box
//         sx={{
//           display: 'flex',
//           flexDirection: 'column',
//           alignItems: 'center',
//           minWidth: 80,
//           mt: '10px',
//         }}
//       >
//         <CustomToggle
//           size="sm"
//           label="Select All"
//           checked={isKamSelectAll}
//           onChange={(event) => {
//             onKamChange(
//               rowIndex,
//               event.target.checked ? clientOptions.map((option) => option.id) : [],
//             );
//           }}
//         />
//       </Box>

//       {/* Clients — multi select */}
//       <SelectDropdownMultiple
//         name={`entityKamBindings[${rowIndex}].kamIds`}
//         label="Kams (System Users)"
//         options={clientOptions}
//         value={row.kamIds || []}
//         onChange={(ids) => onKamChange(rowIndex, ids)}
//         disabled={isKamSelectAll || row.loadingClients || !row.entityId}
//         limitTags={3}
//         fixedHeight
//         loading={row.loadingClients}
//         placeholder={!row.entityId ? "Select business entity first" : "Select Kams (System Users)"}
//       />

//       {/* Remove row button */}
//       <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, mt: '10px' }}>
//         {rowIndex === totalRows - 1 && (
//           <IconButton
//             onClick={onAdd}
//             size="small"
//             sx={{
//               color: '#2563eb',
//               '&:hover': { bgcolor: '#eff6ff' },
//             }}
//           >
//             <AddCircleOutlineIcon fontSize="small" />
//           </IconButton>
//         )}
//         <IconButton
//           onClick={() => onRemove(rowIndex)}
//           disabled={totalRows === 1}
//           size="small"
//           sx={{
//             color: totalRows === 1 ? '#cbd5e1' : '#ef4444',
//             '&:hover': { bgcolor: '#fef2f2' },
//           }}
//         >
//           <RemoveCircleOutlineIcon fontSize="small" />
//         </IconButton>
//       </Box>
//     </Box>
//   );
// }

// // ---------------------------------------------------------------------------
// // MappingRow — reused for Team / Group / Division
// // ---------------------------------------------------------------------------

// function MappingRow({
//   title,
//   toggleName,
//   selectedName,
//   defaultName,
//   options, // Now receiving options directly
//   values,
//   touched,
//   errors,
//   handleBlur,
//   setFieldValue,
// }) {
//   const selectedOptions = useMemo(
//     () => {
//       if (values[toggleName]) {
//         return options;
//       }
//       return options.filter((option) => values[selectedName]?.includes(option.id));
//     },
//     [options, selectedName, toggleName, values],
//   );

//   const defaultOptionsFetcher = useMemo(
//     () => async () => selectedOptions.map(opt => ({ id: opt.id, label: opt.label })),
//     [selectedOptions],
//   );

//   return (
//     <Box
//       sx={{
//         display: 'grid',
//         gridTemplateColumns: 'auto minmax(0, 1fr) minmax(0, 1fr)',
//         alignItems: 'start',
//         gap: 1.5,
//       }}
//     >
//       <Box
//         sx={{
//           display: 'flex',
//           flexDirection: 'column',
//           alignItems: 'center',
//           minWidth: 80,
//           mt: '10px',
//         }}
//       >
//         <CustomToggle
//           size="sm"
//           label="Select All"
//           checked={values[toggleName]}
//           onChange={(event) => {
//             const checked = event.target.checked;
//             const nextSelectedIds = checked ? options.map((option) => option.id) : [];

//             setFieldValue(toggleName, checked);
//             setFieldValue(selectedName, nextSelectedIds);

//             if (!nextSelectedIds.includes(values[defaultName])) {
//               setFieldValue(defaultName, '');
//             }
//           }}
//         />
//       </Box>

//       <SelectDropdownMultiple
//         name={selectedName}
//         label={title}
//         options={options}
//         value={values[selectedName]}
//         onChange={(ids) => {
//           setFieldValue(selectedName, ids);

//           if (!ids.includes(values[defaultName])) {
//             setFieldValue(defaultName, '');
//           }
//         }}
//         onBlur={handleBlur}
//         disabled={values[toggleName]}
//         error={Boolean(touched[selectedName] && errors[selectedName])}
//         helperText={touched[selectedName] && errors[selectedName] ? errors[selectedName] : undefined}
//         limitTags={3}
//         fixedHeight
//       />

//       <SelectDropdownSingle
//         name={defaultName}
//         label={`Default ${title}`}
//         fetchOptions={defaultOptionsFetcher}
//         value={values[defaultName]}
//         onChange={(id) => setFieldValue(defaultName, id)}
//         onBlur={handleBlur}
//         disabled={selectedOptions.length === 0}
//         error={Boolean(touched[defaultName] && errors[defaultName])}
//         helperText={touched[defaultName] && errors[defaultName] ? errors[defaultName] : undefined}
//       />
//     </Box>
//   );
// }

// // ---------------------------------------------------------------------------
// // Main page
// // ---------------------------------------------------------------------------

// export default function UserMappingPage() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const user = location.state?.user || null;
//   const initialMapping = location.state?.mapping || null;
  
//   // State for business entities
//   const [businessEntities, setBusinessEntities] = useState([]);
  
//   // State for teams, groups, divisions
//   const [teams, setTeams] = useState([]);
//   const [groups, setGroups] = useState([]);
//   const [divisions, setDivisions] = useState([]);
  
//   // State for alerts
//   const [alert, setAlert] = useState({ type: '', message: '', open: false });

//   // Fetch business entities on component mount
//   useEffect(() => {
//     const loadBusinessEntities = async () => {
//       try {
//         const entities = await fetchBusinessEntities();
//         setBusinessEntities(entities);
//       } catch (error) {
//         console.error('Failed to load business entities:', error);
//         setBusinessEntities([]);
//         showAlert('error', 'Failed to load business entities');
//       }
//     };

//     loadBusinessEntities();
//   }, []);

//   // Fetch teams
//   useEffect(() => {
//     const loadTeams = async () => {
//       try {
//         const teamsData = await fetchTeams();
//         const formattedTeams = Array.isArray(teamsData) 
//           ? teamsData.map(team => ({
//               id: team.id,
//               label: team.name || team.team_name || 'Unnamed Team'
//             }))
//           : [];
//         setTeams(formattedTeams);
//       } catch (error) {
//         console.error('Failed to load teams:', error);
//         setTeams([]);
//         showAlert('error', 'Failed to load teams');
//       }
//     };
//     loadTeams();
//   }, []);

//   // Fetch groups
//   useEffect(() => {
//     const loadGroups = async () => {
//       try {
//         const groupsData = await fetchGroups();
//         const formattedGroups = Array.isArray(groupsData)
//           ? groupsData.map(group => ({
//               id: group.id,
//               label: group.name || group.group_name || 'Unnamed Group'
//             }))
//           : [];
//         setGroups(formattedGroups);
//       } catch (error) {
//         console.error('Failed to load groups:', error);
//         setGroups([]);
//         showAlert('error', 'Failed to load groups');
//       }
//     };
//     loadGroups();
//   }, []);

//   // Fetch divisions
//   useEffect(() => {
//     const loadDivisions = async () => {
//       try {
//         const divisionsData = await fetchDivisions();
//         const formattedDivisions = Array.isArray(divisionsData)
//           ? divisionsData.map(division => ({
//               id: division.id,
//               label: division.name || division.division_name || 'Unnamed Division'
//             }))
//           : [];
//         setDivisions(formattedDivisions);
//       } catch (error) {
//         console.error('Failed to load divisions:', error);
//         setDivisions([]);
//         showAlert('error', 'Failed to load divisions');
//       }
//     };
//     loadDivisions();
//   }, []);

//   const initialValues = useMemo(
//     () => ({
//       ...EMPTY_MAPPING_VALUES,
//       ...normalizeMapping(initialMapping),
//     }),
//     [initialMapping],
//   );

//   const showAlert = (type, message) => {
//     setAlert({ type, message, open: true });
//     setTimeout(() => {
//       setAlert(prev => ({ ...prev, open: false }));
//     }, 5000);
//   };

//   const formik = useFormik({
//     initialValues,
//     enableReinitialize: true,
//     onSubmit: async (values, { setSubmitting }) => {
//       try {
//         const payload = {
//           userId: user?.id || null,
//           mapping: {
//             entityKamBindings: values.entityKamBindings.map((b) => ({
//               entityId: b.entityId || null,
//               kamIds: b.kamIds,
//             })),
//             defaultEntityId: values.defaultEntityId || null,
//             defaultKamId: values.defaultKamId || null,
//             teams: {
//               selectAll: values.teamSelectAll,
//               ids: values.teamIds,
//               defaultId: values.defaultTeamId || null,
//             },
//             groups: {
//               selectAll: values.groupSelectAll,
//               ids: values.groupIds,
//               defaultId: values.defaultGroupId || null,
//             },
//             divisions: {
//               selectAll: values.divisionSelectAll,
//               ids: values.divisionIds,
//               defaultId: values.defaultDivisionId || null,
//             },
//           },
//         };

//         console.log('User mapping payload:', payload);
        
//         // Call the API to store mappings
//         const result = await storeUserMappings(payload);
        
//         console.log('Mapping saved successfully:', result);
//         showAlert('success', 'User mappings saved successfully!');
        
//         // Navigate back after a short delay to show success message
//         setTimeout(() => {
//           navigate('/settings/users');
//         }, 1500);
        
//       } catch (error) {
//         console.error('Failed to save mappings:', error);
//         const errorMessage = error.response?.data?.message || 'Failed to save user mappings';
//         showAlert('error', errorMessage);
//       } finally {
//         setSubmitting(false);
//       }
//     },
//   });

//   // Function to fetch clients for a specific row
//   const fetchClientsForRow = useCallback(async (rowIndex, entityId) => {
//     if (!entityId) return;

//     // Update loading state for this row
//     formik.setFieldValue(`entityKamBindings[${rowIndex}].loadingClients`, true);
    
//     try {
//       const clients = await fetchClientsByBusinessEntity({ business_entity_id: entityId });
      
//       // Update client options for this row
//       formik.setFieldValue(`entityKamBindings[${rowIndex}].clientOptions`, clients || []);
      
//       // Reset selected clients when business entity changes
//       formik.setFieldValue(`entityKamBindings[${rowIndex}].kamIds`, []);
//     } catch (error) {
//       console.error('Failed to fetch clients:', error);
//       formik.setFieldValue(`entityKamBindings[${rowIndex}].clientOptions`, []);
//       formik.setFieldValue(`entityKamBindings[${rowIndex}].kamIds`, []);
//       showAlert('error', 'Failed to fetch clients for selected business entity');
//     } finally {
//       formik.setFieldValue(`entityKamBindings[${rowIndex}].loadingClients`, false);
//     }
//   }, [formik]);

//   // ---- Entity-KAM binding handlers ----

//   const handleAddRow = useCallback(() => {
//     formik.setFieldValue('entityKamBindings', [
//       ...formik.values.entityKamBindings,
//       EMPTY_ENTITY_KAM_ROW(),
//     ]);
//   }, [formik]);

//   const handleRemoveRow = useCallback(
//     (index) => {
//       const updated = formik.values.entityKamBindings.filter((_, i) => i !== index);
//       const removedEntityId = formik.values.entityKamBindings[index].entityId;

//       formik.setFieldValue('entityKamBindings', updated);

//       // If the removed row held the default entity, clear defaultEntityId
//       if (removedEntityId && formik.values.defaultEntityId === removedEntityId) {
//         formik.setFieldValue('defaultEntityId', '');
//         formik.setFieldValue('defaultKamId', '');
//       }
//     },
//     [formik],
//   );

//   const handleEntityChange = useCallback(
//     (index, entityId) => {
//       // Update the entity ID first
//       const updated = formik.values.entityKamBindings.map((row, i) =>
//         i === index ? { ...row, entityId, kamIds: [], clientOptions: [] } : row,
//       );
//       formik.setFieldValue('entityKamBindings', updated);

//       // If the old entity for this row was the default, clear it
//       const oldEntityId = formik.values.entityKamBindings[index].entityId;
//       if (oldEntityId && formik.values.defaultEntityId === oldEntityId) {
//         formik.setFieldValue('defaultEntityId', '');
//         formik.setFieldValue('defaultKamId', '');
//       }

//       // Fetch clients for the selected business entity
//       if (entityId) {
//         fetchClientsForRow(index, entityId);
//       }
//     },
//     [formik, fetchClientsForRow],
//   );

//   const handleKamChange = useCallback(
//     (index, kamIds) => {
//       const updated = formik.values.entityKamBindings.map((row, i) =>
//         i === index ? { ...row, kamIds } : row,
//       );
//       formik.setFieldValue('entityKamBindings', updated);

//       const targetRow = formik.values.entityKamBindings[index];
//       if (
//         targetRow?.entityId
//         && targetRow.entityId === formik.values.defaultEntityId
//         && !kamIds.includes(formik.values.defaultKamId)
//       ) {
//         formik.setFieldValue('defaultKamId', '');
//       }
//     },
//     [formik],
//   );

//   // Collect entity ids already selected across all rows (to prevent duplicate entity selection)
//   const selectedEntityIds = formik.values.entityKamBindings
//     .map((b) => b.entityId)
//     .filter(Boolean);

//   // Default entity options — only entities that have been chosen in binding rows
//   const defaultEntityOptions = useMemo(
//     () => businessEntities.filter((opt) => selectedEntityIds.includes(opt.id)),
//     [businessEntities, selectedEntityIds],
//   );

//   const defaultEntityFetcher = useMemo(
//     () => async () => defaultEntityOptions.map(entity => ({ id: entity.id, label: entity.name })),
//     [defaultEntityOptions],
//   );

//   // Get selected KAM IDs for the default entity
//   const defaultKamOptions = useMemo(() => {
//     const selectedBinding = formik.values.entityKamBindings.find(
//       (binding) => binding.entityId === formik.values.defaultEntityId,
//     );

//     if (!selectedBinding) {
//       return [];
//     }

//     // Return ONLY the selected clients (KAMs) for the selected default entity
//     const selectedClients = (selectedBinding.clientOptions || [])
//       .filter(client => selectedBinding.kamIds?.includes(client.id))
//       .map(client => ({
//         id: client.id,
//         label: client.client_name,
//       }));

//     return selectedClients;
//   }, [formik.values.defaultEntityId, formik.values.entityKamBindings]);

//   const defaultKamFetcher = useMemo(
//     () => async () => defaultKamOptions,
//     [defaultKamOptions],
//   );

//   // ---- Card wrapper style ----
//   const cardSx = {
//     bgcolor: '#fff',
//     border: '1px solid #d1d9e0',
//     borderRadius: '16px',
//     p: { xs: 2, sm: 2.5 },
//   };

//   // Section config with dynamic options
//   const sectionConfig = [
//     {
//       title: 'Team',
//       toggleName: 'teamSelectAll',
//       selectedName: 'teamIds',
//       defaultName: 'defaultTeamId',
//       options: teams,
//     },
//     {
//       title: 'Group',
//       toggleName: 'groupSelectAll',
//       selectedName: 'groupIds',
//       defaultName: 'defaultGroupId',
//       options: groups,
//     },
//     {
//       title: 'Division',
//       toggleName: 'divisionSelectAll',
//       selectedName: 'divisionIds',
//       defaultName: 'defaultDivisionId',
//       options: divisions,
//     },
//   ];

//   return (
//     <Box
//       sx={{
//         minHeight: '100vh',
//         bgcolor: '#ffffff',
//         px: { xs: 2, sm: 3, md: 3 },
//         py: { xs: 3, sm: 3 },
//       }}
//     >
//       {/* Alert Messages */}
//       {alert.open && (
//         <Alert 
//           severity={alert.type} 
//           sx={{ mb: 2 }}
//           onClose={() => setAlert(prev => ({ ...prev, open: false }))}
//         >
//           {alert.message}
//         </Alert>
//       )}

//       {/* ---- Header ---- */}
//       <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
//         <Box
//           onClick={() => navigate(-1)}
//           sx={{
//             width: 36,
//             height: 36,
//             borderRadius: '10px',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             cursor: 'pointer',
//             color: '#475569',
//             flexShrink: 0,
//             '&:hover': { bgcolor: '#f1f5f9' },
//           }}
//         >
//           <ArrowBackIcon sx={{ fontSize: 18 }} />
//         </Box>

//         <Box
//           sx={{
//             width: 42,
//             height: 42,
//             borderRadius: '12px',
//             bgcolor: '#eff6ff',
//             border: '1px solid #bfdbfe',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             flexShrink: 0,
//           }}
//         >
//           <AssignmentIndOutlinedIcon sx={{ fontSize: 22, color: '#2563eb' }} />
//         </Box>

//         <Box>
//           <Typography variant="h5" fontWeight={800} color="#111827" letterSpacing="-0.3px">
//             User Mapping
//           </Typography>
//           {user && (
//             <Typography variant="caption" color="#64748b">
//               Mapping for: <strong>{user.user_name || user.id}</strong>
//             </Typography>
//           )}
//         </Box>
//       </Stack>

//       {/* ---- Form ---- */}
//       <Box component="form" noValidate onSubmit={formik.handleSubmit} sx={{ pt: 0.5 }}>
//         <Stack spacing={2.5}>

//           {/* ================================================================
//               SECTION 1 — Business Entity ↔ Client Bindings
//           ================================================================ */}
//           <Box sx={cardSx}>
//             <SectionLabel
//               icon={<BusinessIcon sx={{ fontSize: 18, color: '#0284c7' }} />}
//               title="Business Entity & Client Binding"
//               subtitle="Bind clients to specific business entities for visibility control"
//             />

//             <Stack spacing={1.5}>
//               {formik.values.entityKamBindings.map((row, index) => {
//                 // "used" ids = all selected entity ids except THIS row's own selection
//                 const usedByOthers = selectedEntityIds.filter((id) => id !== row.entityId);

//                 return (
//                   <EntityKamBindingRow
//                     key={row.id}
//                     row={row}
//                     rowIndex={index}
//                     totalRows={formik.values.entityKamBindings.length}
//                     businessEntities={businessEntities}
//                     usedEntityIds={usedByOthers}
//                     onEntityChange={handleEntityChange}
//                     onKamChange={handleKamChange}
//                     onRemove={handleRemoveRow}
//                     onAdd={handleAddRow}
//                   />
//                 );
//               })}
//             </Stack>

//             {/* Default Entity */}
//             <Divider sx={{ my: 2, borderColor: '#e2e8f0' }} />

//             <Box
//               sx={{
//                 display: 'grid',
//                 gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) minmax(0, 1fr)' },
//                 gap: 1.5,
//                 alignItems: 'end',
//               }}
//             >
//               <SelectDropdownSingle
//                 name="defaultEntityId"
//                 label="Default Business Entity"
//                 fetchOptions={defaultEntityFetcher}
//                 value={formik.values.defaultEntityId}
//                 onChange={(id) => {
//                   formik.setFieldValue('defaultEntityId', id);
//                   formik.setFieldValue('defaultKamId', '');
//                 }}
//                 onBlur={formik.handleBlur}
//                 disabled={defaultEntityOptions.length === 0}
//               />

//               <SelectDropdownSingle
//                 name="defaultKamId"
//                 label="Default Kam"
//                 fetchOptions={defaultKamFetcher}
//                 value={formik.values.defaultKamId}
//                 onChange={(id) => formik.setFieldValue('defaultKamId', id)}
//                 onBlur={formik.handleBlur}
//                 disabled={!formik.values.defaultEntityId || defaultKamOptions.length === 0}
//               />
//             </Box>
//           </Box>

//           {/* ================================================================
//               SECTION 2 — Team / Group / Division
//           ================================================================ */}
//           <Box sx={cardSx}>
//             <SectionLabel
//               icon={<PeopleAltOutlinedIcon sx={{ fontSize: 18, color: '#0284c7' }} />}
//               title="Team, Group & Division"
//               subtitle="Select all applicable teams, groups, and divisions with defaults"
//             />

//             <Stack spacing={1.5}>
//               {sectionConfig.map((section) => (
//                 <MappingRow
//                   key={section.selectedName}
//                   title={section.title}
//                   toggleName={section.toggleName}
//                   selectedName={section.selectedName}
//                   defaultName={section.defaultName}
//                   options={section.options}
//                   values={formik.values}
//                   touched={formik.touched}
//                   errors={formik.errors}
//                   handleBlur={formik.handleBlur}
//                   setFieldValue={formik.setFieldValue}
//                 />
//               ))}
//             </Stack>
//           </Box>

//         </Stack>

//         {/* ---- Actions ---- */}
//         <Stack
//           direction={{ xs: 'column', sm: 'row' }}
//           spacing={2}
//           justifyContent="flex-end"
//           sx={{ mt: 3 }}
//         >
//           <Button
//             variant="outlined"
//             onClick={() => navigate('/settings/users')}
//             sx={{
//               minWidth: { xs: '100%', sm: 120 },
//               textTransform: 'none',
//               fontWeight: 600,
//               borderRadius: '10px',
//               borderColor: '#e2e8f0',
//               color: '#64748b',
//             }}
//           >
//             Cancel
//           </Button>
//           <Button
//             type="submit"
//             variant="contained"
//             disabled={formik.isSubmitting}
//             sx={{
//               minWidth: { xs: '100%', sm: 150 },
//               textTransform: 'none',
//               fontWeight: 700,
//               borderRadius: '10px',
//               bgcolor: '#2563eb',
//               boxShadow: '0 1px 3px rgba(37,99,235,0.25)',
//               '&:hover': { bgcolor: '#1d4ed8' },
//               '&:disabled': { bgcolor: '#cbd5e1' }
//             }}
//           >
//             {formik.isSubmitting ? (
//               <Stack direction="row" alignItems="center" spacing={1}>
//                 <CircularProgress size={20} sx={{ color: 'white' }} />
//                 <span>Saving...</span>
//               </Stack>
//             ) : (
//               'Save Mapping'
//             )}
//           </Button>
//         </Stack>
//       </Box>
//     </Box>
//   );
// }









import React, { useMemo, useCallback, useEffect, useState } from 'react';
import { useFormik } from 'formik';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Stack,
  Typography,
  IconButton,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import SelectDropdownMultiple from '../../../components/shared/SelectDropdownMultiple';
import SelectDropdownSingle from '../../../components/shared/SelectDropdownSingle';
import CustomToggle from '../../../components/shared/CustomToggle';
import { fetchBusinessEntities, fetchTeams, fetchGroups, fetchSystemUsers } from '../api/settingsApi';
import { fetchDivisions, storeUserMappings } from '../api/clientsUsersmappingApi';

// ---------------------------------------------------------------------------
// Initial / empty values
// ---------------------------------------------------------------------------

const EMPTY_ENTITY_KAM_ROW = () => ({
  id: crypto.randomUUID(),
  entityId: '',
  kamIds: [],
  systemUserOptions: [], // Store system user options for each row
  loadingUsers: false, // Track loading state for users
});

const EMPTY_MAPPING_VALUES = {
  entityKamBindings: [EMPTY_ENTITY_KAM_ROW()],
  defaultEntityId: '',
  defaultKamId: '',
  teamSelectAll: false,
  teamIds: [],
  defaultTeamId: '',
  groupSelectAll: false,
  groupIds: [],
  defaultGroupId: '',
  divisionSelectAll: false,
  divisionIds: [],
  defaultDivisionId: '',
};

// ---------------------------------------------------------------------------
// Normalize incoming mapping data
// ---------------------------------------------------------------------------

function normalizeMapping(mapping) {
  const safeMapping = mapping ?? {};

  const rawBindings = safeMapping.entityKamBindings;
  const entityKamBindings =
    Array.isArray(rawBindings) && rawBindings.length > 0
      ? rawBindings.map((b) => ({
          id: b.id || crypto.randomUUID(),
          entityId: b.entityId || '',
          kamIds: Array.isArray(b.kamIds) ? b.kamIds : [],
          systemUserOptions: [],
          loadingUsers: false,
        }))
      : [EMPTY_ENTITY_KAM_ROW()];

  return {
    entityKamBindings,
    defaultEntityId: safeMapping.defaultEntityId || '',
    defaultKamId: safeMapping.defaultKamId || '',
    teamSelectAll: Boolean(safeMapping.teams?.selectAll),
    teamIds: Array.isArray(safeMapping.teams?.ids) ? safeMapping.teams.ids : [],
    defaultTeamId: safeMapping.teams?.defaultId || '',
    groupSelectAll: Boolean(safeMapping.groups?.selectAll),
    groupIds: Array.isArray(safeMapping.groups?.ids) ? safeMapping.groups.ids : [],
    defaultGroupId: safeMapping.groups?.defaultId || '',
    divisionSelectAll: Boolean(safeMapping.divisions?.selectAll),
    divisionIds: Array.isArray(safeMapping.divisions?.ids) ? safeMapping.divisions.ids : [],
    defaultDivisionId: safeMapping.divisions?.defaultId || '',
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getSelectedOptions(selectAll, selectedIds, options) {
  return selectAll
    ? options
    : options.filter((option) => selectedIds.includes(option.id));
}

// ---------------------------------------------------------------------------
// Section label component
// ---------------------------------------------------------------------------

function SectionLabel({ icon, title, subtitle }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: '9px',
          bgcolor: '#f0f9ff',
          border: '1px solid #bae6fd',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="subtitle1" fontWeight={700} color="#0f172a" lineHeight={1.2}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="#64748b">
            {subtitle}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}

// ---------------------------------------------------------------------------
// EntityKamBindingRow — one row in the binding section
// ---------------------------------------------------------------------------

function EntityKamBindingRow({
  row,
  rowIndex,
  totalRows,
  businessEntities, // Pass business entities from parent
  usedEntityIds,   // entity ids already selected in OTHER rows (for disabling)
  onEntityChange,
  onKamChange,
  onRemove,
  onAdd,
}) {
  // Filter and prepare entity options from fetched data
  const entityOptions = useMemo(() => {
    if (!businessEntities || businessEntities.length === 0) return [];
    
    return businessEntities.map((entity) => ({
      id: entity.id,
      label: entity.name, // Using 'name' from backend
      disabled: usedEntityIds.includes(entity.id),
    }));
  }, [businessEntities, usedEntityIds]);

  const entityFetcher = useMemo(() => async () => entityOptions, [entityOptions]);
  
  // Prepare system user options for the dropdown
  const userOptions = useMemo(() => {
    if (!row.systemUserOptions || row.systemUserOptions.length === 0) return [];
    return row.systemUserOptions.map((user) => ({
      id: user.id,
      label: user.user_name || user.name || 'Unnamed User',
    }));
  }, [row.systemUserOptions]);
  
  const isKamSelectAll = row.kamIds?.length === userOptions.length && userOptions.length > 0;

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr) 36px',
        alignItems: 'start',
        gap: 1.5,
      }}
    >
      {/* Business Entity — single select */}
      <SelectDropdownSingle
        name={`entityKamBindings[${rowIndex}].entityId`}
        label="Business Entity"
        fetchOptions={entityFetcher}
        value={row.entityId}
        onChange={(id) => onEntityChange(rowIndex, id)}
      />

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minWidth: 80,
          mt: '10px',
        }}
      >
        <CustomToggle
          size="sm"
          label="Select All"
          checked={isKamSelectAll}
          onChange={(event) => {
            onKamChange(
              rowIndex,
              event.target.checked ? userOptions.map((option) => option.id) : [],
            );
          }}
        />
      </Box>

      {/* System Users — multi select */}
      <SelectDropdownMultiple
        name={`entityKamBindings[${rowIndex}].kamIds`}
        label="System Users"
        options={userOptions}
        value={row.kamIds || []}
        onChange={(ids) => onKamChange(rowIndex, ids)}
        disabled={isKamSelectAll || row.loadingUsers || !row.entityId}
        limitTags={3}
        fixedHeight
        loading={row.loadingUsers}
        placeholder={!row.entityId ? "Select business entity first" : "Select System Users"}
      />

      {/* Remove row button */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, mt: '10px' }}>
        {rowIndex === totalRows - 1 && (
          <IconButton
            onClick={onAdd}
            size="small"
            sx={{
              color: '#2563eb',
              '&:hover': { bgcolor: '#eff6ff' },
            }}
          >
            <AddCircleOutlineIcon fontSize="small" />
          </IconButton>
        )}
        <IconButton
          onClick={() => onRemove(rowIndex)}
          disabled={totalRows === 1}
          size="small"
          sx={{
            color: totalRows === 1 ? '#cbd5e1' : '#ef4444',
            '&:hover': { bgcolor: '#fef2f2' },
          }}
        >
          <RemoveCircleOutlineIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// MappingRow — reused for Team / Group / Division
// ---------------------------------------------------------------------------

function MappingRow({
  title,
  toggleName,
  selectedName,
  defaultName,
  options, // Now receiving options directly
  values,
  touched,
  errors,
  handleBlur,
  setFieldValue,
}) {
  const selectedOptions = useMemo(
    () => {
      if (values[toggleName]) {
        return options;
      }
      return options.filter((option) => values[selectedName]?.includes(option.id));
    },
    [options, selectedName, toggleName, values],
  );

  const defaultOptionsFetcher = useMemo(
    () => async () => selectedOptions.map(opt => ({ id: opt.id, label: opt.label })),
    [selectedOptions],
  );

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'auto minmax(0, 1fr) minmax(0, 1fr)',
        alignItems: 'start',
        gap: 1.5,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minWidth: 80,
          mt: '10px',
        }}
      >
        <CustomToggle
          size="sm"
          label="Select All"
          checked={values[toggleName]}
          onChange={(event) => {
            const checked = event.target.checked;
            const nextSelectedIds = checked ? options.map((option) => option.id) : [];

            setFieldValue(toggleName, checked);
            setFieldValue(selectedName, nextSelectedIds);

            if (!nextSelectedIds.includes(values[defaultName])) {
              setFieldValue(defaultName, '');
            }
          }}
        />
      </Box>

      <SelectDropdownMultiple
        name={selectedName}
        label={title}
        options={options}
        value={values[selectedName]}
        onChange={(ids) => {
          setFieldValue(selectedName, ids);

          if (!ids.includes(values[defaultName])) {
            setFieldValue(defaultName, '');
          }
        }}
        onBlur={handleBlur}
        disabled={values[toggleName]}
        error={Boolean(touched[selectedName] && errors[selectedName])}
        helperText={touched[selectedName] && errors[selectedName] ? errors[selectedName] : undefined}
        limitTags={3}
        fixedHeight
      />

      <SelectDropdownSingle
        name={defaultName}
        label={`Default ${title}`}
        fetchOptions={defaultOptionsFetcher}
        value={values[defaultName]}
        onChange={(id) => setFieldValue(defaultName, id)}
        onBlur={handleBlur}
        disabled={selectedOptions.length === 0}
        error={Boolean(touched[defaultName] && errors[defaultName])}
        helperText={touched[defaultName] && errors[defaultName] ? errors[defaultName] : undefined}
      />
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function UserMappingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user || null;
  const initialMapping = location.state?.mapping || null;
  
  // State for business entities
  const [businessEntities, setBusinessEntities] = useState([]);
  
  // State for system users
  const [systemUsers, setSystemUsers] = useState([]);
  
  // State for teams, groups, divisions
  const [teams, setTeams] = useState([]);
  const [groups, setGroups] = useState([]);
  const [divisions, setDivisions] = useState([]);
  
  // State for alerts
  const [alert, setAlert] = useState({ type: '', message: '', open: false });

  // Fetch business entities on component mount
  useEffect(() => {
    const loadBusinessEntities = async () => {
      try {
        const entities = await fetchBusinessEntities();
        setBusinessEntities(entities);
      } catch (error) {
        console.error('Failed to load business entities:', error);
        setBusinessEntities([]);
        showAlert('error', 'Failed to load business entities');
      }
    };

    loadBusinessEntities();
  }, []);

  // ✅ Fetch system users once on component mount (no parameters needed)
  useEffect(() => {
    const loadSystemUsers = async () => {
      try {
        const response = await fetchSystemUsers();
        const usersData = response.data || [];
        setSystemUsers(usersData);
      } catch (error) {
        console.error('Failed to load system users:', error);
        setSystemUsers([]);
        showAlert('error', 'Failed to load system users');
      }
    };

    loadSystemUsers();
  }, []);

  // Fetch teams
  useEffect(() => {
    const loadTeams = async () => {
      try {
        const teamsData = await fetchTeams();
        const formattedTeams = Array.isArray(teamsData) 
          ? teamsData.map(team => ({
              id: team.id,
              label: team.name || team.team_name || 'Unnamed Team'
            }))
          : [];
        setTeams(formattedTeams);
      } catch (error) {
        console.error('Failed to load teams:', error);
        setTeams([]);
        showAlert('error', 'Failed to load teams');
      }
    };
    loadTeams();
  }, []);

  // Fetch groups
  useEffect(() => {
    const loadGroups = async () => {
      try {
        const groupsData = await fetchGroups();
        const formattedGroups = Array.isArray(groupsData)
          ? groupsData.map(group => ({
              id: group.id,
              label: group.name || group.group_name || 'Unnamed Group'
            }))
          : [];
        setGroups(formattedGroups);
      } catch (error) {
        console.error('Failed to load groups:', error);
        setGroups([]);
        showAlert('error', 'Failed to load groups');
      }
    };
    loadGroups();
  }, []);

  // Fetch divisions
  useEffect(() => {
    const loadDivisions = async () => {
      try {
        const divisionsData = await fetchDivisions();
        const formattedDivisions = Array.isArray(divisionsData)
          ? divisionsData.map(division => ({
              id: division.id,
              label: division.name || division.division_name || 'Unnamed Division'
            }))
          : [];
        setDivisions(formattedDivisions);
      } catch (error) {
        console.error('Failed to load divisions:', error);
        setDivisions([]);
        showAlert('error', 'Failed to load divisions');
      }
    };
    loadDivisions();
  }, []);

  const initialValues = useMemo(
    () => ({
      ...EMPTY_MAPPING_VALUES,
      ...normalizeMapping(initialMapping),
    }),
    [initialMapping],
  );

  const showAlert = (type, message) => {
    setAlert({ type, message, open: true });
    setTimeout(() => {
      setAlert(prev => ({ ...prev, open: false }));
    }, 5000);
  };

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const payload = {
          userId: user?.id || null,
          mapping: {
            entityKamBindings: values.entityKamBindings.map((b) => ({
              entityId: b.entityId || null,
              kamIds: b.kamIds,
            })),
            defaultEntityId: values.defaultEntityId || null,
            defaultKamId: values.defaultKamId || null,
            teams: {
              selectAll: values.teamSelectAll,
              ids: values.teamIds,
              defaultId: values.defaultTeamId || null,
            },
            groups: {
              selectAll: values.groupSelectAll,
              ids: values.groupIds,
              defaultId: values.defaultGroupId || null,
            },
            divisions: {
              selectAll: values.divisionSelectAll,
              ids: values.divisionIds,
              defaultId: values.defaultDivisionId || null,
            },
          },
        };

        console.log('User mapping payload:', payload);
        
        // Call the API to store mappings
        const result = await storeUserMappings(payload);
        
        console.log('Mapping saved successfully:', result);
        showAlert('success', 'User mappings saved successfully!');
        
        // Navigate back after a short delay to show success message
        setTimeout(() => {
          navigate('/settings/users');
        }, 1500);
        
      } catch (error) {
        console.error('Failed to save mappings:', error);
        const errorMessage = error.response?.data?.message || 'Failed to save user mappings';
        showAlert('error', errorMessage);
      } finally {
        setSubmitting(false);
      }
    },
  });

  // ✅ UPDATED: Load system users for a row (no parameters needed, already loaded globally)
  const handleLoadUsersForRow = useCallback((rowIndex) => {
    // Update loading state for this row
    formik.setFieldValue(`entityKamBindings[${rowIndex}].loadingUsers`, true);
    
    try {
      // Use the already-loaded system users
      formik.setFieldValue(`entityKamBindings[${rowIndex}].systemUserOptions`, systemUsers);
      
      // Reset selected users when business entity changes
      formik.setFieldValue(`entityKamBindings[${rowIndex}].kamIds`, []);
    } catch (error) {
      console.error('Failed to load users:', error);
      formik.setFieldValue(`entityKamBindings[${rowIndex}].systemUserOptions`, []);
      formik.setFieldValue(`entityKamBindings[${rowIndex}].kamIds`, []);
      showAlert('error', 'Failed to load system users');
    } finally {
      formik.setFieldValue(`entityKamBindings[${rowIndex}].loadingUsers`, false);
    }
  }, [formik, systemUsers]);

  // ---- Entity-KAM binding handlers ----

  const handleAddRow = useCallback(() => {
    formik.setFieldValue('entityKamBindings', [
      ...formik.values.entityKamBindings,
      EMPTY_ENTITY_KAM_ROW(),
    ]);
  }, [formik]);

  const handleRemoveRow = useCallback(
    (index) => {
      const updated = formik.values.entityKamBindings.filter((_, i) => i !== index);
      const removedEntityId = formik.values.entityKamBindings[index].entityId;

      formik.setFieldValue('entityKamBindings', updated);

      // If the removed row held the default entity, clear defaultEntityId
      if (removedEntityId && formik.values.defaultEntityId === removedEntityId) {
        formik.setFieldValue('defaultEntityId', '');
        formik.setFieldValue('defaultKamId', '');
      }
    },
    [formik],
  );

  const handleEntityChange = useCallback(
    (index, entityId) => {
      // Update the entity ID first
      const updated = formik.values.entityKamBindings.map((row, i) =>
        i === index ? { ...row, entityId, kamIds: [], systemUserOptions: [] } : row,
      );
      formik.setFieldValue('entityKamBindings', updated);

      // If the old entity for this row was the default, clear it
      const oldEntityId = formik.values.entityKamBindings[index].entityId;
      if (oldEntityId && formik.values.defaultEntityId === oldEntityId) {
        formik.setFieldValue('defaultEntityId', '');
        formik.setFieldValue('defaultKamId', '');
      }

      // Load users for the selected business entity
      if (entityId) {
        handleLoadUsersForRow(index);
      }
    },
    [formik, handleLoadUsersForRow],
  );

  const handleKamChange = useCallback(
    (index, kamIds) => {
      const updated = formik.values.entityKamBindings.map((row, i) =>
        i === index ? { ...row, kamIds } : row,
      );
      formik.setFieldValue('entityKamBindings', updated);

      const targetRow = formik.values.entityKamBindings[index];
      if (
        targetRow?.entityId
        && targetRow.entityId === formik.values.defaultEntityId
        && !kamIds.includes(formik.values.defaultKamId)
      ) {
        formik.setFieldValue('defaultKamId', '');
      }
    },
    [formik],
  );

  // Collect entity ids already selected across all rows (to prevent duplicate entity selection)
  const selectedEntityIds = formik.values.entityKamBindings
    .map((b) => b.entityId)
    .filter(Boolean);

  // Default entity options — only entities that have been chosen in binding rows
  const defaultEntityOptions = useMemo(
    () => businessEntities.filter((opt) => selectedEntityIds.includes(opt.id)),
    [businessEntities, selectedEntityIds],
  );

  const defaultEntityFetcher = useMemo(
    () => async () => defaultEntityOptions.map(entity => ({ id: entity.id, label: entity.name })),
    [defaultEntityOptions],
  );

  // Get selected system users for the default entity
  const defaultKamOptions = useMemo(() => {
    const selectedBinding = formik.values.entityKamBindings.find(
      (binding) => binding.entityId === formik.values.defaultEntityId,
    );

    if (!selectedBinding) {
      return [];
    }

    // Return ONLY the selected users for the selected default entity
    const selectedUsers = (selectedBinding.systemUserOptions || [])
      .filter(user => selectedBinding.kamIds?.includes(user.id))
      .map(user => ({
        id: user.id,
        label: user.user_name || user.name || 'Unnamed User',
      }));

    return selectedUsers;
  }, [formik.values.defaultEntityId, formik.values.entityKamBindings]);

  const defaultKamFetcher = useMemo(
    () => async () => defaultKamOptions,
    [defaultKamOptions],
  );

  // ---- Card wrapper style ----
  const cardSx = {
    bgcolor: '#fff',
    border: '1px solid #d1d9e0',
    borderRadius: '16px',
    p: { xs: 2, sm: 2.5 },
  };

  // Section config with dynamic options
  const sectionConfig = [
    {
      title: 'Team',
      toggleName: 'teamSelectAll',
      selectedName: 'teamIds',
      defaultName: 'defaultTeamId',
      options: teams,
    },
    {
      title: 'Group',
      toggleName: 'groupSelectAll',
      selectedName: 'groupIds',
      defaultName: 'defaultGroupId',
      options: groups,
    },
    {
      title: 'Division',
      toggleName: 'divisionSelectAll',
      selectedName: 'divisionIds',
      defaultName: 'defaultDivisionId',
      options: divisions,
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#ffffff',
        px: { xs: 2, sm: 3, md: 3 },
        py: { xs: 3, sm: 3 },
      }}
    >
      {/* Alert Messages */}
      {alert.open && (
        <Alert 
          severity={alert.type} 
          sx={{ mb: 2 }}
          onClose={() => setAlert(prev => ({ ...prev, open: false }))}
        >
          {alert.message}
        </Alert>
      )}

      {/* ---- Header ---- */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Box
          onClick={() => navigate(-1)}
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
            '&:hover': { bgcolor: '#f1f5f9' },
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
          <AssignmentIndOutlinedIcon sx={{ fontSize: 22, color: '#2563eb' }} />
        </Box>

        <Box>
          <Typography variant="h5" fontWeight={800} color="#111827" letterSpacing="-0.3px">
            User Mapping
          </Typography>
          {user && (
            <Typography variant="caption" color="#64748b">
              Mapping for: <strong>{user.user_name || user.id}</strong>
            </Typography>
          )}
        </Box>
      </Stack>

      {/* ---- Form ---- */}
      <Box component="form" noValidate onSubmit={formik.handleSubmit} sx={{ pt: 0.5 }}>
        <Stack spacing={2.5}>

          {/* ================================================================
              SECTION 1 — Business Entity ↔ System User Bindings
          ================================================================ */}
          <Box sx={cardSx}>
            <SectionLabel
              icon={<BusinessIcon sx={{ fontSize: 18, color: '#0284c7' }} />}
              title="Business Entity & System User Binding"
              subtitle="Bind system users to specific business entities for visibility control"
            />

            <Stack spacing={1.5}>
              {formik.values.entityKamBindings.map((row, index) => {
                // "used" ids = all selected entity ids except THIS row's own selection
                const usedByOthers = selectedEntityIds.filter((id) => id !== row.entityId);

                return (
                  <EntityKamBindingRow
                    key={row.id}
                    row={row}
                    rowIndex={index}
                    totalRows={formik.values.entityKamBindings.length}
                    businessEntities={businessEntities}
                    usedEntityIds={usedByOthers}
                    onEntityChange={handleEntityChange}
                    onKamChange={handleKamChange}
                    onRemove={handleRemoveRow}
                    onAdd={handleAddRow}
                  />
                );
              })}
            </Stack>

            {/* Default Entity */}
            <Divider sx={{ my: 2, borderColor: '#e2e8f0' }} />

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) minmax(0, 1fr)' },
                gap: 1.5,
                alignItems: 'end',
              }}
            >
              <SelectDropdownSingle
                name="defaultEntityId"
                label="Default Business Entity"
                fetchOptions={defaultEntityFetcher}
                value={formik.values.defaultEntityId}
                onChange={(id) => {
                  formik.setFieldValue('defaultEntityId', id);
                  formik.setFieldValue('defaultKamId', '');
                }}
                onBlur={formik.handleBlur}
                disabled={defaultEntityOptions.length === 0}
              />

              <SelectDropdownSingle
                name="defaultKamId"
                label="Default System User"
                fetchOptions={defaultKamFetcher}
                value={formik.values.defaultKamId}
                onChange={(id) => formik.setFieldValue('defaultKamId', id)}
                onBlur={formik.handleBlur}
                disabled={!formik.values.defaultEntityId || defaultKamOptions.length === 0}
              />
            </Box>
          </Box>

          {/* ================================================================
              SECTION 2 — Team / Group / Division
          ================================================================ */}
          <Box sx={cardSx}>
            <SectionLabel
              icon={<PeopleAltOutlinedIcon sx={{ fontSize: 18, color: '#0284c7' }} />}
              title="Team, Group & Division"
              subtitle="Select all applicable teams, groups, and divisions with defaults"
            />

            <Stack spacing={1.5}>
              {sectionConfig.map((section) => (
                <MappingRow
                  key={section.selectedName}
                  title={section.title}
                  toggleName={section.toggleName}
                  selectedName={section.selectedName}
                  defaultName={section.defaultName}
                  options={section.options}
                  values={formik.values}
                  touched={formik.touched}
                  errors={formik.errors}
                  handleBlur={formik.handleBlur}
                  setFieldValue={formik.setFieldValue}
                />
              ))}
            </Stack>
          </Box>

        </Stack>

        {/* ---- Actions ---- */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="flex-end"
          sx={{ mt: 3 }}
        >
          <Button
            variant="outlined"
            onClick={() => navigate('/settings/users')}
            sx={{
              minWidth: { xs: '100%', sm: 120 },
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '10px',
              borderColor: '#e2e8f0',
              color: '#64748b',
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={formik.isSubmitting}
            sx={{
              minWidth: { xs: '100%', sm: 150 },
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: '10px',
              bgcolor: '#2563eb',
              boxShadow: '0 1px 3px rgba(37,99,235,0.25)',
              '&:hover': { bgcolor: '#1d4ed8' },
              '&:disabled': { bgcolor: '#cbd5e1' }
            }}
          >
            {formik.isSubmitting ? (
              <Stack direction="row" alignItems="center" spacing={1}>
                <CircularProgress size={20} sx={{ color: 'white' }} />
                <span>Saving...</span>
              </Stack>
            ) : (
              'Save Mapping'
            )}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
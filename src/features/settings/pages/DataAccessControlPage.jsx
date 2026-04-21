// import React, { useCallback, useEffect, useState } from 'react';
// import {
//   Box,
//   Button,
//   Checkbox,
//   Paper,
//   Stack,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Typography,
// } from '@mui/material';
// import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
// import SelectDropdownSingle from '../../../components/shared/SelectDropdownSingle';
// import OrbitLoader from '../../../components/shared/OrbitLoader';
// import useInitialTableLoading from '../../../components/shared/useInitialTableLoading';
// import {
//   BUSINESS_ENTITIES,
//   CRITERIA_OPTIONS,
//   FEATURE_OPTIONS,
//   ROLE_OPTIONS,
//   getMockBusinessEntityAccessControl,
//   getMockFieldLevelAccessControl,
// } from '../constants/dataAccessControl';
// import { fetchRoles, fetchPageNames, fetchPageFeatures, getUserViewPermissions, storeUserViewPermissions,
//   updateUserViewPermissions
//  } from '../api/settingsApi';


// export default function DataAccessControlPage() {
//   const isLoading = useInitialTableLoading();
//   const [selectedCriteria] = useState(CRITERIA_OPTIONS[0].id);
//   const [selectedRole, setSelectedRole] = useState('');
//   const [selectedFeature, setSelectedFeature] = useState('');
//   const [roleOptions, setRoleOptions] = useState([]);
//   const [pageOptions, setPageOptions] = useState([]);
//   const [selectedFieldIds, setSelectedFieldIds] = useState([]);
//   const [selectAll, setSelectAll] = useState(false);
//   const [loadingSave, setLoadingSave] = useState(false);
//   const [accessControl, setAccessControl] = useState(() => (
//     getMockBusinessEntityAccessControl(ROLE_OPTIONS[0].id, FEATURE_OPTIONS[0].id)
//   ));

//   function initializeFields(fields) {
//     return fields.map((field) => ({
//       ...field,
//       read: field.read ?? false,
//       write: field.write ?? false,
//       modify: field.modify ?? false,
//       delete: field.delete ?? false,
//       user_view_id: field.user_view_id ?? null,
//     }));
//   }


//   const fetchRoleOptions = useCallback(async () => {
//     try {
//       const rawRoles = await fetchRoles();
//       const normalizedRoles = Array.isArray(rawRoles)
//         ? rawRoles.map((role) => ({
//             ...role,
//             id: role?.id ?? '',
//             label: role?.label || role?.name || 'Unnamed Role',
//           }))
//         : [];
//       setRoleOptions(normalizedRoles);
//       return normalizedRoles;
//     } catch {
//       setRoleOptions([]);
//       return [];
//     }
//   }, []);

//   const fetchPageOptions = useCallback(async () => {
//     try {
//       const rawPages = await fetchPageNames();
//       const normalizedPages = Array.isArray(rawPages)
//         ? rawPages.map((page) => ({
//             ...page,
//             id: page?.id ?? '',
//             label: page?.label || 'Unnamed Page',
//           }))
//         : [];
//       setPageOptions(normalizedPages);
//       return normalizedPages;
//     } catch {
//       setPageOptions([]);
//       return [];
//     }
//   }, []);

 

//   const loadAccessControl = useCallback((criteriaId, roleId, featureKey) => {
//     if (criteriaId === 'field_level') {
//       const data = structuredClone(getMockFieldLevelAccessControl(roleId, featureKey));
//       setAccessControl({
//         ...data,
//         fields: initializeFields(data.fields || []),
//       });
//       return;
//     }

//     const data = structuredClone(getMockBusinessEntityAccessControl(roleId, featureKey));
//     setAccessControl({
//       ...data,
//       fields: initializeFields(data.fields || []),
//     });
//   }, []);

//   function handleRoleChange(roleId) {
//     setSelectedRole(roleId);
//     loadAccessControl(selectedCriteria, roleId, selectedFeature);
//   }

//   function handleFeatureChange(featureKey) {
//     setSelectedFeature(featureKey);
//     setSelectedFieldIds([]); // Reset selections when page changes
//     setSelectAll(false);
//     loadAccessControl(selectedCriteria, selectedRole, featureKey);
//   }

//   function handleFieldSelection(fieldId, checked) {
//     setSelectedFieldIds((prev) =>
//       checked
//         ? [...prev, fieldId]
//         : prev.filter((id) => id !== fieldId)
//     );

//     if (!checked) {
//       setAccessControl((prev) => ({
//         ...prev,
//         fields: prev.fields.map((field) =>
//           field.id === fieldId
//             ? { ...field, read: false, write: false, modify: false, delete: false, user_view_id: null }
//             : field
//         ),
//       }));
//     }
//   }

//   function handleActionToggle(fieldId, actionKey, checked) {
//     setAccessControl((prev) => ({
//       ...prev,
//       fields: prev.fields.map((field) =>
//         field.id === fieldId
//           ? { ...field, [actionKey]: checked }
//           : field
//       ),
//     }));
//   }

//   function handleSelectAll(checked) {
//     if (checked) {
//       const allIds = accessControl.fields.map((field) => field.id);
//       setSelectedFieldIds(allIds);
//       setSelectAll(true);
//     } else {
//       setSelectedFieldIds([]);
//       setSelectAll(false);
//     }
//   }

//   useEffect(() => {
//     if (!selectedRole && roleOptions.length > 0) {
//       const firstRoleId = roleOptions[0].id;
//       setSelectedRole(firstRoleId);
//       loadAccessControl(selectedCriteria, firstRoleId, selectedFeature);
//     }
//   }, [roleOptions, selectedRole, selectedCriteria, selectedFeature, loadAccessControl]);

//   useEffect(() => {
//     if (!selectedFeature && pageOptions.length > 0) {
//       const firstPageId = pageOptions[0].id;
//       setSelectedFeature(firstPageId);
//       loadAccessControl(selectedCriteria, selectedRole, firstPageId);
//     }
//   }, [pageOptions, selectedFeature, selectedCriteria, selectedRole, loadAccessControl]);

//   useEffect(() => {
//     const loadPageFeatures = async () => {
//       if (selectedFeature) {
//         try {
//           const features = await fetchPageFeatures(selectedFeature);
//           const normalizedFeatures = Array.isArray(features)
//             ? initializeFields(features.map((feature) => ({
//                 id: feature?.id,
//                 fieldName: feature?.feature_name || 'Unnamed Feature',
//               })))
//             : [];
//           setAccessControl((prev) => ({
//             ...prev,
//             fields: normalizedFeatures,
//           }));
//         } catch (error) {
//           console.error('Failed to load page features:', error);
//           setAccessControl((prev) => ({
//             ...prev,
//             fields: [],
//           }));
//         }
//       } else {
//         setAccessControl((prev) => ({
//           ...prev,
//           fields: [],
//         }));
//       }
//     };

//     loadPageFeatures();
//   }, [selectedFeature, loadAccessControl]);

//   useEffect(() => {
//     const loadExistingPermissions = async () => {
//       if (selectedRole && selectedFeature) {
//         try {
//           console.log('Loading permissions for role:', selectedRole, 'feature:', selectedFeature);
//           const existing = await getUserViewPermissions(selectedRole, selectedFeature);
//           console.log('Existing permissions:', existing);
          
//           let selectedIds = [];
//           let permissionMap = {};

//           if (Array.isArray(existing) && existing.length > 0) {
//             // Build permission map with read/write/modify/delete fields
//             permissionMap = existing.reduce((acc, item) => {
//               const featureId = item?.feature_id;
//               if (!featureId) return acc;
//               acc[featureId] = item;
//               selectedIds.push(featureId);
//               return acc;
//             }, {});

//             console.log('Permission map:', permissionMap);
//           }

//           setSelectedFieldIds(selectedIds);
//           setSelectAll(selectedIds.length === accessControl.fields.length && accessControl.fields.length > 0);
//           setAccessControl((prev) => ({
//             ...prev,
//             fields: prev.fields.map((field) => {
//               const permission = permissionMap[field.id];
//               return {
//                 ...field,
//                 user_view_id: permission?.id ?? field.user_view_id,
//                 read: permission?.read ?? false,
//                 write: permission?.write ?? false,
//                 modify: permission?.modify ?? false,
//               };
//             }),
//           }));
//         } catch (error) {
//           console.error('Failed to load existing permissions:', error);
//           setSelectedFieldIds([]);
//           setSelectAll(false);
//         }
//       } else {
//         setSelectedFieldIds([]);
//         setSelectAll(false);
//       }
//     };

//     loadExistingPermissions();
//   }, [selectedRole, selectedFeature, loadAccessControl, accessControl.fields.length]);

//   useEffect(() => {
//     setSelectAll(selectedFieldIds.length === accessControl.fields.length && accessControl.fields.length > 0);
//   }, [selectedFieldIds, accessControl.fields.length]);

//   async function handleSave() {
//     setLoadingSave(true);

//     try {
//       const createTasks = [];
//       const existingPermissions = [];

//       for (const field of accessControl.fields.filter((item) => selectedFieldIds.includes(item.id))) {
//         const permissionData = {
//           feature_id: field.id,
//           read: !!field.read,
//           write: !!field.write,
//           modify: !!field.modify,
//           delete: false,
//         };

//         if (field.user_view_id) {
//           // Collect existing permissions for batch update
//           existingPermissions.push(permissionData);
//         } else {
//           // Create new permission with all fields
//           createTasks.push(
//             storeUserViewPermissions({
//               role_id: selectedRole,
//               navigation_id: selectedFeature,
//               ...permissionData,
//             })
//           );
//         }
//       }

//       // Execute all create tasks in parallel
//       if (createTasks.length > 0) {
//         await Promise.all(createTasks);
//         console.log(`Created ${createTasks.length} new permissions`);
//       }

//       // Batch update existing permissions
//       if (existingPermissions.length > 0) {
//         await updateUserViewPermissions({
//           role_id: selectedRole,
//           navigation_id: selectedFeature,
//           permissions: existingPermissions,
//         });
//         console.log(`Updated ${existingPermissions.length} existing permissions`);
//       }

//       alert('Permissions updated successfully');
//     } catch (error) {
//       console.error('Failed to update permissions:', error);
//       alert('Failed to update permissions');
//     } finally {
//       setLoadingSave(false);
//     }
//   }

//   return (
//     <Box sx={{ minHeight: '100vh', bgcolor: '#ffffff', px: { xs: 2, sm: 3, md: 3 }, py: { xs: 3, sm: 3 } }}>
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
//             Access Control
//           </Typography>
//         </Stack>
//       </Box>

//       <Box
//         sx={{
//           mb: 3,
//           display: 'grid',
//           gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
//           gap: '0px 20px',
//         }}
//       >

//         <SelectDropdownSingle
//           name="roleId"
//           label="Role *"
//           fetchOptions={fetchRoleOptions}
//           value={selectedRole}
//           onChange={handleRoleChange}
//         />

//         <SelectDropdownSingle
//           name="featureKey"
//           label="Page Name *"
//           fetchOptions={fetchPageOptions}
//           value={selectedFeature}
//           onChange={handleFeatureChange}
//         />
//       </Box>

//       <Paper
//         elevation={0}
//         sx={{
//           borderRadius: '24px',
//           overflow: 'hidden',
//           border: '1px solid #e2e8f0',
//           bgcolor: '#f8fafc',
//           boxShadow: '0 20px 60px rgba(15, 23, 42, 0.08)',
//         }}
//       >
//         <TableContainer sx={{ minHeight: 360, backgroundColor: '#ffffff' }}>
//           {isLoading ? (
//             <OrbitLoader title="Loading access control" minHeight={260} />
//           ) : (
//             <Table sx={{ borderCollapse: 'separate', borderSpacing: '0 8px' }}>
//               <TableHead>
//                 <TableRow sx={{ bgcolor: '#eff6ff' }}>
//                   <TableCell sx={{ fontWeight: 800, color: '#1d4ed8', minWidth: 240, py: 2 }}>Fields</TableCell>
//                   <TableCell align="center" sx={{ fontWeight: 800, color: '#1d4ed8', minWidth: 100, py: 2 }}>
//                     <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
//                       <Checkbox
//                         checked={selectAll}
//                         onChange={(e) => handleSelectAll(e.target.checked)}
//                         indeterminate={selectedFieldIds.length > 0 && selectedFieldIds.length < accessControl.fields.length}
//                         color="primary"
//                       />
//                       <Typography variant="body2" color="#1d4ed8" fontWeight={700}>
//                         Read
//                       </Typography>
//                     </Stack>
//                   </TableCell>
//                   <TableCell align="center" sx={{ fontWeight: 800, color: '#1d4ed8', minWidth: 100, py: 2 }}>Write</TableCell>
//                   <TableCell align="center" sx={{ fontWeight: 800, color: '#1d4ed8', minWidth: 100, py: 2 }}>Modify</TableCell>
//                 </TableRow>
//               </TableHead>
//               <TableBody>
//                 {accessControl.fields.map((field, index) => {
//                   const isSelected = selectedFieldIds.includes(field.id);
//                   return (
//                     <TableRow
//                       key={field.id}
//                       hover
//                       sx={{
//                         bgcolor: index % 2 === 0 ? '#ffffff' : '#f7fbff',
//                         '& td': { borderBottom: 'none' },
//                       }}
//                     >
//                       <TableCell sx={{ fontWeight: 600, color: '#0f172a', py: 2 }}>{field.fieldName}</TableCell>
//                       <TableCell align="center">
//                         <Checkbox
//                           checked={isSelected}
//                           onChange={(e) => handleFieldSelection(field.id, e.target.checked)}
//                           color="primary"
//                         />
//                       </TableCell>
//                       <TableCell align="center">
//                         <Checkbox
//                           checked={!!field.write}
//                           disabled={!isSelected}
//                           onChange={(e) => handleActionToggle(field.id, 'write', e.target.checked)}
//                           color="primary"
//                         />
//                       </TableCell>
//                       <TableCell align="center">
//                         <Checkbox
//                           checked={!!field.modify}
//                           disabled={!isSelected}
//                           onChange={(e) => handleActionToggle(field.id, 'modify', e.target.checked)}
//                           color="primary"
//                         />
//                       </TableCell>
//                     </TableRow>
//                   );
//                 })}
//               </TableBody>
//             </Table>
//           )}
//         </TableContainer>
//       </Paper>

//       <Box mt={3} display="flex" justifyContent="flex-end">
//         <Button variant="contained" onClick={handleSave} disabled={loadingSave}>
//           {loadingSave ? 'Saving...' : 'Save Permissions'}
//         </Button>
//       </Box>
//     </Box>
//   );
// }




import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
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
  BUSINESS_ENTITIES,
  CRITERIA_OPTIONS,
  FEATURE_OPTIONS,
  ROLE_OPTIONS,
  getMockBusinessEntityAccessControl,
  getMockFieldLevelAccessControl,
} from '../constants/dataAccessControl';
import { fetchRoles, fetchPageNames, fetchPageFeatures, getUserViewPermissions, storeUserViewPermissions,
  updateUserViewPermissions
 } from '../api/settingsApi';


export default function DataAccessControlPage() {
  const isLoading = useInitialTableLoading();
  const [selectedCriteria] = useState(CRITERIA_OPTIONS[0].id);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedFeature, setSelectedFeature] = useState('');
  const [roleOptions, setRoleOptions] = useState([]);
  const [pageOptions, setPageOptions] = useState([]);
  const [loadingSave, setLoadingSave] = useState(false);
  const [accessControl, setAccessControl] = useState(() => (
    getMockBusinessEntityAccessControl(ROLE_OPTIONS[0].id, FEATURE_OPTIONS[0].id)
  ));

  function initializeFields(fields) {
    return fields.map((field) => ({
      ...field,
      read: field.read ?? true, // Default to true
      write: field.write ?? true, // Default to true
      modify: field.modify ?? true, // Default to true
      delete: field.delete ?? false,
      user_view_id: field.user_view_id ?? null,
      rowSelected: field.rowSelected ?? true, // Add rowSelected property
    }));
  }


  const fetchRoleOptions = useCallback(async () => {
    try {
      const rawRoles = await fetchRoles();
      const normalizedRoles = Array.isArray(rawRoles)
        ? rawRoles.map((role) => ({
            ...role,
            id: role?.id ?? '',
            label: role?.label || role?.name || 'Unnamed Role',
          }))
        : [];
      setRoleOptions(normalizedRoles);
      return normalizedRoles;
    } catch {
      setRoleOptions([]);
      return [];
    }
  }, []);

  const fetchPageOptions = useCallback(async () => {
    try {
      const rawPages = await fetchPageNames();
      const normalizedPages = Array.isArray(rawPages)
        ? rawPages.map((page) => ({
            ...page,
            id: page?.id ?? '',
            label: page?.label || 'Unnamed Page',
          }))
        : [];
      setPageOptions(normalizedPages);
      return normalizedPages;
    } catch {
      setPageOptions([]);
      return [];
    }
  }, []);

 

  const loadAccessControl = useCallback((criteriaId, roleId, featureKey) => {
    if (criteriaId === 'field_level') {
      const data = structuredClone(getMockFieldLevelAccessControl(roleId, featureKey));
      setAccessControl({
        ...data,
        fields: initializeFields(data.fields || []),
      });
      return;
    }

    const data = structuredClone(getMockBusinessEntityAccessControl(roleId, featureKey));
    setAccessControl({
      ...data,
      fields: initializeFields(data.fields || []),
    });
  }, []);

  function handleRoleChange(roleId) {
    setSelectedRole(roleId);
    loadAccessControl(selectedCriteria, roleId, selectedFeature);
  }

  function handleFeatureChange(featureKey) {
    setSelectedFeature(featureKey);
    loadAccessControl(selectedCriteria, selectedRole, featureKey);
  }

  // Handle row selection - this will check/uncheck all checkboxes in the row
  function handleRowSelection(fieldId, checked) {
    setAccessControl((prev) => ({
      ...prev,
      fields: prev.fields.map((field) =>
        field.id === fieldId
          ? { 
              ...field, 
              rowSelected: checked,
              read: checked,
              write: checked,
              modify: checked
            }
          : field
      ),
    }));
  }

  function handleActionToggle(fieldId, actionKey, checked) {
    setAccessControl((prev) => ({
      ...prev,
      fields: prev.fields.map((field) => {
        if (field.id === fieldId) {
          const updatedField = { ...field, [actionKey]: checked };
          
          // Update rowSelected based on whether all actions are checked
          const allChecked = updatedField.read && updatedField.write && updatedField.modify;
          updatedField.rowSelected = allChecked;
          
          return updatedField;
        }
        return field;
      }),
    }));
  }

  useEffect(() => {
    if (!selectedRole && roleOptions.length > 0) {
      const firstRoleId = roleOptions[0].id;
      setSelectedRole(firstRoleId);
      loadAccessControl(selectedCriteria, firstRoleId, selectedFeature);
    }
  }, [roleOptions, selectedRole, selectedCriteria, selectedFeature, loadAccessControl]);

  useEffect(() => {
    if (!selectedFeature && pageOptions.length > 0) {
      const firstPageId = pageOptions[0].id;
      setSelectedFeature(firstPageId);
      loadAccessControl(selectedCriteria, selectedRole, firstPageId);
    }
  }, [pageOptions, selectedFeature, selectedCriteria, selectedRole, loadAccessControl]);

  useEffect(() => {
    const loadPageFeatures = async () => {
      if (selectedFeature) {
        try {
          const features = await fetchPageFeatures(selectedFeature);
          const normalizedFeatures = Array.isArray(features)
            ? initializeFields(features.map((feature) => ({
                id: feature?.id,
                fieldName: feature?.feature_name || 'Unnamed Feature',
              })))
            : [];
          setAccessControl((prev) => ({
            ...prev,
            fields: normalizedFeatures,
          }));
        } catch (error) {
          console.error('Failed to load page features:', error);
          setAccessControl((prev) => ({
            ...prev,
            fields: [],
          }));
        }
      } else {
        setAccessControl((prev) => ({
          ...prev,
          fields: [],
        }));
      }
    };

    loadPageFeatures();
  }, [selectedFeature, loadAccessControl]);

  useEffect(() => {
    const loadExistingPermissions = async () => {
      if (selectedRole && selectedFeature) {
        try {
          console.log('Loading permissions for role:', selectedRole, 'feature:', selectedFeature);
          const existing = await getUserViewPermissions(selectedRole, selectedFeature);
          console.log('Existing permissions:', existing);
          
          let permissionMap = {};

          if (Array.isArray(existing) && existing.length > 0) {
            permissionMap = existing.reduce((acc, item) => {
              const featureId = item?.feature_id;
              if (!featureId) return acc;
              acc[featureId] = item;
              return acc;
            }, {});

            console.log('Permission map:', permissionMap);
          }

          setAccessControl((prev) => ({
            ...prev,
            fields: prev.fields.map((field) => {
              const permission = permissionMap[field.id];
              const read = permission?.read ?? true;
              const write = permission?.write ?? true;
              const modify = permission?.modify ?? true;
              
              return {
                ...field,
                user_view_id: permission?.id ?? field.user_view_id,
                read: read,
                write: write,
                modify: modify,
                rowSelected: read && write && modify,
              };
            }),
          }));
        } catch (error) {
          console.error('Failed to load existing permissions:', error);
        }
      }
    };

    loadExistingPermissions();
  }, [selectedRole, selectedFeature, loadAccessControl]);

  async function handleSave() {
    setLoadingSave(true);

    try {
      const createTasks = [];
      const existingPermissions = [];

      for (const field of accessControl.fields) {
        const permissionData = {
          feature_id: field.id,
          read: !!field.read,
          write: !!field.write,
          modify: !!field.modify,
          delete: false,
        };

        if (field.user_view_id) {
          existingPermissions.push(permissionData);
        } else {
          createTasks.push(
            storeUserViewPermissions({
              role_id: selectedRole,
              navigation_id: selectedFeature,
              ...permissionData,
            })
          );
        }
      }

      if (createTasks.length > 0) {
        await Promise.all(createTasks);
        console.log(`Created ${createTasks.length} new permissions`);
      }

      if (existingPermissions.length > 0) {
        await updateUserViewPermissions({
          role_id: selectedRole,
          navigation_id: selectedFeature,
          permissions: existingPermissions,
        });
        console.log(`Updated ${existingPermissions.length} existing permissions`);
      }

      alert('Permissions updated successfully');
    } catch (error) {
      console.error('Failed to update permissions:', error);
      alert('Failed to update permissions');
    } finally {
      setLoadingSave(false);
    }
  }

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
            Access Control
          </Typography>
        </Stack>
      </Box>

      <Box
        sx={{
          mb: 3,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: '0px 20px',
        }}
      >

        <SelectDropdownSingle
          name="roleId"
          label="Role *"
          fetchOptions={fetchRoleOptions}
          value={selectedRole}
          onChange={handleRoleChange}
        />

        <SelectDropdownSingle
          name="featureKey"
          label="Page Name *"
          fetchOptions={fetchPageOptions}
          value={selectedFeature}
          onChange={handleFeatureChange}
        />
      </Box>

      <Paper
        elevation={0}
        sx={{
          borderRadius: '24px',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
          bgcolor: '#f8fafc',
          boxShadow: '0 20px 60px rgba(15, 23, 42, 0.08)',
        }}
      >
        <TableContainer sx={{ minHeight: 360, backgroundColor: '#ffffff' }}>
          {isLoading ? (
            <OrbitLoader title="Loading access control" minHeight={260} />
          ) : (
            <Table sx={{ borderCollapse: 'separate', borderSpacing: '0 8px' }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#eff6ff' }}>
                  <TableCell sx={{ fontWeight: 800, color: '#1d4ed8', minWidth: 240, py: 2 }}>Fields</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, color: '#1d4ed8', minWidth: 100, py: 2 }}>
                    <Typography variant="body2" color="#1d4ed8" fontWeight={700}>
                      Read
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, color: '#1d4ed8', minWidth: 100, py: 2 }}>
                    <Typography variant="body2" color="#1d4ed8" fontWeight={700}>
                      Write
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, color: '#1d4ed8', minWidth: 100, py: 2 }}>
                    <Typography variant="body2" color="#1d4ed8" fontWeight={700}>
                      Modify
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {accessControl.fields.map((field, index) => {
                  return (
                    <TableRow
                      key={field.id}
                      hover
                      sx={{
                        bgcolor: index % 2 === 0 ? '#ffffff' : '#f7fbff',
                        '& td': { borderBottom: 'none' },
                      }}
                    >
                      <TableCell sx={{ fontWeight: 600, color: '#0f172a', py: 2 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Checkbox
                            checked={field.rowSelected || false}
                            onChange={(e) => handleRowSelection(field.id, e.target.checked)}
                            color="primary"
                          />
                          <Typography>{field.fieldName}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="center">
                        <Checkbox
                          checked={!!field.read}
                          onChange={(e) => handleActionToggle(field.id, 'read', e.target.checked)}
                          color="primary"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Checkbox
                          checked={!!field.write}
                          onChange={(e) => handleActionToggle(field.id, 'write', e.target.checked)}
                          color="primary"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Checkbox
                          checked={!!field.modify}
                          onChange={(e) => handleActionToggle(field.id, 'modify', e.target.checked)}
                          color="primary"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      </Paper>

      <Box mt={3} display="flex" justifyContent="flex-end">
        <Button variant="contained" onClick={handleSave} disabled={loadingSave}>
          {loadingSave ? 'Saving...' : 'Save Permissions'}
        </Button>
      </Box>
    </Box>
  );
}






// import React, { useEffect, useState, useContext } from 'react';
// import { Link } from 'react-router-dom';
// import ReactAudioPlayer from 'react-audio-player';
// import { Volume2, VolumeX, AlertTriangle, AlertCircle } from 'lucide-react';
// import { useSelector } from 'react-redux';

// import { fetchDataCenterCount } from '../api/settings/dataCenterApi';
// import sound from '../assets/sounds/alarm.mp3';
// import {
//   fetchSensorThreshold,
//   fetchSensorType,
//   fetchStateConfig,
//   fetchDeviceStatus,
// } from '../api/dashboardTabApi';
// import { errorMessage } from '../api/api-config/apiResponseMessage';
// import { userContext } from '../context/UserContext';
// import {
//   fetchSensorRealTimeValueByDataCenter,
//   fetchDiagramSVG,
// } from '../api/settings/dataCenterApi';

// const Home = () => {
//   let arr = [];
//   const { user } = useContext(userContext);
//   const userAllowedDataCenterIds = user?.data_center_ids || [];

//   const dataCenterId = useSelector((state) => state.updatedDataCenter.dataCenter);
//   const incommingMQTTData = useSelector((state) => state.mqtt.data);

//   const [alarmSensors, setAlarmSensors] = useState([]);
//   const [alarmSmokeWaterSensors, setAlarmSmokeWaterSensors] = useState([]);

//   const [shouldPlayAlarm, setShouldPlayAlarm] = useState(false);
//   const [isMuteAlarm, setIsMuteAlarm] = useState(false);
//   const [showOnlyAlarms, setShowOnlyAlarms] = useState(false);
//   const [totalRequiredAlarmCount, setTotalRequiredAlarmCount] = useState(0);
//   const [totalAlarmedSensorIds, setTotalAlarmedSensorIds] = useState(0);

//   const [sensorType, setSensorType] = useState([]);
//   const [threshold, setThreshold] = useState([]);
//   const [stateConfig, setStateConfig] = useState([]);
//   const [diagramContent, setDiagramContent] = useState([]);
//   const [sensorRealTimeValues, setSensorRealTimeValues] = useState([]);

//   const [liveSensorData, setLiveSensorData] = useState(null);
//   const [liveSmokeWaterData, setLiveSmokeWaterData] = useState(null);

//   const [isLoadingDBData, setIsLoadingDBData] = useState(true);
//   const prevAlarmCountRef = React.useRef(0); // Track previous alarm count for auto-unmute

//   const [allowedSensorIds] = useState(new Set([1, 2]));
//   const [allowedSmokeAndWaterSensorIds] = useState(new Set([3, 4, 5, 6]));

//   const [deviceStatus, setDeviceStatus] = useState([]);
//   const [isLoadingStatusData, setIsLoadingStatusData] = useState(false);

//   // ============================================================
//   // Effective DataCenter IDs
//   // ============================================================
//   const effectiveDataCenterIds = React.useMemo(() => {
//     if (!user) return [];
//     if (dataCenterId == null) return userAllowedDataCenterIds;
//     return [dataCenterId];
//   }, [user, dataCenterId, userAllowedDataCenterIds]);

//   // ============================================================
//   // STEP 1: FETCH CONFIG DATA
//   // ============================================================
//   useEffect(() => {
//     if (!effectiveDataCenterIds.length) return;

//     Promise.all([
//       fetchSensorThreshold(effectiveDataCenterIds),
//       fetchSensorType(effectiveDataCenterIds),
//       fetchStateConfig(effectiveDataCenterIds),
//       fetchDiagramSVG(effectiveDataCenterIds),
//     ])
//       .then(([thresholdRes, sensorTypeRes, stateRes, diagramSvg]) => {
//         setThreshold(thresholdRes);
//         arr = thresholdRes;
//         setSensorType(sensorTypeRes);
//         setStateConfig(stateRes);
//         setDiagramContent(diagramSvg.data);
//       })
//       .catch(errorMessage);
//   }, [effectiveDataCenterIds]);

//   // ============================================================
//   // STEP 2: FETCH DATABASE DATA
//   // ============================================================
//   useEffect(() => {
//     if (!effectiveDataCenterIds.length) return;

//     setIsLoadingDBData(true);

//     fetchSensorRealTimeValueByDataCenter(effectiveDataCenterIds)
//       .then((response) => {
//         const values = response.data || response;
//         setSensorRealTimeValues(values);
//       })
//       .catch((error) => {
//         console.error('❌ Failed to fetch DB data:', error);
//         setIsLoadingDBData(false);
//       });
//   }, [effectiveDataCenterIds]);

//   // ============================================================
//   // STEP 3: Process DB data and create initial liveSensorData
//   // ============================================================
//   useEffect(() => {
//     if (sensorRealTimeValues.length > 0 && threshold.length > 0) {
//       const grouped = sensorRealTimeValues.reduce((acc, sensor) => {
//         if (!acc[sensor.sensor_type]) {
//           acc[sensor.sensor_type] = {
//             id: sensor.sensor_type,
//             sensor_type_name: sensor.sensor_type_name,
//             sensors: [],
//           };
//         }
//         acc[sensor.sensor_type].sensors.push({
//           id: sensor.sensor_id,
//           val: parseFloat(sensor.value),
//           sensor_name: sensor.sensor_name,
//           location: sensor.location,
//           status: sensor.name,
//         });
//         return acc;
//       }, {});

//       const sensorTypes = Object.values(grouped);
//       const enriched = {
//         sensor_types: sensorTypes.map((sensorType) => ({
//           ...sensorType,
//           sensors: sensorType.sensors.map((sensor) => {
//             const matchedThresholds = threshold
//               .filter((th) => th.sensor_id === sensor.id && th.sensor_type === sensorType.id)
//               .map((th) => ({
//                 threshold: th.threshold,
//                 threshold_name: th.threshold_name,
//                 color: th.color,
//               }));
//             return { ...sensor, thresholds: matchedThresholds };
//           }),
//         })),
//       };

//       setLiveSensorData(enriched);

//       if (stateConfig.length > 0) {
//         const smokeWaterTypes = sensorTypes.filter((st) =>
//           allowedSmokeAndWaterSensorIds.has(st.id)
//         );
//         const enrichedSmokeWater = {
//           sensor_types: smokeWaterTypes.map((sensorType) => {
//             const sensor_type_name =
//               stateConfig.find((state) => state.type_id === sensorType.id)?.type_name ||
//               sensorType.sensor_type_name;
//             return {
//               ...sensorType,
//               sensor_type_name,
//               sensors: sensorType.sensors.map((sensor) => {
//                 const matchedState = stateConfig.find(
//                   (state) =>
//                     state.type_id === sensorType.id &&
//                     state.sensor_id === sensor.id &&
//                     state.state_value === sensor.val
//                 );
                
//                 return {
//                   ...sensor,
//                   state_name: matchedState?.state_name || null,
//                   color: matchedState?.color || null,
//                   isSound: matchedState?.sound || null,
//                 };
//               }),
//             };
//           }),
//         };
//         setLiveSmokeWaterData(enrichedSmokeWater);
//       }

//       setIsLoadingDBData(false);
//     }
//   }, [sensorRealTimeValues, threshold, stateConfig]);

//   // ============================================================
//   // STEP 4: UPDATE WITH MQTT DATA - Normal Sensors (Types 1, 2)
//   // ✅ Works for both single DC and all DCs
//   // ✅ Immediately updates only the sensors that changed
//   // ============================================================
//   useEffect(() => {
//     if (!incommingMQTTData?.length || !threshold.length) return;

//     // Filter MQTT data to only the DCs the user can see
//     const relevantMQTTItems = incommingMQTTData.filter((item) =>
//       effectiveDataCenterIds.includes(item.dc_id)
//     );

//     if (!relevantMQTTItems.length) return;

//     // Process each DC's latest MQTT message
//     relevantMQTTItems.forEach((latest) => {
//       if (!latest.sensor_types?.length) return;

//       // Skip if all sensor types have empty sensors
//       if (latest.sensor_types.every((st) => !st.sensors?.length)) return;

//       // Filter to only allowed sensor type IDs (1, 2)
//       const matchedSensorTypes = latest.sensor_types.filter((item) =>
//         allowedSensorIds.has(item.id)
//       );

//       if (!matchedSensorTypes.length) return;

//       const enrichedTypes = matchedSensorTypes.map((sensorType) => {
//         const typeThreshold = threshold.find(
//           (th) => th.sensor_type === sensorType.id && th.dc_id === latest.dc_id
//         );

//         return {
//           ...sensorType,
//           sensor_type_name: typeThreshold?.sensor_type_name || sensorType.sensor_type_name,
//           sensors: sensorType.sensors.map((sensor) => {
//             const matchedThresholds = threshold
//               .filter(
//                 (th) =>
//                   th.sensor_id === sensor.id &&
//                   th.dc_id === latest.dc_id &&
//                   th.sensor_type === sensorType.id
//               )
//               .map((th) => ({
//                 threshold: th.threshold,
//                 threshold_name: th.threshold_name,
//                 color: th.color,
//               }));

//             // ✅ Derive status from threshold_name by comparing sensor val
//             // Thresholds are sorted ascending; find which band the value falls into
//             const sortedThresholds = [...matchedThresholds].sort(
//               (a, b) => a.threshold - b.threshold
//             );
//             let derivedStatus =
//               sortedThresholds.length > 0
//                 ? sortedThresholds[sortedThresholds.length - 1].threshold_name // default: highest band
//                 : undefined;
//             for (let i = 0; i < sortedThresholds.length; i++) {
//               if (sensor.val <= sortedThresholds[i].threshold) {
//                 derivedStatus = sortedThresholds[i].threshold_name;
//                 break;
//               }
//             }

//             return {
//               ...sensor,
//               thresholds: matchedThresholds ?? [],
//               status: derivedStatus, // ✅ Mapped from threshold, not raw MQTT field
//             };
//           }),
//         };
//       });

//       setLiveSensorData((prev) => {
//         const existing = prev || { sensor_types: [] };
//         const mergedSensorTypes = [...existing.sensor_types];

//         const updatedSensorsLog = [];

//         enrichedTypes.forEach((newType) => {
//           const typeIndex = mergedSensorTypes.findIndex((t) => t.id === newType.id);

//           if (typeIndex >= 0) {
//             const existingType = mergedSensorTypes[typeIndex];
//             const mergedSensors = [...existingType.sensors];

//             newType.sensors.forEach((newSensor) => {
//               const sensorIndex = mergedSensors.findIndex((s) => s.id === newSensor.id);
//               const oldSensor = sensorIndex >= 0 ? mergedSensors[sensorIndex] : null;

//               // ✅ Preserve sensor_name and location from DB, update val and status from MQTT
//               const updatedSensor = {
//                 ...newSensor,
//                 sensor_name: oldSensor?.sensor_name || newSensor.sensor_name,
//                 location: oldSensor?.location || newSensor.location,
//               };

//               if (sensorIndex >= 0) {
//                 // Log only changed sensors
//                 if (oldSensor?.val !== newSensor.val || oldSensor?.status !== newSensor.status) {
//                   updatedSensorsLog.push({
//                     dc_id: latest.dc_id,
//                     type: newType.sensor_type_name,
//                     sensor_id: newSensor.id,
//                     sensor_name: updatedSensor.sensor_name,
//                     oldVal: oldSensor?.val,
//                     newVal: newSensor.val,
//                     oldStatus: oldSensor?.status,
//                     newStatus: newSensor.status,
//                   });
//                 }
//                 mergedSensors[sensorIndex] = updatedSensor;
//               } else {
//                 mergedSensors.push(updatedSensor);
//               }
//             });

//             mergedSensorTypes[typeIndex] = { ...existingType, sensors: mergedSensors };
//           } else {
//             if (newType.sensors?.length > 0) {
//               mergedSensorTypes.push(newType);
//             }
//           }
//         });

//         mergedSensorTypes.sort((a, b) => a.id - b.id);

//         // ✅ Clean, focused log — only when something actually changed
//         if (updatedSensorsLog.length > 0) {
//           console.log(
//             `⚡ [MQTT] ${updatedSensorsLog.length} sensor(s) updated (DC: ${latest.dc_id})`
//           );
//           updatedSensorsLog.forEach((s) => {
//             console.log(
//               `   └─ [${s.type}] Sensor #${s.sensor_id} (${s.sensor_name}): val ${s.oldVal} → ${s.newVal} | status "${s.oldStatus}" → "${s.newStatus}"`
//             );
//           });
//         }

//         return { ...latest, sensor_types: mergedSensorTypes };
//       });
//     });
//   }, [incommingMQTTData, threshold, effectiveDataCenterIds]);

//   // ============================================================
//   // STEP 5: UPDATE WITH MQTT DATA - Smoke/Water Sensors (Types 3,4,5,6)
//   // ✅ Same pattern: works for all DCs, logs only changes
//   // ============================================================
//   useEffect(() => {
//     if (!incommingMQTTData?.length || !stateConfig.length) return;

//     const relevantMQTTItems = incommingMQTTData.filter((item) =>
//       effectiveDataCenterIds.includes(item.dc_id)
//     );

//     if (!relevantMQTTItems.length) return;

//     relevantMQTTItems.forEach((latest) => {
//       if (!latest.sensor_types?.length) return;

//       const hasValidData = latest.sensor_types.some((st) => st.sensors?.length > 0);
//       if (!hasValidData) return;

//       const filteredSensorTypes = latest.sensor_types.filter((st) =>
//         allowedSmokeAndWaterSensorIds.has(st.id)
//       );

//       if (!filteredSensorTypes.length) return;

//       const enrichedTypes = filteredSensorTypes.map((sensorType) => {
//         const sensor_type_name =
//           stateConfig.find((state) => state.type_id === sensorType.id)?.type_name ||
//           sensorType.sensor_type_name;

//         const enrichedSensors = sensorType.sensors
//           .map((sensor) => {
//             // ✅ Derive status from stateConfig by matching sensor val
//             const matchedState = stateConfig.find(
//               (state) =>
//                 state.sensor_id === sensor.id &&
//                 state.type_id === sensorType.id &&
//                 state.state_value === sensor.val
//             );
// console.log('🔍 Matching sensor---:', matchedState);
//             return {
//               ...sensor,
//               state_name: matchedState?.state_name || null,
//               color: matchedState?.color || null,
//               status: matchedState?.state_name || null, // ✅ Mapped from stateConfig, not raw MQTT field
//             };
//           })
//           .filter((sensor) => sensor.status !== null); // Only keep sensors with a known state

//         return { ...sensorType, sensor_type_name, sensors: enrichedSensors };
//       });

//       const hasValidSensors = enrichedTypes.some((st) => st.sensors?.length);
//       if (!hasValidSensors) return;

//       setLiveSmokeWaterData((prev) => {
//         const existing = prev || { sensor_types: [] };
//         const mergedSensorTypes = [...existing.sensor_types];

//         const updatedSensorsLog = [];

//         enrichedTypes.forEach((newType) => {
//           const typeIndex = mergedSensorTypes.findIndex((t) => t.id === newType.id);

//           if (typeIndex >= 0) {
//             const existingType = mergedSensorTypes[typeIndex];
//             const mergedSensors = [...existingType.sensors];

//             newType.sensors.forEach((newSensor) => {
//               const sensorIndex = mergedSensors.findIndex((s) => s.id === newSensor.id);
//               const oldSensor = sensorIndex >= 0 ? mergedSensors[sensorIndex] : null;

//               const updatedSensor = {
//                 ...newSensor,
//                 sensor_name: oldSensor?.sensor_name || newSensor.sensor_name,
//                 location: oldSensor?.location || newSensor.location,
//               };

//               if (sensorIndex >= 0) {
//                 if (oldSensor?.val !== newSensor.val || oldSensor?.status !== newSensor.status) {
//                   updatedSensorsLog.push({
//                     dc_id: latest.dc_id,
//                     type: newType.sensor_type_name,
//                     sensor_id: newSensor.id,
//                     sensor_name: updatedSensor.sensor_name,
//                     oldVal: oldSensor?.val,
//                     newVal: newSensor.val,
//                     oldStatus: oldSensor?.status,
//                     newStatus: newSensor.status,
//                   });
//                 }
//                 mergedSensors[sensorIndex] = updatedSensor;
//               } else {
//                 mergedSensors.push(updatedSensor);
//               }
//             });

//             mergedSensorTypes[typeIndex] = { ...existingType, sensors: mergedSensors };
//           } else {
//             if (newType.sensors?.length > 0) {
//               mergedSensorTypes.push(newType);
//             }
//           }
//         });

//         mergedSensorTypes.sort((a, b) => a.id - b.id);

//         // ✅ Clean, focused log — only when something actually changed
//         if (updatedSensorsLog.length > 0) {
//           console.log(
//             `⚡ [MQTT Smoke/Water] ${updatedSensorsLog.length} sensor(s) updated (DC: ${latest.dc_id})`
//           );
//           updatedSensorsLog.forEach((s) => {
//             console.log(
//               `   └─ [${s.type}] Sensor #${s.sensor_id} (${s.sensor_name}): val ${s.oldVal} → ${s.newVal} | status "${s.oldStatus}" → "${s.newStatus}"`
//             );
//           });
//         }

//         return { ...latest, sensor_types: mergedSensorTypes };
//       });
//     });
//   }, [incommingMQTTData, stateConfig, effectiveDataCenterIds]);

//   useEffect(() => {
//     fetchDataCenterCount()
//       .then((res) => {})
//       .catch(errorMessage);
//   }, []);

//   // ============================================================
//   // PROCESS THRESHOLD ALARMS (Types 1, 2)
//   // ============================================================
//   useEffect(() => {
//     setAlarmSensors([]);

//     if (liveSensorData?.sensor_types?.length > 0) {
//       const filteredSensorTypes = liveSensorData.sensor_types.filter((item) =>
//         allowedSensorIds.has(item.id)
//       );

//       filteredSensorTypes.forEach((sensorType) => {
//         sensorType.sensors?.forEach((sensor) => {
//           const status = sensor.status;
//           const isAlarm = status && status.toLowerCase() === 'high';

//           if (isAlarm) {
//             setAlarmSensors((prev) => {
//               const exists = prev.some(
//                 (a) => a.sensor_id === sensor.id && a.sensor_type === sensorType.id
//               );
//               if (exists) return prev;
//               return [
//                 ...prev,
//                 {
//                   sensor_id: sensor.id,
//                   sensor_type: sensorType.id,
//                   sensor_type_name: sensorType.sensor_type_name,
//                   val: sensor.val,
//                   status: status,
//                 },
//               ];
//             });
//           }
//         });
//       });
//     }
//   }, [liveSensorData]);

//   // ============================================================
//   // PROCESS STATE ALARMS (Types 3, 4, 5, 6)
//   // ============================================================
//   useEffect(() => {
//     if (!liveSmokeWaterData?.sensor_types?.length) {
//       setAlarmSmokeWaterSensors([]);
//       return;
//     }

//     const alarms = [];

//     liveSmokeWaterData.sensor_types.forEach((sensorType) => {
//       sensorType.sensors?.forEach((sensor) => {
//         const status = sensor.status;
//         let isAlarm = false;

//         if (sensorType.id === 6) {
//           isAlarm = status && status.toLowerCase() !== 'close';
//         } else {
//           isAlarm = status && status.toLowerCase() !== 'normal';
//         }

//         if (isAlarm) {
//           alarms.push({
//             sensor_id: sensor.id,
//             sensor_type: sensorType.id,
//             sensor_type_name: sensorType.sensor_type_name,
//             val: sensor.val,
//             status: status,
//             color: '#dc2626',
//             location: sensor.location,
//           });
//         }
//       });
//     });
// console.log('🚨 Smoke/Water Alarms Detected:', alarms);
//     setAlarmSmokeWaterSensors(alarms);
//   }, [liveSmokeWaterData]);

//   // ============================================================
//   // MAP ALARMS TO SENSOR TYPES FOR DISPLAY
//   // ============================================================
//   const updatedAlarmData = sensorType?.map((type) => {
//     const thresholdAlarms =
//       alarmSensors?.filter(
//         (sensor) => sensor.sensor_type_name?.toLowerCase() === type.sensor_type_name?.toLowerCase()
//       ) || [];

//     const stateAlarms =
//       alarmSmokeWaterSensors?.filter(
//         (sensor) => sensor.sensor_type_name?.toLowerCase() === type.sensor_type_name?.toLowerCase()
//       ) || [];

//     const allAlarms = [...thresholdAlarms, ...stateAlarms];

//     return {
//       ...type,
//       sensorId: allAlarms.map((sensor) => sensor.sensor_id),
//       alarm: allAlarms.length,
//     };
//   });

//   const alarmFiltered = showOnlyAlarms
//     ? updatedAlarmData?.filter((item) => item.alarm > 0)
//     : updatedAlarmData;

//   useEffect(() => {
//     if (!Array.isArray(updatedAlarmData)) return;

//     const alarmedSensorIds = updatedAlarmData
//       .filter((item) => item.alarm > 0)
//       .flatMap((item) => item.sensorId);

//     const totalCount = alarmedSensorIds.length;
//     const uniqueAlarmedSensorIds = Array.from(new Set(alarmedSensorIds));

//     setShouldPlayAlarm((prev) => {
//       const newValue = totalCount > 0;
//       return prev === newValue ? prev : newValue;
//     });

//     // ✅ Auto-unmute when a NEW alarm arrives while sound is muted
//     // Detects by comparing current count to previous count via ref
//     if (totalCount > prevAlarmCountRef.current) {
//       console.log(
//         `🔔 New alarm detected (${prevAlarmCountRef.current} → ${totalCount}) — auto-unmuting`
//       );
//       setIsMuteAlarm(false);
//     }

//     // Always keep ref in sync with latest alarm count
//     prevAlarmCountRef.current = totalCount;

//     setTotalRequiredAlarmCount((prev) => (prev === totalCount ? prev : totalCount));

//     setTotalAlarmedSensorIds((prev) => {
//       if (typeof prev !== 'object' || prev === null) return uniqueAlarmedSensorIds;
//       if (
//         prev.length !== uniqueAlarmedSensorIds.length ||
//         prev.some((val, idx) => val !== uniqueAlarmedSensorIds[idx])
//       ) {
//         return uniqueAlarmedSensorIds;
//       }
//       return prev;
//     });
//   }, [updatedAlarmData]);

//   const handleCardClick = (item) => {
//     if (item?.sensorId?.length > 0) {
//       window.location.href = `/admin/alarm-details/${item.sensorId.join(',')}`;
//     }
//   };

//   const handleCriticalAlertClick = () => {
//     if (totalAlarmedSensorIds?.length > 0) {
//       window.location.href = `/admin/alarm-details/${totalAlarmedSensorIds.join(',')}`;
//     }
//   };

//   const dataSource = liveSensorData ? 'hybrid' : 'db';

//   useEffect(() => {
//     if (!effectiveDataCenterIds.length) return;

//     let intervalId;

//     const fetchStatus = () => {
//       setIsLoadingStatusData(true);

//       fetchDeviceStatus(effectiveDataCenterIds)
//         .then((response) => {
//           setDeviceStatus(response.data);
//           setIsLoadingStatusData(false);
//         })
//         .catch((error) => {
//           console.error('❌ Failed to fetch DB data:', error);
//           setIsLoadingStatusData(false);
//         });
//     };

//     // 🔥 Initial call
//     fetchStatus();

//     // 🔥 Auto refresh every 5 seconds
//     intervalId = setInterval(fetchStatus, 5000);

//     // ✅ Cleanup when component unmounts
//     return () => clearInterval(intervalId);
//   }, [effectiveDataCenterIds]);

//   const [deviceOfflineIds, setDeviceOfflineIds] = useState([]);
//   const [deviceOfflineCount, setDeviceOfflineCount] = useState(0);

//   useEffect(() => {
//     if (!deviceStatus?.length) return;

//     const now = new Date().getTime();

//     const offlineDevices = deviceStatus.filter((device) => {
//       const updatedTime = new Date(device.updated_at).getTime();
//       const diffSeconds = (now - updatedTime) / 1000;
//       return diffSeconds > 15;
//     });

//     setDeviceOfflineIds(offlineDevices.map((d) => d.device_id));
//     setDeviceOfflineCount(offlineDevices.length);


//   }, [deviceStatus]);



//   return (
//     <div style={styles.container}>
//       <div style={styles.wrapper}>
//         <div style={styles.header}>
//           <h1 style={styles.title}>Alarm Dashboard</h1>
//           <p style={styles.subtitle}>
//             Real-time monitoring and alerts
//             {isLoadingDBData && (
//               <span style={{ color: '#f59e0b', marginLeft: '10px' }}>⏳ Loading...</span>
//             )}
//             {!isLoadingDBData && dataSource === 'db' && (
//               <span style={{ color: '#6b7280', marginLeft: '10px' }}>📊 Database</span>
//             )}
//             {dataSource === 'hybrid' && (
//               <span style={{ color: '#10b981', marginLeft: '10px' }}>🟢 Live</span>
//             )}
//           </p>
//         </div>

//         <div style={styles.topBar}>
//           <div style={styles.alertSection}>
//             {totalRequiredAlarmCount > 0 && (
//               <button onClick={handleCriticalAlertClick} style={styles.criticalAlert}>
//                 <AlertTriangle style={styles.alertIcon} />
//                 <div style={styles.alertContent}>
//                   <span style={styles.alertCount}>{totalRequiredAlarmCount}</span>
//                   <span style={styles.alertText}>Active Alarms - Immediate Attention Required</span>
//                 </div>
//               </button>
//             )}
//           </div>

//           <div style={styles.controlsSection}>
//             <button
//               style={{ ...styles.button, ...styles.buttonSecondary }}
//               onClick={() => setShowOnlyAlarms((prev) => !prev)}
//             >
//               {showOnlyAlarms ? 'Show All' : 'Show Only Alarms'}
//             </button>

//             <button
//               onClick={() => setIsMuteAlarm(!isMuteAlarm)}
//               style={{
//                 ...styles.button,
//                 ...(isMuteAlarm ? styles.buttonMuted : styles.buttonDanger),
//               }}
//             >
//               {isMuteAlarm ? (
//                 <>
//                   <VolumeX style={styles.buttonIcon} />
//                   Muted
//                 </>
//               ) : (
//                 <>
//                   <Volume2 style={styles.buttonIcon} />
//                   Unmute
//                 </>
//               )}
//             </button>
//           </div>
//         </div>

//         {isLoadingDBData && (
//           <div style={{ textAlign: 'center', padding: '40px', fontSize: '16px', color: '#6b7280' }}>
//             ⏳ Loading sensor data from database...
//           </div>
//         )}

//         {!isLoadingDBData && (
//           <div style={styles.grid}>
//             {alarmFiltered?.map((item, index) => (
//               <button
//                 key={index}
//                 onClick={() => handleCardClick(item)}
//                 style={{ ...styles.card, ...(item.alarm > 0 ? styles.cardAlarm : {}) }}
//               >
//                 <div style={styles.cardHeader}>
//                   {item.alarm > 0 && (
//                     <div style={styles.alarmIndicator}>
//                       <AlertCircle style={styles.alarmIcon} />
//                     </div>
//                   )}
//                   <h3 style={styles.cardTitle}>{item.sensor_type_name}</h3>
//                 </div>

//                 <div style={styles.cardBody}>
//                   <div
//                     style={{
//                       ...styles.alarmCount,
//                       ...(item.alarm > 0 ? styles.alarmCountActive : {}),
//                     }}
//                   >
//                     {item.alarm || 0}
//                   </div>
//                   <p style={styles.alarmLabel}>
//                     {item.alarm === 1 ? 'Active Alarm' : 'Active Alarms'}
//                   </p>
//                 </div>

//                 {item.alarm > 0 && (
//                   <div style={styles.cardFooter}>
//                     <span style={styles.viewDetailsText}>View Details →</span>
//                   </div>
//                 )}
//               </button>
//             ))}
//           </div>
//         )}

//         {/* DEVICE OFFLINE COUNT CARD */}
//         <div className="mt-3">
//           {deviceOfflineCount > 0 && (
//             <button
//               onClick={() =>
//                 (window.location.href = `/admin/device-details/${deviceOfflineIds.join(',')}`)
//               }
//               style={{ ...styles.card, ...styles.cardAlarm }}
//             >
//               <div style={styles.cardHeader}>
//                 <div style={styles.alarmIndicator}>
//                   <AlertTriangle style={styles.alarmIcon} />
//                 </div>
//                 <h3 style={styles.cardTitle}>Device Offline</h3>
//               </div>

//               <div style={styles.cardBody}>
//                 <div style={{ ...styles.alarmCount, ...styles.alarmCountActive }}>
//                   {deviceOfflineCount}
//                 </div>
//                 <p style={styles.alarmLabel}>
//                   {deviceOfflineCount === 1 ? 'Offline Device' : 'Offline Devices'}
//                 </p>
//               </div>

//               <div style={styles.cardFooter}>
//                 <span style={styles.viewDetailsText}>View Details →</span>
//               </div>
//             </button>
//           )}
//         </div>

//         {shouldPlayAlarm && (
//           <>
//             <ReactAudioPlayer
//               src={sound}
//               autoPlay
//               controls
//               loop
//               muted={isMuteAlarm}
//               style={{ display: 'none' }}
//             />
//             {!isMuteAlarm && (
//               <div style={styles.audioIndicator}>
//                 <Volume2 style={styles.audioIcon} />
//                 <span style={styles.audioText}>Alarm sound playing</span>
//               </div>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// const styles = {
//   container: {
//     minHeight: '100vh',
//     background: 'linear-gradient(to bottom right, #f9fafb, #f3f4f6)',
//     padding: '32px 24px',
//   },
//   wrapper: { maxWidth: '1400px', margin: '0 auto' },
//   header: { marginBottom: '32px' },
//   title: { fontSize: '30px', fontWeight: '600', color: '#111827', marginBottom: '8px' },
//   subtitle: { fontSize: '14px', color: '#6b7280' },
//   topBar: { display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' },
//   alertSection: { flex: 1 },
//   criticalAlert: {
//     display: 'flex',
//     alignItems: 'center',
//     gap: '16px',
//     padding: '5px 24px',
//     backgroundColor: '#fef2f2',
//     borderWidth: '2px',
//     borderStyle: 'solid',
//     borderColor: '#fecaca',
//     borderRadius: '12px',
//     cursor: 'pointer',
//     transition: 'all 0.2s',
//     boxShadow: '0 4px 6px rgba(239, 68, 68, 0.1)',
//     width: '100%',
//     textDecoration: 'none',
//     textAlign: 'left',
//   },
//   alertIcon: { width: '32px', height: '32px', color: '#dc2626', flexShrink: 0 },
//   alertContent: { display: 'flex', alignItems: 'center', gap: '12px' },
//   alertCount: { fontSize: '28px', fontWeight: '700', color: '#dc2626' },
//   alertText: { fontSize: '16px', fontWeight: '600', color: '#991b1b' },
//   controlsSection: { display: 'flex', gap: '12px', justifyContent: 'flex-end', flexWrap: 'wrap' },
//   button: {
//     display: 'flex',
//     alignItems: 'center',
//     gap: '8px',
//     padding: '12px 20px',
//     fontSize: '14px',
//     fontWeight: '600',
//     borderRadius: '8px',
//     border: '1px solid gray',
//     cursor: 'pointer',
//     transition: 'all 0.2s',
//     whiteSpace: 'nowrap',
//   },
//   buttonSecondary: { backgroundColor: '#f3f4f6', color: '#374151' },
//   buttonDanger: { backgroundColor: '#dc2626', color: 'white' },
//   buttonMuted: { backgroundColor: '#6b7280', color: 'white' },
//   buttonIcon: { width: '18px', height: '18px' },
//   grid: {
//     display: 'grid',
//     gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
//     gap: '20px',
//   },
//   grid: {
//     display: 'grid',
//     gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', // 🔥 smaller width
//     gap: '12px', // less gap
//   },

//   card: {
//     display: 'flex',
//     flexDirection: 'column',
//     backgroundColor: 'white',
//     borderWidth: '1px',
//     borderStyle: 'solid',
//     borderColor: '#e5e7eb',
//     borderRadius: '10px',
//     padding: '12px', // 🔥 smaller padding
//     cursor: 'pointer',
//     transition: 'all 0.2s',
//     position: 'relative',
//     overflow: 'hidden',
//     textAlign: 'left',
//   },

//   cardAlarm: {
//     backgroundColor: '#fff1f2',
//     borderColor: '#ef4444',
//     borderWidth: '2px',
//     boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)',
//     animation: 'pulse 1.5s infinite',
//   },

//   cardHeader: {
//     display: 'flex',
//     alignItems: 'center',
//     gap: '8px', // 🔥 smaller gap
//     marginBottom: '8px',
//   },

//   alarmIndicator: {
//     width: '30px', // 🔥 smaller circle
//     height: '30px',
//     backgroundColor: '#fee2e2',
//     borderRadius: '50%',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   alarmIcon: {
//     width: '18px', // 🔥 smaller icon
//     height: '18px',
//     color: '#dc2626',
//   },

//   cardTitle: {
//     fontSize: '14px', // 🔥 smaller title
//     fontWeight: '600',
//     color: '#111827',
//     margin: 0,
//   },

//   cardBody: {
//     textAlign: 'center',
//     padding: '5px 0',
//   },

//   alarmCount: {
//     fontSize: '38px', // 🔥 smaller number
//     fontWeight: '700',
//     color: '#9ca3af',
//     lineHeight: '1',
//     marginBottom: '4px',
//   },

//   alarmLabel: {
//     fontSize: '12px', // 🔥 smaller label
//     color: '#6b7280',
//     margin: 0,
//   },

//   cardFooter: {
//     marginTop: '6px',
//     paddingTop: '6px',
//     borderTop: '1px solid #fecaca',
//   },

//   viewDetailsText: {
//     fontSize: '12px',
//     fontWeight: '600',
//     color: '#dc2626',
//   },

//   audioIndicator: {
//     position: 'fixed',
//     bottom: '24px',
//     right: '24px',
//     display: 'flex',
//     alignItems: 'center',
//     gap: '8px',
//     padding: '12px 16px',
//     backgroundColor: '#dc2626',
//     color: 'white',
//     borderRadius: '8px',
//     boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
//   },
//   audioIcon: { width: '20px', height: '20px' },
//   audioText: { fontSize: '14px', fontWeight: '600' },
// };

// export default Home;



/// final code 

// import React, { useEffect, useState, useContext } from 'react';
// import { Link } from 'react-router-dom';
// import ReactAudioPlayer from 'react-audio-player';
// import { Volume2, VolumeX, AlertTriangle, AlertCircle } from 'lucide-react';
// import { useSelector } from 'react-redux';

// import { fetchDataCenterCount } from '../api/settings/dataCenterApi';
// import sound from '../assets/sounds/alarm.mp3';
// import {
//   fetchSensorThreshold,
//   fetchSensorType,
//   fetchStateConfig,
//   fetchDeviceStatus,
// } from '../api/dashboardTabApi';
// import { errorMessage } from '../api/api-config/apiResponseMessage';
// import { userContext } from '../context/UserContext';
// import {
//   fetchSensorRealTimeValueByDataCenter,
//   fetchDiagramSVG,
// } from '../api/settings/dataCenterApi';

// const Home = () => {
//   let arr = [];
//   const { user } = useContext(userContext);
//   const userAllowedDataCenterIds = user?.data_center_ids || [];

//   const dataCenterId = useSelector((state) => state.updatedDataCenter.dataCenter);
//   const incommingMQTTData = useSelector((state) => state.mqtt.data);

//   const [alarmSensors, setAlarmSensors] = useState([]);
//   const [alarmSmokeWaterSensors, setAlarmSmokeWaterSensors] = useState([]);

//   const [shouldPlayAlarm, setShouldPlayAlarm] = useState(false);
//   const [isMuteAlarm, setIsMuteAlarm] = useState(false);
//   const [showOnlyAlarms, setShowOnlyAlarms] = useState(false);
//   const [totalRequiredAlarmCount, setTotalRequiredAlarmCount] = useState(0);
//   const [totalAlarmedSensorIds, setTotalAlarmedSensorIds] = useState(0);

//   const [sensorType, setSensorType] = useState([]);
//   const [threshold, setThreshold] = useState([]);
//   const [stateConfig, setStateConfig] = useState([]);
//   const [diagramContent, setDiagramContent] = useState([]);
//   const [sensorRealTimeValues, setSensorRealTimeValues] = useState([]);

//   const [liveSensorData, setLiveSensorData] = useState(null);
//   const [liveSmokeWaterData, setLiveSmokeWaterData] = useState(null);

//   const [isLoadingDBData, setIsLoadingDBData] = useState(true);
//   const prevAlarmCountRef = React.useRef(0);

//   const [allowedSensorIds] = useState(new Set([1, 2]));
//   const [allowedSmokeAndWaterSensorIds] = useState(new Set([3, 4, 5, 6]));

//   const [deviceStatus, setDeviceStatus] = useState([]);
//   const [isLoadingStatusData, setIsLoadingStatusData] = useState(false);

//   // ============================================================
//   // Effective DataCenter IDs
//   // ============================================================
//   const effectiveDataCenterIds = React.useMemo(() => {
//     if (!user) return [];
//     if (dataCenterId == null) return userAllowedDataCenterIds;
//     return [dataCenterId];
//   }, [user, dataCenterId, userAllowedDataCenterIds]);

//   // ============================================================
//   // STEP 1: FETCH CONFIG DATA
//   // ============================================================
//   useEffect(() => {
//     if (!effectiveDataCenterIds.length) return;

//     Promise.all([
//       fetchSensorThreshold(effectiveDataCenterIds),
//       fetchSensorType(effectiveDataCenterIds),
//       fetchStateConfig(effectiveDataCenterIds),
//       fetchDiagramSVG(effectiveDataCenterIds),
//     ])
//       .then(([thresholdRes, sensorTypeRes, stateRes, diagramSvg]) => {
//         setThreshold(thresholdRes);
//         arr = thresholdRes;
//         setSensorType(sensorTypeRes);
//         setStateConfig(stateRes);
//         setDiagramContent(diagramSvg.data);
//       })
//       .catch(errorMessage);
//   }, [effectiveDataCenterIds]);

//   // ============================================================
//   // STEP 2: FETCH DATABASE DATA
//   // ============================================================
//   useEffect(() => {
//     if (!effectiveDataCenterIds.length) return;

//     setIsLoadingDBData(true);

//     fetchSensorRealTimeValueByDataCenter(effectiveDataCenterIds)
//       .then((response) => {
//         const values = response.data || response;
//         setSensorRealTimeValues(values);
//       })
//       .catch((error) => {
//         console.error('❌ Failed to fetch DB data:', error);
//         setIsLoadingDBData(false);
//       });
//   }, [effectiveDataCenterIds]);

//   // ============================================================
//   // STEP 3: Process DB data and create initial liveSensorData
//   // ============================================================
//   useEffect(() => {
//     if (sensorRealTimeValues.length > 0 && threshold.length > 0) {
//       const grouped = sensorRealTimeValues.reduce((acc, sensor) => {
//         if (!acc[sensor.sensor_type]) {
//           acc[sensor.sensor_type] = {
//             id: sensor.sensor_type,
//             sensor_type_name: sensor.sensor_type_name,
//             sensors: [],
//           };
//         }
//         acc[sensor.sensor_type].sensors.push({
//           id: sensor.sensor_id,
//           val: parseFloat(sensor.value),
//           sensor_name: sensor.sensor_name,
//           location: sensor.location,
//           status: sensor.name,
//         });
//         return acc;
//       }, {});

//       const sensorTypes = Object.values(grouped);
//       const enriched = {
//         sensor_types: sensorTypes.map((sensorType) => ({
//           ...sensorType,
//           sensors: sensorType.sensors.map((sensor) => {
//             const matchedThresholds = threshold
//               .filter((th) => th.sensor_id === sensor.id && th.sensor_type === sensorType.id)
//               .map((th) => ({
//                 threshold: th.threshold,
//                 threshold_name: th.threshold_name,
//                 color: th.color,
//               }));
//             return { ...sensor, thresholds: matchedThresholds };
//           }),
//         })),
//       };

//       setLiveSensorData(enriched);

//       if (stateConfig.length > 0) {
//         const smokeWaterTypes = sensorTypes.filter((st) =>
//           allowedSmokeAndWaterSensorIds.has(st.id)
//         );
//         const enrichedSmokeWater = {
//           sensor_types: smokeWaterTypes.map((sensorType) => {
//             const sensor_type_name =
//               stateConfig.find((state) => state.type_id === sensorType.id)?.type_name ||
//               sensorType.sensor_type_name;
//             return {
//               ...sensorType,
//               sensor_type_name,
//               sensors: sensorType.sensors.map((sensor) => {
//                 const matchedState = stateConfig.find(
//                   (state) =>
//                     state.type_id === sensorType.id &&
//                     state.sensor_id === sensor.id &&
//                     state.state_value === sensor.val
//                 );

//                 return {
//                   ...sensor,
//                   state_name: matchedState?.state_name || null,
//                   color: matchedState?.color || null,
//                   status: matchedState?.state_name || null,
//                   sound: matchedState?.sound ?? 0, // ✅ FIX: carry sound field from stateConfig
//                 };
//               }),
//             };
//           }),
//         };
//         setLiveSmokeWaterData(enrichedSmokeWater);
//       }

//       setIsLoadingDBData(false);
//     }
//   }, [sensorRealTimeValues, threshold, stateConfig]);

//   // ============================================================
//   // STEP 4: UPDATE WITH MQTT DATA - Normal Sensors (Types 1, 2)
//   // ============================================================
//   useEffect(() => {
//     if (!incommingMQTTData?.length || !threshold.length) return;

//     const relevantMQTTItems = incommingMQTTData.filter((item) =>
//       effectiveDataCenterIds.includes(item.dc_id)
//     );

//     if (!relevantMQTTItems.length) return;

//     relevantMQTTItems.forEach((latest) => {
//       if (!latest.sensor_types?.length) return;

//       if (latest.sensor_types.every((st) => !st.sensors?.length)) return;

//       const matchedSensorTypes = latest.sensor_types.filter((item) =>
//         allowedSensorIds.has(item.id)
//       );

//       if (!matchedSensorTypes.length) return;

//       const enrichedTypes = matchedSensorTypes.map((sensorType) => {
//         const typeThreshold = threshold.find(
//           (th) => th.sensor_type === sensorType.id && th.dc_id === latest.dc_id
//         );

//         return {
//           ...sensorType,
//           sensor_type_name: typeThreshold?.sensor_type_name || sensorType.sensor_type_name,
//           sensors: sensorType.sensors.map((sensor) => {
//             const matchedThresholds = threshold
//               .filter(
//                 (th) =>
//                   th.sensor_id === sensor.id &&
//                   th.dc_id === latest.dc_id &&
//                   th.sensor_type === sensorType.id
//               )
//               .map((th) => ({
//                 threshold: th.threshold,
//                 threshold_name: th.threshold_name,
//                 color: th.color,
//               }));

//             const sortedThresholds = [...matchedThresholds].sort(
//               (a, b) => a.threshold - b.threshold
//             );
//             let derivedStatus =
//               sortedThresholds.length > 0
//                 ? sortedThresholds[sortedThresholds.length - 1].threshold_name
//                 : undefined;
//             for (let i = 0; i < sortedThresholds.length; i++) {
//               if (sensor.val <= sortedThresholds[i].threshold) {
//                 derivedStatus = sortedThresholds[i].threshold_name;
//                 break;
//               }
//             }

//             return {
//               ...sensor,
//               thresholds: matchedThresholds ?? [],
//               status: derivedStatus,
//             };
//           }),
//         };
//       });

//       setLiveSensorData((prev) => {
//         const existing = prev || { sensor_types: [] };
//         const mergedSensorTypes = [...existing.sensor_types];

//         const updatedSensorsLog = [];

//         enrichedTypes.forEach((newType) => {
//           const typeIndex = mergedSensorTypes.findIndex((t) => t.id === newType.id);

//           if (typeIndex >= 0) {
//             const existingType = mergedSensorTypes[typeIndex];
//             const mergedSensors = [...existingType.sensors];

//             newType.sensors.forEach((newSensor) => {
//               const sensorIndex = mergedSensors.findIndex((s) => s.id === newSensor.id);
//               const oldSensor = sensorIndex >= 0 ? mergedSensors[sensorIndex] : null;

//               const updatedSensor = {
//                 ...newSensor,
//                 sensor_name: oldSensor?.sensor_name || newSensor.sensor_name,
//                 location: oldSensor?.location || newSensor.location,
//               };

//               if (sensorIndex >= 0) {
//                 if (oldSensor?.val !== newSensor.val || oldSensor?.status !== newSensor.status) {
//                   updatedSensorsLog.push({
//                     dc_id: latest.dc_id,
//                     type: newType.sensor_type_name,
//                     sensor_id: newSensor.id,
//                     sensor_name: updatedSensor.sensor_name,
//                     oldVal: oldSensor?.val,
//                     newVal: newSensor.val,
//                     oldStatus: oldSensor?.status,
//                     newStatus: newSensor.status,
//                   });
//                 }
//                 mergedSensors[sensorIndex] = updatedSensor;
//               } else {
//                 mergedSensors.push(updatedSensor);
//               }
//             });

//             mergedSensorTypes[typeIndex] = { ...existingType, sensors: mergedSensors };
//           } else {
//             if (newType.sensors?.length > 0) {
//               mergedSensorTypes.push(newType);
//             }
//           }
//         });

//         mergedSensorTypes.sort((a, b) => a.id - b.id);

//         if (updatedSensorsLog.length > 0) {
//           console.log(
//             `⚡ [MQTT] ${updatedSensorsLog.length} sensor(s) updated (DC: ${latest.dc_id})`
//           );
//           updatedSensorsLog.forEach((s) => {
//             console.log(
//               `   └─ [${s.type}] Sensor #${s.sensor_id} (${s.sensor_name}): val ${s.oldVal} → ${s.newVal} | status "${s.oldStatus}" → "${s.newStatus}"`
//             );
//           });
//         }

//         return { ...latest, sensor_types: mergedSensorTypes };
//       });
//     });
//   }, [incommingMQTTData, threshold, effectiveDataCenterIds]);

//   // ============================================================
//   // STEP 5: UPDATE WITH MQTT DATA - Smoke/Water Sensors (Types 3,4,5,6)
//   // ============================================================
//   useEffect(() => {
//     if (!incommingMQTTData?.length || !stateConfig.length) return;

//     const relevantMQTTItems = incommingMQTTData.filter((item) =>
//       effectiveDataCenterIds.includes(item.dc_id)
//     );

//     if (!relevantMQTTItems.length) return;

//     relevantMQTTItems.forEach((latest) => {
//       if (!latest.sensor_types?.length) return;

//       const hasValidData = latest.sensor_types.some((st) => st.sensors?.length > 0);
//       if (!hasValidData) return;

//       const filteredSensorTypes = latest.sensor_types.filter((st) =>
//         allowedSmokeAndWaterSensorIds.has(st.id)
//       );

//       if (!filteredSensorTypes.length) return;

//       const enrichedTypes = filteredSensorTypes.map((sensorType) => {
//         const sensor_type_name =
//           stateConfig.find((state) => state.type_id === sensorType.id)?.type_name ||
//           sensorType.sensor_type_name;

//         const enrichedSensors = sensorType.sensors
//           .map((sensor) => {
//             const matchedState = stateConfig.find(
//               (state) =>
//                 state.sensor_id === sensor.id &&
//                 state.type_id === sensorType.id &&
//                 state.state_value === sensor.val
//             );

//             return {
//               ...sensor,
//               state_name: matchedState?.state_name || null,
//               color: matchedState?.color || null,
//               status: matchedState?.state_name || null,
//               sound: matchedState?.sound ?? 0, // ✅ FIX: carry sound field from stateConfig
//             };
//           })
//           .filter((sensor) => sensor.status !== null);

//         return { ...sensorType, sensor_type_name, sensors: enrichedSensors };
//       });

//       const hasValidSensors = enrichedTypes.some((st) => st.sensors?.length);
//       if (!hasValidSensors) return;

//       setLiveSmokeWaterData((prev) => {
//         const existing = prev || { sensor_types: [] };
//         const mergedSensorTypes = [...existing.sensor_types];

//         const updatedSensorsLog = [];

//         enrichedTypes.forEach((newType) => {
//           const typeIndex = mergedSensorTypes.findIndex((t) => t.id === newType.id);

//           if (typeIndex >= 0) {
//             const existingType = mergedSensorTypes[typeIndex];
//             const mergedSensors = [...existingType.sensors];

//             newType.sensors.forEach((newSensor) => {
//               const sensorIndex = mergedSensors.findIndex((s) => s.id === newSensor.id);
//               const oldSensor = sensorIndex >= 0 ? mergedSensors[sensorIndex] : null;

//               const updatedSensor = {
//                 ...newSensor,
//                 sensor_name: oldSensor?.sensor_name || newSensor.sensor_name,
//                 location: oldSensor?.location || newSensor.location,
//                 sound: newSensor.sound ?? oldSensor?.sound ?? 0, // ✅ FIX: preserve sound on merge
//               };

//               if (sensorIndex >= 0) {
//                 if (oldSensor?.val !== newSensor.val || oldSensor?.status !== newSensor.status) {
//                   updatedSensorsLog.push({
//                     dc_id: latest.dc_id,
//                     type: newType.sensor_type_name,
//                     sensor_id: newSensor.id,
//                     sensor_name: updatedSensor.sensor_name,
//                     oldVal: oldSensor?.val,
//                     newVal: newSensor.val,
//                     oldStatus: oldSensor?.status,
//                     newStatus: newSensor.status,
//                   });
//                 }
//                 mergedSensors[sensorIndex] = updatedSensor;
//               } else {
//                 mergedSensors.push(updatedSensor);
//               }
//             });

//             mergedSensorTypes[typeIndex] = { ...existingType, sensors: mergedSensors };
//           } else {
//             if (newType.sensors?.length > 0) {
//               mergedSensorTypes.push(newType);
//             }
//           }
//         });

//         mergedSensorTypes.sort((a, b) => a.id - b.id);

//         if (updatedSensorsLog.length > 0) {
//           console.log(
//             `⚡ [MQTT Smoke/Water] ${updatedSensorsLog.length} sensor(s) updated (DC: ${latest.dc_id})`
//           );
//           updatedSensorsLog.forEach((s) => {
//             console.log(
//               `   └─ [${s.type}] Sensor #${s.sensor_id} (${s.sensor_name}): val ${s.oldVal} → ${s.newVal} | status "${s.oldStatus}" → "${s.newStatus}"`
//             );
//           });
//         }

//         return { ...latest, sensor_types: mergedSensorTypes };
//       });
//     });
//   }, [incommingMQTTData, stateConfig, effectiveDataCenterIds]);

//   useEffect(() => {
//     fetchDataCenterCount()
//       .then((res) => {})
//       .catch(errorMessage);
//   }, []);

//   // ============================================================
//   // PROCESS THRESHOLD ALARMS (Types 1, 2)
//   // ============================================================
//   useEffect(() => {
//     setAlarmSensors([]);

//     if (liveSensorData?.sensor_types?.length > 0) {
//       const filteredSensorTypes = liveSensorData.sensor_types.filter((item) =>
//         allowedSensorIds.has(item.id)
//       );

//       filteredSensorTypes.forEach((sensorType) => {
//         sensorType.sensors?.forEach((sensor) => {
//           const status = sensor.status;
//           const isAlarm = status && status.toLowerCase() === 'high';

//           if (isAlarm) {
//             setAlarmSensors((prev) => {
//               const exists = prev.some(
//                 (a) => a.sensor_id === sensor.id && a.sensor_type === sensorType.id
//               );
//               if (exists) return prev;
//               return [
//                 ...prev,
//                 {
//                   sensor_id: sensor.id,
//                   sensor_type: sensorType.id,
//                   sensor_type_name: sensorType.sensor_type_name,
//                   val: sensor.val,
//                   status: status,
//                 },
//               ];
//             });
//           }
//         });
//       });
//     }
//   }, [liveSensorData]);

//   // ============================================================
//   // PROCESS STATE ALARMS (Types 3, 4, 5, 6)
//   // ============================================================
//   useEffect(() => {
//     if (!liveSmokeWaterData?.sensor_types?.length) {
//       setAlarmSmokeWaterSensors([]);
//       return;
//     }

//     const alarms = [];

//     liveSmokeWaterData.sensor_types.forEach((sensorType) => {
//       sensorType.sensors?.forEach((sensor) => {
//         const status = sensor.status;
//         let isAlarm = false;

//         if (sensorType.id === 6) {
//           isAlarm = status && status.toLowerCase() !== 'close';
//         } else {
//           isAlarm = status && status.toLowerCase() !== 'normal';
//         }

//         // ✅ FIX: If sound = 0, suppress alarm regardless of status
//         if (sensor.sound !== 1) {
//           isAlarm = false;
//         }

//         if (isAlarm) {
//           alarms.push({
//             sensor_id: sensor.id,
//             sensor_type: sensorType.id,
//             sensor_type_name: sensorType.sensor_type_name,
//             val: sensor.val,
//             status: status,
//             color: '#dc2626',
//             location: sensor.location,
//           });
//         }
//       });
//     });

//     console.log('🚨 Smoke/Water Alarms Detected:', alarms);
//     setAlarmSmokeWaterSensors(alarms);
//   }, [liveSmokeWaterData]);

//   // ============================================================
//   // MAP ALARMS TO SENSOR TYPES FOR DISPLAY
//   // ============================================================
//   const updatedAlarmData = sensorType?.map((type) => {
//     const thresholdAlarms =
//       alarmSensors?.filter(
//         (sensor) => sensor.sensor_type_name?.toLowerCase() === type.sensor_type_name?.toLowerCase()
//       ) || [];

//     const stateAlarms =
//       alarmSmokeWaterSensors?.filter(
//         (sensor) => sensor.sensor_type_name?.toLowerCase() === type.sensor_type_name?.toLowerCase()
//       ) || [];

//     const allAlarms = [...thresholdAlarms, ...stateAlarms];

//     return {
//       ...type,
//       sensorId: allAlarms.map((sensor) => sensor.sensor_id),
//       alarm: allAlarms.length,
//     };
//   });

//   const alarmFiltered = showOnlyAlarms
//     ? updatedAlarmData?.filter((item) => item.alarm > 0)
//     : updatedAlarmData;

//   useEffect(() => {
//     if (!Array.isArray(updatedAlarmData)) return;

//     const alarmedSensorIds = updatedAlarmData
//       .filter((item) => item.alarm > 0)
//       .flatMap((item) => item.sensorId);

//     const totalCount = alarmedSensorIds.length;
//     const uniqueAlarmedSensorIds = Array.from(new Set(alarmedSensorIds));

//     setShouldPlayAlarm((prev) => {
//       const newValue = totalCount > 0;
//       return prev === newValue ? prev : newValue;
//     });

//     if (totalCount > prevAlarmCountRef.current) {
//       console.log(
//         `🔔 New alarm detected (${prevAlarmCountRef.current} → ${totalCount}) — auto-unmuting`
//       );
//       setIsMuteAlarm(false);
//     }

//     prevAlarmCountRef.current = totalCount;

//     setTotalRequiredAlarmCount((prev) => (prev === totalCount ? prev : totalCount));

//     setTotalAlarmedSensorIds((prev) => {
//       if (typeof prev !== 'object' || prev === null) return uniqueAlarmedSensorIds;
//       if (
//         prev.length !== uniqueAlarmedSensorIds.length ||
//         prev.some((val, idx) => val !== uniqueAlarmedSensorIds[idx])
//       ) {
//         return uniqueAlarmedSensorIds;
//       }
//       return prev;
//     });
//   }, [updatedAlarmData]);

//   const handleCardClick = (item) => {
//     if (item?.sensorId?.length > 0) {
//       window.location.href = `/admin/alarm-details/${item.sensorId.join(',')}`;
//     }
//   };

//   const handleCriticalAlertClick = () => {
//     if (totalAlarmedSensorIds?.length > 0) {
//       window.location.href = `/admin/alarm-details/${totalAlarmedSensorIds.join(',')}`;
//     }
//   };

//   const dataSource = liveSensorData ? 'hybrid' : 'db';

//   useEffect(() => {
//     if (!effectiveDataCenterIds.length) return;

//     let intervalId;

//     const fetchStatus = () => {
//       setIsLoadingStatusData(true);

//       fetchDeviceStatus(effectiveDataCenterIds)
//         .then((response) => {
//           setDeviceStatus(response.data);
//           setIsLoadingStatusData(false);
//         })
//         .catch((error) => {
//           console.error('❌ Failed to fetch DB data:', error);
//           setIsLoadingStatusData(false);
//         });
//     };

//     fetchStatus();
//     intervalId = setInterval(fetchStatus, 5000);

//     return () => clearInterval(intervalId);
//   }, [effectiveDataCenterIds]);

//   const [deviceOfflineIds, setDeviceOfflineIds] = useState([]);
//   const [deviceOfflineCount, setDeviceOfflineCount] = useState(0);

//   useEffect(() => {
//     if (!deviceStatus?.length) return;

//     const now = new Date().getTime();

//     const offlineDevices = deviceStatus.filter((device) => {
//       const updatedTime = new Date(device.updated_at).getTime();
//       const diffSeconds = (now - updatedTime) / 1000;
//       return diffSeconds > 30; // offline if no update for 30 seconds
//     });

//     setDeviceOfflineIds(offlineDevices.map((d) => d.device_id));
//     setDeviceOfflineCount(offlineDevices.length);

//     console.log('⚠️ Offline Devices:', offlineDevices);
//   }, [deviceStatus]);

//   return (
//     <div style={styles.container}>
//       <div style={styles.wrapper}>
//         <div style={styles.header}>
//           <h1 style={styles.title}>Alarm Dashboard</h1>
//           <p style={styles.subtitle}>
//             Real-time monitoring and alerts
//             {isLoadingDBData && (
//               <span style={{ color: '#f59e0b', marginLeft: '10px' }}>⏳ Loading...</span>
//             )}
//             {!isLoadingDBData && dataSource === 'db' && (
//               <span style={{ color: '#6b7280', marginLeft: '10px' }}>📊 Database</span>
//             )}
//             {dataSource === 'hybrid' && (
//               <span style={{ color: '#10b981', marginLeft: '10px' }}>🟢 Live</span>
//             )}
//           </p>
//         </div>

//         <div style={styles.topBar}>
//           <div style={styles.alertSection}>
//             {totalRequiredAlarmCount > 0 && (
//               <button onClick={handleCriticalAlertClick} style={styles.criticalAlert}>
//                 <AlertTriangle style={styles.alertIcon} />
//                 <div style={styles.alertContent}>
//                   <span style={styles.alertCount}>{totalRequiredAlarmCount}</span>
//                   <span style={styles.alertText}>Active Alarms - Immediate Attention Required</span>
//                 </div>
//               </button>
//             )}
//           </div>

//           <div style={styles.controlsSection}>
//             <button
//               style={{ ...styles.button, ...styles.buttonSecondary }}
//               onClick={() => setShowOnlyAlarms((prev) => !prev)}
//             >
//               {showOnlyAlarms ? 'Show All' : 'Show Only Alarms'}
//             </button>

//             <button
//               onClick={() => setIsMuteAlarm(!isMuteAlarm)}
//               style={{
//                 ...styles.button,
//                 ...(isMuteAlarm ? styles.buttonMuted : styles.buttonDanger),
//               }}
//             >
//               {isMuteAlarm ? (
//                 <>
//                   <VolumeX style={styles.buttonIcon} />
//                   Muted
//                 </>
//               ) : (
//                 <>
//                   <Volume2 style={styles.buttonIcon} />
//                   Unmute
//                 </>
//               )}
//             </button>
//           </div>
//         </div>

//         {isLoadingDBData && (
//           <div style={{ textAlign: 'center', padding: '40px', fontSize: '16px', color: '#6b7280' }}>
//             ⏳ Loading sensor data from database...
//           </div>
//         )}

//         {!isLoadingDBData && (
//           <div style={styles.grid}>
//             {alarmFiltered?.map((item, index) => (
//               <button
//                 key={index}
//                 onClick={() => handleCardClick(item)}
//                 style={{ ...styles.card, ...(item.alarm > 0 ? styles.cardAlarm : {}) }}
//               >
//                 <div style={styles.cardHeader}>
//                   {item.alarm > 0 && (
//                     <div style={styles.alarmIndicator}>
//                       <AlertCircle style={styles.alarmIcon} />
//                     </div>
//                   )}
//                   <h3 style={styles.cardTitle}>{item.sensor_type_name}</h3>
//                 </div>

//                 <div style={styles.cardBody}>
//                   <div
//                     style={{
//                       ...styles.alarmCount,
//                       ...(item.alarm > 0 ? styles.alarmCountActive : {}),
//                     }}
//                   >
//                     {item.alarm || 0}
//                   </div>
//                   <p style={styles.alarmLabel}>
//                     {item.alarm === 1 ? 'Active Alarm' : 'Active Alarms'}
//                   </p>
//                 </div>

//                 {item.alarm > 0 && (
//                   <div style={styles.cardFooter}>
//                     <span style={styles.viewDetailsText}>View Details →</span>
//                   </div>
//                 )}
//               </button>
//             ))}
//           </div>
//         )}

//         {/* DEVICE OFFLINE COUNT CARD */}
//         <div className="mt-3">
//           {deviceOfflineCount > 0 && (
//             <button
//               onClick={() =>
//                 (window.location.href = `/admin/device-details/${deviceOfflineIds.join(',')}`)
//               }
//               style={{ ...styles.card, ...styles.cardAlarm }}
//             >
//               <div style={styles.cardHeader}>
//                 <div style={styles.alarmIndicator}>
//                   <AlertTriangle style={styles.alarmIcon} />
//                 </div>
//                 <h3 style={styles.cardTitle}>Device Offline</h3>
//               </div>

//               <div style={styles.cardBody}>
//                 <div style={{ ...styles.alarmCount, ...styles.alarmCountActive }}>
//                   {deviceOfflineCount}
//                 </div>
//                 <p style={styles.alarmLabel}>
//                   {deviceOfflineCount === 1 ? 'Offline Device' : 'Offline Devices'}
//                 </p>
//               </div>

//               <div style={styles.cardFooter}>
//                 <span style={styles.viewDetailsText}>View Details →</span>
//               </div>
//             </button>
//           )}
//         </div>

//         {shouldPlayAlarm && (
//           <>
//             <ReactAudioPlayer
//               src={sound}
//               autoPlay
//               controls
//               loop
//               muted={isMuteAlarm}
//               style={{ display: 'none' }}
//             />
//             {!isMuteAlarm && (
//               <div style={styles.audioIndicator}>
//                 <Volume2 style={styles.audioIcon} />
//                 <span style={styles.audioText}>Alarm sound playing</span>
//               </div>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// const styles = {
//   container: {
//     minHeight: '100vh',
//     background: 'linear-gradient(to bottom right, #f9fafb, #f3f4f6)',
//     padding: '32px 24px',
//   },
//   wrapper: { maxWidth: '1400px', margin: '0 auto' },
//   header: { marginBottom: '32px' },
//   title: { fontSize: '30px', fontWeight: '600', color: '#111827', marginBottom: '8px' },
//   subtitle: { fontSize: '14px', color: '#6b7280' },
//   topBar: { display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' },
//   alertSection: { flex: 1 },
//   criticalAlert: {
//     display: 'flex',
//     alignItems: 'center',
//     gap: '16px',
//     padding: '5px 24px',
//     backgroundColor: '#fef2f2',
//     borderWidth: '2px',
//     borderStyle: 'solid',
//     borderColor: '#fecaca',
//     borderRadius: '12px',
//     cursor: 'pointer',
//     transition: 'all 0.2s',
//     boxShadow: '0 4px 6px rgba(239, 68, 68, 0.1)',
//     width: '100%',
//     textDecoration: 'none',
//     textAlign: 'left',
//   },
//   alertIcon: { width: '32px', height: '32px', color: '#dc2626', flexShrink: 0 },
//   alertContent: { display: 'flex', alignItems: 'center', gap: '12px' },
//   alertCount: { fontSize: '28px', fontWeight: '700', color: '#dc2626' },
//   alertText: { fontSize: '16px', fontWeight: '600', color: '#991b1b' },
//   controlsSection: { display: 'flex', gap: '12px', justifyContent: 'flex-end', flexWrap: 'wrap' },
//   button: {
//     display: 'flex',
//     alignItems: 'center',
//     gap: '8px',
//     padding: '12px 20px',
//     fontSize: '14px',
//     fontWeight: '600',
//     borderRadius: '8px',
//     border: '1px solid gray',
//     cursor: 'pointer',
//     transition: 'all 0.2s',
//     whiteSpace: 'nowrap',
//   },
//   buttonSecondary: { backgroundColor: '#f3f4f6', color: '#374151' },
//   buttonDanger: { backgroundColor: '#dc2626', color: 'white' },
//   buttonMuted: { backgroundColor: '#6b7280', color: 'white' },
//   buttonIcon: { width: '18px', height: '18px' },
//   grid: {
//     display: 'grid',
//     gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
//     gap: '12px',
//   },
//   card: {
//     display: 'flex',
//     flexDirection: 'column',
//     backgroundColor: 'white',
//     borderWidth: '1px',
//     borderStyle: 'solid',
//     borderColor: '#e5e7eb',
//     borderRadius: '10px',
//     padding: '12px',
//     cursor: 'pointer',
//     transition: 'all 0.2s',
//     position: 'relative',
//     overflow: 'hidden',
//     textAlign: 'left',
//   },
//   cardAlarm: {
//     backgroundColor: '#fff1f2',
//     borderColor: '#ef4444',
//     borderWidth: '2px',
//     boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)',
//     animation: 'pulse 1.5s infinite',
//   },
//   cardHeader: {
//     display: 'flex',
//     alignItems: 'center',
//     gap: '8px',
//     marginBottom: '8px',
//   },
//   alarmIndicator: {
//     width: '30px',
//     height: '30px',
//     backgroundColor: '#fee2e2',
//     borderRadius: '50%',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   alarmIcon: {
//     width: '18px',
//     height: '18px',
//     color: '#dc2626',
//   },
//   cardTitle: {
//     fontSize: '14px',
//     fontWeight: '600',
//     color: '#111827',
//     margin: 0,
//   },
//   cardBody: {
//     textAlign: 'center',
//     padding: '5px 0',
//   },
//   alarmCount: {
//     fontSize: '38px',
//     fontWeight: '700',
//     color: '#9ca3af',
//     lineHeight: '1',
//     marginBottom: '4px',
//   },
//   alarmCountActive: {
//     color: '#dc2626',
//   },
//   alarmLabel: {
//     fontSize: '12px',
//     color: '#6b7280',
//     margin: 0,
//   },
//   cardFooter: {
//     marginTop: '6px',
//     paddingTop: '6px',
//     borderTop: '1px solid #fecaca',
//   },
//   viewDetailsText: {
//     fontSize: '12px',
//     fontWeight: '600',
//     color: '#dc2626',
//   },
//   audioIndicator: {
//     position: 'fixed',
//     bottom: '24px',
//     right: '24px',
//     display: 'flex',
//     alignItems: 'center',
//     gap: '8px',
//     padding: '12px 16px',
//     backgroundColor: '#dc2626',
//     color: 'white',
//     borderRadius: '8px',
//     boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
//   },
//   audioIcon: { width: '20px', height: '20px' },
//   audioText: { fontSize: '14px', fontWeight: '600' },
// };

// export default Home;


/// test code 

import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import ReactAudioPlayer from 'react-audio-player';
import { Volume2, VolumeX, AlertTriangle, AlertCircle } from 'lucide-react';
import { useSelector } from 'react-redux';

import { fetchDataCenterCount } from '../api/settings/dataCenterApi';
import sound from '../assets/sounds/alarm.mp3';
import {
  fetchSensorThreshold,
  fetchSensorType,
  fetchStateConfig,
  fetchDeviceStatus,
} from '../api/dashboardTabApi';
import { errorMessage } from '../api/api-config/apiResponseMessage';
import { userContext } from '../context/UserContext';
import {
  fetchSensorRealTimeValueByDataCenter,
  fetchDiagramSVG,
} from '../api/settings/dataCenterApi';

const Home = () => {
  let arr = [];
  const { user } = useContext(userContext);
  const userAllowedDataCenterIds = user?.data_center_ids || [];

  const dataCenterId = useSelector((state) => state.updatedDataCenter.dataCenter);
  const incommingMQTTData = useSelector((state) => state.mqtt.data);

  const [alarmSensors, setAlarmSensors] = useState([]);
  const [alarmSmokeWaterSensors, setAlarmSmokeWaterSensors] = useState([]);

  const [shouldPlayAlarm, setShouldPlayAlarm] = useState(false);
  const [isMuteAlarm, setIsMuteAlarm] = useState(false);
  const [showOnlyAlarms, setShowOnlyAlarms] = useState(false);
  const [totalRequiredAlarmCount, setTotalRequiredAlarmCount] = useState(0);
  const [totalAlarmedSensorIds, setTotalAlarmedSensorIds] = useState(0);

  const [sensorType, setSensorType] = useState([]);
  const [threshold, setThreshold] = useState([]);
  const [stateConfig, setStateConfig] = useState([]);
  const [diagramContent, setDiagramContent] = useState([]);
  const [sensorRealTimeValues, setSensorRealTimeValues] = useState([]);

  const [liveSensorData, setLiveSensorData] = useState(null);
  const [liveSmokeWaterData, setLiveSmokeWaterData] = useState(null);

  const [isLoadingDBData, setIsLoadingDBData] = useState(true);
  const prevAlarmCountRef = React.useRef(0);

  const [allowedSensorIds] = useState(new Set([1, 2]));
  const [allowedSmokeAndWaterSensorIds] = useState(new Set([3, 4, 5, 6]));

  const [deviceStatus, setDeviceStatus] = useState([]);
  const [isLoadingStatusData, setIsLoadingStatusData] = useState(false);

  // ============================================================
  // Effective DataCenter IDs
  // ============================================================
  const effectiveDataCenterIds = React.useMemo(() => {
    if (!user) return [];
    if (dataCenterId == null) return userAllowedDataCenterIds;
    return [dataCenterId];
  }, [user, dataCenterId, userAllowedDataCenterIds]);

  // ============================================================
  // STEP 1: FETCH CONFIG DATA
  // ============================================================
  useEffect(() => {
    if (!effectiveDataCenterIds.length) return;

    Promise.all([
      fetchSensorThreshold(effectiveDataCenterIds),
      fetchSensorType(effectiveDataCenterIds),
      fetchStateConfig(effectiveDataCenterIds),
      fetchDiagramSVG(effectiveDataCenterIds),
    ])
      .then(([thresholdRes, sensorTypeRes, stateRes, diagramSvg]) => {
        setThreshold(thresholdRes);
        arr = thresholdRes;
        setSensorType(sensorTypeRes);
        setStateConfig(stateRes);
        setDiagramContent(diagramSvg.data);
      })
      .catch(errorMessage);
  }, [effectiveDataCenterIds]);

  // ============================================================
  // STEP 2: FETCH DATABASE DATA
  // ============================================================
  useEffect(() => {
    if (!effectiveDataCenterIds.length) return;

    setIsLoadingDBData(true);

    fetchSensorRealTimeValueByDataCenter(effectiveDataCenterIds)
      .then((response) => {
        const values = response.data || response;
        setSensorRealTimeValues(values);
      })
      .catch((error) => {
        console.error('❌ Failed to fetch DB data:', error);
        setIsLoadingDBData(false);
      });
  }, [effectiveDataCenterIds]);

  // ============================================================
  // STEP 3: Process DB data and create initial liveSensorData
  // ============================================================
  useEffect(() => {
    if (sensorRealTimeValues.length > 0 && threshold.length > 0) {
      const grouped = sensorRealTimeValues.reduce((acc, sensor) => {
        if (!acc[sensor.sensor_type]) {
          acc[sensor.sensor_type] = {
            id: sensor.sensor_type,
            sensor_type_name: sensor.sensor_type_name,
            sensors: [],
          };
        }
        acc[sensor.sensor_type].sensors.push({
          id: sensor.sensor_id,
          val: parseFloat(sensor.value),
          sensor_name: sensor.sensor_name,
          location: sensor.location,
          status: sensor.name,
        });
        return acc;
      }, {});

      const sensorTypes = Object.values(grouped);
      const enriched = {
        sensor_types: sensorTypes.map((sensorType) => ({
          ...sensorType,
          sensors: sensorType.sensors.map((sensor) => {
            const matchedThresholds = threshold
              .filter((th) => th.sensor_id === sensor.id && th.sensor_type === sensorType.id)
              .map((th) => ({
                threshold: th.threshold,
                threshold_name: th.threshold_name,
                color: th.color,
              }));
            return { ...sensor, thresholds: matchedThresholds };
          }),
        })),
      };

      setLiveSensorData(enriched);

      if (stateConfig.length > 0) {
        const smokeWaterTypes = sensorTypes.filter((st) =>
          allowedSmokeAndWaterSensorIds.has(st.id)
        );
        const enrichedSmokeWater = {
          sensor_types: smokeWaterTypes.map((sensorType) => {
            const sensor_type_name =
              stateConfig.find((state) => state.type_id === sensorType.id)?.type_name ||
              sensorType.sensor_type_name;
            return {
              ...sensorType,
              sensor_type_name,
              sensors: sensorType.sensors.map((sensor) => {
                const matchedState = stateConfig.find(
                  (state) =>
                    state.type_id === sensorType.id &&
                    state.sensor_id === sensor.id &&
                    state.state_value === sensor.val
                );

                return {
                  ...sensor,
                  state_name: matchedState?.state_name || null,
                  color: matchedState?.color || null,
                  status: matchedState?.state_name || null,
                  sound: matchedState?.sound ?? 0, // ✅ FIX: carry sound field from stateConfig
                };
              }),
            };
          }),
        };
        setLiveSmokeWaterData(enrichedSmokeWater);
      }

      setIsLoadingDBData(false);
    }
  }, [sensorRealTimeValues, threshold, stateConfig]);

  // ============================================================
  // STEP 4: UPDATE WITH MQTT DATA - Normal Sensors (Types 1, 2)
  // ============================================================
  useEffect(() => {
    if (!incommingMQTTData?.length || !threshold.length) return;

    const relevantMQTTItems = incommingMQTTData.filter((item) =>
      effectiveDataCenterIds.includes(item.dc_id)
    );

    if (!relevantMQTTItems.length) return;

    relevantMQTTItems.forEach((latest) => {
      if (!latest.sensor_types?.length) return;

      if (latest.sensor_types.every((st) => !st.sensors?.length)) return;

      const matchedSensorTypes = latest.sensor_types.filter((item) =>
        allowedSensorIds.has(item.id)
      );

      if (!matchedSensorTypes.length) return;

      const enrichedTypes = matchedSensorTypes.map((sensorType) => {
        const typeThreshold = threshold.find(
          (th) => th.sensor_type === sensorType.id && th.dc_id === latest.dc_id
        );

        return {
          ...sensorType,
          sensor_type_name: typeThreshold?.sensor_type_name || sensorType.sensor_type_name,
          sensors: sensorType.sensors.map((sensor) => {
            const matchedThresholds = threshold
              .filter(
                (th) =>
                  th.sensor_id === sensor.id &&
                  th.dc_id === latest.dc_id &&
                  th.sensor_type === sensorType.id
              )
              .map((th) => ({
                threshold: th.threshold,
                threshold_name: th.threshold_name,
                color: th.color,
              }));

            const sortedThresholds = [...matchedThresholds].sort(
              (a, b) => a.threshold - b.threshold
            );
            let derivedStatus =
              sortedThresholds.length > 0
                ? sortedThresholds[sortedThresholds.length - 1].threshold_name
                : undefined;
            for (let i = 0; i < sortedThresholds.length; i++) {
              if (sensor.val <= sortedThresholds[i].threshold) {
                derivedStatus = sortedThresholds[i].threshold_name;
                break;
              }
            }

            return {
              ...sensor,
              thresholds: matchedThresholds ?? [],
              status: derivedStatus,
            };
          }),
        };
      });

      setLiveSensorData((prev) => {
        const existing = prev || { sensor_types: [] };
        const mergedSensorTypes = [...existing.sensor_types];

        const updatedSensorsLog = [];

        enrichedTypes.forEach((newType) => {
          const typeIndex = mergedSensorTypes.findIndex((t) => t.id === newType.id);

          if (typeIndex >= 0) {
            const existingType = mergedSensorTypes[typeIndex];
            const mergedSensors = [...existingType.sensors];

            newType.sensors.forEach((newSensor) => {
              const sensorIndex = mergedSensors.findIndex((s) => s.id === newSensor.id);
              const oldSensor = sensorIndex >= 0 ? mergedSensors[sensorIndex] : null;

              const updatedSensor = {
                ...newSensor,
                sensor_name: oldSensor?.sensor_name || newSensor.sensor_name,
                location: oldSensor?.location || newSensor.location,
              };

              if (sensorIndex >= 0) {
                if (oldSensor?.val !== newSensor.val || oldSensor?.status !== newSensor.status) {
                  updatedSensorsLog.push({
                    dc_id: latest.dc_id,
                    type: newType.sensor_type_name,
                    sensor_id: newSensor.id,
                    sensor_name: updatedSensor.sensor_name,
                    oldVal: oldSensor?.val,
                    newVal: newSensor.val,
                    oldStatus: oldSensor?.status,
                    newStatus: newSensor.status,
                  });
                }
                mergedSensors[sensorIndex] = updatedSensor;
              } else {
                mergedSensors.push(updatedSensor);
              }
            });

            mergedSensorTypes[typeIndex] = { ...existingType, sensors: mergedSensors };
          } else {
            if (newType.sensors?.length > 0) {
              mergedSensorTypes.push(newType);
            }
          }
        });

        mergedSensorTypes.sort((a, b) => a.id - b.id);

        if (updatedSensorsLog.length > 0) {
          console.log(
            `⚡ [MQTT] ${updatedSensorsLog.length} sensor(s) updated (DC: ${latest.dc_id})`
          );
          updatedSensorsLog.forEach((s) => {
            console.log(
              `   └─ [${s.type}] Sensor #${s.sensor_id} (${s.sensor_name}): val ${s.oldVal} → ${s.newVal} | status "${s.oldStatus}" → "${s.newStatus}"`
            );
          });
        }

        return { ...latest, sensor_types: mergedSensorTypes };
      });
    });
  }, [incommingMQTTData, threshold, effectiveDataCenterIds]);

  // ============================================================
  // STEP 5: UPDATE WITH MQTT DATA - Smoke/Water Sensors (Types 3,4,5,6)
  // ============================================================
  useEffect(() => {
    if (!incommingMQTTData?.length || !stateConfig.length) return;

    const relevantMQTTItems = incommingMQTTData.filter((item) =>
      effectiveDataCenterIds.includes(item.dc_id)
    );

    if (!relevantMQTTItems.length) return;

    relevantMQTTItems.forEach((latest) => {
      if (!latest.sensor_types?.length) return;

      const hasValidData = latest.sensor_types.some((st) => st.sensors?.length > 0);
      if (!hasValidData) return;

      const filteredSensorTypes = latest.sensor_types.filter((st) =>
        allowedSmokeAndWaterSensorIds.has(st.id)
      );

      if (!filteredSensorTypes.length) return;

      const enrichedTypes = filteredSensorTypes.map((sensorType) => {
        const sensor_type_name =
          stateConfig.find((state) => state.type_id === sensorType.id)?.type_name ||
          sensorType.sensor_type_name;

        const enrichedSensors = sensorType.sensors
          .map((sensor) => {
            const matchedState = stateConfig.find(
              (state) =>
                state.sensor_id === sensor.id &&
                state.type_id === sensorType.id &&
                state.state_value === sensor.val
            );

            return {
              ...sensor,
              state_name: matchedState?.state_name || null,
              color: matchedState?.color || null,
              status: matchedState?.state_name || null,
              sound: matchedState?.sound ?? 0, // ✅ FIX: carry sound field from stateConfig
            };
          })
          .filter((sensor) => sensor.status !== null);

        return { ...sensorType, sensor_type_name, sensors: enrichedSensors };
      });

      const hasValidSensors = enrichedTypes.some((st) => st.sensors?.length);
      if (!hasValidSensors) return;

      setLiveSmokeWaterData((prev) => {
        const existing = prev || { sensor_types: [] };
        const mergedSensorTypes = [...existing.sensor_types];

        const updatedSensorsLog = [];

        enrichedTypes.forEach((newType) => {
          const typeIndex = mergedSensorTypes.findIndex((t) => t.id === newType.id);

          if (typeIndex >= 0) {
            const existingType = mergedSensorTypes[typeIndex];
            const mergedSensors = [...existingType.sensors];

            newType.sensors.forEach((newSensor) => {
              const sensorIndex = mergedSensors.findIndex((s) => s.id === newSensor.id);
              const oldSensor = sensorIndex >= 0 ? mergedSensors[sensorIndex] : null;

              const updatedSensor = {
                ...newSensor,
                sensor_name: oldSensor?.sensor_name || newSensor.sensor_name,
                location: oldSensor?.location || newSensor.location,
                sound: newSensor.sound ?? oldSensor?.sound ?? 0, // ✅ FIX: preserve sound on merge
              };

              if (sensorIndex >= 0) {
                if (oldSensor?.val !== newSensor.val || oldSensor?.status !== newSensor.status) {
                  updatedSensorsLog.push({
                    dc_id: latest.dc_id,
                    type: newType.sensor_type_name,
                    sensor_id: newSensor.id,
                    sensor_name: updatedSensor.sensor_name,
                    oldVal: oldSensor?.val,
                    newVal: newSensor.val,
                    oldStatus: oldSensor?.status,
                    newStatus: newSensor.status,
                  });
                }
                mergedSensors[sensorIndex] = updatedSensor;
              } else {
                mergedSensors.push(updatedSensor);
              }
            });

            mergedSensorTypes[typeIndex] = { ...existingType, sensors: mergedSensors };
          } else {
            if (newType.sensors?.length > 0) {
              mergedSensorTypes.push(newType);
            }
          }
        });

        mergedSensorTypes.sort((a, b) => a.id - b.id);

        if (updatedSensorsLog.length > 0) {
          console.log(
            `⚡ [MQTT Smoke/Water] ${updatedSensorsLog.length} sensor(s) updated (DC: ${latest.dc_id})`
          );
          updatedSensorsLog.forEach((s) => {
            console.log(
              `   └─ [${s.type}] Sensor #${s.sensor_id} (${s.sensor_name}): val ${s.oldVal} → ${s.newVal} | status "${s.oldStatus}" → "${s.newStatus}"`
            );
          });
        }

        return { ...latest, sensor_types: mergedSensorTypes };
      });
    });
  }, [incommingMQTTData, stateConfig, effectiveDataCenterIds]);

  useEffect(() => {
    fetchDataCenterCount()
      .then((res) => {})
      .catch(errorMessage);
  }, []);

  // ============================================================
  // PROCESS THRESHOLD ALARMS (Types 1, 2)
  // ============================================================
  useEffect(() => {
    setAlarmSensors([]);

    if (liveSensorData?.sensor_types?.length > 0) {
      const filteredSensorTypes = liveSensorData.sensor_types.filter((item) =>
        allowedSensorIds.has(item.id)
      );

      filteredSensorTypes.forEach((sensorType) => {
        sensorType.sensors?.forEach((sensor) => {
          const status = sensor.status;
          const isAlarm = status && status.toLowerCase() === 'high';

          if (isAlarm) {
            setAlarmSensors((prev) => {
              const exists = prev.some(
                (a) => a.sensor_id === sensor.id && a.sensor_type === sensorType.id
              );
              if (exists) return prev;
              return [
                ...prev,
                {
                  sensor_id: sensor.id,
                  sensor_type: sensorType.id,
                  sensor_type_name: sensorType.sensor_type_name,
                  val: sensor.val,
                  status: status,
                },
              ];
            });
          }
        });
      });
    }
  }, [liveSensorData]);

  // ============================================================
  // PROCESS STATE ALARMS (Types 3, 4, 5, 6)
  // ============================================================
  useEffect(() => {
    if (!liveSmokeWaterData?.sensor_types?.length) {
      setAlarmSmokeWaterSensors([]);
      return;
    }

    const alarms = [];

    liveSmokeWaterData.sensor_types.forEach((sensorType) => {
      sensorType.sensors?.forEach((sensor) => {
        const status = sensor.status;
        let isAlarm = false;

        if (sensorType.id === 6) {
          isAlarm = status && status.toLowerCase() !== 'close';
        } else {
          isAlarm = status && status.toLowerCase() !== 'normal';
        }

        // ✅ FIX: If sound = 0, suppress alarm regardless of status
        if (sensor.sound !== 1) {
          isAlarm = false;
        }

        if (isAlarm) {
          alarms.push({
            sensor_id: sensor.id,
            sensor_type: sensorType.id,
            sensor_type_name: sensorType.sensor_type_name,
            val: sensor.val,
            status: status,
            color: '#dc2626',
            location: sensor.location,
          });
        }
      });
    });

    console.log('🚨 Smoke/Water Alarms Detected:', alarms);
    setAlarmSmokeWaterSensors(alarms);
  }, [liveSmokeWaterData]);

  // ============================================================
  // MAP ALARMS TO SENSOR TYPES FOR DISPLAY
  // ============================================================
  const updatedAlarmData = sensorType?.map((type) => {
    const thresholdAlarms =
      alarmSensors?.filter(
        (sensor) => sensor.sensor_type_name?.toLowerCase() === type.sensor_type_name?.toLowerCase()
      ) || [];

    const stateAlarms =
      alarmSmokeWaterSensors?.filter(
        (sensor) => sensor.sensor_type_name?.toLowerCase() === type.sensor_type_name?.toLowerCase()
      ) || [];

    const allAlarms = [...thresholdAlarms, ...stateAlarms];

    return {
      ...type,
      sensorId: allAlarms.map((sensor) => sensor.sensor_id),
      alarm: allAlarms.length,
    };
  });

  const alarmFiltered = showOnlyAlarms
    ? updatedAlarmData?.filter((item) => item.alarm > 0)
    : updatedAlarmData;

  useEffect(() => {
    if (!Array.isArray(updatedAlarmData)) return;

    const alarmedSensorIds = updatedAlarmData
      .filter((item) => item.alarm > 0)
      .flatMap((item) => item.sensorId);

    const totalCount = alarmedSensorIds.length;
    const uniqueAlarmedSensorIds = Array.from(new Set(alarmedSensorIds));

    setShouldPlayAlarm((prev) => {
      const newValue = totalCount > 0;
      return prev === newValue ? prev : newValue;
    });

    if (totalCount > prevAlarmCountRef.current) {
      console.log(
        `🔔 New alarm detected (${prevAlarmCountRef.current} → ${totalCount}) — auto-unmuting`
      );
      setIsMuteAlarm(false);
    }

    prevAlarmCountRef.current = totalCount;

    setTotalRequiredAlarmCount((prev) => (prev === totalCount ? prev : totalCount));

    setTotalAlarmedSensorIds((prev) => {
      if (typeof prev !== 'object' || prev === null) return uniqueAlarmedSensorIds;
      if (
        prev.length !== uniqueAlarmedSensorIds.length ||
        prev.some((val, idx) => val !== uniqueAlarmedSensorIds[idx])
      ) {
        return uniqueAlarmedSensorIds;
      }
      return prev;
    });
  }, [updatedAlarmData]);

  const handleCardClick = (item) => {
    if (item?.sensorId?.length > 0) {
      window.location.href = `/admin/alarm-details/${item.sensorId.join(',')}`;
    }
  };

  const handleCriticalAlertClick = () => {
    if (totalAlarmedSensorIds?.length > 0) {
      window.location.href = `/admin/alarm-details/${totalAlarmedSensorIds.join(',')}`;
    }
  };

  const dataSource = liveSensorData ? 'hybrid' : 'db';

  useEffect(() => {
    if (!effectiveDataCenterIds.length) return;

    let intervalId;

    const fetchStatus = () => {
      setIsLoadingStatusData(true);

      fetchDeviceStatus(effectiveDataCenterIds)
        .then((response) => {
          setDeviceStatus(response.data);
          setIsLoadingStatusData(false);
        })
        .catch((error) => {
          console.error('❌ Failed to fetch DB data:', error);
          setIsLoadingStatusData(false);
        });
    };

    fetchStatus();
    intervalId = setInterval(fetchStatus, 5000);

    return () => clearInterval(intervalId);
  }, [effectiveDataCenterIds]);

  const [deviceOfflineIds, setDeviceOfflineIds] = useState([]);
  const [deviceOfflineCount, setDeviceOfflineCount] = useState(0);

  useEffect(() => {
    if (!deviceStatus?.length) return;

    const now = new Date().getTime();

    const offlineDevices = deviceStatus.filter((device) => {
      const updatedTime = new Date(device.updated_at).getTime();
      const diffSeconds = (now - updatedTime) / 1000;
      return diffSeconds > 30; // offline if no update for 30 seconds
    });

    setDeviceOfflineIds(offlineDevices.map((d) => d.device_id));
    setDeviceOfflineCount(offlineDevices.length);

    console.log('⚠️ Offline Devices:', offlineDevices);
  }, [deviceStatus]);

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <div style={styles.header}>
          <h1 style={styles.title}>Alarm Dashboard</h1>
          <p style={styles.subtitle}>
            Real-time monitoring and alerts
            {isLoadingDBData && (
              <span style={{ color: '#f59e0b', marginLeft: '10px' }}>⏳ Loading...</span>
            )}
            {!isLoadingDBData && dataSource === 'db' && (
              <span style={{ color: '#6b7280', marginLeft: '10px' }}>📊 Database</span>
            )}
            {dataSource === 'hybrid' && (
              <span style={{ color: '#10b981', marginLeft: '10px' }}>🟢 Live</span>
            )}
          </p>
        </div>

        <div style={styles.topBar}>
          <div style={styles.alertSection}>
            {totalRequiredAlarmCount > 0 && (
              <button onClick={handleCriticalAlertClick} style={styles.criticalAlert}>
                <AlertTriangle style={styles.alertIcon} />
                <div style={styles.alertContent}>
                  <span style={styles.alertCount}>{totalRequiredAlarmCount}</span>
                  <span style={styles.alertText}>Active Alarms - Immediate Attention Required</span>
                </div>
              </button>
            )}
          </div>

          <div style={styles.controlsSection}>
            <button
              style={{ ...styles.button, ...styles.buttonSecondary }}
              onClick={() => setShowOnlyAlarms((prev) => !prev)}
            >
              {showOnlyAlarms ? 'Show All' : 'Show Only Alarms'}
            </button>

            <button
              onClick={() => setIsMuteAlarm(!isMuteAlarm)}
              style={{
                ...styles.button,
                ...(isMuteAlarm ? styles.buttonMuted : styles.buttonDanger),
              }}
            >
              {isMuteAlarm ? (
                <>
                  <VolumeX style={styles.buttonIcon} />
                  Muted
                </>
              ) : (
                <>
                  <Volume2 style={styles.buttonIcon} />
                  Unmute
                </>
              )}
            </button>
          </div>
        </div>

        {isLoadingDBData && (
          <div style={{ textAlign: 'center', padding: '40px', fontSize: '16px', color: '#6b7280' }}>
            ⏳ Loading sensor data from database...
          </div>
        )}

        {!isLoadingDBData && (
          <div style={styles.grid}>
            {alarmFiltered?.map((item, index) => (
              <button
                key={index}
                onClick={() => handleCardClick(item)}
                style={{ ...styles.card, ...(item.alarm > 0 ? styles.cardAlarm : {}) }}
              >
                <div style={styles.cardHeader}>
                  {item.alarm > 0 && (
                    <div style={styles.alarmIndicator}>
                      <AlertCircle style={styles.alarmIcon} />
                    </div>
                  )}
                  <h3 style={styles.cardTitle}>{item.sensor_type_name}</h3>
                </div>

                <div style={styles.cardBody}>
                  <div
                    style={{
                      ...styles.alarmCount,
                      ...(item.alarm > 0 ? styles.alarmCountActive : {}),
                    }}
                  >
                    {item.alarm || 0}
                  </div>
                  <p style={styles.alarmLabel}>
                    {item.alarm === 1 ? 'Active Alarm' : 'Active Alarms'}
                  </p>
                </div>

                {item.alarm > 0 && (
                  <div style={styles.cardFooter}>
                    <span style={styles.viewDetailsText}>View Details →</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* DEVICE OFFLINE COUNT CARD */}
        <div className="mt-3">
          {deviceOfflineCount > 0 && (
            <button
              onClick={() =>
                (window.location.href = `/admin/device-details/${deviceOfflineIds.join(',')}`)
              }
              style={{ ...styles.card, ...styles.cardAlarm }}
            >
              <div style={styles.cardHeader}>
                <div style={styles.alarmIndicator}>
                  <AlertTriangle style={styles.alarmIcon} />
                </div>
                <h3 style={styles.cardTitle}>Device Offline</h3>
              </div>

              <div style={styles.cardBody}>
                <div style={{ ...styles.alarmCount, ...styles.alarmCountActive }}>
                  {deviceOfflineCount}
                </div>
                <p style={styles.alarmLabel}>
                  {deviceOfflineCount === 1 ? 'Offline Device' : 'Offline Devices'}
                </p>
              </div>

              <div style={styles.cardFooter}>
                <span style={styles.viewDetailsText}>View Details →</span>
              </div>
            </button>
          )}
        </div>

        {shouldPlayAlarm && (
          <>
            <ReactAudioPlayer
              src={sound}
              autoPlay
              controls
              loop
              muted={isMuteAlarm}
              style={{ display: 'none' }}
            />
            {!isMuteAlarm && (
              <div style={styles.audioIndicator}>
                <Volume2 style={styles.audioIcon} />
                <span style={styles.audioText}>Alarm sound playing</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(to bottom right, #f9fafb, #f3f4f6)',
    padding: '32px 24px',
  },
  wrapper: { maxWidth: '1400px', margin: '0 auto' },
  header: { marginBottom: '32px' },
  title: { fontSize: '30px', fontWeight: '600', color: '#111827', marginBottom: '8px' },
  subtitle: { fontSize: '14px', color: '#6b7280' },
  topBar: { display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' },
  alertSection: { flex: 1 },
  criticalAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '5px 24px',
    backgroundColor: '#fef2f2',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: '#fecaca',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 6px rgba(239, 68, 68, 0.1)',
    width: '100%',
    textDecoration: 'none',
    textAlign: 'left',
  },
  alertIcon: { width: '32px', height: '32px', color: '#dc2626', flexShrink: 0 },
  alertContent: { display: 'flex', alignItems: 'center', gap: '12px' },
  alertCount: { fontSize: '28px', fontWeight: '700', color: '#dc2626' },
  alertText: { fontSize: '16px', fontWeight: '600', color: '#991b1b' },
  controlsSection: { display: 'flex', gap: '12px', justifyContent: 'flex-end', flexWrap: 'wrap' },
  button: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    fontSize: '14px',
    fontWeight: '600',
    borderRadius: '8px',
    border: '1px solid gray',
    cursor: 'pointer',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  },
  buttonSecondary: { backgroundColor: '#f3f4f6', color: '#374151' },
  buttonDanger: { backgroundColor: '#dc2626', color: 'white' },
  buttonMuted: { backgroundColor: '#6b7280', color: 'white' },
  buttonIcon: { width: '18px', height: '18px' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '12px',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'white',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#e5e7eb',
    borderRadius: '10px',
    padding: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    position: 'relative',
    overflow: 'hidden',
    textAlign: 'left',
  },
  cardAlarm: {
    backgroundColor: '#fff1f2',
    borderColor: '#ef4444',
    borderWidth: '2px',
    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)',
    animation: 'pulse 1.5s infinite',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
  },
  alarmIndicator: {
    width: '30px',
    height: '30px',
    backgroundColor: '#fee2e2',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alarmIcon: {
    width: '18px',
    height: '18px',
    color: '#dc2626',
  },
  cardTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  cardBody: {
    textAlign: 'center',
    padding: '5px 0',
  },
  alarmCount: {
    fontSize: '38px',
    fontWeight: '700',
    color: '#9ca3af',
    lineHeight: '1',
    marginBottom: '4px',
  },
  alarmCountActive: {
    color: '#dc2626',
  },
  alarmLabel: {
    fontSize: '12px',
    color: '#6b7280',
    margin: 0,
  },
  cardFooter: {
    marginTop: '6px',
    paddingTop: '6px',
    borderTop: '1px solid #fecaca',
  },
  viewDetailsText: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#dc2626',
  },
  audioIndicator: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: '#dc2626',
    color: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
  audioIcon: { width: '20px', height: '20px' },
  audioText: { fontSize: '14px', fontWeight: '600' },
};

export default Home;
// import React, { useEffect, useState, useContext } from 'react';
// import { Link } from 'react-router-dom';
// import ReactAudioPlayer from 'react-audio-player';
// import { Volume2, VolumeX, AlertTriangle, AlertCircle } from 'lucide-react'; // Added AlertTriangle, AlertCircle
// import { useSelector } from 'react-redux';

// import { fetchDataCenterCount } from '../api/settings/dataCenterApi';
// import sound from '../assets/sounds/alarm.mp3';
// import { fetchSensorThreshold, fetchSensorType, fetchStateConfig } from '../api/dashboardTabApi';
// import {
//   fetchSensorRealTimeValueByDataCenter,
//   fetchDiagramSVG,
// } from '../api/settings/dataCenterApi';
// import { errorMessage } from '../api/api-config/apiResponseMessage';
// import { userContext } from '../context/UserContext';

// const Home = () => {
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
//   const [sensorRealTimeValue, setSensorRealTimeValue] = useState([]);

//   // sesor Type
//   const [allowedSensorIds, setAllowedSensorIds] = useState(new Set([1, 2]));
//   const [allowedSmokeAndWaterSensorIds, setAllowedSmokeAndWaterSensorIds] = useState(
//     new Set([3, 4, 5])
//   );
//   const [allowedSLDIds, setAllowedSLDIds] = useState(new Set([3]));

//   const effectiveDataCenterIds = React.useMemo(() => {
//     if (!user) return [];

//     // 🔥 If NO dataCenter selected → use all allowed
//     if (dataCenterId == null) {
//       console.log('Using userAllowedDataCenterIds');
//       return userAllowedDataCenterIds;
//     }

//     // 🔥 If selected
//     return [dataCenterId];
//   }, [user, dataCenterId, userAllowedDataCenterIds]);

//   // useEffect(() => {
//   //   if (dataCenterId != null) {

//   //     Promise.all([
//   //       fetchSensorThreshold(dataCenterId),
//   //       fetchSensorType(dataCenterId),
//   //       fetchStateConfig(dataCenterId),
//   //       fetchDiagramSVG(dataCenterId)
//   //     ])
//   //       .then(([thresholdRes, sensorTypeRes, stateRes, diagramSvg]) => {
//   //         setThreshold(thresholdRes);
//   //         setSensorType(sensorTypeRes);
//   //         setStateConfig(stateRes);
//   //         setDiagramContent(diagramSvg.data);
//   //       })
//   //       .catch(errorMessage);
//   //   }
//   // }, [dataCenterId]);

//   useEffect(() => {
//     if (!effectiveDataCenterIds.length) return;

//     Promise.all([
//       fetchSensorThreshold(effectiveDataCenterIds),
//       fetchSensorType(effectiveDataCenterIds),
//       fetchStateConfig(effectiveDataCenterIds),
//       fetchDiagramSVG(effectiveDataCenterIds),
//       fetchSensorRealTimeValueByDataCenter(effectiveDataCenterIds),
//     ])
//       .then(([thresholdRes, sensorTypeRes, stateRes, diagramSvg, sensorRealTimeValue]) => {
//         setThreshold(thresholdRes);
//         setSensorType(sensorTypeRes);
//         setStateConfig(stateRes);
//         setDiagramContent(diagramSvg.data);
//         setSensorRealTimeValue(sensorRealTimeValue);
//       })
//       .catch(errorMessage);
//   }, [effectiveDataCenterIds]);

//   useEffect(() => {
//     fetchDataCenterCount().then((res) => {});
//   }, []);

//   useEffect(() => {
//     setAlarmSensors([]);

//     if (incommingMQTTData?.length > 0 && effectiveDataCenterIds?.length > 0 && threshold.length) {
//       const filteredDataCenter = incommingMQTTData.filter((item) =>
//         effectiveDataCenterIds.includes(item.dc_id)
//       );

//       if (filteredDataCenter.length === 0) return;

//       filteredDataCenter.forEach((latest) => {
//         const matchedSensorType = {
//           ...latest,
//           sensor_types: (latest.sensor_types || []).filter((item) =>
//             allowedSensorIds?.has(item.id)
//           ),
//         };

//         matchedSensorType.sensor_types.forEach((sensorType) => {
//           sensorType.sensors.forEach((sensor) => {
//             const matchedThresholds = threshold.filter(
//               (th) =>
//                 th.sensor_id === sensor.id &&
//                 th.dc_id === latest.dc_id &&
//                 th.sensor_type === sensorType.id
//             );

//             matchedThresholds.forEach((th) => {
//               const sensorValue = Number(sensor.val);
//               const thresholdValue = Number(th.threshold);

//               if (th.threshold_name === 'High' && sensorValue >= thresholdValue) {
//                 setAlarmSensors((prev) => {
//                   const exists = prev.some(
//                     (a) =>
//                       a.sensor_id === sensor.id &&
//                       a.sensor_type === sensorType.id &&
//                       a.dc_id === latest.dc_id
//                   );

//                   if (exists) return prev;

//                   return [
//                     ...prev,
//                     {
//                       sensor_id: sensor.id,
//                       sensor_type: sensorType.id,
//                       sensor_type_name: th.sensor_type_name,
//                       val: sensorValue,
//                       threshold: thresholdValue,
//                       threshold_name: th.threshold_name,
//                       dc_id: latest.dc_id,
//                     },
//                   ];
//                 });
//               }
//             });
//           });
//         });
//       });
//     }
//   }, [incommingMQTTData, threshold, effectiveDataCenterIds]);

//   useEffect(() => {
//     if (!incommingMQTTData?.length || !effectiveDataCenterIds?.length || !stateConfig.length)
//       return;

//     const filteredDataCenter = incommingMQTTData.filter((item) =>
//       effectiveDataCenterIds.includes(item.dc_id)
//     );

//     const alarmSensors = [];

//     filteredDataCenter.forEach((latest) => {
//       latest.sensor_types
//         ?.filter((sensorType) => allowedSmokeAndWaterSensorIds.has(sensorType.id))
//         .forEach((sensorType) => {
//           const sensor_type_name =
//             stateConfig.find((state) => state.type_id === sensorType.id)?.type_name || null;

//           sensorType.sensors.forEach((sensor) => {
//             const matchedState = stateConfig.find(
//               (state) =>
//                 state.sensor_id === sensor.id &&
//                 state.type_id === sensorType.id &&
//                 state.state_value === sensor.val
//             );

//             const isAlarm =
//               matchedState?.state_name && matchedState.state_name.toLowerCase() !== 'normal';

//             if (isAlarm) {
//               alarmSensors.push({
//                 sensor_id: sensor.id,
//                 sensor_type: sensorType.id,
//                 sensor_type_name,
//                 val: sensor.val,
//                 state_name: matchedState.state_name,
//                 color: matchedState.color,
//                 location: matchedState.location,
//                 dc_id: latest.dc_id,
//               });
//             }
//           });
//         });
//     });

//     setAlarmSmokeWaterSensors(alarmSensors);
//   }, [incommingMQTTData, stateConfig, effectiveDataCenterIds]);

//   const updatedAlarmData = sensorType?.map((type) => {
//     const normal =
//       alarmSensors?.filter(
//         (sensor) => sensor.sensor_type_name.toLowerCase() === type.sensor_type_name.toLowerCase()
//       ) || [];

//     const smokeWater =
//       alarmSmokeWaterSensors?.filter(
//         (sensor) => sensor.sensor_type_name.toLowerCase() === type.sensor_type_name.toLowerCase()
//       ) || [];

//     const allSensors = [...normal, ...smokeWater];

//     return {
//       ...type,
//       sensorId: allSensors.map((sensor) => sensor.sensor_id),
//       alarm: allSensors.length,
//     };
//   });

//   const alarmFiltered = showOnlyAlarms
//     ? updatedAlarmData?.filter((item) => item.alarm > 0)
//     : updatedAlarmData;

//   useEffect(() => {
//     if (!Array.isArray(updatedAlarmData)) return;

//     let totalCount = 0;
//     const alarmedSensorIds = updatedAlarmData
//       .filter((item) => item.alarm > 0)
//       .flatMap((item) => item.sensorId);

//     totalCount = alarmedSensorIds.length;

//     const uniqueAlarmedSensorIds = Array.from(new Set(alarmedSensorIds));

//     setShouldPlayAlarm((prev) => {
//       const newValue = totalCount > 0;
//       return prev === newValue ? prev : newValue;
//     });

//     setTotalRequiredAlarmCount((prev) => (prev === totalCount ? prev : totalCount));

//     setTotalAlarmedSensorIds((prev) => {
//       if (typeof prev !== 'object' || prev === null) {
//         // Initialize if not an array/object, crucial for initial state logic
//         return uniqueAlarmedSensorIds;
//       }
//       if (
//         prev.length !== uniqueAlarmedSensorIds.length ||
//         prev.some((val, idx) => val !== uniqueAlarmedSensorIds[idx])
//       ) {
//         return uniqueAlarmedSensorIds;
//       }
//       return prev;
//     });
//   }, [updatedAlarmData]);

//   // Handler function to link to alarm details page
//   const handleCardClick = (sensorIds) => {
//     if (sensorIds && sensorIds.length > 0) {
//       // Functional equivalence to your original Link usage:
//       // <Link to={`/admin/alarm-details/${dataCenterId}/${item.sensorId.join(",")}`}>
//       window.location.href = `/admin/alarm-details/${sensorIds.join(',')}`;
//     }
//   };

//   // Handler function for the critical alert banner
//   const handleCriticalAlertClick = () => {
//     if (totalAlarmedSensorIds && totalAlarmedSensorIds.length > 0) {
//       // Functional equivalence to your original Link usage:
//       // <Link to={`/admin/alarm-details/${dataCenterId}/${totalAlarmedSensorIds.join(",")}`}>
//       window.location.href = `/admin/alarm-details/${totalAlarmedSensorIds.join(',')}`;
//     }
//   };

//   // console.log("Effective Data Center IDs:", effectiveDataCenterIds);
//   // console.log("Incomming MQTT Data:", incommingMQTTData);
//   // console.log("Updated Alarm Data:", updatedAlarmData);
//   // console.log("Total Required Alarm Count:", totalRequiredAlarmCount);
//   // console.log('Total Alarmed Sensor IDs:', totalAlarmedSensorIds);
//   // console.log("Should Play Alarm:", shouldPlayAlarm);
//   // console.log("Is Mute Alarm:", isMuteAlarm);
//   // console.log("Show Only Alarms:", showOnlyAlarms);
//   // console.log('Alarm Filtered Data:', alarmFiltered);
//   // console.log('Sensor Type:', sensorType);
//   // console.log("Threshold:", threshold);
//   // console.log('State Config:', stateConfig);
//   // console.log("Diagram Content:", diagramContent);
//   // console.log("User Allowed Data Center IDs:", userAllowedDataCenterIds);
//   // console.log("selected dataCenterId from Redux:", dataCenterId);

//   // console.log('Sensor Real-Time Value:', sensorRealTimeValue.data);
//   return (
//     <div style={styles.container}>
//       <div style={styles.wrapper}>
//         {/* Visual change: Added Header */}
//         <div style={styles.header}>
//           <h1 style={styles.title}>Alarm Dashboard</h1>
//           <p style={styles.subtitle}>
//             Real-time monitoring and alerts for Data Center {dataCenterId}
//           </p>
//         </div>

//         {/* Visual change: Wrapped alert and controls in topBar */}
//         <div style={styles.topBar}>
//           {/* CRITICAL ALERT BANNER */}
//           <div style={styles.alertSection}>
//             {totalRequiredAlarmCount > 0 && (
//               <button
//                 onClick={handleCriticalAlertClick} // Use functional handler for navigation
//                 style={styles.criticalAlert}
//               >
//                 <AlertTriangle style={styles.alertIcon} />
//                 <div style={styles.alertContent}>
//                   <span style={styles.alertCount}>{totalRequiredAlarmCount}</span>
//                   <span style={styles.alertText}>Active Alarms - Immediate Attention Required</span>
//                 </div>
//               </button>
//             )}
//           </div>

//           {/* CONTROLS SECTION */}
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

//         {/* Visual change: Grid layout for sensor cards */}
//         <div style={styles.grid}>
//           {alarmFiltered?.map((item, index) => (
//             <button
//               key={index}
//               onClick={() => handleCardClick(item.sensorId)} // Use functional handler for navigation
//               style={{
//                 ...styles.card,
//                 ...(item.alarm > 0 ? styles.cardAlarm : {}),
//               }}
//               // Original component used Link, which is functionally a navigation/click.
//               // This button is the visual equivalent of the clickable box.
//             >
//               <div style={styles.cardHeader}>
//                 {item.alarm > 0 && (
//                   <div style={styles.alarmIndicator}>
//                     <AlertCircle style={styles.alarmIcon} />
//                   </div>
//                 )}
//                 <h3 style={styles.cardTitle}>{item.sensor_type_name}</h3>
//               </div>

//               <div style={styles.cardBody}>
//                 <div
//                   style={{
//                     ...styles.alarmCount,
//                     ...(item.alarm > 0 ? styles.alarmCountActive : {}),
//                   }}
//                 >
//                   {item.alarm || 0}
//                 </div>
//                 <p style={styles.alarmLabel}>
//                   {item.alarm === 1 ? 'Active Alarm' : 'Active Alarms'}
//                 </p>
//               </div>

//               {item.alarm > 0 && (
//                 <div style={styles.cardFooter}>
//                   <span style={styles.viewDetailsText}>View Details →</span>
//                 </div>
//               )}
//             </button>
//           ))}
//         </div>

//         {/* AUDIBLE ALARM PLAYER (hidden) and Visual Indicator */}
//         {shouldPlayAlarm && (
//           <>
//             {/* The audio player remains functional but hidden */}
//             <ReactAudioPlayer
//               src={sound}
//               autoPlay
//               controls
//               loop
//               muted={isMuteAlarm}
//               style={{ display: 'none' }}
//             />

//             {/* New: Visual alarm indicator added when playing and unmuted */}
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

// // --- VISUAL STYLES (COPIED VERBATIM) ---
// const styles = {
//   container: {
//     minHeight: '100vh',
//     background: 'linear-gradient(to bottom right, #f9fafb, #f3f4f6)',
//     padding: '32px 24px',
//   },
//   wrapper: {
//     maxWidth: '1400px',
//     margin: '0 auto',
//   },
//   header: {
//     marginBottom: '32px',
//   },
//   title: {
//     fontSize: '30px',
//     fontWeight: '600',
//     color: '#111827',
//     marginBottom: '8px',
//   },
//   subtitle: {
//     fontSize: '14px',
//     color: '#6b7280',
//   },
//   topBar: {
//     display: 'flex',
//     flexDirection: 'column',
//     gap: '16px',
//     marginBottom: '32px',
//   },
//   alertSection: {
//     flex: 1,
//   },
//   criticalAlert: {
//     display: 'flex',
//     alignItems: 'center',
//     gap: '16px',
//     padding: '20px 24px',
//     backgroundColor: '#fef2f2',
//     border: '2px solid #fecaca',
//     borderRadius: '12px',
//     cursor: 'pointer',
//     transition: 'all 0.2s',
//     boxShadow: '0 4px 6px rgba(239, 68, 68, 0.1)',
//     width: '100%',
//     // Ensuring it functions like a Link
//     textDecoration: 'none',
//     textAlign: 'left',
//   },
//   alertIcon: {
//     width: '32px',
//     height: '32px',
//     color: '#dc2626',
//     flexShrink: 0,
//   },
//   alertContent: {
//     display: 'flex',
//     alignItems: 'center',
//     gap: '12px',
//   },
//   alertCount: {
//     fontSize: '28px',
//     fontWeight: '700',
//     color: '#dc2626',
//   },
//   alertText: {
//     fontSize: '16px',
//     fontWeight: '600',
//     color: '#991b1b',
//   },
//   controlsSection: {
//     display: 'flex',
//     gap: '12px',
//     justifyContent: 'flex-end',
//     flexWrap: 'wrap',
//   },
//   button: {
//     display: 'flex',
//     alignItems: 'center',
//     gap: '8px',
//     padding: '12px 20px',
//     fontSize: '14px',
//     fontWeight: '600',
//     borderRadius: '8px',
//     border: 'none',
//     cursor: 'pointer',
//     transition: 'all 0.2s',
//     whiteSpace: 'nowrap',
//   },
//   buttonSecondary: {
//     backgroundColor: '#f3f4f6',
//     color: '#374151',
//   },
//   buttonDanger: {
//     backgroundColor: '#dc2626',
//     color: 'white',
//   },
//   buttonMuted: {
//     backgroundColor: '#6b7280',
//     color: 'white',
//   },
//   buttonIcon: {
//     width: '18px',
//     height: '18px',
//   },
//   grid: {
//     display: 'grid',
//     gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
//     gap: '20px',
//   },
//   card: {
//     display: 'flex',
//     flexDirection: 'column',
//     backgroundColor: 'white',
//     border: '2px solid #e5e7eb',
//     borderRadius: '12px',
//     padding: '24px',
//     cursor: 'pointer',
//     transition: 'all 0.2s',
//     position: 'relative',
//     overflow: 'hidden',
//     textAlign: 'left',
//     // Ensuring it functions like a Link
//     textDecoration: 'none',
//   },
//   cardAlarm: {
//     backgroundColor: '#fef2f2',
//     borderColor: '#fca5a5',
//     boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)',
//   },
//   cardHeader: {
//     display: 'flex',
//     alignItems: 'center',
//     gap: '12px',
//     marginBottom: '20px',
//   },
//   alarmIndicator: {
//     width: '40px',
//     height: '40px',
//     backgroundColor: '#fee2e2',
//     borderRadius: '50%',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   alarmIcon: {
//     width: '24px',
//     height: '24px',
//     color: '#dc2626',
//   },
//   cardTitle: {
//     fontSize: '16px',
//     fontWeight: '600',
//     color: '#111827',
//     margin: 0,
//   },
//   cardBody: {
//     textAlign: 'center',
//     padding: '20px 0',
//   },
//   alarmCount: {
//     fontSize: '56px',
//     fontWeight: '700',
//     color: '#9ca3af',
//     lineHeight: '1',
//     marginBottom: '8px',
//   },
//   alarmCountActive: {
//     color: '#dc2626',
//   },
//   alarmLabel: {
//     fontSize: '14px',
//     color: '#6b7280',
//     margin: 0,
//   },
//   cardFooter: {
//     marginTop: '16px',
//     paddingTop: '16px',
//     borderTop: '1px solid #fecaca',
//   },
//   viewDetailsText: {
//     fontSize: '14px',
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
//   audioIcon: {
//     width: '20px',
//     height: '20px',
//   },
//   audioText: {
//     fontSize: '14px',
//     fontWeight: '600',
//   },
// };

// export default Home;

// db realtime check
import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import ReactAudioPlayer from 'react-audio-player';
import { Volume2, VolumeX, AlertTriangle, AlertCircle } from 'lucide-react';
import { useSelector } from 'react-redux';

import { fetchDataCenterCount } from '../api/settings/dataCenterApi';
import sound from '../assets/sounds/alarm.mp3';
import { fetchSensorThreshold, fetchSensorType, fetchStateConfig } from '../api/dashboardTabApi';
import { errorMessage } from '../api/api-config/apiResponseMessage';
import { userContext } from '../context/UserContext';
import {
  fetchSensorRealTimeValueByDataCenter,
  fetchDiagramSVG,
} from '../api/settings/dataCenterApi';

const Home = () => {
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
  const prevAlarmCountRef = React.useRef(0); // Track previous alarm count for auto-unmute

  const [allowedSensorIds] = useState(new Set([1, 2]));
  const [allowedSmokeAndWaterSensorIds] = useState(new Set([3, 4, 5, 6]));

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
  // ✅ Works for both single DC and all DCs
  // ✅ Immediately updates only the sensors that changed
  // ============================================================
  useEffect(() => {
    if (!incommingMQTTData?.length || !threshold.length) return;

    // Filter MQTT data to only the DCs the user can see
    const relevantMQTTItems = incommingMQTTData.filter((item) =>
      effectiveDataCenterIds.includes(item.dc_id)
    );

    if (!relevantMQTTItems.length) return;

    // Process each DC's latest MQTT message
    relevantMQTTItems.forEach((latest) => {
      if (!latest.sensor_types?.length) return;

      // Skip if all sensor types have empty sensors
      if (latest.sensor_types.every((st) => !st.sensors?.length)) return;

      // Filter to only allowed sensor type IDs (1, 2)
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

            // ✅ Derive status from threshold_name by comparing sensor val
            // Thresholds are sorted ascending; find which band the value falls into
            const sortedThresholds = [...matchedThresholds].sort(
              (a, b) => a.threshold - b.threshold
            );
            let derivedStatus =
              sortedThresholds.length > 0
                ? sortedThresholds[sortedThresholds.length - 1].threshold_name // default: highest band
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
              status: derivedStatus, // ✅ Mapped from threshold, not raw MQTT field
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

              // ✅ Preserve sensor_name and location from DB, update val and status from MQTT
              const updatedSensor = {
                ...newSensor,
                sensor_name: oldSensor?.sensor_name || newSensor.sensor_name,
                location: oldSensor?.location || newSensor.location,
              };

              if (sensorIndex >= 0) {
                // Log only changed sensors
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

        // ✅ Clean, focused log — only when something actually changed
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
  // ✅ Same pattern: works for all DCs, logs only changes
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
            // ✅ Derive status from stateConfig by matching sensor val
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
              status: matchedState?.state_name || null, // ✅ Mapped from stateConfig, not raw MQTT field
            };
          })
          .filter((sensor) => sensor.status !== null); // Only keep sensors with a known state

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

        // ✅ Clean, focused log — only when something actually changed
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

    // ✅ Auto-unmute when a NEW alarm arrives while sound is muted
    // Detects by comparing current count to previous count via ref
    if (totalCount > prevAlarmCountRef.current) {
      console.log(
        `🔔 New alarm detected (${prevAlarmCountRef.current} → ${totalCount}) — auto-unmuting`
      );
      setIsMuteAlarm(false);
    }

    // Always keep ref in sync with latest alarm count
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
              <span style={{ color: '#10b981', marginLeft: '10px' }}>🟢 Live MQTT</span>
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
    padding: '20px 24px',
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
    border: 'none',
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
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'white',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: '#e5e7eb',
    borderRadius: '12px',
    padding: '24px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    position: 'relative',
    overflow: 'hidden',
    textAlign: 'left',
    textDecoration: 'none',
  },
  cardAlarm: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)',
  },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' },
  alarmIndicator: {
    width: '40px',
    height: '40px',
    backgroundColor: '#fee2e2',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alarmIcon: { width: '24px', height: '24px', color: '#dc2626' },
  cardTitle: { fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 },
  cardBody: { textAlign: 'center', padding: '20px 0' },
  alarmCount: {
    fontSize: '56px',
    fontWeight: '700',
    color: '#9ca3af',
    lineHeight: '1',
    marginBottom: '8px',
  },
  alarmCountActive: { color: '#dc2626' },
  alarmLabel: { fontSize: '14px', color: '#6b7280', margin: 0 },
  cardFooter: { marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #fecaca' },
  viewDetailsText: { fontSize: '14px', fontWeight: '600', color: '#dc2626' },
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

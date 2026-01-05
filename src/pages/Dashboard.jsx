// import React, { useContext, useEffect, useState, useMemo, useRef } from 'react';
// import { useFormik } from 'formik';
// import * as Yup from 'yup';
// import DynamicSelectField from '../components/DynamicSelectField';
// import { errorMessage } from './../api/api-config/apiResponseMessage';

// import { fetchDiagramSVG, getUserDataCenters } from '../api/settings/dataCenterApi';
// import { userContext } from '../context/UserContext';
// import { useDispatch, useSelector } from 'react-redux';
// import { SLD } from './../components/tabs/SLD.component';
// import Sensor from './../components/tabs/Sensor.component';
// import DieselGenerator from './../components/tabs/DieselGenerator.component';
// import FuelTank from './../components/tabs/FuelTank.component';
// import PAC from './../components/tabs/PAC.component';
// import UPS from './../components/tabs/UPS.component';
// import Rectifire from './../components/tabs/Rectifire.component';
// import Bettery from './../components/tabs/Bettery.component';
// import { ablyAPI } from '../api/ablyAPI';
// import { fetchSensorThreshold, fetchSensorType, fetchStateConfig } from '../api/dashboardTabApi';
// import { setAlarmedSensors } from '../redux/features/dashboard/alarmedSensorDataSlice';
// import { Control } from '../components/tabs/Control.component';
// import { buildLiveSLDData } from '../utils/mqttDataParsing';

// const Dashboard = () => {
//   const incommingMQTTData = useSelector((state) => state.mqtt.data);
//   const { user } = useContext(userContext);
//   const dispatch = useDispatch();
//   const tabList = useSelector((state) => state.tablist.tabs);
//   const dataCenterId = useSelector((state) => state.updatedDataCenter.dataCenter);
//   const [activeTab, setActiveTab] = useState(null);

//   const [liveSensorData, setLiveSensorData] = useState(null);
//   const [liveSomkeAndWaterSensorData, setLiveSomkeAndWaterSensorData] = useState(null);
//   const [liveSLDSensorData, setLiveSLDSensorData] = useState(null);
//   const [liveControlSensorData, setLiveControlSensorData] = useState(null);

//   const [sensorType, setSensorType] = useState([]);
//   const [threshold, setThreshold] = useState([]);
//   const [stateConfig, setStateConfig] = useState([]);
//   const [diagramContent, setDiagramContent] = useState([]);

//   // sesor Type
//   const [allowedSensorIds, setAllowedSensorIds] = useState(new Set([1, 2]));
//   const [allowedSmokeAndWaterSensorIds, setAllowedSmokeAndWaterSensorIds] = useState(
//     new Set([4, 5])
//   );
//   const [allowedSLDIds, setAllowedSLDIds] = useState(new Set([3]));
//   const [allowedControlIds, setAllowedControlIds] = useState(new Set([6]));
//   const [allowedDieselGenaratorIds, setAllowedDieselGenaratorIds] = useState(new Set([1, 2]));

//   useEffect(() => {
//     setActiveTab(null);
//     if (tabList && tabList.length > 0) {
//       setActiveTab(tabList[0].id);
//     }
//   }, [tabList]);

//   useEffect(() => {
//     if (dataCenterId != null) {
//       Promise.all([
//         fetchSensorThreshold(dataCenterId),
//         fetchSensorType(dataCenterId),
//         fetchStateConfig(dataCenterId),
//         fetchDiagramSVG(dataCenterId),
//       ])
//         .then(([thresholdRes, sensorTypeRes, stateRes, diagramSvg]) => {
//           setThreshold(thresholdRes);
//           setSensorType(sensorTypeRes);
//           setStateConfig(stateRes);
//           setDiagramContent(diagramSvg.data);
//         })
//         .catch(errorMessage);
//     }
//   }, [dataCenterId]);

//   useEffect(() => {
//     if (incommingMQTTData?.length > 0 && dataCenterId && threshold.length) {
//       const filteredDataCenter = incommingMQTTData.filter((item) => item.dc_id === dataCenterId);
//       if (filteredDataCenter.length === 0) {
//         console.warn(`⚠️ No matching MQTT data found for dataCenterId: ${dataCenterId}`);
//         setLiveSensorData([]);
//         return;
//       }
//       const latest = filteredDataCenter[filteredDataCenter.length - 1];
//       if (latest.dc_id === dataCenterId) {
//         const matchedSensorType = {
//           ...latest,
//           sensor_types: (latest.sensor_types || []).filter((item) =>
//             allowedSensorIds?.has(item.id)
//           ),
//         };

//         const enriched = {
//           ...matchedSensorType,
//           sensor_types: matchedSensorType.sensor_types.map((sensorType) => {
//             const typeThreshold = threshold.find(
//               (th) => th.sensor_type === sensorType.id && th.dc_id === matchedSensorType.dc_id
//             );

//             const sensor_type_name = typeThreshold?.sensor_type_name || null;

//             return {
//               ...sensorType,
//               sensor_type_name,

//               sensors: sensorType.sensors
//                 .filter((sensor) =>
//                   threshold.some(
//                     (th) =>
//                       th.sensor_id === sensor.id &&
//                       th.dc_id === matchedSensorType.dc_id &&
//                       th.sensor_type === sensorType.id
//                   )
//                 )
//                 .map((sensor) => {
//                   const matchedThresholds = threshold
//                     .filter(
//                       (th) =>
//                         th.sensor_id === sensor.id &&
//                         th.dc_id === matchedSensorType.dc_id &&
//                         th.sensor_type === sensorType.id
//                     )
//                     .map((th) => ({
//                       threshold: th.threshold,
//                       threshold_name: th.threshold_name,
//                       color: th.color,
//                     }));
//                   return {
//                     ...sensor,
//                     thresholds: matchedThresholds ?? [],
//                   };
//                 }),
//             };
//           }),
//         };

//         setLiveSensorData(enriched);
//       }
//     }
//   }, [incommingMQTTData, dataCenterId, threshold]);

//   useEffect(() => {
//     if (!incommingMQTTData?.length || !dataCenterId || !stateConfig.length) return;

//     const filteredDataCenter = incommingMQTTData.filter((item) => item.dc_id === dataCenterId);

//     if (!filteredDataCenter.length) {
//       console.warn(`⚠️ No matching MQTT data found for dataCenterId: ${dataCenterId}`);
//       return; // Don't reset state — just skip update
//     }

//     const latest = filteredDataCenter[filteredDataCenter.length - 1];

//     if (!latest || !latest.sensor_types?.length) return;

//     const filteredSensorTypes = latest.sensor_types.filter((sensorType) =>
//       allowedSmokeAndWaterSensorIds.has(sensorType.id)
//     );

//     if (!filteredSensorTypes.length) return; // No relevant sensor types

//     const enrichedSensorTypes = filteredSensorTypes.map((sensorType) => {
//       const sensor_type_name =
//         stateConfig.find((state) => state.type_id === sensorType.id)?.type_name || null;

//       const filteredSensors = sensorType.sensors
//         .filter((sensor) =>
//           stateConfig.some(
//             (state) =>
//               state.sensor_id === sensor.id &&
//               state.type_id === sensorType.id &&
//               state.state_value === sensor.val
//           )
//         )
//         .map((sensor) => {
//           const matchedStates = stateConfig.filter(
//             (state) =>
//               state.sensor_id === sensor.id &&
//               state.type_id === sensorType.id &&
//               state.state_value === sensor.val
//           );

//           return {
//             ...sensor,
//             ...(matchedStates[0] && {
//               state_name: matchedStates[0].state_name,
//               color: matchedStates[0].color,
//               location: matchedStates[0].location,
//             }),
//           };
//         });

//       return {
//         ...sensorType,
//         sensor_type_name,
//         sensors: filteredSensors,
//       };
//     });
//     const hasValidSensors = enrichedSensorTypes.some((st) => st.sensors?.length);
//     if (!hasValidSensors) return;

//     const enriched = {
//       ...latest,
//       sensor_types: enrichedSensorTypes,
//     };

//     setLiveSomkeAndWaterSensorData(enriched);
//   }, [incommingMQTTData, dataCenterId, stateConfig]);

//   // SLD
//   // combine two device
//   // useEffect(() => {
//   //   if (incommingMQTTData?.length > 0 && dataCenterId && stateConfig.length) {
//   //     const filteredDataCenter = incommingMQTTData.filter((item) => item.dc_id === dataCenterId);

//   //     if (filteredDataCenter.length === 0) {
//   //       console.warn(`⚠️ No matching MQTT data found for dataCenterId: ${dataCenterId}`);
//   //       setLiveSLDSensorData([]);
//   //       return;
//   //     }

//   //     const sensorTypeMap = new Map();

//   //     filteredDataCenter.forEach((device) => {
//   //       device.sensor_types?.forEach((sensorType) => {
//   //         if (!allowedSLDIds?.has(sensorType.id)) return;

//   //         if (!sensorTypeMap.has(sensorType.id)) {
//   //           sensorTypeMap.set(sensorType.id, []);
//   //         }

//   //         const existingSensors = sensorTypeMap.get(sensorType.id);

//   //         sensorType.sensors?.forEach((sensor) => {
//   //           const existsInStateConfig = stateConfig.some(
//   //             (state) => state.type_id === sensorType.id && state.state_value === sensor.val
//   //           );

//   //           if (existsInStateConfig) {
//   //             const index = existingSensors.findIndex((s) => s.id === sensor.id);
//   //             if (index !== -1) {
//   //               existingSensors[index] = sensor; // Replace if exists
//   //             } else {
//   //               existingSensors.push(sensor); // Add new
//   //             }
//   //           }
//   //         });
//   //       });
//   //     });

//   //     const enrichedSensorTypes = [...sensorTypeMap.entries()].map(([typeId, sensors]) => {
//   //       const sensor_type_name =
//   //         stateConfig.find((state) => state.type_id === typeId)?.type_name || null;

//   //       const enrichedSensors = sensors.map((sensor) => {
//   //         const matched = stateConfig.find(
//   //           (state) => state.type_id === typeId && state.state_value === sensor.val
//   //         );

//   //         return {
//   //           ...sensor,
//   //           state_name: matched?.state_name || null,
//   //           color: matched?.color || null,
//   //           location: matched?.location || null,
//   //         };
//   //       });

//   //       return {
//   //         id: typeId,
//   //         sensor_type_name,
//   //         sensors: enrichedSensors,
//   //       };
//   //     });

//   //     setLiveSLDSensorData({
//   //       dc_id: dataCenterId,
//   //       sensor_types: enrichedSensorTypes,
//   //     });
//   //   }
//   // }, [incommingMQTTData, dataCenterId, stateConfig]);

//  useEffect(() => {
  
//   const liveData = buildLiveSLDData({
//     mqttData: incommingMQTTData,
//     dataCenterId,
//     sensorStateConfig: stateConfig, 
//     allowedSLDIds, 
//   });

//   if (!liveData) {
//     setLiveSLDSensorData(null);
//     return;
//   }

//   setLiveSLDSensorData(liveData);
// }, [incommingMQTTData, dataCenterId,stateConfig]);


//   // Contrls
//   useEffect(() => {
//     if (incommingMQTTData?.length > 0 && dataCenterId && stateConfig.length) {
//       const filteredDataCenter = incommingMQTTData.filter((item) => item.dc_id === dataCenterId);

//       if (filteredDataCenter.length === 0) {
//         console.warn(`⚠️ No matching MQTT data found for dataCenterId: ${dataCenterId}`);
//         setLiveControlSensorData([]);
//         return;
//       }

//       // ✅ Step 1: Build Map of sensorTypeId -> sensors[]
//       const sensorTypeMap = new Map();

//       filteredDataCenter.forEach((device) => {
//         device.sensor_types?.forEach((sensorType) => {
//           if (!allowedControlIds?.has(sensorType.id)) return;

//           if (!sensorTypeMap.has(sensorType.id)) {
//             sensorTypeMap.set(sensorType.id, []);
//           }

//           const existing = sensorTypeMap.get(sensorType.id);

//           sensorType.sensors?.forEach((sensor) => {
//             // ✅ Only include sensor if it matches stateConfig
//             const existsInStateConfig = stateConfig.some(
//               (state) =>
//                 state.type_id === sensorType.id &&
//                 state.sensor_id === sensor.id &&
//                 state.state_value === sensor.val
//             );

//             if (existsInStateConfig) {
//               const index = existing.findIndex((s) => s.id === sensor.id);
//               if (index !== -1) {
//                 existing[index] = sensor; // Replace
//               } else {
//                 existing.push(sensor);
//               }
//             }
//           });
//         });
//       });

//       // ✅ Step 2: Enrich valid sensors
//       const enrichedSensorTypes = [...sensorTypeMap.entries()].map(([typeId, sensors]) => {
//         const sensor_type_name = stateConfig.find((s) => s.type_id === typeId)?.type_name || null;

//         const enrichedSensors = sensors.map((sensor) => {
//           const matchedState = stateConfig.find(
//             (state) =>
//               state.type_id === typeId &&
//               state.sensor_id === sensor.id &&
//               state.state_value === sensor.val
//           );

//           return {
//             ...sensor,
//             state_name: matchedState?.state_name || null,
//             color: matchedState?.color || null,
//             location: matchedState?.location || null,
//             mode_type: matchedState?.mode_type || null,
//             paired_status: matchedState?.paired_status || null,
//             paired_sensors: matchedState?.paired_sensors || null,
//             on_time: matchedState?.on_time || null,
//             off_time: matchedState?.off_time || null,
//             duration: matchedState?.duration || null,
//             sensor_name: matchedState?.sensor_name || null,
//             runningDuration: matchedState?.runningDuration || null,
//             restDuration: matchedState?.restDuration || null,
//             days: matchedState?.day_names || null,
//           };
//         });

//         return {
//           id: typeId,
//           sensor_type_name,
//           sensors: enrichedSensors,
//         };
//       });

//       setLiveControlSensorData({
//         dc_id: dataCenterId,
//         sensor_types: enrichedSensorTypes,
//       });
//     }
//   }, [incommingMQTTData, dataCenterId, stateConfig]);

//   const tabContentMap = {
//     1: <SLD data={diagramContent} live={liveSLDSensorData?.sensor_types?.[0]} />,
//     2: <Sensor data={liveSensorData} smokeAndwaterData={liveSomkeAndWaterSensorData} />,
//     3: <DieselGenerator />,
//     4: <FuelTank />,
//     5: <PAC />,
//     6: <UPS />,
//     7: <Rectifire />,
//     8: <Bettery />,
//     9: <Control live={liveControlSensorData?.sensor_types?.[0]} />,
//   };
//   // console.log(threshold);
//   // console.log(incommingMQTTData);
//   // console.log('state-config: ---', stateConfig);
//   // console.log(liveSomkeAndWaterSensorData);
//   // console.log(diagramContent);
//   // console.log(updatedDataCenter);
//   // console.log(liveSensorData);
//   // console.log(dataCenterId);
//   // console.log(liveSLDSensorData);
//   // console.log(alarmSensors);
//   // console.log(liveControlSensorData?.sensor_types?.[0]);
//   // console.log(liveControlSensorData);
//   // console.log('sld', liveSLDSensorData);
//   // console.log('live data', incommingMQTTData);

//   return (
//     <section>
//       <div className="card">
//         <div className="card-header flex-column justify-content-between align-items-center">
//           <div className="d-flex  justify-content-between align-items-center"></div>
//           <ul className="nav nav-tabs card-header-tabs">
//             {tabList?.map((tab) => (
//               <li className="nav-item" key={tab.id}>
//                 <button
//                   className={`nav-link text-secondary rounded-bottom-0 fw-bold ${
//                     activeTab === tab.id ? 'active' : ''
//                   }`}
//                   onClick={() => setActiveTab(tab.id)}
//                 >
//                   {tab.name}
//                 </button>
//               </li>
//             ))}
//           </ul>
//         </div>

//         <div className="card-body" key={activeTab}>
//           {tabContentMap[activeTab] || <p>No content available for this tab.</p>}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Dashboard;

// // import React, { useEffect, useState } from "react";
// // import { Activity, Zap, Droplet, Battery, Gauge, Wind, Power, Shield, Settings } from "lucide-react";

// // // Mock components for demo
// // const SLD = ({ data, live }) => (
// //   <div style={styles.tabContent}>
// //     <div style={styles.metricsGrid}>
// //       <div style={{...styles.metricCard, ...styles.metricCardBlue}}>
// //         <div style={styles.metricHeader}>
// //           <h3 style={styles.metricTitle}>Main Bus</h3>
// //           <div style={styles.statusDot}></div>
// //         </div>
// //         <p style={styles.metricValue}>415V</p>
// //         <p style={styles.metricLabel}>Active</p>
// //       </div>
// //       <div style={{...styles.metricCard, ...styles.metricCardPurple}}>
// //         <div style={styles.metricHeader}>
// //           <h3 style={styles.metricTitle}>Load</h3>
// //           <Zap style={styles.metricIcon} />
// //         </div>
// //         <p style={styles.metricValue}>85%</p>
// //         <p style={styles.metricLabel}>Optimal Range</p>
// //       </div>
// //       <div style={{...styles.metricCard, ...styles.metricCardGreen}}>
// //         <div style={styles.metricHeader}>
// //           <h3 style={styles.metricTitle}>Power Factor</h3>
// //           <Gauge style={styles.metricIcon} />
// //         </div>
// //         <p style={styles.metricValue}>0.98</p>
// //         <p style={styles.metricLabel}>Excellent</p>
// //       </div>
// //     </div>
// //     <div style={styles.diagramContainer}>
// //       <div style={styles.placeholderContent}>
// //         <Activity style={styles.placeholderIcon} />
// //         <p style={styles.placeholderTitle}>Single Line Diagram</p>
// //         <p style={styles.placeholderText}>Real-time electrical distribution visualization</p>
// //       </div>
// //     </div>
// //   </div>
// // );

// // const Sensor = ({ data, smokeAndwaterData }) => (
// //   <div style={styles.sensorGrid}>
// //     {[
// //       { name: 'Temperature', value: '24.5°C', status: 'normal', color: 'blue' },
// //       { name: 'Humidity', value: '45%', status: 'normal', color: 'cyan' },
// //       { name: 'Smoke Detector', value: 'Clear', status: 'safe', color: 'green' },
// //       { name: 'Water Leak', value: 'None', status: 'safe', color: 'green' }
// //     ].map((sensor, idx) => (
// //       <div key={idx} style={{...styles.sensorCard, ...styles[`sensorCard${sensor.color.charAt(0).toUpperCase() + sensor.color.slice(1)}`]}}>
// //         <div style={styles.sensorHeader}>
// //           <Activity style={styles.sensorIcon} />
// //           <span style={{...styles.statusBadge, ...(sensor.status === 'normal' ? styles.statusBadgeBlue : styles.statusBadgeGreen)}}>
// //             {sensor.status}
// //           </span>
// //         </div>
// //         <p style={styles.sensorName}>{sensor.name}</p>
// //         <p style={styles.sensorValue}>{sensor.value}</p>
// //       </div>
// //     ))}
// //   </div>
// // );

// // const DieselGenerator = () => (
// //   <div style={styles.generatorLayout}>
// //     <div style={styles.generatorMain}>
// //       <h3 style={styles.sectionTitle}>Generator Status</h3>
// //       <div style={styles.statusGrid}>
// //         {[
// //           { label: 'Status', value: 'Standby' },
// //           { label: 'Voltage', value: '415V' },
// //           { label: 'Frequency', value: '50Hz' },
// //           { label: 'Load', value: '0%' }
// //         ].map((item, idx) => (
// //           <div key={idx} style={styles.statusItem}>
// //             <p style={styles.statusLabel}>{item.label}</p>
// //             <p style={styles.statusValue}>{item.value}</p>
// //           </div>
// //         ))}
// //       </div>
// //     </div>
// //     <div style={styles.runtimeCard}>
// //       <Zap style={styles.runtimeIcon} />
// //       <h3 style={styles.runtimeTitle}>Runtime Today</h3>
// //       <p style={styles.runtimeValue}>0h 0m</p>
// //       <p style={styles.runtimeLabel}>Last run: 2 days ago</p>
// //     </div>
// //   </div>
// // );

// // const FuelTank = () => (
// //   <div style={styles.fuelLayout}>
// //     <div style={styles.fuelTankContainer}>
// //       <h3 style={styles.sectionTitle}>Fuel Level</h3>
// //       <div style={styles.tankVisual}>
// //         <div style={styles.tankFill}></div>
// //         <div style={styles.tankOverlay}>
// //           <p style={styles.tankPercentage}>75%</p>
// //           <p style={styles.tankLiters}>1,125 Liters</p>
// //         </div>
// //       </div>
// //     </div>
// //     <div style={styles.fuelMetrics}>
// //       <div style={styles.consumptionCard}>
// //         <h3 style={styles.metricSmallTitle}>Consumption Rate</h3>
// //         <p style={styles.metricLargeValue}>12 L/hr</p>
// //         <p style={styles.metricSmallLabel}>Average</p>
// //       </div>
// //       <div style={styles.runtimeEstimateCard}>
// //         <h3 style={styles.metricSmallTitle}>Estimated Runtime</h3>
// //         <p style={styles.metricLargeValue}>94 hours</p>
// //         <p style={styles.metricSmallLabel}>At current load</p>
// //       </div>
// //     </div>
// //   </div>
// // );

// // const PAC = () => (
// //   <div style={styles.pacGrid}>
// //     {['Unit A', 'Unit B', 'Unit C'].map((unit, idx) => (
// //       <div key={idx} style={styles.unitCard}>
// //         <div style={styles.unitHeader}>
// //           <h3 style={styles.unitTitle}>{unit}</h3>
// //           <Wind style={styles.unitIcon} />
// //         </div>
// //         <div style={styles.unitStats}>
// //           {[
// //             { label: 'Status', value: 'Running', color: '#10b981' },
// //             { label: 'Temperature', value: '22°C', color: '#111827' },
// //             { label: 'Power', value: '8.5 kW', color: '#111827' }
// //           ].map((stat, i) => (
// //             <div key={i} style={styles.unitStat}>
// //               <span style={styles.unitStatLabel}>{stat.label}</span>
// //               <span style={{...styles.unitStatValue, color: stat.color}}>{stat.value}</span>
// //             </div>
// //           ))}
// //         </div>
// //       </div>
// //     ))}
// //   </div>
// // );

// // const UPS = () => (
// //   <div style={styles.upsLayout}>
// //     <div style={styles.upsMain}>
// //       <h3 style={styles.sectionTitle}>UPS Status</h3>
// //       <div style={styles.upsGrid}>
// //         {[
// //           { label: 'Input', value: '415V' },
// //           { label: 'Output', value: '415V' },
// //           { label: 'Load', value: '68%' },
// //           { label: 'Battery', value: '100%' }
// //         ].map((item, idx) => (
// //           <div key={idx} style={styles.upsItem}>
// //             <p style={styles.upsLabel}>{item.label}</p>
// //             <p style={styles.upsValue}>{item.value}</p>
// //           </div>
// //         ))}
// //       </div>
// //       <div style={styles.upsModeCard}>
// //         <p style={styles.upsMode}>Mode: Online</p>
// //         <p style={styles.upsModeDesc}>Running on mains power</p>
// //       </div>
// //     </div>
// //     <div style={styles.backupCard}>
// //       <Battery style={styles.backupIcon} />
// //       <h3 style={styles.backupTitle}>Backup Time</h3>
// //       <p style={styles.backupValue}>45 min</p>
// //       <p style={styles.backupLabel}>At current load</p>
// //     </div>
// //   </div>
// // );

// // const Rectifier = () => (
// //   <div style={styles.rectifierLayout}>
// //     <div style={styles.rectifierCard}>
// //       <h3 style={styles.sectionTitle}>Input</h3>
// //       <div style={styles.rectifierStats}>
// //         {[
// //           { label: 'Voltage', value: '415V AC' },
// //           { label: 'Current', value: '45A' },
// //           { label: 'Frequency', value: '50Hz' }
// //         ].map((item, idx) => (
// //           <div key={idx} style={styles.rectifierStat}>
// //             <span style={styles.rectifierLabel}>{item.label}</span>
// //             <span style={styles.rectifierValue}>{item.value}</span>
// //           </div>
// //         ))}
// //       </div>
// //     </div>
// //     <div style={styles.rectifierCard}>
// //       <h3 style={styles.sectionTitle}>Output</h3>
// //       <div style={styles.rectifierStats}>
// //         {[
// //           { label: 'Voltage', value: '48V DC' },
// //           { label: 'Current', value: '120A' },
// //           { label: 'Power', value: '5.76 kW' }
// //         ].map((item, idx) => (
// //           <div key={idx} style={styles.rectifierStat}>
// //             <span style={styles.rectifierLabel}>{item.label}</span>
// //             <span style={styles.rectifierValue}>{item.value}</span>
// //           </div>
// //         ))}
// //       </div>
// //     </div>
// //   </div>
// // );

// // const BatteryComponent = () => (
// //   <div style={styles.batteryLayout}>
// //     {['Bank A', 'Bank B'].map((bank, idx) => (
// //       <div key={idx} style={styles.batteryCard}>
// //         <h3 style={styles.sectionTitle}>{bank}</h3>
// //         <div style={styles.batteryCharge}>
// //           <p style={styles.chargeLabel}>Charge Level</p>
// //           <p style={styles.chargeValue}>{idx === 0 ? '98%' : '97%'}</p>
// //         </div>
// //         <div style={styles.batteryMetrics}>
// //           <div style={styles.batteryMetric}>
// //             <p style={styles.batteryMetricLabel}>Voltage</p>
// //             <p style={styles.batteryMetricValue}>{idx === 0 ? '54.2V' : '54.0V'}</p>
// //           </div>
// //           <div style={styles.batteryMetric}>
// //             <p style={styles.batteryMetricLabel}>Current</p>
// //             <p style={styles.batteryMetricValue}>{idx === 0 ? '12A' : '11A'}</p>
// //           </div>
// //         </div>
// //       </div>
// //     ))}
// //     <div style={styles.healthCard}>
// //       <Shield style={styles.healthIcon} />
// //       <h3 style={styles.healthTitle}>Health Status</h3>
// //       <p style={styles.healthValue}>Excellent</p>
// //       <p style={styles.healthLabel}>Last tested: 3 days ago</p>
// //     </div>
// //   </div>
// // );

// // const Control = ({ live }) => (
// //   <div style={styles.controlGrid}>
// //     {[
// //       { name: 'Main Switch', status: 'ON', color: 'green' },
// //       { name: 'Generator Control', status: 'AUTO', color: 'blue' },
// //       { name: 'HVAC Control', status: 'ON', color: 'green' },
// //       { name: 'Lighting Zone 1', status: 'ON', color: 'green' }
// //     ].map((control, idx) => (
// //       <div key={idx} style={styles.controlCard}>
// //         <div style={styles.controlHeader}>
// //           <Settings style={styles.controlIcon} />
// //           <div style={{...styles.controlDot, backgroundColor: control.color === 'green' ? '#10b981' : '#3b82f6'}}></div>
// //         </div>
// //         <p style={styles.controlName}>{control.name}</p>
// //         <p style={{...styles.controlStatus, color: control.color === 'green' ? '#10b981' : '#3b82f6'}}>
// //           {control.status}
// //         </p>
// //         <button style={styles.controlButton}>Toggle</button>
// //       </div>
// //     ))}
// //   </div>
// // );

// // const mockTabList = [
// //   { id: 1, name: 'SLD' },
// //   { id: 2, name: 'Sensors' },
// //   { id: 3, name: 'Diesel Generator' },
// //   { id: 4, name: 'Fuel Tank' },
// //   { id: 5, name: 'PAC' },
// //   { id: 6, name: 'UPS' },
// //   { id: 7, name: 'Rectifier' },
// //   { id: 8, name: 'Battery' },
// //   { id: 9, name: 'Control' }
// // ];

// // const Dashboard = () => {
// //   const [tabList] = useState(mockTabList);
// //   const [activeTab, setActiveTab] = useState(null);

// //   useEffect(() => {
// //     if (tabList && tabList.length > 0) {
// //       setActiveTab(tabList[0].id);
// //     }
// //   }, [tabList]);

// //   const tabContentMap = {
// //     1: <SLD />,
// //     2: <Sensor />,
// //     3: <DieselGenerator />,
// //     4: <FuelTank />,
// //     5: <PAC />,
// //     6: <UPS />,
// //     7: <Rectifier />,
// //     8: <BatteryComponent />,
// //     9: <Control />
// //   };

// //   return (
// //     <div style={styles.container}>
// //       <div style={styles.wrapper}>
// //         <div style={styles.header}>
// //           <h1 style={styles.title}>Data Center Dashboard</h1>
// //           <p style={styles.subtitle}>Real-time monitoring and control</p>
// //         </div>

// //         <div style={styles.tabContainer}>
// //           <div style={styles.tabList}>
// //             {tabList?.map((tab, index) => (
// //               <button
// //                 key={tab.id}
// //                 onClick={() => setActiveTab(tab.id)}
// //                 style={{
// //                   ...styles.tab,
// //                   ...(activeTab === tab.id ? styles.tabActive : {}),
// //                   ...(index !== 0 ? styles.tabBorder : {})
// //                 }}
// //               >
// //                 <span style={styles.tabText}>{tab.name}</span>
// //                 {activeTab === tab.id && <div style={styles.tabIndicator}></div>}
// //               </button>
// //             ))}
// //           </div>
// //         </div>

// //         <div style={styles.content}>
// //           {tabContentMap[activeTab] || (
// //             <div style={styles.emptyState}>
// //               <div style={styles.emptyStateContent}>
// //                 <p style={styles.emptyStateTitle}>No content available</p>
// //                 <p style={styles.emptyStateText}>Please select a valid tab</p>
// //               </div>
// //             </div>
// //           )}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // const styles = {
// //   container: {
// //     minHeight: '100vh',
// //     background: 'linear-gradient(to bottom right, #f9fafb, #f3f4f6)',
// //   },
// //   wrapper: {
// //     maxWidth: '1800px',
// //     margin: '0 auto',
// //     padding: '32px 24px',
// //   },
// //   header: {
// //     marginBottom: '32px',
// //   },
// //   title: {
// //     fontSize: '30px',
// //     fontWeight: '600',
// //     color: '#111827',
// //     marginBottom: '8px',
// //   },
// //   subtitle: {
// //     fontSize: '14px',
// //     color: '#6b7280',
// //   },
// //   tabContainer: {
// //     backgroundColor: 'white',
// //     borderRadius: '12px',
// //     boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
// //     border: '1px solid #e5e7eb',
// //     overflow: 'hidden',
// //     marginBottom: '24px',
// //   },
// //   tabList: {
// //     display: 'flex',
// //     borderBottom: '1px solid #e5e7eb',
// //   },
// //   tab: {
// //     position: 'relative',
// //     flex: 1,
// //     padding: '16px 24px',
// //     fontSize: '14px',
// //     fontWeight: '600',
// //     color: '#6b7280',
// //     backgroundColor: 'transparent',
// //     border: 'none',
// //     cursor: 'pointer',
// //     transition: 'all 0.2s',
// //     whiteSpace: 'nowrap',
// //   },
// //   tabActive: {
// //     color: '#2563eb',
// //     backgroundColor: '#eff6ff',
// //   },
// //   tabBorder: {
// //     borderLeft: '1px solid #e5e7eb',
// //   },
// //   tabText: {
// //     position: 'relative',
// //     zIndex: 10,
// //   },
// //   tabIndicator: {
// //     position: 'absolute',
// //     bottom: 0,
// //     left: 0,
// //     right: 0,
// //     height: '3px',
// //     background: 'linear-gradient(to right, #3b82f6, #2563eb)',
// //   },
// //   content: {
// //     transition: 'all 0.3s',
// //   },
// //   emptyState: {
// //     backgroundColor: 'white',
// //     borderRadius: '12px',
// //     border: '1px solid #e5e7eb',
// //     padding: '48px',
// //   },
// //   emptyStateContent: {
// //     display: 'flex',
// //     flexDirection: 'column',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     height: '256px',
// //   },
// //   emptyStateTitle: {
// //     color: '#6b7280',
// //     fontWeight: '500',
// //   },
// //   emptyStateText: {
// //     fontSize: '14px',
// //     color: '#9ca3af',
// //     marginTop: '4px',
// //   },
// //   tabContent: {
// //     display: 'flex',
// //     flexDirection: 'column',
// //     gap: '16px',
// //   },
// //   metricsGrid: {
// //     display: 'grid',
// //     gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
// //     gap: '16px',
// //   },
// //   metricCard: {
// //     borderRadius: '8px',
// //     padding: '24px',
// //     border: '1px solid',
// //   },
// //   metricCardBlue: {
// //     background: 'linear-gradient(to bottom right, #eff6ff, #dbeafe)',
// //     borderColor: '#bfdbfe',
// //   },
// //   metricCardPurple: {
// //     background: 'linear-gradient(to bottom right, #faf5ff, #f3e8ff)',
// //     borderColor: '#e9d5ff',
// //   },
// //   metricCardGreen: {
// //     background: 'linear-gradient(to bottom right, #f0fdf4, #dcfce7)',
// //     borderColor: '#bbf7d0',
// //   },
// //   metricHeader: {
// //     display: 'flex',
// //     alignItems: 'center',
// //     justifyContent: 'space-between',
// //     marginBottom: '16px',
// //   },
// //   metricTitle: {
// //     fontSize: '14px',
// //     fontWeight: '500',
// //     color: '#111827',
// //   },
// //   statusDot: {
// //     width: '12px',
// //     height: '12px',
// //     backgroundColor: '#10b981',
// //     borderRadius: '50%',
// //   },
// //   metricIcon: {
// //     width: '20px',
// //     height: '20px',
// //   },
// //   metricValue: {
// //     fontSize: '28px',
// //     fontWeight: '600',
// //     color: '#111827',
// //   },
// //   metricLabel: {
// //     fontSize: '12px',
// //     color: '#374151',
// //     marginTop: '4px',
// //   },
// //   diagramContainer: {
// //     backgroundColor: 'white',
// //     borderRadius: '8px',
// //     border: '1px solid #e5e7eb',
// //     padding: '32px',
// //   },
// //   placeholderContent: {
// //     display: 'flex',
// //     flexDirection: 'column',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     height: '384px',
// //   },
// //   placeholderIcon: {
// //     width: '64px',
// //     height: '64px',
// //     color: '#d1d5db',
// //     marginBottom: '16px',
// //   },
// //   placeholderTitle: {
// //     color: '#111827',
// //     fontWeight: '600',
// //     fontSize: '18px',
// //   },
// //   placeholderText: {
// //     fontSize: '14px',
// //     color: '#6b7280',
// //     marginTop: '8px',
// //   },
// //   sensorGrid: {
// //     display: 'grid',
// //     gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
// //     gap: '16px',
// //   },
// //   sensorCard: {
// //     borderRadius: '8px',
// //     padding: '24px',
// //     border: '1px solid',
// //   },
// //   sensorCardBlue: {
// //     background: 'linear-gradient(to bottom right, #eff6ff, #dbeafe)',
// //     borderColor: '#bfdbfe',
// //   },
// //   sensorCardCyan: {
// //     background: 'linear-gradient(to bottom right, #ecfeff, #cffafe)',
// //     borderColor: '#a5f3fc',
// //   },
// //   sensorCardGreen: {
// //     background: 'linear-gradient(to bottom right, #f0fdf4, #dcfce7)',
// //     borderColor: '#bbf7d0',
// //   },
// //   sensorHeader: {
// //     display: 'flex',
// //     alignItems: 'center',
// //     justifyContent: 'space-between',
// //     marginBottom: '16px',
// //   },
// //   sensorIcon: {
// //     width: '24px',
// //     height: '24px',
// //   },
// //   statusBadge: {
// //     padding: '4px 8px',
// //     borderRadius: '9999px',
// //     fontSize: '12px',
// //     fontWeight: '500',
// //   },
// //   statusBadgeBlue: {
// //     backgroundColor: '#bfdbfe',
// //     color: '#1e40af',
// //   },
// //   statusBadgeGreen: {
// //     backgroundColor: '#bbf7d0',
// //     color: '#166534',
// //   },
// //   sensorName: {
// //     fontSize: '14px',
// //     fontWeight: '500',
// //     marginBottom: '4px',
// //   },
// //   sensorValue: {
// //     fontSize: '28px',
// //     fontWeight: '600',
// //   },
// //   generatorLayout: {
// //     display: 'grid',
// //     gridTemplateColumns: '2fr 1fr',
// //     gap: '24px',
// //   },
// //   generatorMain: {
// //     backgroundColor: 'white',
// //     borderRadius: '8px',
// //     border: '1px solid #e5e7eb',
// //     padding: '32px',
// //   },
// //   sectionTitle: {
// //     fontSize: '18px',
// //     fontWeight: '600',
// //     color: '#111827',
// //     marginBottom: '24px',
// //   },
// //   statusGrid: {
// //     display: 'grid',
// //     gridTemplateColumns: 'repeat(4, 1fr)',
// //     gap: '16px',
// //   },
// //   statusItem: {
// //     textAlign: 'center',
// //     padding: '16px',
// //     backgroundColor: '#f9fafb',
// //     borderRadius: '8px',
// //   },
// //   statusLabel: {
// //     fontSize: '12px',
// //     color: '#6b7280',
// //     marginBottom: '8px',
// //   },
// //   statusValue: {
// //     fontSize: '20px',
// //     fontWeight: '600',
// //     color: '#111827',
// //   },
// //   runtimeCard: {
// //     background: 'linear-gradient(to bottom right, #fff7ed, #ffedd5)',
// //     borderRadius: '8px',
// //     border: '1px solid #fed7aa',
// //     padding: '24px',
// //   },
// //   runtimeIcon: {
// //     width: '32px',
// //     height: '32px',
// //     color: '#ea580c',
// //     marginBottom: '16px',
// //   },
// //   runtimeTitle: {
// //     fontSize: '14px',
// //     fontWeight: '500',
// //     color: '#7c2d12',
// //     marginBottom: '8px',
// //   },
// //   runtimeValue: {
// //     fontSize: '36px',
// //     fontWeight: '600',
// //     color: '#7c2d12',
// //   },
// //   runtimeLabel: {
// //     fontSize: '12px',
// //     color: '#9a3412',
// //     marginTop: '8px',
// //   },
// //   fuelLayout: {
// //     display: 'grid',
// //     gridTemplateColumns: '1fr 1fr',
// //     gap: '24px',
// //   },
// //   fuelTankContainer: {
// //     backgroundColor: 'white',
// //     borderRadius: '8px',
// //     border: '1px solid #e5e7eb',
// //     padding: '32px',
// //   },
// //   tankVisual: {
// //     position: 'relative',
// //     height: '256px',
// //     backgroundColor: '#f3f4f6',
// //     borderRadius: '8px',
// //     overflow: 'hidden',
// //   },
// //   tankFill: {
// //     position: 'absolute',
// //     bottom: 0,
// //     left: 0,
// //     right: 0,
// //     height: '75%',
// //     background: 'linear-gradient(to top, #f59e0b, #fbbf24)',
// //   },
// //   tankOverlay: {
// //     position: 'absolute',
// //     inset: 0,
// //     display: 'flex',
// //     flexDirection: 'column',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //   },
// //   tankPercentage: {
// //     fontSize: '48px',
// //     fontWeight: '700',
// //     color: 'white',
// //     textShadow: '0 2px 4px rgba(0,0,0,0.3)',
// //   },
// //   tankLiters: {
// //     fontSize: '14px',
// //     color: 'white',
// //     textShadow: '0 2px 4px rgba(0,0,0,0.3)',
// //   },
// //   fuelMetrics: {
// //     display: 'flex',
// //     flexDirection: 'column',
// //     gap: '16px',
// //   },
// //   consumptionCard: {
// //     background: 'linear-gradient(to bottom right, #fffbeb, #fef3c7)',
// //     borderRadius: '8px',
// //     border: '1px solid #fde68a',
// //     padding: '24px',
// //   },
// //   runtimeEstimateCard: {
// //     background: 'linear-gradient(to bottom right, #eff6ff, #dbeafe)',
// //     borderRadius: '8px',
// //     border: '1px solid #bfdbfe',
// //     padding: '24px',
// //   },
// //   metricSmallTitle: {
// //     fontSize: '14px',
// //     fontWeight: '500',
// //     marginBottom: '12px',
// //   },
// //   metricLargeValue: {
// //     fontSize: '28px',
// //     fontWeight: '600',
// //   },
// //   metricSmallLabel: {
// //     fontSize: '12px',
// //     marginTop: '4px',
// //   },
// //   pacGrid: {
// //     display: 'grid',
// //     gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
// //     gap: '16px',
// //   },
// //   unitCard: {
// //     backgroundColor: 'white',
// //     borderRadius: '8px',
// //     border: '1px solid #e5e7eb',
// //     padding: '24px',
// //   },
// //   unitHeader: {
// //     display: 'flex',
// //     alignItems: 'center',
// //     justifyContent: 'space-between',
// //     marginBottom: '16px',
// //   },
// //   unitTitle: {
// //     fontSize: '18px',
// //     fontWeight: '600',
// //     color: '#111827',
// //   },
// //   unitIcon: {
// //     width: '24px',
// //     height: '24px',
// //     color: '#2563eb',
// //   },
// //   unitStats: {
// //     display: 'flex',
// //     flexDirection: 'column',
// //     gap: '12px',
// //   },
// //   unitStat: {
// //     display: 'flex',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //     padding: '8px 0',
// //     borderBottom: '1px solid #f3f4f6',
// //   },
// //   unitStatLabel: {
// //     fontSize: '14px',
// //     color: '#6b7280',
// //   },
// //   unitStatValue: {
// //     fontSize: '14px',
// //     fontWeight: '500',
// //   },
// //   upsLayout: {
// //     display: 'grid',
// //     gridTemplateColumns: '2fr 1fr',
// //     gap: '24px',
// //   },
// //   upsMain: {
// //     backgroundColor: 'white',
// //     borderRadius: '8px',
// //     border: '1px solid #e5e7eb',
// //     padding: '32px',
// //   },
// //   upsGrid: {
// //     display: 'grid',
// //     gridTemplateColumns: 'repeat(4, 1fr)',
// //     gap: '16px',
// //     marginBottom: '24px',
// //   },
// //   upsItem: {
// //     textAlign: 'center',
// //     padding: '16px',
// //     backgroundColor: '#f9fafb',
// //     borderRadius: '8px',
// //   },
// //   upsLabel: {
// //     fontSize: '12px',
// //     color: '#6b7280',
// //     marginBottom: '8px',
// //   },
// //   upsValue: {
// //     fontSize: '20px',
// //     fontWeight: '600',
// //     color: '#111827',
// //   },
// //   upsModeCard: {
// //     backgroundColor: '#f0fdf4',
// //     border: '1px solid #bbf7d0',
// //     borderRadius: '8px',
// //     padding: '16px',
// //   },
// //   upsMode: {
// //     fontSize: '14px',
// //     fontWeight: '500',
// //     color: '#166534',
// //   },
// //   upsModeDesc: {
// //     fontSize: '12px',
// //     color: '#166534',
// //     marginTop: '4px',
// //   },
// //   backupCard: {
// //     background: 'linear-gradient(to bottom right, #f0fdf4, #dcfce7)',
// //     borderRadius: '8px',
// //     border: '1px solid #bbf7d0',
// //     padding: '24px',
// //   },
// //   backupIcon: {
// //     width: '32px',
// //     height: '32px',
// //     color: '#16a34a',
// //     marginBottom: '16px',
// //   },
// //   backupTitle: {
// //     fontSize: '14px',
// //     fontWeight: '500',
// //     color: '#166534',
// //     marginBottom: '8px',
// //   },
// //   backupValue: {
// //     fontSize: '36px',
// //     fontWeight: '600',
// //     color: '#166534',
// //   },
// //   backupLabel: {
// //     fontSize: '12px',
// //     color: '#166534',
// //     marginTop: '8px',
// //   },
// //   rectifierLayout: {
// //     display: 'grid',
// //     gridTemplateColumns: '1fr 1fr',
// //     gap: '24px',
// //   },
// //   rectifierCard: {
// //     backgroundColor: 'white',
// //     borderRadius: '8px',
// //     border: '1px solid #e5e7eb',
// //     padding: '32px',
// //   },
// //   rectifierStats: {
// //     display: 'flex',
// //     flexDirection: 'column',
// //     gap: '16px',
// //   },
// //   rectifierStat: {
// //     display: 'flex',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //     padding: '16px',
// //     backgroundColor: '#f9fafb',
// //     borderRadius: '8px',
// //   },
// //   rectifierLabel: {
// //     fontSize: '14px',
// //     color: '#6b7280',
// //   },
// //   rectifierValue: {
// //     fontSize: '18px',
// //     fontWeight: '600',
// //     color: '#111827',
// //   },
// //   batteryLayout: {
// //     display: 'grid',
// //     gridTemplateColumns: '1fr 1fr 1fr',
// //     gap: '24px',
// //   },
// //   batteryCard: {
// //     backgroundColor: 'white',
// //     borderRadius: '8px',
// //     border: '1px solid #e5e7eb',
// //     padding: '32px',
// //   },
// //   batteryCharge: {
// //     textAlign: 'center',
// //     padding: '24px',
// //     backgroundColor: '#f0fdf4',
// //     borderRadius: '8px',
// //     marginBottom: '16px',
// //   },
// //   chargeLabel: {
// //     fontSize: '14px',
// //     color: '#166534',
// //     marginBottom: '8px',
// //   },
// //   chargeValue: {
// //     fontSize: '48px',
// //     fontWeight: '700',
// //     color: '#166534',
// //   },
// //   batteryMetrics: {
// //     display: 'grid',
// //     gridTemplateColumns: '1fr 1fr',
// //     gap: '12px',
// //   },
// //   batteryMetric: {
// //     textAlign: 'center',
// //     padding: '12px',
// //     backgroundColor: '#f9fafb',
// //     borderRadius: '8px',
// //   },
// //   batteryMetricLabel: {
// //     fontSize: '12px',
// //     color: '#6b7280',
// //   },
// //   batteryMetricValue: {
// //     fontSize: '18px',
// //     fontWeight: '600',
// //     color: '#111827',
// //   },
// //   healthCard: {
// //     background: 'linear-gradient(to bottom right, #eff6ff, #dbeafe)',
// //     borderRadius: '8px',
// //     border: '1px solid #bfdbfe',
// //     padding: '24px',
// //   },
// //   healthIcon: {
// //     width: '32px',
// //     height: '32px',
// //     color: '#2563eb',
// //     marginBottom: '16px',
// //   },
// //   healthTitle: {
// //     fontSize: '14px',
// //     fontWeight: '500',
// //     color: '#1e40af',
// //     marginBottom: '8px',
// //   },
// //   healthValue: {
// //     fontSize: '28px',
// //     fontWeight: '600',
// //     color: '#1e40af',
// //   },
// //   healthLabel: {
// //     fontSize: '12px',
// //     color: '#1e40af',
// //     marginTop: '8px',
// //   },
// //   controlGrid: {
// //     display: 'grid',
// //     gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
// //     gap: '16px',
// //   },
// //   controlCard: {
// //     backgroundColor: 'white',
// //     borderRadius: '8px',
// //     border: '1px solid #e5e7eb',
// //     padding: '24px',
// //   },
// //   controlHeader: {
// //     display: 'flex',
// //     alignItems: 'center',
// //     justifyContent: 'space-between',
// //     marginBottom: '16px',
// //   },
// //   controlIcon: {
// //     width: '20px',
// //     height: '20px',
// //     color: '#9ca3af',
// //   },
// //   controlDot: {
// //     width: '12px',
// //     height: '12px',
// //     borderRadius: '50%',
// //   },
// //   controlName: {
// //     fontSize: '14px',
// //     fontWeight: '500',
// //     color: '#111827',
// //     marginBottom: '8px',
// //   },
// //   controlStatus: {
// //     fontSize: '18px',
// //     fontWeight: '600',
// //   },
// //   controlButton: {
// //     width: '100%',
// //     marginTop: '16px',
// //     padding: '8px 16px',
// //     backgroundColor: '#f3f4f6',
// //     color: '#374151',
// //     fontSize: '14px',
// //     fontWeight: '500',
// //     borderRadius: '8px',
// //     border: 'none',
// //     cursor: 'pointer',
// //     transition: 'background-color 0.2s',
// //   },
// // };

// // export default Dashboard;





import React, { useState, useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { userContext } from '../context/UserContext';
import { SLD } from './../components/tabs/SLD.component';
import Sensor from './../components/tabs/Sensor.component';
import DieselGenerator from './../components/tabs/DieselGenerator.component';
import FuelTank from './../components/tabs/FuelTank.component';
import PAC from './../components/tabs/PAC.component';
import UPS from './../components/tabs/UPS.component';
import Rectifire from './../components/tabs/Rectifire.component';
import Bettery from './../components/tabs/Bettery.component';
import { ablyAPI } from '../api/ablyAPI';
import { fetchSensorThreshold, fetchSensorType, fetchStateConfig } from '../api/dashboardTabApi';
import { setAlarmedSensors } from '../redux/features/dashboard/alarmedSensorDataSlice';
import { Control } from '../components/tabs/Control.component';
import { errorMessage } from './../api/api-config/apiResponseMessage';
import {buildLiveSLDData} from "../utils/mqttDataParsing";
import { fetchSensorRealTimeValueByDataCenter, fetchDiagramSVG } from "../api/settings/dataCenterApi";

const Dashboard = () => {
  const incommingMQTTData = useSelector((state) => state.mqtt.data);
  const { user } = useContext(userContext);
  const dispatch = useDispatch();
  const tabList = useSelector((state) => state.tablist.tabs);
  const dataCenterId = useSelector((state) => state.updatedDataCenter.dataCenter);
  const [activeTab, setActiveTab] = useState(null);

  const [liveSensorData, setLiveSensorData] = useState(() => {
    const saved = localStorage.getItem('liveSensorData');
    return saved ? JSON.parse(saved) : null;
  });
  const [liveSomkeAndWaterSensorData, setLiveSomkeAndWaterSensorData] = useState(() => {
    const saved = localStorage.getItem('liveSomkeAndWaterSensorData');
    return saved ? JSON.parse(saved) : null;
  });
  const [liveSLDSensorData, setLiveSLDSensorData] = useState(null);
  const [liveControlSensorData, setLiveControlSensorData] = useState(null);

  const [sensorType, setSensorType] = useState([]);
  const [threshold, setThreshold] = useState([]);
  const [stateConfig, setStateConfig] = useState([]);
  const [diagramContent, setDiagramContent] = useState([]);
  const [sensorRealTimeValues, setSensorRealTimeValues] = useState([]);

  // sesor Type
  const [allowedSensorIds] = useState(new Set([1, 2]));
  const [allowedSmokeAndWaterSensorIds] = useState(new Set([4, 5, 6]));
  const [allowedSLDIds] = useState(new Set([3]));
  const [allowedControlIds] = useState(new Set([6]));
  const [allowedDieselGenaratorIds] = useState(new Set([1, 2]));

  // Save liveSensorData to localStorage
  useEffect(() => {
    if (liveSensorData) {
      localStorage.setItem('liveSensorData', JSON.stringify(liveSensorData));
    }
  }, [liveSensorData]);

  // Save liveSomkeAndWaterSensorData to localStorage
  useEffect(() => {
    if (liveSomkeAndWaterSensorData) {
      localStorage.setItem('liveSomkeAndWaterSensorData', JSON.stringify(liveSomkeAndWaterSensorData));
    }
  }, [liveSomkeAndWaterSensorData]);

  useEffect(() => {
    setActiveTab(null);
    if (tabList && tabList.length > 0) {
      setActiveTab(tabList[0].id);
    }
  }, [tabList]);

  useEffect(() => {
    if (dataCenterId != null) {
      Promise.all([
        fetchSensorThreshold(dataCenterId),
        fetchSensorType(dataCenterId),
        fetchStateConfig(dataCenterId),
        fetchDiagramSVG(dataCenterId),
        fetchSensorRealTimeValueByDataCenter(dataCenterId),
      ])
        .then(([thresholdRes, sensorTypeRes, stateRes, diagramSvg, sensorRealTimeRes]) => {
          setThreshold(thresholdRes);
          setSensorType(sensorTypeRes);
          setStateConfig(stateRes);
          setDiagramContent(diagramSvg.data);
          setSensorRealTimeValues(sensorRealTimeRes.data);
        })
        .catch(errorMessage);
    }
  }, [dataCenterId]);

  useEffect(() => {
    if (sensorRealTimeValues.length > 0 && threshold.length > 0) {
      const grouped = sensorRealTimeValues.reduce((acc, sensor) => {
        if (!acc[sensor.sensor_type]) {
          acc[sensor.sensor_type] = {
            id: sensor.sensor_type,
            sensor_type_name: sensor.sensor_type_name,
            sensors: []
          };
        }
        acc[sensor.sensor_type].sensors.push({
          id: sensor.sensor_id,
          val: parseFloat(sensor.value),
          sensor_name: sensor.sensor_name,
          location: sensor.location,
        });
        return acc;
      }, {});
      const sensorTypes = Object.values(grouped);
      const enriched = {
        sensor_types: sensorTypes.map(sensorType => {
          return {
            ...sensorType,
            sensors: sensorType.sensors.map(sensor => {
              const matchedThresholds = threshold.filter(th => th.sensor_id === sensor.id && th.dc_id === dataCenterId && th.sensor_type === sensorType.id).map(th => ({threshold: th.threshold, threshold_name: th.threshold_name, color: th.color}));
              return {
                ...sensor,
                thresholds: matchedThresholds
              };
            })
          };
        })
      };
      setLiveSensorData(enriched);

      // Process smoke and water sensors from API
      if (stateConfig.length > 0) {
        const smokeWaterTypes = sensorTypes.filter(st => allowedSmokeAndWaterSensorIds.has(st.id));
        const enrichedSmokeWater = {
          sensor_types: smokeWaterTypes.map(sensorType => {
            const sensor_type_name = stateConfig.find(state => state.type_id === sensorType.id)?.type_name || sensorType.sensor_type_name;
            return {
              ...sensorType,
              sensor_type_name,
              sensors: sensorType.sensors.map(sensor => {
                const matchedState = stateConfig.find(state => state.type_id === sensorType.id && state.sensor_id === sensor.id && state.state_value === sensor.val);
                return {
                  ...sensor,
                  state_name: matchedState?.state_name || null,
                  color: matchedState?.color || null,
                  location: sensor.location,
                  sensor_name: sensor.sensor_name,
                };
              })
            };
          })
        };
        setLiveSomkeAndWaterSensorData(enrichedSmokeWater);
      }
    }
  }, [sensorRealTimeValues, threshold, stateConfig, dataCenterId]);

  useEffect(() => {
    if (incommingMQTTData?.length > 0 && dataCenterId && threshold.length) {
      const filteredDataCenter = incommingMQTTData.filter((item) => item.dc_id === dataCenterId);
      if (filteredDataCenter.length === 0) {
        return;
      }
      const latest = filteredDataCenter[filteredDataCenter.length - 1];
      
      // IMPORTANT: Skip update if sensor data is empty or null
      if (!latest.sensor_types?.length || latest.sensor_types.some(st => !st.sensors?.length)) {
        console.warn("⚠️ Empty sensor data received - skipping update to preserve last value");
        return;
      }
      
      if (latest.dc_id === dataCenterId) {
        const matchedSensorType = {
          ...latest,
          sensor_types: (latest.sensor_types || []).filter((item) =>
            allowedSensorIds?.has(item.id)
          ),
        };

        const enriched = {
          ...matchedSensorType,
          sensor_types: matchedSensorType.sensor_types.map((sensorType) => {
            const typeThreshold = threshold.find(
              (th) => th.sensor_type === sensorType.id && th.dc_id === matchedSensorType.dc_id
            );

            const sensor_type_name = typeThreshold?.sensor_type_name || null;

            return {
              ...sensorType,
              sensor_type_name,

              sensors: sensorType.sensors
                .map((sensor) => {
                  const matchedThresholds = threshold
                    .filter(
                      (th) =>
                        th.sensor_id === sensor.id &&
                        th.dc_id === matchedSensorType.dc_id &&
                        th.sensor_type === sensorType.id
                    )
                    .map((th) => ({
                      threshold: th.threshold,
                      threshold_name: th.threshold_name,
                      color: th.color,
                    }));
                  const existingSensor = liveSensorData?.sensor_types?.find(st => st.id === sensorType.id)?.sensors?.find(s => s.id === sensor.id);
                  return {
                    ...sensor,
                    thresholds: matchedThresholds ?? [],
                    sensor_name: existingSensor?.sensor_name || sensor.sensor_name,
                    location: existingSensor?.location || sensor.location,
                  };
                }),
            };
          }),
        };

        // Merge with existing data to keep previous sensor types
        const existing = liveSensorData || { dc_id: dataCenterId, sensor_types: [] };
        const mergedSensorTypes = [...existing.sensor_types];

        enriched.sensor_types.forEach(newType => {
          const index = mergedSensorTypes.findIndex(t => t.id === newType.id);
          if (index >= 0) {
            // Update existing type's sensors
            const existingType = mergedSensorTypes[index];
            const mergedSensors = [...existingType.sensors];
            newType.sensors.forEach(newSensor => {
              const sensorIndex = mergedSensors.findIndex(s => s.id === newSensor.id);
              if (sensorIndex >= 0) {
                mergedSensors[sensorIndex] = newSensor;
              } else {
                mergedSensors.push(newSensor);
              }
            });
            mergedSensorTypes[index] = { ...existingType, sensors: mergedSensors };
          } else {
            // Add new type if it has sensors
            if (newType.sensors?.length > 0) {
              mergedSensorTypes.push(newType);
            }
          }
        });

        // Sort sensor types by id to maintain order: Temperature (1), Humidity (2), etc.
        mergedSensorTypes.sort((a, b) => a.id - b.id);

        const merged = { ...latest, sensor_types: mergedSensorTypes };

        setLiveSensorData(merged);
      }
    }
  }, [incommingMQTTData, dataCenterId, threshold]);

  useEffect(() => {
    if (!incommingMQTTData?.length || !dataCenterId || !stateConfig.length) return;

    const filteredDataCenter = incommingMQTTData.filter((item) => item.dc_id === dataCenterId);

    if (!filteredDataCenter.length) {
      return;
    }

    const latest = filteredDataCenter[filteredDataCenter.length - 1];

    if (!latest || !latest.sensor_types?.length) return;

    // IMPORTANT: Check if all sensor types have empty sensors
    const hasValidData = latest.sensor_types.some(st => st.sensors?.length > 0);
    if (!hasValidData) {
      console.warn("⚠️ Empty smoke/water data received - skipping update");
      return;
    }

    const filteredSensorTypes = latest.sensor_types.filter((sensorType) =>
      allowedSmokeAndWaterSensorIds.has(sensorType.id)
    );

    if (!filteredSensorTypes.length) return;

    const enrichedSensorTypes = filteredSensorTypes.map((sensorType) => {
      const sensor_type_name =
        stateConfig.find((state) => state.type_id === sensorType.id)?.type_name || null;

      const filteredSensors = sensorType.sensors
        .filter((sensor) =>
          stateConfig.some(
            (state) =>
              state.sensor_id === sensor.id &&
              state.type_id === sensorType.id &&
              state.state_value === sensor.val
          )
        )
        .map((sensor) => {
          const matchedStates = stateConfig.filter(
            (state) =>
              state.sensor_id === sensor.id &&
              state.type_id === sensorType.id &&
              state.state_value === sensor.val
          );

          const existingSensor = liveSomkeAndWaterSensorData?.sensor_types?.find(st => st.id === sensorType.id)?.sensors?.find(s => s.id === sensor.id);
          return {
            ...sensor,
            ...(matchedStates[0] && {
              state_name: matchedStates[0].state_name,
              color: matchedStates[0].color,
            }),
            sensor_name: existingSensor?.sensor_name || sensor.sensor_name,
            location: existingSensor?.location || sensor.location,
          };
        });

      return {
        ...sensorType,
        sensor_type_name,
        sensors: filteredSensors,
      };
    });
    const hasValidSensors = enrichedSensorTypes.some((st) => st.sensors?.length);
    if (!hasValidSensors) return;

    // Merge with existing data to keep previous sensor types
    const existing = liveSomkeAndWaterSensorData || { dc_id: dataCenterId, sensor_types: [] };
    const mergedSensorTypes = [...existing.sensor_types];

    enrichedSensorTypes.forEach(newType => {
      const index = mergedSensorTypes.findIndex(t => t.id === newType.id);
      if (index >= 0) {
        // Update existing type's sensors
        const existingType = mergedSensorTypes[index];
        const mergedSensors = [...existingType.sensors];
        newType.sensors.forEach(newSensor => {
          const sensorIndex = mergedSensors.findIndex(s => s.id === newSensor.id);
          if (sensorIndex >= 0) {
            mergedSensors[sensorIndex] = newSensor;
          } else {
            mergedSensors.push(newSensor);
          }
        });
        mergedSensorTypes[index] = { ...existingType, sensors: mergedSensors };
      } else {
        // Add new type if it has sensors
        if (newType.sensors?.length > 0) {
          mergedSensorTypes.push(newType);
        }
      }
    });

    // Sort sensor types by id to maintain order
    mergedSensorTypes.sort((a, b) => a.id - b.id);

    const merged = {
      ...latest,
      sensor_types: mergedSensorTypes,
    };

    setLiveSomkeAndWaterSensorData(merged);
  }, [incommingMQTTData, dataCenterId, stateConfig]);

   useEffect(() => {
  const liveData = buildLiveSLDData({
    mqttData: incommingMQTTData,
    dataCenterId,
    sensorStateConfig: stateConfig, 
    allowedSLDIds, 
  });

  if (!liveData) {
    setLiveSLDSensorData(null);
    return;
  }

  setLiveSLDSensorData(liveData);
}, [incommingMQTTData, dataCenterId,stateConfig]);

  useEffect(() => {
    if (incommingMQTTData?.length > 0 && dataCenterId && stateConfig.length) {
      const filteredDataCenter = incommingMQTTData.filter((item) => item.dc_id === dataCenterId);

      if (filteredDataCenter.length === 0) {
        return;
      }

      // IMPORTANT: Skip if data is empty
      const hasValidData = filteredDataCenter.some(device => 
        device.sensor_types?.some(st => st.sensors?.length > 0)
      );
      if (!hasValidData) {
        console.warn("⚠️ Empty Control data received - skipping update");
        return;
      }

      const sensorTypeMap = new Map();

      filteredDataCenter.forEach((device) => {
        device.sensor_types?.forEach((sensorType) => {
          if (!allowedControlIds?.has(sensorType.id)) return;

          if (!sensorTypeMap.has(sensorType.id)) {
            sensorTypeMap.set(sensorType.id, []);
          }

          const existing = sensorTypeMap.get(sensorType.id);

          sensorType.sensors?.forEach((sensor) => {
            const existsInStateConfig = stateConfig.some(
              (state) =>
                state.type_id === sensorType.id &&
                state.sensor_id === sensor.id &&
                state.state_value === sensor.val
            );

            if (existsInStateConfig) {
              const index = existing.findIndex((s) => s.id === sensor.id);
              if (index !== -1) {
                existing[index] = sensor;
              } else {
                existing.push(sensor);
              }
            }
          });
        });
      });

      const enrichedSensorTypes = [...sensorTypeMap.entries()].map(([typeId, sensors]) => {
        const sensor_type_name = stateConfig.find((s) => s.type_id === typeId)?.type_name || null;

        const enrichedSensors = sensors.map((sensor) => {
          const matchedState = stateConfig.find(
            (state) =>
              state.type_id === typeId &&
              state.sensor_id === sensor.id &&
              state.state_value === sensor.val
          );

          return {
            ...sensor,
            state_name: matchedState?.state_name || null,
            color: matchedState?.color || null,
            location: matchedState?.location || null,
            mode_type: matchedState?.mode_type || null,
            paired_status: matchedState?.paired_status || null,
            paired_sensors: matchedState?.paired_sensors || null,
            on_time: matchedState?.on_time || null,
            off_time: matchedState?.off_time || null,
            duration: matchedState?.duration || null,
            sensor_name: matchedState?.sensor_name || null,
            runningDuration: matchedState?.runningDuration || null,
            restDuration: matchedState?.restDuration || null,
            days: matchedState?.day_names || null,
          };
        });

        return {
          id: typeId,
          sensor_type_name,
          sensors: enrichedSensors,
        };
      });

      setLiveControlSensorData({
        dc_id: dataCenterId,
        sensor_types: enrichedSensorTypes,
      });
    }
  }, [incommingMQTTData, dataCenterId, stateConfig]);


  const tabContentMap = {
    1: <SLD data={diagramContent} live={liveSLDSensorData?.sensor_types?.[0]} />,
    2: <Sensor data={liveSensorData} smokeAndwaterData={liveSomkeAndWaterSensorData} />,
    3: <DieselGenerator />,
    4: <FuelTank />,
    5: <PAC />,
    6: <UPS />,
    7: <Rectifire />,
    8: <Bettery />,
    9: <Control live={liveControlSensorData?.sensor_types?.[0]} />,
  };

  return (
    <section>
      <div className="card">
        <div className="card-header flex-column justify-content-between align-items-center">
          <div className="d-flex  justify-content-between align-items-center"></div>
          <ul className="nav nav-tabs card-header-tabs">
            {tabList?.map((tab) => (
              <li className="nav-item" key={tab.id}>
                <button
                  className={`nav-link text-secondary rounded-bottom-0 fw-bold ${
                    activeTab === tab.id ? 'active' : ''
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="card-body">
          {tabContentMap[activeTab] || <p>No content available for this tab.</p>}
        </div>
      </div>
    </section>
  );
};

export default Dashboard;

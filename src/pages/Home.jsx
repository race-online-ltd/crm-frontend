// import React, { useEffect, useState } from 'react';
// import {Link} from "react-router-dom";
// import ReactAudioPlayer from 'react-audio-player';
// import { Volume2, VolumeX } from "lucide-react";
// import { useSelector } from 'react-redux';

// import { fetchDataCenterCount } from '../api/settings/dataCenterApi';
// import sound from '../assets/sounds/alarm.mp3';
// import { fetchSensorThreshold, fetchSensorType, fetchStateConfig } from "../api/dashboardTabApi";
// import { fetchDiagramSVG } from "../api/settings/dataCenterApi";
// import { errorMessage } from '../api/api-config/apiResponseMessage';


// const Home = () => {
//   const dataCenterId = useSelector((state) => state.updatedDataCenter.dataCenter);
//   const incommingMQTTData = useSelector((state) => state.mqtt.data);
//   const [alarmSensors, setAlarmSensors] = useState([]);
//     const [alarmSmokeWaterSensors, setAlarmSmokeWaterSensors] = useState([]);
  
//   const [shouldPlayAlarm, setShouldPlayAlarm] = useState(false);
//   const [isMuteAlarm, setIsMuteAlarm] = useState(false);
//   const [showOnlyAlarms, setShowOnlyAlarms] = useState(false);
//    const [totalRequiredAlarmCount, setTotalRequiredAlarmCount] = useState(0);
//    const [totalAlarmedSensorIds, setTotalAlarmedSensorIds] = useState(0);
   

  

//    const [sensorType, setSensorType] = useState([]);
//   const [threshold, setThreshold] = useState([]);
//   const [stateConfig, setStateConfig] = useState([]);
//   const [diagramContent, setDiagramContent] = useState([]);
  
//     // sesor Type
//   const [allowedSensorIds, setAllowedSensorIds] = useState(new Set([1, 2]));
//   const [allowedSmokeAndWaterSensorIds, setAllowedSmokeAndWaterSensorIds] = useState(new Set([4, 5]));
//   const [allowedSLDIds, setAllowedSLDIds] = useState(new Set([3]));

//    useEffect(() => {
//     if(dataCenterId != null){
//       Promise.all([
//       fetchSensorThreshold(dataCenterId),
//       fetchSensorType(dataCenterId),
//       fetchStateConfig(dataCenterId),
//       fetchDiagramSVG(dataCenterId)
//     ])
//       .then(([thresholdRes, sensorTypeRes,stateRes,diagramSvg]) => {
//         setThreshold(thresholdRes);
//         setSensorType(sensorTypeRes);
//         setStateConfig(stateRes);
//         setDiagramContent(diagramSvg.data);
        
//       })
//       .catch(errorMessage);
//     }
//   }, [dataCenterId]);

 

// useEffect(()=>{
//   fetchDataCenterCount()
//   .then((res)=>{

// })
//   },[]);


//   useEffect(() => {
//   setAlarmSensors([]);
//     if (incommingMQTTData?.length > 0 && dataCenterId && threshold.length) {
//       const filteredDataCenter = incommingMQTTData.filter(item => item.dc_id === dataCenterId);
//       if (filteredDataCenter.length === 0) {
//       console.warn(`⚠️ No matching MQTT data found for dataCenterId: ${dataCenterId}`);
//       setAlarmSensors([]);
//       return;
//     }
//       const latest = filteredDataCenter[filteredDataCenter.length - 1];
//       if (latest.dc_id === dataCenterId) {
//         const matchedSensorType = {
//           ...latest,
//           sensor_types: (latest.sensor_types || []).filter(item =>
//             allowedSensorIds?.has(item.id)
//           ),
//         };
  
//         const enriched = {
//           ...matchedSensorType,
//           sensor_types: matchedSensorType.sensor_types.map(sensorType => {
//             const typeThreshold = threshold.find(
//               th => th.sensor_type === sensorType.id && th.dc_id === matchedSensorType.dc_id
//             );
  
//             const sensor_type_name = typeThreshold?.sensor_type_name || null;
  
//             return {
//               ...sensorType,
//               sensor_type_name,
              
//               sensors: sensorType.sensors
//                 .filter(sensor =>
//                   threshold.some(th =>
//                     th.sensor_id === sensor.id &&
//                     th.dc_id === matchedSensorType.dc_id &&
//                     th.sensor_type === sensorType.id
//                   )
//                 )
//                 .map(sensor => {
//                   const matchedThresholds = threshold
//                     .filter(th =>
//                       th.sensor_id === sensor.id &&
//                       th.dc_id === matchedSensorType.dc_id &&
//                       th.sensor_type === sensorType.id
//                     )
//                     .map(th => ({
//                       threshold: th.threshold,
//                       threshold_name: th.threshold_name,
//                       color: th.color,
//                     }));
  
//                     matchedThresholds?.forEach(th => {
//                     const sensorValue = Number(sensor.val);
//                     const thresholdValue = Number(th.threshold);
  
//                     if (th.threshold_name === "High" && sensorValue >= thresholdValue) {
//                       // console.log("🔥 High threshold crossed! Adding to alarmSensors.");
  
//                   setAlarmSensors(prev => [
//                         ...prev,
//                         {
//                           sensor_id: sensor.id,
//                           sensor_type: sensorType.id,
//                           sensor_type_name: sensor_type_name , 
//                           val: sensorValue,
//                           threshold: thresholdValue,
//                           threshold_name: th.threshold_name,
//                           dc_id: matchedSensorType.dc_id,
//                         }
//                       ]);
//                     }
//                   });
  
  
//                   return {
//                     ...sensor,
//                     thresholds: matchedThresholds ?? [],
//                   };
//                 }),
//             };
//           }),
//         };
//       }
//     }
//   }, [incommingMQTTData, dataCenterId, threshold]);


// useEffect(() => {
//   if (!incommingMQTTData?.length || !dataCenterId || !stateConfig.length) return;

//   const filteredDataCenter = incommingMQTTData.filter(item => item.dc_id === dataCenterId);
//   if (!filteredDataCenter.length) return;

//   const latest = filteredDataCenter[filteredDataCenter.length - 1];
//   if (!latest?.sensor_types?.length) return;

//   const filteredSensorTypes = latest.sensor_types.filter(sensorType =>
//     allowedSmokeAndWaterSensorIds.has(sensorType.id)
//   );
//   if (!filteredSensorTypes.length) return;

//   const alarmSensors = [];

//   filteredSensorTypes.forEach(sensorType => {
//     const sensor_type_name =
//       stateConfig.find(state => state.type_id === sensorType.id)?.type_name || null;

//     sensorType.sensors.forEach(sensor => {
//       const matchedState = stateConfig.find(
//         state =>
//           state.sensor_id === sensor.id &&
//           state.type_id === sensorType.id &&
//           state.state_value === sensor.val
//       );
//       const isAlarm =
//     matchedState?.state_name &&
//     matchedState.state_name.toLowerCase() !== "normal";

//       if (isAlarm) {
//         alarmSensors.push({
//           sensor_id: sensor.id,
//           sensor_type: sensorType.id,
//           sensor_type_name: sensor_type_name,
//           val: sensor.val,
//           state_name: matchedState.state_name,
//           color: matchedState.color,
//           location: matchedState.location,
//           dc_id: latest.dc_id,
//         });
//       }
//     });
//   });

//   setAlarmSmokeWaterSensors(alarmSensors);
// }, [incommingMQTTData, dataCenterId, stateConfig]);


// const updatedAlarmData = sensorType?.map(type => {
//   const normal = alarmSensors?.filter(sensor =>
//     sensor.sensor_type_name.toLowerCase() === type.sensor_type_name.toLowerCase()
//   ) || [];

//   const smokeWater = alarmSmokeWaterSensors?.filter(sensor =>
//     sensor.sensor_type_name.toLowerCase() === type.sensor_type_name.toLowerCase()
//   ) || [];

//   const allSensors = [...normal, ...smokeWater];

//   return {
//     ...type,
//     sensorId: allSensors.map(sensor => sensor.sensor_id),
//     alarm: allSensors.length,
//   };
// });

// const alarmFiltered = showOnlyAlarms
//     ? updatedAlarmData?.filter(item => item.alarm > 0)
//     : updatedAlarmData;

// //  useEffect(() => {
// //     const totalAlarmCount = updatedAlarmData?.reduce((sum, item) => sum + item.alarm, 0);
// //     setShouldPlayAlarm(totalAlarmCount > 0);
// //     setTotalRequiredAlarmCount(totalAlarmCount);
// //   }, [updatedAlarmData]);

// useEffect(() => {
//   if (!Array.isArray(updatedAlarmData)) return;

//   let totalCount = 0;
//   const alarmedSensorIds = updatedAlarmData
//     .filter(item => item.alarm > 0)
//     .flatMap(item => item.sensorId);

//   totalCount = alarmedSensorIds.length;

//   const uniqueAlarmedSensorIds = Array.from(new Set(alarmedSensorIds));

//   setShouldPlayAlarm(prev => {
//     const newValue = totalCount > 0;
//     return prev === newValue ? prev : newValue;
//   });

//   setTotalRequiredAlarmCount(prev => (prev === totalCount ? prev : totalCount));

//   setTotalAlarmedSensorIds(prev => {
//     if (prev.length !== uniqueAlarmedSensorIds.length ||
//         prev.some((val, idx) => val !== uniqueAlarmedSensorIds[idx])) {
//       return uniqueAlarmedSensorIds;
//     }
//     return prev;
//   });
// }, [updatedAlarmData]);



//   return (
//       <section className="alarm-dashboard">
//         <div className='row mb-3'>
//           <div className='col-12 col-sm-6'>
//              { totalRequiredAlarmCount >0 && (<div class="alert alert-danger" role="alert">
//                 <Link to={`/admin/alarm-details/${dataCenterId}/${totalAlarmedSensorIds.join(",")}`}><span className='fw-bold'>{totalRequiredAlarmCount}</span> Immediate attention required
//             </Link></div>) }
//           </div>
//           <div className='col-12 col-sm-6 text-sm-end'>
//             <button className='btn btn-secondary me-2' onClick={() => setShowOnlyAlarms(prev => !prev)}>
//         {showOnlyAlarms ? 'Show All' : 'Show Only Alarms'}
//       </button>
// <button
//           onClick={() => setIsMuteAlarm(!isMuteAlarm)}
//           className='btn btn-danger'
//         >
//           {isMuteAlarm ? (
//             <>
//               <VolumeX size={18} className='me-2' />
//               Muted
//             </>
//           ) : (
//             <>
//               <Volume2 size={18} className='me-2' />
//               Unmute
//             </>
//           )}
//         </button>
//           </div>
            
//         </div>
//     <div className="d-flex gap-4 flex-wrap justify-content-center">
//         {alarmFiltered?.map((item,index)=>(
           
//             <Link key={index} to={`/admin/alarm-details/${dataCenterId}/${item.sensorId.join(",")}`} className={`box ${item.alarm >0 ? 'alarm-highlight' : ''}`}>
//                   <h5 className='fw-bold'>{item.alarm || 0}</h5>
//                   <h6>{item.sensor_type_name}</h6>
//                 </Link>
//         ))}

//         {shouldPlayAlarm && (
//                     <ReactAudioPlayer
//                             src={sound}
//                             autoPlay
//                             controls
//                             loop
//                             muted={isMuteAlarm}
//                             style={{ display: "none" }}
//                           />
//         )}
//       </div>
//   </section>
//   )
// }

// export default Home



import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import ReactAudioPlayer from 'react-audio-player';
import { Volume2, VolumeX, AlertTriangle, AlertCircle } from "lucide-react"; // Added AlertTriangle, AlertCircle
import { useSelector } from 'react-redux';

import { fetchDataCenterCount } from '../api/settings/dataCenterApi';
import sound from '../assets/sounds/alarm.mp3';
import { fetchSensorThreshold, fetchSensorType, fetchStateConfig } from "../api/dashboardTabApi";
import { fetchDiagramSVG } from "../api/settings/dataCenterApi";
import { errorMessage } from '../api/api-config/apiResponseMessage';


const Home = () => {
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

  // sesor Type
  const [allowedSensorIds, setAllowedSensorIds] = useState(new Set([1, 2]));
  const [allowedSmokeAndWaterSensorIds, setAllowedSmokeAndWaterSensorIds] = useState(new Set([4, 5]));
  const [allowedSLDIds, setAllowedSLDIds] = useState(new Set([3]));

  useEffect(() => {
    if (dataCenterId != null) {
      Promise.all([
        fetchSensorThreshold(dataCenterId),
        fetchSensorType(dataCenterId),
        fetchStateConfig(dataCenterId),
        fetchDiagramSVG(dataCenterId)
      ])
        .then(([thresholdRes, sensorTypeRes, stateRes, diagramSvg]) => {
          setThreshold(thresholdRes);
          setSensorType(sensorTypeRes);
          setStateConfig(stateRes);
          setDiagramContent(diagramSvg.data);

        })
        .catch(errorMessage);
    }
  }, [dataCenterId]);



  useEffect(() => {
    fetchDataCenterCount()
      .then((res) => {

      })
  }, []);


  useEffect(() => {
    setAlarmSensors([]);
    if (incommingMQTTData?.length > 0 && dataCenterId && threshold.length) {
      const filteredDataCenter = incommingMQTTData.filter(item => item.dc_id === dataCenterId);
      if (filteredDataCenter.length === 0) {
        console.warn(`⚠️ No matching MQTT data found for dataCenterId: ${dataCenterId}`);
        setAlarmSensors([]);
        return;
      }
      const latest = filteredDataCenter[filteredDataCenter.length - 1];
      if (latest.dc_id === dataCenterId) {
        const matchedSensorType = {
          ...latest,
          sensor_types: (latest.sensor_types || []).filter(item =>
            allowedSensorIds?.has(item.id)
          ),
        };

        const enriched = {
          ...matchedSensorType,
          sensor_types: matchedSensorType.sensor_types.map(sensorType => {
            const typeThreshold = threshold.find(
              th => th.sensor_type === sensorType.id && th.dc_id === matchedSensorType.dc_id
            );

            const sensor_type_name = typeThreshold?.sensor_type_name || null;

            return {
              ...sensorType,
              sensor_type_name,

              sensors: sensorType.sensors
                .filter(sensor =>
                  threshold.some(th =>
                    th.sensor_id === sensor.id &&
                    th.dc_id === matchedSensorType.dc_id &&
                    th.sensor_type === sensorType.id
                  )
                )
                .map(sensor => {
                  const matchedThresholds = threshold
                    .filter(th =>
                      th.sensor_id === sensor.id &&
                      th.dc_id === matchedSensorType.dc_id &&
                      th.sensor_type === sensorType.id
                    )
                    .map(th => ({
                      threshold: th.threshold,
                      threshold_name: th.threshold_name,
                      color: th.color,
                    }));


                  matchedThresholds?.forEach(th => {
                    const sensorValue = Number(sensor.val);
                    const thresholdValue = Number(th.threshold);

                    if (th.threshold_name === "High" && sensorValue >= thresholdValue) {
                      // console.log("🔥 High threshold crossed! Adding to alarmSensors.");

                      setAlarmSensors(prev => {
                        // Prevent duplicates and ensure no functional change
                        const isAlreadyAlarmed = prev.some(
                          (a) => a.sensor_id === sensor.id && a.sensor_type === sensorType.id
                        );
                        if (isAlreadyAlarmed) return prev;
                        
                        return [
                          ...prev,
                          {
                            sensor_id: sensor.id,
                            sensor_type: sensorType.id,
                            sensor_type_name: sensor_type_name,
                            val: sensorValue,
                            threshold: thresholdValue,
                            threshold_name: th.threshold_name,
                            dc_id: matchedSensorType.dc_id,
                          }
                        ];
                      });
                    }
                  });


                  return {
                    ...sensor,
                    thresholds: matchedThresholds ?? [],
                  };
                }),
            };
          }),
        };
      }
    }
  }, [incommingMQTTData, dataCenterId, threshold]);


  useEffect(() => {
    if (!incommingMQTTData?.length || !dataCenterId || !stateConfig.length) return;

    const filteredDataCenter = incommingMQTTData.filter(item => item.dc_id === dataCenterId);
    if (!filteredDataCenter.length) return;

    const latest = filteredDataCenter[filteredDataCenter.length - 1];
    if (!latest?.sensor_types?.length) return;

    const filteredSensorTypes = latest.sensor_types.filter(sensorType =>
      allowedSmokeAndWaterSensorIds.has(sensorType.id)
    );
    if (!filteredSensorTypes.length) return;

    const alarmSensors = [];

    filteredSensorTypes.forEach(sensorType => {
      const sensor_type_name =
        stateConfig.find(state => state.type_id === sensorType.id)?.type_name || null;

      sensorType.sensors.forEach(sensor => {
        const matchedState = stateConfig.find(
          state =>
            state.sensor_id === sensor.id &&
            state.type_id === sensorType.id &&
            state.state_value === sensor.val
        );
        const isAlarm =
          matchedState?.state_name &&
          matchedState.state_name.toLowerCase() !== "normal";

        if (isAlarm) {
          alarmSensors.push({
            sensor_id: sensor.id,
            sensor_type: sensorType.id,
            sensor_type_name: sensor_type_name,
            val: sensor.val,
            state_name: matchedState.state_name,
            color: matchedState.color,
            location: matchedState.location,
            dc_id: latest.dc_id,
          });
        }
      });
    });

    setAlarmSmokeWaterSensors(alarmSensors);
  }, [incommingMQTTData, dataCenterId, stateConfig]);


  const updatedAlarmData = sensorType?.map(type => {
    const normal = alarmSensors?.filter(sensor =>
      sensor.sensor_type_name.toLowerCase() === type.sensor_type_name.toLowerCase()
    ) || [];

    const smokeWater = alarmSmokeWaterSensors?.filter(sensor =>
      sensor.sensor_type_name.toLowerCase() === type.sensor_type_name.toLowerCase()
    ) || [];

    const allSensors = [...normal, ...smokeWater];

    return {
      ...type,
      sensorId: allSensors.map(sensor => sensor.sensor_id),
      alarm: allSensors.length,
    };
  });

  const alarmFiltered = showOnlyAlarms
    ? updatedAlarmData?.filter(item => item.alarm > 0)
    : updatedAlarmData;


  useEffect(() => {
    if (!Array.isArray(updatedAlarmData)) return;

    let totalCount = 0;
    const alarmedSensorIds = updatedAlarmData
      .filter(item => item.alarm > 0)
      .flatMap(item => item.sensorId);

    totalCount = alarmedSensorIds.length;

    const uniqueAlarmedSensorIds = Array.from(new Set(alarmedSensorIds));

    setShouldPlayAlarm(prev => {
      const newValue = totalCount > 0;
      return prev === newValue ? prev : newValue;
    });

    setTotalRequiredAlarmCount(prev => (prev === totalCount ? prev : totalCount));

    setTotalAlarmedSensorIds(prev => {
      if (typeof prev !== 'object' || prev === null) {
          // Initialize if not an array/object, crucial for initial state logic
          return uniqueAlarmedSensorIds;
      }
      if (prev.length !== uniqueAlarmedSensorIds.length ||
        prev.some((val, idx) => val !== uniqueAlarmedSensorIds[idx])) {
        return uniqueAlarmedSensorIds;
      }
      return prev;
    });
  }, [updatedAlarmData]);


  // Handler function to link to alarm details page
  const handleCardClick = (sensorIds) => {
    if (sensorIds && sensorIds.length > 0) {
      // Functional equivalence to your original Link usage:
      // <Link to={`/admin/alarm-details/${dataCenterId}/${item.sensorId.join(",")}`}>
      window.location.href = `/admin/alarm-details/${dataCenterId}/${sensorIds.join(",")}`;
    }
  };

  // Handler function for the critical alert banner
  const handleCriticalAlertClick = () => {
    if (totalAlarmedSensorIds && totalAlarmedSensorIds.length > 0) {
        // Functional equivalence to your original Link usage:
        // <Link to={`/admin/alarm-details/${dataCenterId}/${totalAlarmedSensorIds.join(",")}`}>
        window.location.href = `/admin/alarm-details/${dataCenterId}/${totalAlarmedSensorIds.join(",")}`;
    }
  };


  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        {/* Visual change: Added Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>Alarm Dashboard</h1>
          <p style={styles.subtitle}>Real-time monitoring and alerts for Data Center {dataCenterId}</p>
        </div>

        {/* Visual change: Wrapped alert and controls in topBar */}
        <div style={styles.topBar}>
          {/* CRITICAL ALERT BANNER */}
          <div style={styles.alertSection}>
            {totalRequiredAlarmCount > 0 && (
              <button
                onClick={handleCriticalAlertClick} // Use functional handler for navigation
                style={styles.criticalAlert}
              >
                <AlertTriangle style={styles.alertIcon} />
                <div style={styles.alertContent}>
                  <span style={styles.alertCount}>{totalRequiredAlarmCount}</span>
                  <span style={styles.alertText}>Active Alarms - Immediate Attention Required</span>
                </div>
              </button>
            )}
          </div>

          {/* CONTROLS SECTION */}
          <div style={styles.controlsSection}>
            <button
              style={{ ...styles.button, ...styles.buttonSecondary }}
              onClick={() => setShowOnlyAlarms(prev => !prev)}
            >
              {showOnlyAlarms ? 'Show All' : 'Show Only Alarms'}
            </button>

            <button
              onClick={() => setIsMuteAlarm(!isMuteAlarm)}
              style={{
                ...styles.button,
                ...(isMuteAlarm ? styles.buttonMuted : styles.buttonDanger)
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

        {/* Visual change: Grid layout for sensor cards */}
        <div style={styles.grid}>
          {alarmFiltered?.map((item, index) => (
            <button
              key={index}
              onClick={() => handleCardClick(item.sensorId)} // Use functional handler for navigation
              style={{
                ...styles.card,
                ...(item.alarm > 0 ? styles.cardAlarm : {})
              }}
              // Original component used Link, which is functionally a navigation/click.
              // This button is the visual equivalent of the clickable box.
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
                <div style={{
                  ...styles.alarmCount,
                  ...(item.alarm > 0 ? styles.alarmCountActive : {})
                }}>
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

        {/* AUDIBLE ALARM PLAYER (hidden) and Visual Indicator */}
        {shouldPlayAlarm && (
          <>
            {/* The audio player remains functional but hidden */}
            <ReactAudioPlayer
              src={sound}
              autoPlay
              controls
              loop
              muted={isMuteAlarm}
              style={{ display: "none" }}
            />
            
            {/* New: Visual alarm indicator added when playing and unmuted */}
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
  )
}

// --- VISUAL STYLES (COPIED VERBATIM) ---
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(to bottom right, #f9fafb, #f3f4f6)',
    padding: '32px 24px',
  },
  wrapper: {
    maxWidth: '1400px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '32px',
  },
  title: {
    fontSize: '30px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#6b7280',
  },
  topBar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '32px',
  },
  alertSection: {
    flex: 1,
  },
  criticalAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px 24px',
    backgroundColor: '#fef2f2',
    border: '2px solid #fecaca',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 6px rgba(239, 68, 68, 0.1)',
    width: '100%',
    // Ensuring it functions like a Link
    textDecoration: 'none', 
    textAlign: 'left',
  },
  alertIcon: {
    width: '32px',
    height: '32px',
    color: '#dc2626',
    flexShrink: 0,
  },
  alertContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  alertCount: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#dc2626',
  },
  alertText: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#991b1b',
  },
  controlsSection: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
  },
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
  buttonSecondary: {
    backgroundColor: '#f3f4f6',
    color: '#374151',
  },
  buttonDanger: {
    backgroundColor: '#dc2626',
    color: 'white',
  },
  buttonMuted: {
    backgroundColor: '#6b7280',
    color: 'white',
  },
  buttonIcon: {
    width: '18px',
    height: '18px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'white',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    padding: '24px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    position: 'relative',
    overflow: 'hidden',
    textAlign: 'left',
    // Ensuring it functions like a Link
    textDecoration: 'none',
  },
  cardAlarm: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
  },
  alarmIndicator: {
    width: '40px',
    height: '40px',
    backgroundColor: '#fee2e2',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alarmIcon: {
    width: '24px',
    height: '24px',
    color: '#dc2626',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  cardBody: {
    textAlign: 'center',
    padding: '20px 0',
  },
  alarmCount: {
    fontSize: '56px',
    fontWeight: '700',
    color: '#9ca3af',
    lineHeight: '1',
    marginBottom: '8px',
  },
  alarmCountActive: {
    color: '#dc2626',
  },
  alarmLabel: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
  },
  cardFooter: {
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #fecaca',
  },
  viewDetailsText: {
    fontSize: '14px',
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
  audioIcon: {
    width: '20px',
    height: '20px',
  },
  audioText: {
    fontSize: '14px',
    fontWeight: '600',
  },
};


export default Home
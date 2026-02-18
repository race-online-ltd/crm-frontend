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
import { buildLiveSLDData } from '../utils/mqttDataParsing';
import {
  fetchSensorRealTimeValueByDataCenter,
  fetchDiagramSVG,
} from '../api/settings/dataCenterApi';

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

  const [liveDieselData, setLiveDieselData] = useState(null);

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
      localStorage.setItem(
        'liveSomkeAndWaterSensorData',
        JSON.stringify(liveSomkeAndWaterSensorData)
      );
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
            sensors: [],
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
        sensor_types: sensorTypes.map((sensorType) => {
          return {
            ...sensorType,
            sensors: sensorType.sensors.map((sensor) => {
              const matchedThresholds = threshold
                .filter(
                  (th) =>
                    th.sensor_id === sensor.id &&
                    th.dc_id === dataCenterId &&
                    th.sensor_type === sensorType.id
                )
                .map((th) => ({
                  threshold: th.threshold,
                  threshold_name: th.threshold_name,
                  color: th.color,
                }));
              return {
                ...sensor,
                thresholds: matchedThresholds,
              };
            }),
          };
        }),
      };
      setLiveSensorData(enriched);

      // Process smoke and water sensors from API
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
                  location: sensor.location,
                  sensor_name: sensor.sensor_name,
                };
              }),
            };
          }),
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
      if (!latest.sensor_types?.length || latest.sensor_types.some((st) => !st.sensors?.length)) {
        console.warn('⚠️ Empty sensor data received - skipping update to preserve last value');
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

              sensors: sensorType.sensors.map((sensor) => {
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
                const existingSensor = liveSensorData?.sensor_types
                  ?.find((st) => st.id === sensorType.id)
                  ?.sensors?.find((s) => s.id === sensor.id);
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

        enriched.sensor_types.forEach((newType) => {
          const index = mergedSensorTypes.findIndex((t) => t.id === newType.id);
          if (index >= 0) {
            // Update existing type's sensors
            const existingType = mergedSensorTypes[index];
            const mergedSensors = [...existingType.sensors];
            newType.sensors.forEach((newSensor) => {
              const sensorIndex = mergedSensors.findIndex((s) => s.id === newSensor.id);
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
    const hasValidData = latest.sensor_types.some((st) => st.sensors?.length > 0);
    if (!hasValidData) {
      console.warn('⚠️ Empty smoke/water data received - skipping update');
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

          const existingSensor = liveSomkeAndWaterSensorData?.sensor_types
            ?.find((st) => st.id === sensorType.id)
            ?.sensors?.find((s) => s.id === sensor.id);
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

    enrichedSensorTypes.forEach((newType) => {
      const index = mergedSensorTypes.findIndex((t) => t.id === newType.id);
      if (index >= 0) {
        // Update existing type's sensors
        const existingType = mergedSensorTypes[index];
        const mergedSensors = [...existingType.sensors];
        newType.sensors.forEach((newSensor) => {
          const sensorIndex = mergedSensors.findIndex((s) => s.id === newSensor.id);
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
  }, [incommingMQTTData, dataCenterId, stateConfig]);

  useEffect(() => {
    if (incommingMQTTData?.length > 0 && dataCenterId && stateConfig.length) {
      const filteredDataCenter = incommingMQTTData.filter((item) => item.dc_id === dataCenterId);

      if (filteredDataCenter.length === 0) {
        return;
      }

      // IMPORTANT: Skip if data is empty
      const hasValidData = filteredDataCenter.some((device) =>
        device.sensor_types?.some((st) => st.sensors?.length > 0)
      );
      if (!hasValidData) {
        console.warn('⚠️ Empty Control data received - skipping update');
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

  useEffect(() => {
    setLiveSensorData(null);
    setLiveSomkeAndWaterSensorData(null);
    localStorage.removeItem('liveSensorData');
    localStorage.removeItem('liveSomkeAndWaterSensorData');
  }, [dataCenterId]);

  // disel data
  useEffect(() => {
    if (!incommingMQTTData?.length || !dataCenterId) return;

    const dieselPackets = incommingMQTTData.filter(
      (item) => item.dt === 'diesel' && item.dc === dataCenterId
    );

    if (!dieselPackets.length) return;

    const latestDiesel = dieselPackets[dieselPackets.length - 1];

    setLiveDieselData(latestDiesel);
  }, [incommingMQTTData, dataCenterId]);

  // console.log('incommingMQTTData:', incommingMQTTData);
  const tabContentMap = {
    1: <SLD data={diagramContent} live={liveSLDSensorData?.sensor_types?.[0]} />,
    2: <Sensor data={liveSensorData} smokeAndwaterData={liveSomkeAndWaterSensorData} />,
    3: <DieselGenerator data={liveDieselData} />,
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
          <div className="dashboard-tabs">
            {tabList?.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                className={`tab-item ${activeTab === tab.id ? 'tab-active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="tab-text">{tab.name}</span>
                <span className="tab-indicator" aria-hidden />
              </button>
            ))}
          </div>
        </div>

        <div className="card-body">
          {tabContentMap[activeTab] || <p>No content available for this tab.</p>}
        </div>
      </div>
    </section>
  );
};

export default Dashboard;

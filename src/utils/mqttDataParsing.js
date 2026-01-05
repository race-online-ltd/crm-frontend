
export const filterMQTTByDataCenter = (mqttData, dataCenterId) => {
  return mqttData?.filter((d) => d.dc_id === dataCenterId) || [];
};


export const buildSensorStateConfigMap = (stateConfig = []) => {
  const map = new Map();

  stateConfig.forEach((cfg) => {
    const key = `${cfg.type_id}_${cfg.state_value}`;
    if (!map.has(key)) {
      map.set(key, cfg);
    }
  });

  return map;
};


export const buildLiveSLDData = ({
  mqttData,
  dataCenterId,
  sensorStateConfig,
  allowedSLDIds,
}) => {
  if (
    !mqttData?.length ||
    !dataCenterId ||
    !sensorStateConfig?.length ||
    !allowedSLDIds?.size
  ) {
    return null;
  }


  // 1️⃣ Group local config by sensor_id
  const localSensorMap = new Map();
  sensorStateConfig.forEach(cfg => {
    if (!localSensorMap.has(cfg.sensor_id)) {
      localSensorMap.set(cfg.sensor_id, {
        sensor_id: cfg.sensor_id,
        sensor_name: cfg.sensor_name,
        type_id: cfg.type_id,
        type_name: cfg.type_name,
        states: [],
      });
    }

    localSensorMap.get(cfg.sensor_id).states.push({
      path: cfg.path,
      val: cfg.state_value,
      state_name: cfg.state_name,
      color: cfg.color,
      location: cfg.location,
    });
  });

  // 2️⃣ Filter DC
  const dcPackets = filterMQTTByDataCenter(mqttData, dataCenterId);
  if (!dcPackets.length) return null;


  const sensorTypeMap = new Map();

  // 3️⃣ Traverse MQTT packets
  dcPackets.forEach(packet => {
    packet.sensor_types?.forEach(type => {
      if (!allowedSLDIds.has(type.id)) return;

      if (!sensorTypeMap.has(type.id)) {
        sensorTypeMap.set(type.id, {
          id: type.id,
          sensor_type_name: null,
          sensors: new Map(),
        });
      }

      const typeBucket = sensorTypeMap.get(type.id);

      // First, create buckets for all local sensors of this type
      localSensorMap.forEach(localSensor => {
        if (localSensor.type_id !== type.id) return;

        typeBucket.sensor_type_name ||= localSensor.type_name;

        if (!typeBucket.sensors.has(localSensor.sensor_id)) {
          typeBucket.sensors.set(localSensor.sensor_id, {
            id: localSensor.sensor_id,
            sensor_name: localSensor.sensor_name,
            state: localSensor.states.map(s => ({
              ...s,
              is_active: false,
            })),
          });
        }
      });

      // Then update is_active based on MQTT sensor values
      type.sensors?.forEach(mqttSensor => {
        // Find matching local sensor by id (MQTT sensor has 'id', local sensor has 'sensor_id')
        const localSensor = Array.from(localSensorMap.values()).find(
          ls => ls.sensor_id === mqttSensor.id && ls.type_id === type.id
        );

        if (!localSensor) return;

        const sensorBucket = typeBucket.sensors.get(localSensor.sensor_id);
        if (!sensorBucket) return;

        // Mark the correct state as active based on MQTT value
        sensorBucket.state = sensorBucket.state.map(s => ({
          ...s,
          is_active: s.val === mqttSensor.val,
        }));
      });
    });
  });

  if (!sensorTypeMap.size) return null;

  return {
    dc_id: dataCenterId,
    sensor_types: [...sensorTypeMap.values()].map(type => ({
      id: type.id,
      sensor_type_name: type.sensor_type_name,
      sensors: [...type.sensors.values()],
    })),
  };
};



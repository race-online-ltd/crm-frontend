// import React from "react";
// import GaugeComponent from "react-gauge-component";
// import { MdLocationOn } from "react-icons/md";

// const Sensor = ({ data,smokeAndwaterData }) => {

//   return (
//     <>
//     <div>
//       {data?.sensor_types?.map((sensorType, index) => (
//         <div key={index}>
//           <h5 className="my-3 fw-bold">{sensorType.sensor_type_name}</h5>

//           <div className="d-flex gap-3 flex-wrap mb-3">
//             {sensorType.sensors.map((sensor) => (

//               <div className="sensor-box" key={sensor.id}>

//                 <GaugeComponent
//                   type="semicircle"
//                   arc={{
//                     width: 0.2,
//                     padding: 0.005,
//                     cornerRadius: 1,
//                     subArcs: sensor.thresholds
//                       ?.sort((a, b) => a.threshold - b.threshold)
//                       .map((th) => ({
//                         limit: th.threshold,
//                         color: th.color,
//                         showTick: true,
//                         tooltip: {
//                           text: th.threshold_name,
//                         },
//                       })),
//                   }}
//                   pointer={{
//                     color: "#345243",
//                     length: 0.8,
//                     width: 15,
//                   }}
//                   labels={{
//                     valueLabel: {
//                       formatTextValue: (value) => value + " ºC",
//                       style: {
//                         fill: "#97C3AC",
//                         fontSize: 40,
//                         fontWeight: "bold",
//                       },
//                     },
//                     tickLabels: {
//                       type: "outer",
//                       defaultTickValueConfig: {
//                         formatTextValue: (value) => value + " ºC",
//                         style: { fontSize: 10 },
//                       },
//                       ticks: sensor.thresholds
//                         ?.sort((a, b) => a.threshold - b.threshold)
//                         .map((th) => ({
//                           value: th.threshold,
//                         })),
//                     },
//                   }}
//                   value={sensor.val || 0}
//                   minValue={0}
//                   maxValue={
//                     sensor.thresholds?.sort((a, b) => b.threshold - a.threshold)[0]
//                       ?.threshold || 100
//                   }
//                 />

//               </div>
//             ))}
//           </div>
//         </div>
//       ))}
//     </div>
//     <div>
//       {smokeAndwaterData?.sensor_types?.map((sensorType, index) => (
//         <div key={index}>
//           <h5 className="my-3 fw-bold">{sensorType.sensor_type_name}</h5>

//           <div className="d-flex gap-3 flex-wrap mb-3">
//             {sensorType.sensors.map((sensor) => (

//               <div className="sensor-box" style={{width:'150px', background: `${sensor.color}`}} key={sensor.id}>

//                <h5 className="text-white fw-bold">{sensor.state_name}</h5>
//                <h6 className="text-white"><MdLocationOn className="fs-4 fw-bold me-1"/>{sensor.location}</h6>
//               </div>
//             ))}
//           </div>
//         </div>
//       ))}
//     </div>
//     </>
//   );
// };

// export default Sensor;

import React, { useState, useEffect, useRef } from 'react';

import GaugeComponent from 'react-gauge-component';
import { MdLocationOn } from 'react-icons/md';

const Sensor = ({ data, smokeAndwaterData }) => {
  const dataRef = useRef(null);
  const smokeWaterRef = useRef(null);

  const [displayData, setDisplayData] = useState(null);
  const [displaySmokeWaterData, setDisplaySmokeWaterData] = useState(null);


  useEffect(() => {
    if (data && data.sensor_types?.length > 0) {
      dataRef.current = data;
      setDisplayData(data);
    } else if (dataRef.current) {
      setDisplayData(dataRef.current);
    }
  }, [data]);

  useEffect(() => {
    if (smokeAndwaterData && smokeAndwaterData.sensor_types?.length > 0) {
      smokeWaterRef.current = smokeAndwaterData;
      setDisplaySmokeWaterData(smokeAndwaterData);
    } else if (smokeWaterRef.current) {
      setDisplaySmokeWaterData(smokeWaterRef.current);
    }
  }, [smokeAndwaterData]);

  // Combine sensor types from both data sources, but only allowed types, no duplicates
  const allowedSensorIds = [1, 2];
  const allowedSmokeAndWaterSensorIds = [4, 5, 6];
  const allowedIds = [...allowedSensorIds, ...allowedSmokeAndWaterSensorIds];

  const combinedSensorTypes = [];
  if (displayData?.sensor_types) {
    combinedSensorTypes.push(
      ...displayData.sensor_types.filter((st) => allowedSensorIds.includes(st.id))
    );
  }
  if (displaySmokeWaterData?.sensor_types) {
    combinedSensorTypes.push(
      ...displaySmokeWaterData.sensor_types.filter((st) =>
        allowedSmokeAndWaterSensorIds.includes(st.id)
      )
    );
  }

  const offlineIds = displayData?.offline_sensor_id || [];
 
  return (
    <>
      {/* Combined SENSOR DATA */}
      <div>
        {combinedSensorTypes.map((sensorType, index) => (
          <div key={index}>
            <h5 className="my-3 fw-bold">{sensorType.sensor_type_name}</h5>
            <div className="d-flex gap-3 flex-wrap mb-3">
              {sensorType.sensors?.map((sensor) => {
                // Check if this sensor type is for gauges (temp/humidity) or cards (smoke/water)
                const isGaugeType = sensorType.id === 1 || sensorType.id === 2; // Assuming 1 and 2 are temp/humidity
                const isTemp = sensorType.id === 1;
                const unit = isTemp ? "ºC" : "%";
                const isOffline = offlineIds.includes(sensor.id);
                if (isGaugeType) {
                  return (
                    <div
                      className="sensor-box position-relative"
                      key={sensor.id}
                      style={{ opacity: isOffline ? 0.2 : 1 }}
                    >
                      {isOffline && (
                        <div className="offline-overlay">
                          <span className="offline-badge">Offline</span>
                        </div>
                      )}

                      <GaugeComponent
                        type="semicircle"
                        arc={{
                          width: 0.2,
                          padding: 0.005,
                          cornerRadius: 1,
                          subArcs: sensor.thresholds
                            ?.sort((a, b) => a.threshold - b.threshold)
                            .map((th) => ({
                              limit: th.threshold,
                              color: th.color,
                              showTick: true,
                              tooltip: {
                                text: th.threshold_name,
                              },
                            })),
                        }}
                        pointer={{
                          color: '#345243',
                          length: 0.8,
                          width: 15,
                        }}
                        labels={{
                          valueLabel: {
                            formatTextValue: (value) => value + ' ' + unit,
                            style: {
                              fill: '#97C3AC',
                              fontSize: 40,
                              fontWeight: 'bold',
                            },
                          },
                          tickLabels: {
                            type: 'outer',
                            defaultTickValueConfig: {
                              formatTextValue: (value) => value + ' ' + unit,
                              style: { fontSize: 10 },
                            },
                            ticks: sensor.thresholds
                              ?.sort((a, b) => a.threshold - b.threshold)
                              .map((th) => ({
                                value: th.threshold,
                              })),
                          },
                        }}
                        value={sensor.val || 0}
                        minValue={0}
                        maxValue={
                          sensor.thresholds?.sort((a, b) => b.threshold - a.threshold)[0]
                            ?.threshold || 100
                        }
                      />
                      <div className="text-center mt-2">
                        <div className="fw-bold">{sensor.sensor_name}</div>
                        <div>
                          <MdLocationOn className="me-1" />
                          {sensor.location}
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    // <div
                    //   className="sensor-box"
                    //   style={{ width: '150px', background: `${sensor.color}` }}
                    //   key={sensor.id}
                    // >
                    <div
                      className="sensor-box position-relative"
                      key={sensor.id}
                      style={{
                        width: '150px',
                        background: `${sensor.color}`,
                        opacity: isOffline ? 0.2 : 1,
                      }}
                    >
                      {isOffline && (
                        <div className="offline-overlay">
                          <span className="offline-badge2">Offline</span>
                        </div>
                      )}

                      <h5 className="text-white fw-bold">{sensor.state_name}</h5>
                      <h6 className="text-white">
                        <MdLocationOn className="fs-4 fw-bold me-1" />
                        {sensor.location}
                      </h6>
                      <div className="fw-bold text-white">{sensor.sensor_name}</div>
                    </div>
                  );
                }
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default Sensor;

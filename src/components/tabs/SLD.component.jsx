import React, { useEffect, useRef, useState,useContext } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Modal from '../shared/Modal';
import { userContext } from '../../context/UserContext';
import { acknowledgeAlarmStore } from '../../api/alarmApi';
import { errorMessage, successMessage } from '../../api/api-config/apiResponseMessage';
import {fetchSensorRealTimeValueByDataCenter} from '../../api/settings/dataCenterApi';
import { fetchStateConfig } from '../../api/dashboardTabApi';
import { useSelector } from 'react-redux';


const acknowledgeSchema = Yup.object({
  sensorId: Yup.number()
    .required('Sensor ID missing'),

  alarmValue: Yup.number()
    .required('Alarm value missing'),

  userId: Yup.number()
    .required('User not found'),

  message: Yup.string()
    .trim()
    .required('Message is required')
});


export const SLD = ({ data, live }) => {
  const { user } = useContext(userContext);
  const prevSensorStatesRef = useRef(new Map());
  const containerRef = useRef(null);
  const circlePaths = useRef([]);
  const formikRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPathId, setSelectedPathId] = useState(null);
  const dataCenterId = useSelector((state) => state.updatedDataCenter.dataCenter);

  const handleSave = () => {
   
    setIsModalOpen(false);
  };

  useEffect(() => {
  // 🔴 RESET EVERYTHING WHEN DATACENTER CHANGES

  // Clear SVG DOM
  if (containerRef.current) {
    containerRef.current.innerHTML = '';
  }

  // Clear previous sensor states
  prevSensorStatesRef.current = new Map();

  // Clear detected paths
  circlePaths.current = [];

  // Reset modal state
  setIsModalOpen(false);
  setSelectedPathId(null);

}, [dataCenterId]);

  // 1️⃣ Inject SVG + detect clickable paths
  useEffect(() => {
    if (!data?.svg_content || !containerRef.current) return;
    containerRef.current.innerHTML = '';
    containerRef.current.innerHTML = data.svg_content;

    const paths = containerRef.current.querySelectorAll('svg path');
    const found = [];

    paths.forEach((path) => {
      const d = path.getAttribute('d').trim();
      const id = path.getAttribute('id');

      const circleDatacenterMapping = {
  1: (d) => /-169\.5,169\.5/.test(d),
  2: (d) => d !== null && /254\.5,254\.5/.test(d),
   3: (d) =>
    /254\.5,254\.5/.test(d || '') ||   // big circle
    /10\.18,10\.18/.test(d || ''), 
    4: (d) =>
    /254\.5,254\.5/.test(d || '') ||   // big circle
    /10\.18,10\.18/.test(d || ''), 
};
const detector = circleDatacenterMapping[dataCenterId];
  const isCircleLike = detector ? detector(d) : false;
    // const isCircleLike = /-169\.5,169\.5/.test(d);
    // const isCircleLike = d !== null && /254\.5,254\.5/.test(d);
    // const isCircleLike = svg => /d="([^"]254\.5,254\.5[^"])"/.test(d);

    
  console.log('Checking path:', { id, d, isCircleLike });

      if (isCircleLike && id) {
        found.push(id);

        path.classList.add('clickable-path');
        path.style.cursor = 'pointer';

        // use `onclick` so this default handler can be replaced by sensor-specific handlers
        path.onclick = () => {
          setIsModalOpen(true);
          setSelectedPathId(id);
          // clear sensor-specific form fields for generic paths
          if (formikRef.current) {
            formikRef.current.setFieldValue('sensorId', '');
            formikRef.current.setFieldValue('alarmValue', '');
          }
        };
      }
    });


    circlePaths.current = found;
  }, [data?.svg_content]);

// Fetch initial realtime sensor values and apply colors based on state config
useEffect(() => {
  if (!dataCenterId || !data?.svg_content || !containerRef.current) return;

  let cancelled = false;

  const applyInitialValues = async () => {
    try {
      const [stateRes, realtimeRes] = await Promise.all([
        fetchStateConfig(dataCenterId),
        fetchSensorRealTimeValueByDataCenter(dataCenterId),
      ]);

      if (cancelled) return;

      const stateConfig = stateRes || [];
      const realtime = realtimeRes?.data || [];

      if (!stateConfig.length || !realtime.length) return;

      const svg = containerRef.current.querySelector('svg');
      if (!svg) return;

      // Build a map sensor_id -> states (path, valStr, color)
      const localSensorMap = new Map();
      stateConfig.forEach((cfg) => {
        const sid = String(cfg.sensor_id);
        if (!localSensorMap.has(sid)) {
          localSensorMap.set(sid, []);
        }
        localSensorMap.get(sid).push({
          path: cfg.path,
          valStr: String(cfg.state_value),
          color: cfg.color,
        });
      });

      // Only consider DI sensors (sensor_type === 3) from realtime API
      realtime
        .filter((s) => Number(s.sensor_type) === 3)
        .forEach((s) => {
          const sensorId = String(s.sensor_id ?? s.id); // normalize to string
          const valStr = String(s.value ?? s.val);
          if (!localSensorMap.has(sensorId)) return;

          const states = localSensorMap.get(sensorId);
          // find matching state by string comparison
          const matched = states.find((st) => st.valStr === valStr);
          if (!matched) return;

          const pathEl = svg.getElementById(matched.path);
          if (!pathEl) return;

          // apply color
          pathEl.style.fill = matched.color || '#ccc';

          // blink if val === '0'
          if (valStr === '0') pathEl.classList.add('sld-blink');
          else pathEl.classList.remove('sld-blink');

          // store prev state so live updates compare correctly (store strings)
          prevSensorStatesRef.current.set(sensorId, {
            pathId: matched.path,
            val: valStr,
            color: matched.color,
          });

          // Ensure clicking this path opens modal and populates the form with sensor info
          try {
            const handlerPathEl = svg.getElementById(matched.path);
            if (handlerPathEl) {
              handlerPathEl.onclick = () => {
                setIsModalOpen(true);
                setSelectedPathId(matched.path);
                if (formikRef.current) {
                  formikRef.current.setFieldValue('sensorId', Number(sensorId));
                  const numVal = Number(valStr);
                  formikRef.current.setFieldValue('alarmValue', Number.isNaN(numVal) ? valStr : numVal);
                }
              };
            }
          } catch (e) {
            // ignore
          }
        });
    } catch (err) {
      // ignore
    }
  };

  applyInitialValues();

  return () => {
    cancelled = true;
  };
}, [dataCenterId, data?.svg_content]);

useEffect(() => {
  if (!live?.sensors?.length || !containerRef.current) return;

  const svg = containerRef.current.querySelector('svg');
  if (!svg) return;

  live.sensors.forEach(sensor => {
    if (!sensor.state?.length) return;

    // ✅ current active state
    const activeState = sensor.state.find(s => s.is_active);
    if (!activeState) return;

    // Get previous state for this sensor
    const prevState = prevSensorStatesRef.current.get(String(sensor.id));
    
    // Check if this sensor's state actually changed (compare string values)
    const hasChanged = !prevState ||
               prevState.pathId !== activeState.path ||
               String(prevState.val) !== String(activeState.val) ||
               prevState.color !== activeState.color;

    // Skip update if nothing changed for this sensor
    if (!hasChanged) return;

    const pathEl = svg.getElementById(activeState.path);
    if (!pathEl) return;

    // Apply color (no reset)
    pathEl.style.fill = activeState.color || '#ccc';

    // BLINK if val === 0
    if (activeState.val === 0) {
      pathEl.classList.add('sld-blink');
    } else {
      pathEl.classList.remove('sld-blink');
    }

    // click handler
    pathEl.onclick = () => {
      setIsModalOpen(true);
      setSelectedPathId(activeState.path);

      if (formikRef.current) {
        formikRef.current.setFieldValue('sensorId', sensor.id);
        formikRef.current.setFieldValue('alarmValue', activeState.val);
      }
    };

    // Store current state for next comparison (store val as string)
    prevSensorStatesRef.current.set(String(sensor.id), {
      pathId: activeState.path,
      val: String(activeState.val),
      color: activeState.color,
    });
  });
}, [live]);





   const formik = useFormik({
      initialValues: {
        sensorId: '',
        alarmValue: '',
        userId: user?.id || '',
        message: '',
      },
      validationSchema: acknowledgeSchema,
      onSubmit: (values, { resetForm }) => {
        acknowledgeAlarmStore(values)
        .then((res) => {
          successMessage(res);
          setIsModalOpen(false);
          formik.resetForm();
        })
        .catch(errorMessage);
      },
    });

  // Store formik in ref so it's accessible in useEffect
  formikRef.current = formik;

console.log('circlePaths:', circlePaths);


  return (
    <div className="relative min-h-screen">
      {/* SVG Container */}
      <div ref={containerRef} className="svg-container w-full overflow-auto" />

      <Modal
        show={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        title={selectedPathId}
      >

        <form id="acknowledgeForm" onSubmit={formik.handleSubmit}>
          <div className="mb-3">
                 <h6>
                    Checked by{' '}
                    <span className="text-success fw-bold">
                      {user?.username
                        ? user.username.charAt(0).toUpperCase() + user.username.slice(1)
                        : ''}
                    </span>
                  </h6>   
          </div>
          <div className="form-floating">
            {/* <textarea
              className="form-control"
              placeholder="Message here"
              id="floatingTextarea"
              name="message"
              value={formik.values.message}
              onChange={formik.handleChange}
              style={{ height: '100px' }}
            /> */}
            <textarea
              className={`form-control ${
                formik.touched.message && formik.errors.message ? 'is-invalid' : ''
              }`}
              placeholder="Message here"
              id="floatingTextarea"
              name="message"
              value={formik.values.message}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              style={{ height: '100px' }}
            />

            {formik.touched.message && formik.errors.message && (
              <div className="invalid-feedback">
                {formik.errors.message}
              </div>
            )}

            <label htmlFor="floatingTextarea">Message</label>
          </div>
        </form>
      </Modal>
    </div>
  );
};


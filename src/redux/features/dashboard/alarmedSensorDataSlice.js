// import { createSlice } from "@reduxjs/toolkit";

// const initialState = {
//   alarmed: [], 
// };


// const alarmedSensorDataSlice = createSlice({
//   name: "alarmedSensorData",
//   initialState,
//   reducers: {
//     setAlarmedSensors(state, action) {
//       console.log("Inside reducer: setting alarmed to", action.payload);
//       state.alarmed = action.payload.toString(); 
//     },
//   },
// });


// export const { setAlarmedSensors } = alarmedSensorDataSlice.actions;
// export default alarmedSensorDataSlice.reducer;



import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  alarmed: [],
  lastUpdated: null,
  error: null,
};

const alarmedSensorDataSlice = createSlice({
  name: "alarmedSensorData",
  initialState,
  reducers: {
    setAlarmedSensors: (state, action) => {
      // action.payload should be an array of alarmed sensors
      if (Array.isArray(action.payload)) {
        state.alarmed = action.payload;
      } else if (typeof action.payload === "string") {
        // If it's a string, parse it or convert to array
        try {
          state.alarmed = JSON.parse(action.payload);
        } catch {
          state.alarmed = [action.payload];
        }
      } else {
        state.alarmed = [action.payload];
      }
      state.lastUpdated = new Date().toISOString();
      console.log("Alarmed sensors updated:", state.alarmed);
    },

    addAlarmedSensor: (state, action) => {
      const sensor = action.payload;
      const exists = state.alarmed.some((s) => s.sensor_id === sensor.sensor_id);
      if (!exists) {
        state.alarmed.push(sensor);
        state.lastUpdated = new Date().toISOString();
      }
    },

    removeAlarmedSensor: (state, action) => {
      const sensorId = action.payload;
      state.alarmed = state.alarmed.filter((s) => s.sensor_id !== sensorId);
      state.lastUpdated = new Date().toISOString();
    },

    clearAlarmedSensors: (state) => {
      state.alarmed = [];
      state.lastUpdated = new Date().toISOString();
    },

    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setAlarmedSensors,
  addAlarmedSensor,
  removeAlarmedSensor,
  clearAlarmedSensors,
  setError,
} = alarmedSensorDataSlice.actions;

export default alarmedSensorDataSlice.reducer;
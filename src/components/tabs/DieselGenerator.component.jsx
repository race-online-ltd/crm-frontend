// import React from "react";

// const DieselGenerator = () => {
//   return (
//     <div className="container mt-4">
//       <div className="card shadow">


//         <div className="table-responsive">
//           <table className="table table-bordered table-hover text-center align-middle">
//             <thead className="table-light">
//               <tr>
//                 <th colSpan={2}>
//   <div className="d-flex justify-content-around align-items-center">
//     <span className="fw-bold">DG - 01 (Primary)</span>
//     <span className="small text-muted">
//       Last Updated: 02 February 2026 12:55:33 AM
//     </span>
//   </div>
// </th>

//                 <th>Phase R</th>
//                 <th>Phase Y</th>
//                 <th>Phase B</th>
//                 <th>Average</th>
//                 <th>Total</th>
//                 <th>Percent</th>
//               </tr>
//             </thead>

//             <tbody>
//               <tr>
//                 <th rowSpan={4} className="align-middle">
//                   Voltage, Current & Power Measurements
//                 </th>
//                 <td>Line to Line Voltage (VL-L)</td>
//                 <td>415</td>
//                 <td>416</td>
//                 <td>415</td>
//                 <td>415</td>
//                 <td>-</td>
//                 <td>-</td>
//               </tr>

//               <tr>
//                 <td>Line to Neutral Voltage (VL-N)</td>
//                 <td>240</td>
//                 <td>241</td>
//                 <td>240</td>
//                 <td>240</td>
//                 <td>-</td>
//                 <td>-</td>
//               </tr>

//               <tr>
//                 <td>Current (A)</td>
//                 <td>22</td>
//                 <td>23</td>
//                 <td>22</td>
//                 <td>22</td>
//                 <td>-</td>
//                 <td>-</td>
//               </tr>

//               <tr>
//                 <td>Real Power (kW)</td>
//                 <td>15</td>
//                 <td>15</td>
//                 <td>16</td>
//                 <td>15</td>
//                 <td>15</td>
//                 <td>3%</td>
//               </tr>

//             </tbody>
//           </table>
//         </div>


//         <div className="table-responsive">
//           <table className="table table-bordered table-hover text-center align-middle">
//             <thead className="table-light">
//               <tr>
//                 <th>Engine Status</th>
//                 <th>Control Switch Position</th>
//                 <th>Automatic Start / Stop State</th>
//                 <th>RPM</th>
//                 <th>Operating Hours</th>
//                 <th>Battery Voltage</th>
//                 <th>Temperature (°C)</th>
//                 <th>Fuel Consumption (L/h)</th>
//                 <th>Total Real Energy (kWh)</th>
//                 <th>Average Frequency (Hz)</th>
//                 <th>Power Factor</th>
//               </tr>
//             </thead>

//             <tbody>
//                <tr>
//                 <td><span className="badge text-bg-success">Online</span></td>
//                 <td>AUTO</td>
//                 <td>STOPPED</td>
//                 <td>1400</td>
//                 <td>210.17</td>
//                 <td>26.55</td>
//                 <td>82</td>
//                 <td>82</td>
//                 <td>82</td>
//                  <td>82</td>
//                 <td>Lagging</td>
//               </tr>
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DieselGenerator;


import React from "react";

const DieselGenerator = ({ data }) => {
  if (!data?.gens?.length) {
    return <p className="text-center mt-4">No Diesel Data Available</p>;
  }

  const lastUpdated = new Date(data.ts * 1000).toLocaleString();

  return (
    <div className="container mt-4">
      {data.gens.map((dg, index) => {
        const m = dg.m;
        const e = dg.e;

        return (
          <div key={dg.id || index} className="card shadow mb-4">

            {/* ===================== FIRST TABLE ===================== */}
            <div className="table-responsive">
              <table className="table table-bordered table-hover text-center align-middle">
                <thead className="table-light">
                  <tr>
                    <th colSpan={2}>
                      <div className="d-flex justify-content-around align-items-center">
                        <span className="fw-bold">
                          {dg.id?.toUpperCase()}
                        </span>
                        <span className="small text-muted">
                          Last Updated: {lastUpdated}
                        </span>
                      </div>
                    </th>

                    <th>Phase R</th>
                    <th>Phase Y</th>
                    <th>Phase B</th>
                    <th>Average</th>
                    <th>Total</th>
                    <th>Percent</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <th rowSpan={4} className="align-middle">
                      Voltage, Current & Power Measurements
                    </th>
                    <td>Line to Line Voltage (VL-L)</td>
                    <td>{m.v.vll.r}</td>
                    <td>{m.v.vll.y}</td>
                    <td>{m.v.vll.b}</td>
                    <td>{m.v.vll.a}</td>
                    <td>-</td>
                    <td>-</td>
                  </tr>

                  <tr>
                    <td>Line to Neutral Voltage (VL-N)</td>
                    <td>{m.v.vln.r}</td>
                    <td>{m.v.vln.y}</td>
                    <td>{m.v.vln.b}</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                  </tr>

                  <tr>
                    <td>Current (A)</td>
                    <td>{m.i.r}</td>
                    <td>{m.i.y}</td>
                    <td>{m.i.b}</td>
                    <td>{m.i.a}</td>
                    <td>-</td>
                    <td>-</td>
                  </tr>

                  <tr>
                    <td>Real Power (kW)</td>
                    <td>{m.p.r}</td>
                    <td>{m.p.y}</td>
                    <td>{m.p.b}</td>
                    <td>-</td>
                    <td>{m.p.t}</td>
                    <td>{m.p.pct}%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ===================== SECOND TABLE ===================== */}
            <div className="table-responsive">
              <table className="table table-bordered table-hover text-center align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Engine Status</th>
                    <th>Control Switch Position</th>
                    <th>Automatic Start / Stop State</th>
                    <th>RPM</th>
                    <th>Operating Hours</th>
                    <th>Battery Voltage</th>
                    <th>Temperature (°C)</th>
                    <th>Fuel Consumption (L/h)</th>
                    <th>Total Real Energy (kWh)</th>
                    <th>Average Frequency (Hz)</th>
                    <th>Power Factor</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td>
                      <span
                        className={`badge ${
                          e.st === "running"
                            ? "text-bg-success"
                            : "text-bg-danger"
                        }`}
                      >
                        {e.st}
                      </span>
                    </td>
                    <td>{e.sp}</td>
                    <td>{e.st}</td>
                    <td>{e.rpm}</td>
                    <td>{e.oh}</td>
                    <td>{e.vb}</td>
                    <td>{e.t}</td>
                    <td>{e.fl}</td>
                    <td>{m.p.et}</td>
                    <td>{m.hz}</td>
                    <td>{m.pf}</td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        );
      })}
    </div>
  );
};

export default DieselGenerator;

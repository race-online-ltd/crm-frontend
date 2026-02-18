import React, { useEffect, useState, useContext, useRef } from 'react';
import moment from 'moment';
import { useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as bootstrap from 'bootstrap';
import { fetchDeviceStatusById } from '../api/dashboardTabApi';
import { errorMessage, successMessage } from '../api/api-config/apiResponseMessage';
import { userContext } from '../context/UserContext';

const DeviceAlarmDetails = () => {
  const { user } = useContext(userContext);
  const { id } = useParams();

  const [detailsData, setDetailsData] = useState([]);
  const [show, setShow] = useState(false);

  const modalRef = useRef(null);
  const bsModal = useRef(null); // Bootstrap modal instance

  const sensorIds = id.split(',').map(Number);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchDeviceStatusById(id)
      .then((res) => {
        setDetailsData(res.data);
      })
      .catch(errorMessage)
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  return (
    <section className="my-2">
      <div className="container">
        <h3 className="mb-4 text-center">Alarm Details</h3>
        <div className="card shadow-sm border-0">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover table-striped table-bordered">
                <thead className="table-dark">
                  <tr>
                    <th>Data Center</th>
                    <th>Device</th>
                    <th>Location</th>
                    {/* <th>Is Active</th> */}
                    <th>Updated At</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="text-center">
                        <div className="d-flex justify-content-center align-items-center py-3">
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : detailsData.length > 0 ? (
                    detailsData.map((item, index) => (
                      <tr key={index}>
                        <td>{item.datacenter}</td>
                        <td>{item.device}</td>
                        <td>{item.location}</td>
                        {/* <td>
                          <span className="badge bg-danger">{item.is_active}</span>
                        </td> */}
                        <td>{moment(item.updated_at).format('MMMM Do YYYY, h:mm:ss a')}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center">
                        No alarm data found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DeviceAlarmDetails;

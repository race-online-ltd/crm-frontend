import React, { useEffect, useState, useContext, useRef } from 'react';
import moment from 'moment';
import { useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as bootstrap from 'bootstrap'; 
import { acknowledgeAlarmStore, getAlarmDetails } from '../api/alarmApi';
import { errorMessage, successMessage } from '../api/api-config/apiResponseMessage';
import { userContext } from '../context/UserContext';

const AlarmDetails = () => {
  const { user } = useContext(userContext);
const { id } = useParams();

  const [detailsData, setDetailsData] = useState([]);
  const [show, setShow] = useState(false);

  const modalRef = useRef(null);
  const bsModal = useRef(null); // Bootstrap modal instance

  const sensorIds = id.split(',').map(Number);

  useEffect(() => {
    getAlarmDetails({ sensorIds: sensorIds })
      .then((res) => {
        setDetailsData(res.data);
      })
      .catch(errorMessage);
  }, [id]);

  useEffect(() => {
    if (modalRef.current) {
      bsModal.current = new bootstrap.Modal(modalRef.current, {
        backdrop: 'static',
        keyboard: false,
      });
    }
  }, []);

  useEffect(() => {
    if (bsModal.current) {
      if (show) {
        bsModal.current.show();
      } else {
        bsModal.current.hide();
      }
    }
  }, [show]);

  const handleModal = (item) => {
    formik.setFieldValue('sensorId', item.Sensor_Id);
    formik.setFieldValue('alarmValue', item.Sensor_value);
    setShow(true);
  };

  const formik = useFormik({
    initialValues: {
      sensorId: '',
      alarmValue: '',
      userId: user?.id || '',
      message: '',
    },
    onSubmit: (values, { resetForm }) => {
      acknowledgeAlarmStore(values)
        .then((res) => {
          getAlarmDetails({ sensorIds: sensorIds })
      .then((res) => {
        setDetailsData(res.data);
      })
      .catch(errorMessage);
          resetForm();
          setShow(false);
          successMessage(res);
        })
        .catch(errorMessage);
    },
  });

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
                    <th>Type</th>
                    <th>Location</th>
                    <th>Value</th>
                    <th>Created At</th>
                    <th>Acknowledged At</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {detailsData.length > 0 ? (
                    detailsData.map((item, index) => (
                      <tr key={index}>
                        <td>{item.Data_Center}</td>
                        <td>{item.Device_Name}</td>
                        <td>{item.Sensor_type}</td>
                        <td>{item.Sensor_location}</td>
                        <td>
                          <span className="badge bg-danger">
                            {item.Sensor_value}
                          </span>
                        </td>
                        <td>{moment(item.created_at).format('MMMM Do YYYY, h:mm:ss a')}</td>
                        <td>{item.acknowledged_at? moment(item.acknowledged_at).format('MMMM Do YYYY, h:mm:ss a'):''}</td>
                        
                        <td>
                          <button
                            onClick={() => handleModal(item)}
                            className={`btn btn-sm ${item.is_acknowledged? 'btn-success' :'btn-danger'}`}
                            disabled={item.is_acknowledged?true:false}
                          >
                            {item.is_acknowledged? 'Acknowledged':'Acknowledge'}
                          </button>
                        </td>
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

      {/* Modal always rendered, controlled via Bootstrap */}
      <div
        className="modal fade"
        tabIndex="-1"
        aria-labelledby="acknowledgeModalLabel"
        aria-hidden="true"
        ref={modalRef}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="acknowledgeModalLabel">Acknowledge</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShow(false)}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form onSubmit={formik.handleSubmit}>
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

                <div className="mb-3">
                  <label htmlFor="message" className="form-label">
                    Message (Optional)
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    className="form-control"
                    rows="3"
                    value={formik.values.message}
                    onChange={formik.handleChange}
                  />
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button type="submit" className="btn btn-primary">
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AlarmDetails;

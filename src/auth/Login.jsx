import React, { useContext, useState, useEffect } from "react";
import { useFormik } from "formik";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faLock } from "@fortawesome/free-solid-svg-icons";
import { loginSchema } from "./../schema/ValidationSchemas";
import { useNavigate } from "react-router-dom";
import { errorMessage } from "./../api/api-config/apiResponseMessage";
import { ToastContainer } from "react-toastify";
import { authenticateUser } from "../api/userApi";
import { userContext } from "./../context/UserContext";
import { encryptData } from "./../utils/cryptoUtils";

export const Login = () => {
  const { user, setUser } = useContext(userContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validationSchema: loginSchema,
    onSubmit: async (values, { resetForm }) => {
      setIsLoading(true);
      authenticateUser(values) 
        .then((res) => {
          const token = res.access_token;
          const encryptedUserData = encryptData(res.data);
          setUser(res.data);
          localStorage.setItem("user-info", encryptedUserData);
          localStorage.setItem('access_token', token);
          navigate("/admin/home");
          resetForm();
        })
        .catch(errorMessage)
        .finally(() => {
          setIsLoading(false);
        });
    },
  });

  return (
    <section>
      <div className='container'>
        <div
          className='row d-flex align-items-center justify-content-center'
          style={{ height: "100vh" }}>
          <div className='col col-md-5'>
            <div className='card'>
              <div className='card-header d-flex justify-content-center align-items-center'>
                <h5>DCIM</h5>
              </div>
              <div className='p-5'>
                <form className='row' onSubmit={formik.handleSubmit}>
                  <div className='col-12'>
                    <div className='input-group mb-3'>
                      <span className='input-group-text' id='basic-addon1'>
                        <FontAwesomeIcon icon={faUser} />
                      </span>
                      <input
                        type='text'
                        className={`form-control ${
                          formik.touched.username && formik.errors.username
                            ? "is-invalid"
                            : ""
                        }`}
                        placeholder='Username'
                        name='username'
                        value={formik.values.username}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      {formik.touched.username && formik.errors.username ? (
                        <div className='invalid-feedback'>
                          {formik.errors.username}
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className='col-12'>
                    <div className='input-group mb-4'>
                      <span className='input-group-text' id='basic-addon1'>
                        <FontAwesomeIcon icon={faLock} />
                      </span>
                      <input
                        type='password'
                        className={`form-control ${
                          formik.touched.password && formik.errors.password
                            ? "is-invalid"
                            : ""
                        }`}
                        placeholder='Password'
                        name='password'
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      {formik.touched.password && formik.errors.password ? (
                        <div className='invalid-feedback'>
                          {formik.errors.password}
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className='col-12'>
                    <button
                      type='submit'
                      className='add-btn w-100'
                      disabled={isLoading}>
                      {isLoading ? "Logging in..." : "Login"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </section>
  );
};

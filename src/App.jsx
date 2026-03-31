import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import DeviceList from './pages/DeviceList';
import Log from './pages/Log';
import Settings from './pages/Settings';
import Servers from './pages/Servers';
import Reports from './pages/Reports';
import RegistrationForm from './pages/UserRegister';
import Users from './pages/Users';
import { Error } from './pages/Error';
import { Login } from './auth/Login';
import { PrivateRoutes } from './routes/PrivateRoutes';
import { PublicRoutes } from './routes/PublicRoutes';
import UserPermissionsPage from './pages/UserPermissionsPage';
import RoleList from './pages/RoleIndex';
import CreateRole from './pages/RoleCreate';
import RoleShow from './pages/RoleShow';
import EditRole from './pages/RoleEdit';
import { Divisions } from './pages/settings/Divisions';
import { AddDivision } from './pages/settings/AddDivision';
import AddDataCenter from './pages/settings/AddDataCenter';
import DataCenterList from './pages/settings/DataCenterList';
import PartnerList from './pages/settings/Partner';
import DcOwnerMapping from './pages/settings/DcOwnerMapping';
import DcPartnerMapping from './pages/settings/DcPartnerMapping';
import DeviceListShow from './pages/settings/DeviceListShow';
import DeviceForm from './pages/settings/DeviceForm';
import SensorList from './pages/settings/SensorList';
import SensorForm from './pages/settings/SensorForm';
import SensorDetail from './pages/settings/SensorDetail';
import Home from './pages/Home';
import ThresholdTypes from './pages/settings/ThresholdTypes';
import ThresholdValues from './pages/settings/ThresholdValues';
import StateConfigs from './pages/settings/StateConfigs';
import { PermissionProvider } from './context/PermissionContext';
import DashboardMapping from './pages/settings/DashboardMapping';

import SvgUploader from './pages/settings/SvgUploader';
import SvgPreview from './pages/settings/SvgPreview';
import { useDispatch } from 'react-redux';
import { addData } from './redux/features/dashboard/mqttSlice';
import ablyService from './services/ablyService';
import AlarmDetails from './pages/AlarmDetails';
import { DOControlPage } from './pages/settings/DOControl.page';
import { DOControlConfigurationComponent } from './components/DOControlConfiguration.component';
import DeviceAlarmDetails from './pages/DeviceAlarmDetails';
import AlarmReport from './pages/reports/AlarmReport';


const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    ablyService.connectAbly();
    ablyService.subscribeToChannel((data) => {
      dispatch(addData(data));
    });

    return () => {
      ablyService.unsubscribeFromChannel();
    };
  }, [dispatch]);
  return (
    <PermissionProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PublicRoutes />}>
            <Route path="/" element={<Login />} />
            <Route path="*" element={<Error />} />
          </Route>

          <Route path="/admin/*" element={<PrivateRoutes />}>
            <Route path="home" element={<Home />} />
            <Route path="alarm-details/:id" element={<AlarmDetails />} />
            <Route path="device-details/:id" element={<DeviceAlarmDetails />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="reports/device-list" element={<DeviceList />} />
            <Route path="reports/log" element={<Log />} />
            <Route path="reports/settings" element={<Settings />} />
            <Route path="servers" element={<Servers />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings/userregister" element={<RegistrationForm />} />
            <Route path="settings/division" element={<Divisions />} />
            <Route path="settings/add-division" element={<AddDivision />} />
            <Route path="settings/datacenter" element={<AddDataCenter />} />
            <Route path="settings/datacenter/:id" element={<AddDataCenter />} />
            <Route path="settings/datacenter-show" element={<DataCenterList />} />
            <Route path="users" element={<Users />} />

            <Route path="settings/partner-list" element={<PartnerList />} />
            <Route path="settings/add-partner" element={<PartnerList />} />
            <Route path="settings/edit-partner/:id" element={<PartnerList />} />

            <Route path="settings/dc-user-mapping" element={<DcOwnerMapping />} />
            <Route path="settings/dc-partner-mapping" element={<DcPartnerMapping />} />

            <Route path="settings/devices-list" element={<DeviceListShow />} />
            <Route path="settings/devices-create" element={<DeviceForm />} />
            <Route path="settings/devices-edit/:id" element={<DeviceForm />} />

            <Route path="settings/sensor-lists" element={<SensorList />} />
            <Route path="settings/sensor-lists/create" element={<SensorForm />} />
            <Route path="settings/sensor-lists/:id" element={<SensorDetail />} />
            <Route path="settings/sensor-edit/:id" element={<SensorForm />} />

            <Route path="settings/threshold-types" element={<ThresholdTypes />} />
            <Route path="settings/threshold-values" element={<ThresholdValues />} />

            <Route path="settings/state-configs" element={<StateConfigs />} />

            <Route path="settings/dashboart-tab-mappings" element={<DashboardMapping />} />

            <Route path="settings/svguploader" element={<SvgUploader />} />
            <Route path="settings/svgpreviewer" element={<SvgPreview />} />
            <Route path="reports/alarm" element={<AlarmReport />} />

            <Route path="roles" element={<RoleList />} />
            <Route path="roles/create" element={<CreateRole />} />
            <Route path="roles/:id" element={<RoleShow />} />
            <Route path="roles/:id/edit" element={<EditRole />} />

            <Route path="permissions" element={<UserPermissionsPage />} />
            <Route path="settings/control-config" element={<DOControlPage />} />
            <Route path="settings/do-control-form" element={<DOControlConfigurationComponent />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </PermissionProvider>
  );
};

export default App;

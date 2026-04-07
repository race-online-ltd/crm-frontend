// ─── src/features/target/index.js ────────────────────────────────────────────
// Barrel export for the target feature

export { default as KAMTargetTable } from './components/KAMTargetTable';
export { default as SetTarget }      from './components/SetTarget';
export { default as MonthPickerField } from './components/MonthPickerField';
export { default as TargetList }     from './pages/TargetList';
export { default as SetTargetPage }  from './pages/SetTargetPage';


// ─── Add these routes to your router (e.g. src/routes/AppRoutes.jsx) ─────────
/*

import TargetList    from '../features/target/pages/TargetList';
import SetTargetPage from '../features/target/pages/SetTargetPage';

// Inside your <Routes>:
<Route path="/target"     element={<TargetList />}    />
<Route path="/target/set" element={<SetTargetPage />} />

*/
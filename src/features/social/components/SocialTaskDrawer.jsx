import Box from '@mui/material/Box';
import SelectDropdownSingle from '../../../components/shared/SelectDropdownSingle';
import TaskForm from '../../task/components/TaskForm';
import { createTask } from '../../task/api/taskApi';
import SocialFloatingPanel from './SocialFloatingPanel';
import { useSocial } from '../context/SocialContext';
import { entities } from '../data/mockData';

const ENTITY_OPTIONS = entities.map((entity) => ({
  id: entity,
  label: entity,
}));

export default function SocialTaskDrawer({ open, onClose }) {
  const { activeEntity, showToast } = useSocial();

  return (
    <SocialFloatingPanel
      open={open}
      onClose={onClose}
      title="Convert to Task"
      width={580}
      height={640}
      contentSx={{ p: 0 }}
    >
      <Box sx={{ p: 2.5 }}>
        <Box sx={{ mb: 2 }}>
          <SelectDropdownSingle
            name="businessEntity"
            label="Business Entity"
            options={ENTITY_OPTIONS}
            value={activeEntity}
            disabled
          />
        </Box>
        {open ? (
          <TaskForm
            onCancel={onClose}
            actionWidth="100%"
            onSubmit={async (_payload, formData) => {
              await createTask(formData);
              showToast?.('Task created from chat.');
              onClose();
            }}
          />
        ) : null}
      </Box>
    </SocialFloatingPanel>
  );
}

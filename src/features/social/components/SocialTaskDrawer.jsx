import { useCallback, useRef, useState } from 'react';
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

export default function SocialTaskDrawer({ open, onClose, onSubmitted }) {
  const { activeEntity, showToast } = useSocial();
  const [draftValues, setDraftValues] = useState(null);
  const draftRef = useRef(null);

  const handleDraftChange = useCallback((values) => {
    draftRef.current = values;
  }, []);

  const handleClose = useCallback(() => {
    if (draftRef.current) {
      setDraftValues(draftRef.current);
    }
    onClose();
  }, [onClose]);

  return (
    <SocialFloatingPanel
      open={open}
      onClose={handleClose}
      title="Convert to Task"
      width={780}
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
            initialValues={draftValues}
            onCancel={handleClose}
            onDraftChange={handleDraftChange}
            actionWidth="100%"
            onSubmit={async (_payload, formData) => {
              await createTask(formData);
              showToast?.('Task created from chat.');
              draftRef.current = null;
              setDraftValues(null);
              onSubmitted?.();
              onClose();
            }}
          />
        ) : null}
      </Box>
    </SocialFloatingPanel>
  );
}

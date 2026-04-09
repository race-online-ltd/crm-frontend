import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

const ChatPickDialog = ({ chat, open, loading, onClose, onConfirm }) => {
  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ pb: 1 }}>
        <Typography fontWeight={700} fontSize={17}>
          Pick This Chat
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Typography fontSize={14} color="#475569">
          Do you want to pick this chat?
        </Typography>
        {chat && (
          <Typography fontSize={13} color="#111827" fontWeight={600} mt={1}>
            {chat.name}
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button variant="outlined" color="inherit" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant="contained" onClick={onConfirm} disabled={loading}>
          {loading ? 'Picking...' : 'Confirm'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChatPickDialog;

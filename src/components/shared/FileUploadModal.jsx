// src/components/shared/FileUploadModal.jsx
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Modal, Box, Typography, IconButton, Stack, 
  Button, List, ListItem, ListItemText, Paper
} from '@mui/material';
import {
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
  Description as FileIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import CancelIcon from '@mui/icons-material/Cancel';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 500 },
  bgcolor: 'background.paper',
  borderRadius: '16px',
  boxShadow: 24,
  p: 4,
};

export default function FileUploadModal({ open, onClose, onUpload }) {
  const [files, setFiles] = useState([]);

  const onDrop = useCallback((acceptedFiles) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf']
    },
    maxSize: 5 * 1024 * 1024, // 5MB limit
  });

  const removeFile = (name) => {
    setFiles(files.filter(file => file.name !== name));
  };

  const handleUpload = () => {
    onUpload(files);
    setFiles([]); 
    onClose();
  };

  const isUploadDisabled = files.length === 0 || fileRejections.length > 0;

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight={700} sx={{ color: '#1e293b' }}>
            Upload Documents
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>

        {/* Dropzone Area */}
        <Paper
          {...getRootProps()}
          variant="outlined"
          sx={{
            p: 4,
            textAlign: 'center',
            cursor: 'pointer',
            border: '2px dashed',
            borderColor: isDragActive ? 'primary.main' : '#e2e8f0',
            bgcolor: isDragActive ? '#f0f7ff' : '#fafafa',
            transition: 'all 0.2s ease',
            '&:hover': { bgcolor: '#f1f5f9', borderColor: '#cbd5e0' }
          }}
        >
          <input {...getInputProps()} />
          <CloudUploadIcon sx={{ fontSize: 40, color: '#94a3b8', mb: 1 }} />
          <Typography variant="body2" fontWeight={600} color="#475569">
            {isDragActive ? "Drop the files here" : "Click or drag files to upload"}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            JPG, PNG or PDF (Max 5MB)
          </Typography>
        </Paper>

        {/* Error Message */}
        {fileRejections.length > 0 && (
          <Box sx={{ mt: 2, p: 1, bgcolor: '#fef2f2', borderRadius: 1, border: '1px solid #fee2e2' }}>
            <Typography color="error" variant="caption" fontWeight={600} sx={{ display: 'block', textAlign: 'center' }}>
              Error: One or more files exceed 5MB or invalid format.
            </Typography>
          </Box>
        )}

        {/* Selected Files List */}
        <List sx={{ mt: 2, maxHeight: 180, overflow: 'auto', '&::-webkit-scrollbar': { width: '4px' } }}>
          {files.map((file) => (
            <ListItem
              key={file.name}
              secondaryAction={
                <IconButton edge="end" size="small" onClick={() => removeFile(file.name)}>
                  <DeleteIcon fontSize="small" color="error" />
                </IconButton>
              }
              sx={{ bgcolor: '#f8fafc', borderRadius: '8px', mb: 1, border: '1px solid #f1f5f9' }}
            >
              <FileIcon sx={{ mr: 1.5, color: '#64748b', fontSize: 20 }} />
              <ListItemText 
                primary={file.name} 
                secondary={`${(file.size / (1024 * 1024)).toFixed(2)} MB`} 
                primaryTypographyProps={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155' }}
                secondaryTypographyProps={{ fontSize: '0.65rem' }}
              />
            </ListItem>
          ))}
        </List>

        {/* Action Buttons */}
        <Stack direction="row" spacing={2} justifyContent="flex-end" mt={3}>
          {/* আপনার রিকোয়েস্ট অনুযায়ী আপডেট করা ক্যানসেল বাটন */}
          <Button 
            variant="outlined" 
            color="error" 
            startIcon={<CancelIcon />}
            onClick={onClose}
            size="small"
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Cancel
          </Button>
          
          <Button 
            variant={isUploadDisabled ? "outlined" : "contained"} 
            disabled={isUploadDisabled}
            onClick={handleUpload}
            size="small"
            sx={{ 
              textTransform: 'none',
              px: 3,
              fontWeight: 600,
              '&.Mui-disabled': {
                border: '1px solid #e2e8f0',
                color: '#94a3b8'
              }
            }}
          >
            Upload Now
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}
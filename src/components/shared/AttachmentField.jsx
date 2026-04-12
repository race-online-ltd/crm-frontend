import React from 'react';
import {
  Box,
  Button,
  Chip,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

export const ATTACHMENT_ACCEPT =
  '.pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg,.gif,.bmp,.webp,.svg';
const MAX_TOTAL_SIZE = 25 * 1024 * 1024;

function formatFileSize(size = 0) {
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

function buildAcceptMap(accept) {
  return accept.split(',').reduce((acc, item) => {
    const extension = item.trim().toLowerCase();
    if (!extension) return acc;

    if (extension === '.pdf') acc['application/pdf'] = ['.pdf'];
    else if (extension === '.doc') acc['application/msword'] = ['.doc'];
    else if (extension === '.docx') acc['application/vnd.openxmlformats-officedocument.wordprocessingml.document'] = ['.docx'];
    else if (extension === '.xls') acc['application/vnd.ms-excel'] = ['.xls'];
    else if (extension === '.xlsx') acc['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'] = ['.xlsx'];
    else if (extension === '.csv') acc['text/csv'] = ['.csv'];
    else acc['image/*'] = [...(acc['image/*'] || []), extension];

    return acc;
  }, {});
}

function mergeFiles(currentFiles, selectedFiles) {
  const nextFiles = [...currentFiles];

  selectedFiles.forEach((file) => {
    const alreadyAdded = nextFiles.some((item) => (
      item.name === file.name
      && item.size === file.size
      && item.lastModified === file.lastModified
    ));

    if (!alreadyAdded) {
      nextFiles.push(file);
    }
  });

  return nextFiles;
}

export default function AttachmentField({
  label = 'Attachments',
  value = [],
  onChange,
  accept = ATTACHMENT_ACCEPT,
  helperText = '',
}) {
  const files = Array.isArray(value) ? value : [];
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const exceedsTotalSize = totalSize > MAX_TOTAL_SIZE;

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: buildAcceptMap(accept),
    multiple: true,
    noClick: true,
    onDrop: (acceptedFiles) => {
      if (!acceptedFiles.length) return;
      onChange?.(mergeFiles(files, acceptedFiles));
    },
  });

  return (
    <Box>
      {label ? (
        <Typography variant="body2" fontWeight={700} color="#0f172a" sx={{ mb: 1 }}>
          {label}
        </Typography>
      ) : null}
      <Box
        {...getRootProps()}
        sx={{
          border: '1px dashed #cbd5e1',
          borderRadius: '14px',
          bgcolor: isDragActive ? '#eff6ff' : '#f8fafc',
          px: 2,
          py: 1.75,
          transition: 'all 0.18s ease',
          '&:hover': {
            borderColor: '#93c5fd',
            bgcolor: '#f8fbff',
          },
        }}
      >
        <input {...getInputProps()} />

        <Stack
          alignItems="center"
          justifyContent="center"
          spacing={1.1}
        >
          <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', maxWidth: 320 }}>
            Drag and drop files here, or use the button to browse.
          </Typography>

          <Button
            type="button"
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            onClick={open}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.78rem',
              borderRadius: '9px',
              borderColor: '#cbd5e1',
              color: '#334155',
              whiteSpace: 'nowrap',
            }}
          >
            Attach Files
          </Button>
        </Stack>

        {exceedsTotalSize && (
          <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1.25, fontWeight: 600 }}>
            Total attachment size exceeds 25 MB. Please remove some files before submitting.
          </Typography>
        )}

        {files.length > 0 && (
          <Stack spacing={0.75} mt={1.5}>
            {files.map((file) => (
              <Stack
                key={`${file.name}-${file.lastModified}`}
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{
                  p: '7px 10px',
                  borderRadius: '8px',
                  border: `1px solid ${exceedsTotalSize ? '#fecaca' : '#dbeafe'}`,
                  bgcolor: exceedsTotalSize ? '#fef2f2' : '#eff6ff',
                }}
              >
                <InsertDriveFileIcon
                  sx={{
                    color: exceedsTotalSize ? '#dc2626' : '#2563eb',
                    fontSize: 17,
                    flexShrink: 0,
                  }}
                />
                <Box flex={1} minWidth={0}>
                  <Typography
                    noWrap
                    sx={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: exceedsTotalSize ? '#b91c1c' : '#1d4ed8',
                    }}
                  >
                    {file.name}
                  </Typography>
                </Box>
                <Chip
                  label={formatFileSize(file.size)}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    bgcolor: exceedsTotalSize ? '#fee2e2' : '#dbeafe',
                    color: exceedsTotalSize ? '#b91c1c' : '#1d4ed8',
                    flexShrink: 0,
                  }}
                />
                <IconButton
                  size="small"
                  sx={{ p: 0.4, flexShrink: 0 }}
                  onClick={() => onChange?.(files.filter((item) => item !== file))}
                >
                  <DeleteOutlineIcon fontSize="small" sx={{ color: '#ef4444', fontSize: 17 }} />
                </IconButton>
              </Stack>
            ))}
          </Stack>
        )}

        {files.length > 0 ? (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.25 }}>
            {files.length} file{files.length > 1 ? 's' : ''} selected. Total: {formatFileSize(totalSize)} / 25.00 MB
          </Typography>
        ) : null}

        {helperText ? (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            {helperText}
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
}

// Settings.jsx
import React from "react";
import { Typography, Paper, Box, Button, TextField } from "@mui/material";

export default function Settings() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      <Paper sx={{ p: 3, maxWidth: 500 }}>
        <TextField fullWidth label="Username" sx={{ mb: 2 }} />
        <TextField fullWidth label="Email" sx={{ mb: 2 }} />
        <Button variant="contained" color="primary">
          Save Changes
        </Button>
      </Paper>
    </Box>
  );
}

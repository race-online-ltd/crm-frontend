// src/components/shared/FilterButton.jsx
import React from "react";
import { Button } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import PropTypes from "prop-types";

export default function FilterButton({ onClick, label = "Filter", sx = {}, ...props }) {
  return (
    <Button
      variant="outlined"
      startIcon={<FilterListIcon />}
      onClick={onClick}
      sx={sx}
      {...props}
    >
      {label}
    </Button>
  );
}

FilterButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  label: PropTypes.string,
};

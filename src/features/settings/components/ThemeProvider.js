// src/theme/theme.js
import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  shape: { borderRadius: 8 },

  typography: {
    fontFamily: '"Inter", "system-ui", sans-serif',
    fontSize: 14,
    h4: { fontWeight: 700, fontSize: "1.75rem", lineHeight: 1.3 },
    h5: { fontWeight: 700, fontSize: "1.25rem", lineHeight: 1.3 },
    h6: { fontWeight: 700, fontSize: "1rem",    lineHeight: 1.4 },
    subtitle1: { fontWeight: 600, fontSize: "0.9rem"    },
    subtitle2: { fontWeight: 600, fontSize: "0.8rem"    },
    body1:     { fontSize: "0.875rem",  lineHeight: 1.6 },
    body2:     { fontSize: "0.8125rem", lineHeight: 1.6 },
    caption:   { fontSize: "0.75rem",   lineHeight: 1.5 },
    button:    { fontSize: "0.8125rem", fontWeight: 600 },
  },

  palette: {
    background: { default: "#f8fafc", paper: "#ffffff" },
    primary:    { main: "#2563eb", light: "#eff6ff", dark: "#1d4ed8" },
    text:       { primary: "#0f172a", secondary: "#64748b", disabled: "#94a3b8" },
    divider:    "#e2e8f0",
  },

  components: {
    // ── Buttons ────────────────────────────────────────────────────────────
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root:       { textTransform: "none", borderRadius: "8px", fontWeight: 600, fontSize: "0.8125rem" },
        sizeSmall:  { padding: "4px 12px",  fontSize: "0.78rem"  },
        sizeLarge:  { padding: "10px 24px", fontSize: "0.9rem"   },
      },
    },

    // ── Icons ──────────────────────────────────────────────────────────────
    // Keep a sensible default; individual usages can still override with sx.
    MuiSvgIcon: {
      styleOverrides: {
        root:          { fontSize: "1.25rem" },
        fontSizeSmall: { fontSize: "1rem"    },
        fontSizeLarge: { fontSize: "1.5rem"  },
      },
    },

    // ── Paper ──────────────────────────────────────────────────────────────
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root:     { borderRadius: "12px" },
        outlined: { borderColor: "#e2e8f0" },
      },
    },

    // ── Chip ───────────────────────────────────────────────────────────────
    MuiChip: {
      styleOverrides: {
        root:      { fontSize: "0.75rem", fontWeight: 600, borderRadius: "6px" },
        sizeSmall: { fontSize: "0.7rem",  height: "22px"  },
      },
    },

    // ── Tooltip ────────────────────────────────────────────────────────────
    MuiTooltip: {
      styleOverrides: {
        tooltip: { fontSize: "0.72rem", borderRadius: "6px", backgroundColor: "#1e293b" },
      },
    },

    // ── IconButton ─────────────────────────────────────────────────────────
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          "&:focus-visible": { outline: "2px solid #2563eb", outlineOffset: 2 },
        },
      },
    },

    // ── Table ──────────────────────────────────────────────────────────────
    MuiTableCell: {
      styleOverrides: {
        root: { fontSize: "0.8125rem", padding: "10px 14px" },
        head: { fontWeight: 700, color: "#64748b", backgroundColor: "#f8fafc" },
      },
    },

    // ── Global CSS baseline ────────────────────────────────────────────────
    MuiCssBaseline: {
      styleOverrides: {
        // box-sizing reset
        "*, *::before, *::after": { boxSizing: "border-box" },

        body: {
          // Allow x-scroll when content genuinely overflows (instead of hiding it).
          // The layout's overflow:hidden on the main column handles containment;
          // we don't want to kill the scrollbar at body level.
          overflowX: "auto",
          scrollbarWidth: "thin",
          scrollbarColor: "#cbd5e0 transparent",
        },

        // Slim scrollbar for Webkit
        "::-webkit-scrollbar":       { width: "5px", height: "5px" },
        "::-webkit-scrollbar-track": { background: "transparent"   },
        "::-webkit-scrollbar-thumb": { background: "#cbd5e0", borderRadius: "99px" },
      },
    },

    /*
     * ⚠️  NOT overriding MuiOutlinedInput or MuiInputLabel globally.
     *
     * The shared input components (AmountInputField, TextInputField, etc.)
     * each apply their own fontSize/padding via the `sx` prop. A global
     * MuiOutlinedInput override would conflict with those per-component
     * values and is the main reason the inputs were rendering incorrectly.
     * Leave input styling to the individual components.
     */
  },
});
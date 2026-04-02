import React, { useEffect, useRef, useState, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import { TextAlign } from "@tiptap/extension-text-align";

import {
  Box,
  IconButton,
  Divider,
  Tooltip,
  useTheme,
  Popover,
  Typography,
} from "@mui/material";

import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import TitleIcon from "@mui/icons-material/Title";
import ImageIcon from "@mui/icons-material/Image";
import LinkIcon from "@mui/icons-material/Link";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import TableChartIcon from "@mui/icons-material/TableChart";
import FormatColorTextIcon from "@mui/icons-material/FormatColorText";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import FormatAlignCenterIcon from "@mui/icons-material/FormatAlignCenter";
import FormatAlignRightIcon from "@mui/icons-material/FormatAlignRight";
import FormatAlignJustifyIcon from "@mui/icons-material/FormatAlignJustify";
import FormatStrikethroughIcon from "@mui/icons-material/FormatStrikethrough";
import CodeIcon from "@mui/icons-material/Code";
import HorizontalRuleIcon from "@mui/icons-material/HorizontalRule";

// Table operation icons
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import PlaylistRemoveIcon from "@mui/icons-material/PlaylistRemove";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import DeleteIcon from "@mui/icons-material/Delete";
import TableRowsIcon from "@mui/icons-material/TableRows";

// ─── Toolbar Button ──────────────────────────────────────────────────────────
const ToolbarButton = ({ title, active, onClick, children, disabled }) => {
  const theme = useTheme();
  return (
    <Tooltip title={title} arrow>
      <span>
        <IconButton
          size="small"
          disabled={disabled}
          onClick={onClick}
          sx={{
            borderRadius: 1,
            p: "5px",
            color: active
              ? theme.palette.primary.main
              : theme.palette.text.secondary,
            backgroundColor: active
              ? theme.palette.action.selected
              : "transparent",
            border: active
              ? `1px solid ${theme.palette.primary.light}`
              : "1px solid transparent",
            "&:hover": {
              backgroundColor: active
                ? theme.palette.action.selected
                : theme.palette.action.hover,
            },
            transition: "all 0.15s ease",
          }}
        >
          {children}
        </IconButton>
      </span>
    </Tooltip>
  );
};

// ─── Toolbar Divider ─────────────────────────────────────────────────────────
const ToolbarDivider = () => (
  <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.25 }} />
);

// ─── Main Editor ─────────────────────────────────────────────────────────────
const RichTextEditor = ({
  value,
  onChange,
  placeholder = "Start writing...",
}) => {
  const theme = useTheme();

  // ── Reactive active-state tracking ──────────────────────────────────────
  // We store a counter that increments on every selection/update so that
  // toolbar buttons re-evaluate editor.isActive() on every change.
  const [tick, setTick] = useState(0);
  const rerender = useCallback(() => setTick((t) => t + 1), []);

  // ── Color picker anchors ─────────────────────────────────────────────────
  const colorInputRef = useRef(null);
  const highlightInputRef = useRef(null);

  // ── Table toolbar visibility ─────────────────────────────────────────────
  const [inTable, setInTable] = useState(false);

  // ── Prevent value prop from resetting cursor inside table ────────────────
  // We track whether the last change originated from the editor itself.
  const isInternalChange = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      // Highlight extension supports background color marking
      Highlight.configure({ multicolor: true }),
      Image,
      Link.configure({
        openOnClick: false,
        // Automatically exit the link mark when the cursor leaves it
        autolink: true,
      }),
      Placeholder.configure({ placeholder }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],

    content: value || "",

    onUpdate: ({ editor }) => {
      isInternalChange.current = true;
      onChange(editor.getJSON());
      rerender();
      setInTable(editor.isActive("table"));
    },

    onSelectionUpdate: ({ editor }) => {
      rerender();
      setInTable(editor.isActive("table"));

      // ── Fix: exit link mark when cursor moves outside a link ──────────
      // When the cursor is NOT inside a link, ensure the link mark is not
      // being extended by unsetting it (so new typing won't inherit it).
      if (!editor.isActive("link")) {
        editor.commands.unsetMark("link");
      }
    },
  });

  // ── Sync external value changes (but not ones we caused) ────────────────
  useEffect(() => {
    if (!editor) return;
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    // Only reset when the value truly differs (e.g. parent reset)
    const current = JSON.stringify(editor.getJSON());
    const incoming = JSON.stringify(value);
    if (current !== incoming) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  if (!editor) return null;

  // ── Helpers ──────────────────────────────────────────────────────────────
  const addImage = () => {
    const url = window.prompt("Enter image URL");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const addLink = () => {
    const url = window.prompt("Enter link URL");
    if (url) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
      // Move cursor to end of link and immediately exit the mark
      editor.commands.selectTextblockEnd();
      editor.commands.unsetMark("link");
    }
  };

  const removeLink = () => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
  };

  const insertTable = () =>
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();

  const handleTextColor = (e) => {
    editor.chain().focus().setColor(e.target.value).run();
  };

  const handleHighlight = (e) => {
    editor.chain().focus().setHighlight({ color: e.target.value }).run();
  };

  // ── Active helpers (depend on tick so they re-evaluate reactively) ───────
  const is = (name, attrs) => editor.isActive(name, attrs);

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        overflow: "hidden",
        backgroundColor: "background.paper",
        color: "text.primary",
        boxShadow: theme.shadows[1],
      }}
    >
      {/* ── Main Toolbar ─────────────────────────────────────────────────── */}
      <Box
        sx={{
          px: 1,
          py: 0.75,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 0.25,
          borderBottom: "1px solid",
          borderColor: "divider",
          backgroundColor:
            theme.palette.mode === "dark"
              ? "rgba(255,255,255,0.03)"
              : "rgba(0,0,0,0.02)",
        }}
      >
        {/* Text style */}
        <ToolbarButton
          title="Bold (Ctrl+B)"
          active={is("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <FormatBoldIcon fontSize="small" />
        </ToolbarButton>

        <ToolbarButton
          title="Italic (Ctrl+I)"
          active={is("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <FormatItalicIcon fontSize="small" />
        </ToolbarButton>

        <ToolbarButton
          title="Strikethrough"
          active={is("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <FormatStrikethroughIcon fontSize="small" />
        </ToolbarButton>

        <ToolbarButton
          title="Inline Code"
          active={is("code")}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <CodeIcon fontSize="small" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Headings */}
        <ToolbarButton
          title="Heading 1"
          active={is("heading", { level: 1 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
        >
          <Typography
            component="span"
            sx={{ fontSize: 11, fontWeight: 700, lineHeight: 1 }}
          >
            H1
          </Typography>
        </ToolbarButton>

        <ToolbarButton
          title="Heading 2"
          active={is("heading", { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <Typography
            component="span"
            sx={{ fontSize: 11, fontWeight: 700, lineHeight: 1 }}
          >
            H2
          </Typography>
        </ToolbarButton>

        <ToolbarButton
          title="Heading 3"
          active={is("heading", { level: 3 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          <Typography
            component="span"
            sx={{ fontSize: 11, fontWeight: 700, lineHeight: 1 }}
          >
            H3
          </Typography>
        </ToolbarButton>

        <ToolbarDivider />

        {/* Lists */}
        <ToolbarButton
          title="Bullet List"
          active={is("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <FormatListBulletedIcon fontSize="small" />
        </ToolbarButton>

        <ToolbarButton
          title="Numbered List"
          active={is("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <FormatListNumberedIcon fontSize="small" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Alignment */}
        <ToolbarButton
          title="Align Left"
          active={is({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <FormatAlignLeftIcon fontSize="small" />
        </ToolbarButton>

        <ToolbarButton
          title="Align Center"
          active={is({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <FormatAlignCenterIcon fontSize="small" />
        </ToolbarButton>

        <ToolbarButton
          title="Align Right"
          active={is({ textAlign: "right" })}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <FormatAlignRightIcon fontSize="small" />
        </ToolbarButton>

        <ToolbarButton
          title="Justify"
          active={is({ textAlign: "justify" })}
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        >
          <FormatAlignJustifyIcon fontSize="small" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Color & Highlight ─ use hidden <input type="color"> for native picker */}
        <Tooltip title="Text Color" arrow>
          <IconButton
            size="small"
            onClick={() => colorInputRef.current?.click()}
            sx={{
              borderRadius: 1,
              p: "5px",
              position: "relative",
              border: "1px solid transparent",
              "&:hover": { backgroundColor: theme.palette.action.hover },
            }}
          >
            <FormatColorTextIcon fontSize="small" />
            {/* Color swatch strip under the icon */}
            <Box
              sx={{
                position: "absolute",
                bottom: 3,
                left: "50%",
                transform: "translateX(-50%)",
                width: 14,
                height: 3,
                borderRadius: 0.5,
                backgroundColor:
                  editor.getAttributes("textStyle").color || "#000",
              }}
            />
            <input
              ref={colorInputRef}
              type="color"
              defaultValue="#000000"
              style={{ display: "none" }}
              onChange={handleTextColor}
            />
          </IconButton>
        </Tooltip>

        <Tooltip title="Highlight Color" arrow>
          <IconButton
            size="small"
            onClick={() => highlightInputRef.current?.click()}
            sx={{
              borderRadius: 1,
              p: "5px",
              position: "relative",
              border: "1px solid transparent",
              "&:hover": { backgroundColor: theme.palette.action.hover },
            }}
          >
            <BorderColorIcon fontSize="small" />
            <Box
              sx={{
                position: "absolute",
                bottom: 3,
                left: "50%",
                transform: "translateX(-50%)",
                width: 14,
                height: 3,
                borderRadius: 0.5,
                backgroundColor:
                  editor.getAttributes("highlight").color || "#ffff00",
              }}
            />
            <input
              ref={highlightInputRef}
              type="color"
              defaultValue="#ffff00"
              style={{ display: "none" }}
              onChange={handleHighlight}
            />
          </IconButton>
        </Tooltip>

        <ToolbarDivider />

        {/* Media & Links */}
        <ToolbarButton title="Insert Image" onClick={addImage}>
          <ImageIcon fontSize="small" />
        </ToolbarButton>

        <ToolbarButton
          title="Insert Link"
          active={is("link")}
          onClick={addLink}
        >
          <LinkIcon fontSize="small" />
        </ToolbarButton>

        {is("link") && (
          <ToolbarButton title="Remove Link" onClick={removeLink}>
            <LinkOffIcon fontSize="small" />
          </ToolbarButton>
        )}

        <ToolbarButton
          title="Horizontal Rule"
          onClick={() =>
            editor.chain().focus().setHorizontalRule().run()
          }
        >
          <HorizontalRuleIcon fontSize="small" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Table insert */}
        <ToolbarButton
          title="Insert Table"
          active={inTable}
          onClick={insertTable}
        >
          <TableChartIcon fontSize="small" />
        </ToolbarButton>
      </Box>

      {/* ── Table Context Toolbar ─────────────────────────────────────────── */}
      {inTable && (
        <Box
          sx={{
            px: 1,
            py: 0.5,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 0.25,
            borderBottom: "1px solid",
            borderColor: "divider",
            backgroundColor:
              theme.palette.mode === "dark"
                ? "rgba(25,118,210,0.12)"
                : "rgba(25,118,210,0.06)",
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: theme.palette.primary.main,
              fontWeight: 600,
              mr: 0.5,
              letterSpacing: 0.3,
            }}
          >
            TABLE
          </Typography>

          <ToolbarDivider />

          <ToolbarButton
            title="Add Row Below"
            onClick={() => editor.chain().focus().addRowAfter().run()}
          >
            <PlaylistAddIcon fontSize="small" />
          </ToolbarButton>

          <ToolbarButton
            title="Delete Current Row"
            onClick={() => editor.chain().focus().deleteRow().run()}
          >
            <PlaylistRemoveIcon fontSize="small" />
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton
            title="Add Column After"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
          >
            <ViewColumnIcon fontSize="small" />
          </ToolbarButton>

          <ToolbarButton
            title="Delete Current Column"
            onClick={() => editor.chain().focus().deleteColumn().run()}
          >
            <DeleteSweepIcon fontSize="small" />
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton
            title="Merge Cells"
            onClick={() => editor.chain().focus().mergeCells().run()}
          >
            <TableRowsIcon fontSize="small" />
          </ToolbarButton>

          <ToolbarButton
            title="Split Cell"
            onClick={() => editor.chain().focus().splitCell().run()}
          >
            <TableChartIcon fontSize="small" />
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton
            title="Delete Table"
            onClick={() => editor.chain().focus().deleteTable().run()}
          >
            <DeleteIcon fontSize="small" sx={{ color: "error.main" }} />
          </ToolbarButton>
        </Box>
      )}

      {/* ── Editor Content ────────────────────────────────────────────────── */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          "& .ProseMirror": {
            minHeight: 220,
            fontFamily: theme.typography.fontFamily,
            fontSize: theme.typography.body1.fontSize,
            lineHeight: 1.7,
            color: theme.palette.text.primary,
            outline: "none",
          },
          "& .ProseMirror p": { margin: "0 0 6px 0" },
          "& .ProseMirror p.is-editor-empty:first-of-type::before": {
            content: "attr(data-placeholder)",
            float: "left",
            color: theme.palette.text.disabled,
            pointerEvents: "none",
            height: 0,
          },
          "& .ProseMirror h1": {
            fontSize: "1.8em",
            margin: "12px 0 4px 0",
            fontWeight: 700,
          },
          "& .ProseMirror h2": {
            fontSize: "1.4em",
            margin: "10px 0 4px 0",
            fontWeight: 600,
          },
          "& .ProseMirror h3": {
            fontSize: "1.15em",
            margin: "8px 0 3px 0",
            fontWeight: 600,
          },
          // Remove browser-default top/bottom margin on the list container
          "& .ProseMirror ul, & .ProseMirror ol": {
            paddingLeft: 22,
            margin: "2px 0 6px 0",
          },
          // Remove browser-default margin on individual list items
          "& .ProseMirror li": {
            margin: "1px 0",
            padding: 0,
          },
          // The paragraph inside a list item adds extra space — kill it
          "& .ProseMirror li > p": {
            margin: 0,
            padding: 0,
          },
          "& .ProseMirror a": {
            color: theme.palette.primary.main,
            textDecoration: "underline",
            cursor: "pointer",
          },
          "& .ProseMirror hr": {
            border: "none",
            borderTop: `1px solid ${theme.palette.divider}`,
            margin: "16px 0",
          },
          "& .ProseMirror code": {
            backgroundColor: theme.palette.action.selected,
            borderRadius: 3,
            padding: "1px 5px",
            fontFamily: "monospace",
            fontSize: "0.9em",
          },
          // ── Table styles ──────────────────────────────────────────────
          "& .ProseMirror table": {
            borderCollapse: "collapse",
            width: "100%",
            margin: "12px 0",
            tableLayout: "fixed",
          },
          "& .ProseMirror th, & .ProseMirror td": {
            border: `1px solid ${theme.palette.divider}`,
            padding: "6px 10px",
            textAlign: "left",
            verticalAlign: "top",
            minWidth: 40,
            // !! Critical fix: prevent cell content overflow from breaking layout
            wordBreak: "break-word",
          },
          "& .ProseMirror th": {
            backgroundColor: theme.palette.action.selected,
            fontWeight: 600,
          },
          "& .ProseMirror .selectedCell": {
            backgroundColor: `${theme.palette.primary.main}22`,
          },
          "& .ProseMirror .column-resize-handle": {
            backgroundColor: theme.palette.primary.main,
            bottom: 0,
            position: "absolute",
            right: -2,
            top: 0,
            width: 4,
            cursor: "col-resize",
            pointerEvents: "none",
          },
          "& .ProseMirror .tableWrapper": {
            overflowX: "auto",
          },
          "& .resize-cursor": {
            cursor: "col-resize",
          },
        }}
      >
        <EditorContent editor={editor} />
      </Box>
    </Box>
  );
};

export default RichTextEditor;
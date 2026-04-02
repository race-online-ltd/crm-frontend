import React from "react";
import { Box, useTheme } from "@mui/material";

// ─── Mark Renderer ────────────────────────────────────────────────────────────
// Wraps text content in the appropriate inline HTML element based on TipTap marks.
const applyMarks = (text, marks = []) => {
  if (!marks || marks.length === 0) return text;

  return marks.reduce((content, mark) => {
    switch (mark.type) {
      case "bold":
        return <strong>{content}</strong>;

      case "italic":
        return <em>{content}</em>;

      case "strike":
        return <s>{content}</s>;

      case "code":
        return (
          <code
            style={{
              backgroundColor: "rgba(0,0,0,0.07)",
              borderRadius: 3,
              padding: "1px 5px",
              fontFamily: "monospace",
              fontSize: "0.9em",
            }}
          >
            {content}
          </code>
        );

      case "link":
        return (
          <a
            href={mark.attrs?.href}
            target={mark.attrs?.target || "_blank"}
            rel="noopener noreferrer nofollow"
            style={{
              color: "inherit",
              textDecorationColor: "currentColor",
              textDecoration: "underline",
              cursor: "pointer",
            }}
          >
            {content}
          </a>
        );

      case "textStyle": {
        const style = {};
        if (mark.attrs?.color) style.color = mark.attrs.color;
        return Object.keys(style).length > 0 ? (
          <span style={style}>{content}</span>
        ) : (
          content
        );
      }

      case "highlight": {
        const bg = mark.attrs?.color || "#ffff00";
        return (
          <mark
            style={{
              backgroundColor: bg,
              color: "inherit",
              borderRadius: 2,
              padding: "0 2px",
            }}
          >
            {content}
          </mark>
        );
      }

      default:
        return content;
    }
  }, text);
};

// ─── Inline Content Renderer ─────────────────────────────────────────────────
// Renders an array of inline nodes (text, hard breaks, images) inside a block.
const renderInlineContent = (content = []) => {
  if (!content || content.length === 0) return null;

  return content.map((node, i) => {
    switch (node.type) {
      case "text":
        return (
          <React.Fragment key={i}>
            {applyMarks(node.text, node.marks)}
          </React.Fragment>
        );

      case "hardBreak":
        return <br key={i} />;

      case "image":
        return (
          <img
            key={i}
            src={node.attrs?.src}
            alt={node.attrs?.alt || ""}
            title={node.attrs?.title}
            style={{ maxWidth: "100%", display: "inline-block" }}
          />
        );

      default:
        return null;
    }
  });
};

// ─── Block Node Renderer ──────────────────────────────────────────────────────
// Recursively renders any TipTap block node to a React element.
const RenderNode = ({ node, theme }) => {
  if (!node) return null;

  const textAlign = node.attrs?.textAlign || undefined;
  const alignStyle = textAlign ? { textAlign } : {};

  switch (node.type) {
    // ── Paragraphs ────────────────────────────────────────────────────────
    case "paragraph":
      return (
        <p style={{ margin: "0 0 6px 0", ...alignStyle }}>
          {renderInlineContent(node.content)}
          {/* Render a zero-width space for empty paragraphs so they take height */}
          {(!node.content || node.content.length === 0) && "\u200B"}
        </p>
      );

    // ── Headings ──────────────────────────────────────────────────────────
    case "heading": {
      const level = node.attrs?.level || 1;
      const sizeMap = { 1: "1.8em", 2: "1.4em", 3: "1.15em", 4: "1em", 5: "0.9em", 6: "0.85em" };
      const marginMap = { 1: "12px 0 4px 0", 2: "10px 0 4px 0", 3: "8px 0 3px 0", 4: "6px 0 3px 0" };
      const weightMap = { 1: 700, 2: 600, 3: 600, 4: 600, 5: 500, 6: 500 };
      const Tag = `h${level}`;
      return (
        <Tag
          style={{
            fontSize: sizeMap[level] || "1em",
            fontWeight: weightMap[level] || 600,
            margin: marginMap[level] || "6px 0 3px 0",
            lineHeight: 1.3,
            ...alignStyle,
          }}
        >
          {renderInlineContent(node.content)}
        </Tag>
      );
    }

    // ── Bullet List ───────────────────────────────────────────────────────
    case "bulletList":
      return (
        <ul style={{ paddingLeft: 22, margin: "2px 0 6px 0", listStyleType: "disc" }}>
          {(node.content || []).map((item, i) => (
            <RenderNode key={i} node={item} theme={theme} />
          ))}
        </ul>
      );

    // ── Ordered List ──────────────────────────────────────────────────────
    case "orderedList":
      return (
        <ol
          start={node.attrs?.start || 1}
          style={{ paddingLeft: 22, margin: "2px 0 6px 0" }}
        >
          {(node.content || []).map((item, i) => (
            <RenderNode key={i} node={item} theme={theme} />
          ))}
        </ol>
      );

    // ── List Item ─────────────────────────────────────────────────────────
    case "listItem":
      return (
        <li style={{ margin: "1px 0", padding: 0 }}>
          {(node.content || []).map((child, i) => (
            <RenderNode key={i} node={child} theme={theme} />
          ))}
        </li>
      );

    // ── Blockquote ────────────────────────────────────────────────────────
    case "blockquote":
      return (
        <blockquote
          style={{
            borderLeft: `3px solid ${theme.palette.divider}`,
            margin: "8px 0",
            paddingLeft: 12,
            color: theme.palette.text.secondary,
            fontStyle: "italic",
          }}
        >
          {(node.content || []).map((child, i) => (
            <RenderNode key={i} node={child} theme={theme} />
          ))}
        </blockquote>
      );

    // ── Code Block ────────────────────────────────────────────────────────
    case "codeBlock":
      return (
        <pre
          style={{
            backgroundColor: theme.palette.action.selected,
            borderRadius: 4,
            padding: "10px 14px",
            overflowX: "auto",
            fontFamily: "monospace",
            fontSize: "0.875em",
            margin: "8px 0",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          <code>{renderInlineContent(node.content)}</code>
        </pre>
      );

    // ── Horizontal Rule ───────────────────────────────────────────────────
    case "horizontalRule":
      return (
        <hr
          style={{
            border: "none",
            borderTop: `1px solid ${theme.palette.divider}`,
            margin: "16px 0",
          }}
        />
      );

    // ── Image (block-level) ───────────────────────────────────────────────
    case "image":
      return (
        <img
          src={node.attrs?.src}
          alt={node.attrs?.alt || ""}
          title={node.attrs?.title}
          style={{
            maxWidth: "100%",
            display: "block",
            margin: "8px 0",
            borderRadius: 4,
          }}
        />
      );

    // ── Table ─────────────────────────────────────────────────────────────
    case "table":
      return (
        <div style={{ overflowX: "auto", margin: "12px 0" }}>
          <table
            style={{
              borderCollapse: "collapse",
              width: "100%",
              tableLayout: "fixed",
              fontSize: "inherit",
            }}
          >
            <tbody>
              {(node.content || []).map((row, i) => (
                <RenderNode key={i} node={row} theme={theme} />
              ))}
            </tbody>
          </table>
        </div>
      );

    // ── Table Row ─────────────────────────────────────────────────────────
    case "tableRow":
      return (
        <tr>
          {(node.content || []).map((cell, i) => (
            <RenderNode key={i} node={cell} theme={theme} />
          ))}
        </tr>
      );

    // ── Table Header Cell ─────────────────────────────────────────────────
    case "tableHeader": {
      const colwidth = node.attrs?.colwidth?.[0];
      return (
        <th
          colSpan={node.attrs?.colspan || 1}
          rowSpan={node.attrs?.rowspan || 1}
          style={{
            border: `1px solid ${theme.palette.divider}`,
            padding: "6px 10px",
            textAlign: "left",
            verticalAlign: "top",
            fontWeight: 600,
            backgroundColor: theme.palette.action.selected,
            wordBreak: "break-word",
            ...(colwidth ? { width: colwidth } : {}),
          }}
        >
          {(node.content || []).map((child, i) => (
            <RenderNode key={i} node={child} theme={theme} />
          ))}
        </th>
      );
    }

    // ── Table Data Cell ───────────────────────────────────────────────────
    case "tableCell": {
      const colwidth = node.attrs?.colwidth?.[0];
      return (
        <td
          colSpan={node.attrs?.colspan || 1}
          rowSpan={node.attrs?.rowspan || 1}
          style={{
            border: `1px solid ${theme.palette.divider}`,
            padding: "6px 10px",
            textAlign: "left",
            verticalAlign: "top",
            wordBreak: "break-word",
            ...(colwidth ? { width: colwidth } : {}),
          }}
        >
          {(node.content || []).map((child, i) => (
            <RenderNode key={i} node={child} theme={theme} />
          ))}
        </td>
      );
    }

    // ── Doc (root) ────────────────────────────────────────────────────────
    case "doc":
      return (
        <>
          {(node.content || []).map((child, i) => (
            <RenderNode key={i} node={child} theme={theme} />
          ))}
        </>
      );

    default:
      // Graceful fallback: if we don't know the type, try rendering children
      if (node.content) {
        return (
          <>
            {node.content.map((child, i) => (
              <RenderNode key={i} node={child} theme={theme} />
            ))}
          </>
        );
      }
      return null;
  }
};

// ─── RichTextRenderer ─────────────────────────────────────────────────────────
/**
 * Renders TipTap JSON content as styled HTML inside a MUI-aware container.
 *
 * Props:
 *   content   {object|string}  — TipTap JSON doc object, OR a raw JSON string
 *   sx        {object}         — Extra MUI sx styles applied to the wrapper Box
 *   component {string}         — The root element type (default: "div")
 *   compact   {boolean}        — Tighten spacing for use inside small containers
 *   className {string}         — Optional className for the wrapper
 *
 * Usage examples:
 *
 *   // In a normal page area
 *   <RichTextRenderer content={post.body} />
 *
 *   // Inside a MUI Card or Paper
 *   <RichTextRenderer content={record.notes} sx={{ p: 2 }} />
 *
 *   // Inside a MUI TableCell
 *   <TableCell>
 *     <RichTextRenderer content={row.description} compact />
 *   </TableCell>
 *
 *   // Passing raw JSON string from API
 *   <RichTextRenderer content={apiResponse.content} />
 */
const RichTextRenderer = ({
  content,
  sx = {},
  component = "div",
  compact = false,
  className,
}) => {
  const theme = useTheme();

  // Accept either a parsed object or a raw JSON string
  let doc = content;
  if (typeof content === "string") {
    try {
      doc = JSON.parse(content);
    } catch {
      // If it's not valid JSON, render as plain text
      return (
        <Box component={component} className={className} sx={sx}>
          {content}
        </Box>
      );
    }
  }

  // Null / empty guard
  if (!doc) return null;

  // Support both a full doc node and a raw content array
  const docNode =
    doc.type === "doc"
      ? doc
      : { type: "doc", content: Array.isArray(doc) ? doc : [doc] };

  return (
    <Box
      component={component}
      className={className}
      sx={{
        // Base typography inherits from MUI theme
        fontFamily: theme.typography.fontFamily,
        fontSize: theme.typography.body1.fontSize,
        lineHeight: compact ? 1.5 : 1.7,
        color: theme.palette.text.primary,
        // Reset default browser styles that leak into rendered content
        "& *": { boxSizing: "border-box" },
        "& p": { margin: compact ? "0 0 3px 0" : "0 0 6px 0" },
        "& h1, & h2, & h3, & h4, & h5, & h6": {
          fontFamily: theme.typography.fontFamily,
        },
        "& ul, & ol": { paddingLeft: 22, margin: compact ? "1px 0 3px 0" : "2px 0 6px 0" },
        "& li": { margin: "1px 0", padding: 0 },
        "& li > p": { margin: 0, padding: 0 },
        "& a": {
          color: theme.palette.primary.main,
          textDecoration: "underline",
          wordBreak: "break-word",
        },
        "& a:hover": { opacity: 0.8 },
        "& table": {
          borderCollapse: "collapse",
          width: "100%",
          tableLayout: "fixed",
        },
        "& th, & td": {
          border: `1px solid ${theme.palette.divider}`,
          padding: compact ? "3px 6px" : "6px 10px",
          verticalAlign: "top",
          wordBreak: "break-word",
        },
        "& th": {
          backgroundColor: theme.palette.action.selected,
          fontWeight: 600,
        },
        "& tr:nth-of-type(even) td": {
          backgroundColor: theme.palette.action.hover,
        },
        "& pre": {
          backgroundColor: theme.palette.action.selected,
          borderRadius: 1,
          overflowX: "auto",
        },
        "& code": {
          fontFamily: "monospace",
        },
        "& img": {
          maxWidth: "100%",
        },
        "& mark": {
          borderRadius: "2px",
          padding: "0 2px",
        },
        "& hr": {
          border: "none",
          borderTop: `1px solid ${theme.palette.divider}`,
          margin: compact ? "8px 0" : "16px 0",
        },
        // Nested table indent
        "& td table, & th table": {
          margin: "4px 0",
          fontSize: "0.92em",
        },
        // Remove bottom margin from last child to avoid extra space
        "& > *:last-child": { marginBottom: 0 },
        ...sx,
      }}
    >
      <RenderNode node={docNode} theme={theme} />
    </Box>
  );
};

export default RichTextRenderer;
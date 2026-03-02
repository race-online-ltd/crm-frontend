
import React, { useMemo, useState, useRef, useEffect } from "react";
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Columns,
  Database,
  Filter,
  UploadCloud,
  AlertCircle,
  Clock,
  Pencil,
} from "lucide-react";


import './datatabe.css'

 // Ensure you have a CSS file with the necessary styles

/* -------------------------------------------------
   Helper Functions (UNCHANGED)
   ------------------------------------------------- */

function humanize(key) {
  return String(key)
    .replace(/[_\-]+/g, " ")
    .replace(/([a-z\d])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .replace(/^./, (c) => c.toUpperCase());
}

function safeCell(v) {
  if (v === null || v === undefined) return <span className="text-gray-400">—</span>;
  if (typeof v === "boolean") return v ? "Yes" : "No";
  return String(v);
}

function num(n) {
  return typeof n === "number" ? n : 0;
}

function formatImportMeta(meta) {
  if (!meta) return null;
  const { startedAt, finishedAt, added, updated, skipped, errors } = meta;
  let duration = null;
  if (startedAt && finishedAt) {
    const ms = Math.max(0, new Date(finishedAt) - new Date(startedAt));
    duration = ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(2)} s`;
  }
  return { duration, added, updated, skipped, errors };
}

function useOutside(ref, onOutside) {
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onOutside?.();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, onOutside]);
}

function StatChip({ icon, label, value, tone = "default" }) {
  // Use a class for the base style and specific tone classes for colors
  let toneClass = "data-table-stat-chip-default";
  if (tone === "success") toneClass = "data-table-stat-chip-success";
  else if (tone === "warning") toneClass = "data-table-stat-chip-warning";
  else if (tone === "error") toneClass = "data-table-stat-chip-error";
  else if (tone === "secondary") toneClass = "data-table-stat-chip-secondary";

  return (
    <span className={`data-table-stat-chip ${toneClass}`}>
      {icon ? icon : null}
      <span className="data-table-stat-chip-label">{label}</span>
      {value !== undefined ? <span className="data-table-stat-chip-value">{value}</span> : null}
    </span>
  );
}

/* -------------------------------------------------
   DataTable Component
   ------------------------------------------------- */

// NOTE: You will need to import a CSS file that contains the definitions for all 'data-table-...' classes.

export default function DataTable({
  title,
  data = [],
  columns = undefined,
  searchable = true,
  selection = true,
  showId = false,
  pageSizeOptions = [5, 10, 25, 50],
  initialPageSize = 5,
  initialSort,
  stickyHeader = true,
  importMeta,
  onSelectionChange,
  filterComponent,
  // NEW PROPS FOR BACKEND CONTROL
  isBackendPagination = false,
  totalRows: totalRowsProp = 0,
  page: pageProp = 1,
  pageSize: pageSizeProp = 10,
  setPage: setPageProp,
  setPageSize: setPageSizeProp,
  onFilterChange,
}) {
  // ---- columns ----
  const inferredCols = useMemo(() => {
    let cols = [];
    if (columns && columns.length > 0) {
      cols = columns.map((c) =>
        typeof c === "string" ? { key: c, header: humanize(c) } : { header: humanize(c.key), ...c }
      );
    } else {
      const first = data?.[0] || {};
      cols = Object.keys(first).map((k) => ({ key: k, header: humanize(k) }));
    }

    // 🔑 FIX 1: Prevent duplicate ID column key
    const hasExistingIdColumn = cols.some(c => c.key === 'id');
    
    if (showId && !hasExistingIdColumn) {
      // Use an internal key, '__index', that won't clash with data keys like 'id'
      cols = [{ 
          key: '__index', 
          header: 'ID', 
          render: (val, row, index) => (isBackendPagination ? (pageProp - 1) * pageSizeProp + index + 1 : index + 1), 
          isSortable: false 
      }, ...cols];
    }
    return cols;
  }, [columns, data, showId, isBackendPagination, pageProp, pageSizeProp]);

  const [visibleCols, setVisibleCols] = useState(() => new Set(inferredCols.map((c) => c.key)));
  useEffect(() => { setVisibleCols(new Set(inferredCols.map((c) => c.key))); }, [inferredCols]);
  // ... (rest of column logic)

  const allColumnsVisible = useMemo(() => {
    return inferredCols.length > 0 && visibleCols.size === inferredCols.length;
  }, [visibleCols, inferredCols]);

  const toggleAllColumns = () => {
    if (allColumnsVisible) {
      setVisibleCols(new Set());
    } else {
      setVisibleCols(new Set(inferredCols.map(c => c.key)));
    }
  };

  // ---- search & sort ----
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState(() => initialSort || { key: inferredCols[0]?.key, dir: "desc" });

  const handleQueryChange = (newQuery) => {
    setQuery(newQuery);
    if (isBackendPagination && onFilterChange) {
      // Must reset page to 1 on search
      onFilterChange({ page: 1, search: newQuery });
    }
  };

  const toggleSort = (key) => {
    setSort((prev) => {
      const newSort = {
        key,
        dir: (!prev || prev.key !== key) ? "asc" : (prev.dir === "asc" ? "desc" : "asc")
      };

      if (isBackendPagination && onFilterChange) {
        // Must reset page to 1 on sort change
        onFilterChange({ page: 1, sort: newSort.key, sort_dir: newSort.dir });
      }

      return newSort;
    });
  };

  // ---- Client-Side Pagination State ----
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [page, setPage] = useState(1);

  // Reset client-side page on data/query/pageSize change
  useEffect(() => { if (!isBackendPagination) setPage(1); }, [query, pageSize, data, isBackendPagination]);


  // ---- Pagination Handlers (Directs to internal state or external prop function) ----
  const handlePageChange = (newPage) => {
    if (isBackendPagination && setPageProp) {
      setPageProp(newPage);
    } else {
      setPage(newPage);
    }
  };

  const handlePageSizeChange = (newSize) => {
    if (isBackendPagination && setPageSizeProp) {
      // CRITICAL: Reset to page 1 when pageSize changes in backend mode
      setPageProp(1);
      setPageSizeProp(newSize);
    } else {
      setPageSize(newSize);
    }
  };

  // 1. DEFINE CURRENT VALUES BASED ON MODE
  const currentPageSize = isBackendPagination ? pageSizeProp : pageSize;
  const currentPage = isBackendPagination ? pageProp : page;

  // 2. GET THE CORRECT DATA SLICE
  const [pageRows, sortedData, totalClientRows] = useMemo(() => {
    if (isBackendPagination) {
      // BACKEND PAGINATION: 'data' prop is already the correct slice.
      return [data, data, totalRowsProp];
    } else {
      // CLIENT-SIDE PAGINATION: Apply filtering, sorting, and internal slicing.

      // Filtering (unchanged)
      const filtered = query.trim()
        ? data.filter((row) => {
          const q = query.toLowerCase();
          const keys = inferredCols.map((c) => c.key);
          return keys.some((k) => String(row?.[k] ?? "").toLowerCase().includes(q));
        })
        : data;

      // Sorting (unchanged)
      const sorted = sort?.key ? [...filtered].sort((a, b) => {
        const av = a?.[sort.key];
        const bv = b?.[sort.key];
        if (av == null && bv == null) return 0;
        if (av == null) return sort.dir === "asc" ? -1 : 1;
        if (bv == null) return sort.dir === "asc" ? 1 : -1;
        if (typeof av === "number" && typeof bv === "number") {
          return sort.dir === "asc" ? av - bv : bv - av;
        }
        const as = String(av).toLowerCase();
        const bs = String(bv).toLowerCase();
        if (as < bs) return sort.dir === "asc" ? -1 : 1;
        if (as > bs) return sort.dir === "asc" ? 1 : -1;
        return 0;
      }) : filtered;

      // Slicing (unchanged)
      const clientTotalRows = sorted.length;
      const clientTotalPages = Math.max(1, Math.ceil(clientTotalRows / pageSize));
      const clientPageSafe = Math.min(Math.max(page, 1), clientTotalPages);

      const start = (clientPageSafe - 1) * pageSize;
      const end = start + pageSize;
      return [sorted.slice(start, end), sorted, clientTotalRows];
    }
  }, [data, query, inferredCols, sort, isBackendPagination, page, pageSize, totalRowsProp]);


  // 3. DEFINE FINAL PAGINATION CONTROLS
  const totalRows = isBackendPagination ? totalRowsProp : totalClientRows;
  // Use Math.max(1, ...) to ensure totalPages is always at least 1, even if totalRows is 0
  const totalPages = Math.max(1, Math.ceil(totalRows / currentPageSize));
  const pageSafe = Math.min(Math.max(currentPage, 1), totalPages);


  // ---- selection ----
  const [selected, setSelected] = useState(() => new Set());

  const getAbsoluteIndex = (relativeIndex) => {
    return (pageSafe - 1) * currentPageSize + relativeIndex;
  };

  const allVisibleSelected = pageRows.every((_, idx) => selected.has(getAbsoluteIndex(idx))) && pageRows.length > 0;

  const toggleSelectAll = () => {
    const next = new Set(selected);
    if (allVisibleSelected) {
      pageRows.forEach((_, idx) => next.delete(getAbsoluteIndex(idx)));
    } else {
      pageRows.forEach((_, idx) => next.add(getAbsoluteIndex(idx)));
    }
    setSelected(next);
  };

  const toggleSelectRow = (relativeIndex) => {
    const absIndex = getAbsoluteIndex(relativeIndex);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(absIndex)) next.delete(absIndex);
      else next.add(absIndex);
      return next;
    });
  };

  useEffect(() => {
    if (onSelectionChange) {
      const selectedIndices = Array.from(selected);
      // NOTE: This selection logic assumes the full, unfiltered data is stable outside the table.
      // If the selection needs to work on the paginated/filtered set, this logic requires a different approach.
      const rows = selectedIndices.map(absIndex => data[absIndex]).filter(r => r);
      onSelectionChange(rows);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, onSelectionChange, data]);


  // ---- Column Menu / Details Modal (UNCHANGED) ----
  const [colMenuOpen, setColMenuOpen] = useState(false);
  const colBtnRef = useRef(null);
  useOutside(colBtnRef, () => setColMenuOpen(false));

  const [detailsOpen, setDetailsOpen] = useState(false);
  const detailsRef = useRef(null);
  useOutside(detailsRef, () => setDetailsOpen(false));
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setDetailsOpen(false); };
    if (detailsOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [detailsOpen]);

  const importStats = useMemo(() => formatImportMeta(importMeta), [importMeta]);


  return (
    <div className="data-table-container">
      {/* Top bar */}
      <div className="data-table-top-section-padding">
        <div className="data-table-top-bar">
          <div className="data-table-search-group">
            {searchable && (
              <div className="data-table-search-relative-container">
                <Search className="data-table-search-icon" />
                <input
                  className="data-table-input data-table-input-bordered data-table-input-search"
                  placeholder="Search..."
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                />
                {query && (
                  <button
                    className="data-table-btn-clear-search"
                    onClick={() => handleQueryChange("")}
                    type="button"
                  >
                    ✕
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="data-table-action-group">
            {filterComponent}
            {/* Column visibility menu */}
            <div className="data-table-column-menu-relative" ref={colBtnRef}>
              <button
                className="data-table-btn-ghost"
                onClick={() => setColMenuOpen((v) => !v)}
                aria-label="Columns"
                title="Show/Hide columns"
                type="button"
              >
                <SlidersHorizontal className="data-table-icon-sm" />
                <span className="data-table-hidden-sm">Columns</span>
              </button>

              {colMenuOpen && (
                <div className="data-table-column-menu-dropdown">
                  <label className="data-table-column-menu-item data-table-column-menu-select-all">
                    <input
                      type="checkbox"
                      className="data-table-checkbox data-table-checkbox-sm data-table-checkbox-success"
                      checked={allColumnsVisible}
                      onChange={toggleAllColumns}
                    />
                    <span className="data-table-text-sm">Select All</span>
                  </label>

                  <div className="data-table-column-menu-list">
                    {inferredCols.map((c) => {
                      const checked = visibleCols.has(c.key);
                      return ( 
                        <label key={c.key} className="data-table-column-menu-item">
                          <input
                            type="checkbox"
                            className="data-table-checkbox data-table-checkbox-sm data-table-checkbox-success"
                            checked={checked}
                            onChange={() => {
                              setVisibleCols((prev) => {
                                const next = new Set(prev);
                                if (checked) next.delete(c.key);
                                else next.add(c.key);
                                return next;
                              });
                            }}
                          />
                          <span className="data-table-text-sm">{c.header ?? humanize(c.key)}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead className={stickyHeader ? "data-table-thead data-table-sticky" : "data-table-thead"}>
              <tr className="data-table-header-row">
                {selection && (
                  <th className="data-table-th data-table-selection-col">
                    <input
                      type="checkbox"
                      className="data-table-checkbox data-table-checkbox-sm"
                      checked={allVisibleSelected}
                      onChange={toggleSelectAll}
                      aria-label="Select page rows"
                    />
                  </th>
                )}
                {inferredCols.map((col) =>
                  !visibleCols.has(col.key) ? null : (
                    <th 
                      key={col.key} 
                      className={`data-table-th data-table-text-left ${col.align === "right" ? "data-table-text-right" : col.align === "center" ? "data-table-text-center" : ""}`}
                    >
                      <button className="data-table-sort-button" onClick={() => toggleSort(col.key)} type="button">
                        <span>{col.header ?? humanize(col.key)}</span>
                        {/* Only display sort control if it's active or if client-side */}
                        {(!isBackendPagination || sort?.key === col.key) && (
                          <ArrowUpDown className={sort?.key === col.key ? "data-table-icon-xs data-table-icon-active" : "data-table-icon-xs"} />
                        )}
                      </button>
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody className="data-table-body">
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={(selection ? 1 : 0) + Array.from(visibleCols).length} className="data-table-empty-cell">
                    No data
                  </td>
                </tr>
              ) : (
                pageRows.map((row, i) => {
                  const relativeIndex = i;
                  const absIndex = getAbsoluteIndex(i); 
                  const isSelected = selected.has(absIndex);
                  return (
                    // Row Key: Use the unique absolute index
                    <tr key={absIndex} className="data-table-row">
                      {selection && (
                        <td className="data-table-td">
                          <input
                            type="checkbox"
                            className="data-table-checkbox data-table-checkbox-sm data-table-checkbox-success"
                            checked={isSelected}
                            onChange={() => toggleSelectRow(relativeIndex)}
                          />
                        </td>
                      )}
                      {inferredCols.map((col) =>
                        !visibleCols.has(col.key) ? null : (
                          <td
                            // 🔑 FIX 2: Use a COMPOSITE KEY combining row index and column key
                            key={`${absIndex}-${col.key}`} 
                            className={`data-table-td ${col.align === "right" ? "data-table-text-right" : col.align === "center" ? "data-table-text-center" : ""}`}
                            style={{ width: col.width }}
                          >
                            {col.render ? col.render(row[col.key], row, relativeIndex) : safeCell(row[col.key])}
                          </td>
                        )
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer: left = summary, right = pagination + details button */}
        <div className="data-table-footer-bar">
          <div className="data-table-summary-text">
            Showing <b>{pageRows.length}</b> of <b>{totalRows}</b> rows
            {!isBackendPagination && query ? <> (filtered from <b>{data.length}</b>)</> : null}
          </div>

          <div className="data-table-pagination-group">
            <select
              className="data-table-select data-table-select-bordered data-table-select-sm"
              value={currentPageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            >
              {pageSizeOptions.map((n) => (
                <option key={n} value={n}>{n} / page</option>
              ))}
            </select>

            <div className="data-table-pagination-join">
              <button
                className="data-table-btn data-table-btn-sm data-table-btn-join-item"
                onClick={() => handlePageChange(pageSafe - 1)}
                disabled={pageSafe <= 1}
              >
                <ChevronLeft className="data-table-icon-sm" />
              </button>
              <button className="data-table-btn data-table-btn-sm data-table-btn-join-item data-table-pointer-events-none">
                Page {pageSafe} / {totalPages}
              </button>
              <button
                className="data-table-btn data-table-btn-sm data-table-btn-join-item"
                onClick={() => handlePageChange(pageSafe + 1)}
                disabled={pageSafe >= totalPages}
              >
                <ChevronRight className="data-table-icon-sm" />
              </button>
            </div>

            {/* Bottom-right Table details */}
            <button
              className="data-table-details-button"
              onClick={() => setDetailsOpen(true)}
              type="button"
              title="View table details"
            >
              <Database className="data-table-icon-sm" />
              <span>Table details</span>
            </button>
          </div>
        </div>
      </div>
      {/* ===== Modal: Table details (UNCHANGED logic) ===== */}
      {detailsOpen && (
        <div className="data-table-modal-overlay">
          <div ref={detailsRef} className="data-table-modal-content">
            <div className="data-table-modal-header">
              <h3 className="data-table-modal-title">Table details</h3>
              <button className="data-table-btn-ghost data-table-btn-sm" onClick={() => setDetailsOpen(false)} type="button">✕</button>
            </div>

            <div className="data-table-modal-body-space">
              <div className="data-table-modal-chip-group">
                <StatChip icon={<Database className="h-3.5 w-3.5" />} label="Rows" value={totalRows} />
                <StatChip icon={<Columns className="h-3.5 w-3.5" />} label="Cols" value={inferredCols.length} />
                {query ? <StatChip icon={<Filter className="h-3.5 w-3.5" />} label="Filtered" value={!isBackendPagination ? totalClientRows : totalRows} /> : null}
                {selected.size > 0 ? <StatChip icon={<CheckSquare className="h-3.5 w-3.5" />} label="Selected" value={selected.size} /> : null}
                {importStats ? (
                  <>
                    {importStats.duration && <StatChip icon={<Clock className="h-3.5 w-3.5" />} label="Duration" value={importStats.duration} />}
                    {num(importStats.added) > 0 && <StatChip label="Added" tone="success" value={importStats.added} icon={<UploadCloud className="h-3.5 w-3.5" />} />}
                    {num(importStats.updated) > 0 && <StatChip label="Updated" tone="warning" value={importStats.updated} />}
                    {num(importStats.skipped) > 0 && <StatChip label="Skipped" tone="secondary" value={importStats.skipped} />}
                    {num(importStats.errors) > 0 && <StatChip label="Errors" tone="error" value={importStats.errors} icon={<AlertCircle className="h-3.5 w-3.5" />} />}
                  </>
                ) : null}
              </div>

              <div className="data-table-overflow-x-auto">
                <table className="data-table-modal-table">
                  <tbody className="data-table-modal-table-body">
                    <tr><td className="data-table-modal-table-key">Total rows</td><td>{totalRows}</td></tr>
                    <tr><td className="data-table-modal-table-key">Visible columns</td><td>{Array.from(visibleCols).length} / {inferredCols.length}</td></tr>
                    <tr><td className="data-table-modal-table-key">Current page</td><td>{pageSafe} / {totalPages} (size {currentPageSize})</td></tr>
                    {query && <tr><td className="data-table-modal-table-key">Search query</td><td><code className="data-table-code-style">{query}</code></td></tr>}
                    {importStats && (
                      <>
                        <tr><td className="data-table-modal-table-key">Duration</td><td>{importStats.duration ?? "—"}</td></tr>
                        <tr><td className="data-table-modal-table-key">Added / Updated</td><td>{num(importStats.added)} / {num(importStats.updated)}</td></tr>
                        <tr><td className="data-table-modal-table-key">Skipped / Errors</td><td>{num(importStats.skipped)} / {num(importStats.errors)}</td></tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="data-table-modal-footer-right">
                <button className="data-table-btn data-table-btn-primary data-table-btn-sm" onClick={() => setDetailsOpen(false)} type="button">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
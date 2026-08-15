import React from "react";

import {
  Paper,
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TablePagination,
  Box,
  CircularProgress,
  Collapse,
  Checkbox,
} from "@mui/material";

const Table = ({
  columns = [],
  rows = [],
  loading = false,
  minWidth = 1200,
  maxHeight = 500,
  sx = {},
  getRowStyle,
  onRowClick,
  getRowId = (row) => row.id || row.s_no,
  expandedRowId = null,
  renderExpandedRow,
  selectable = false,
  onSelectionChange,
  totalCount,
  rowsPerPageOptions = [10, 25, 50, 100],
  initialRowsPerPage = 25,
}) => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(initialRowsPerPage);
  const [selected, setSelected] = React.useState([]);

  // Auto-reset page to 0 when rows data or total count changes (e.g. filter/tab switch)
  React.useEffect(() => {
    setPage(0);
  }, [rows, totalCount]);

  // Track each row's DOM node so we know where to scroll to
  // once that row gets expanded.
  const rowRefs = React.useRef({});

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const totalRows = totalCount ?? rows.length;
  const maxPage = Math.max(0, Math.ceil(totalRows / rowsPerPage) - 1);
  const safePage = page > maxPage ? 0 : page;

  const allSelected = rows.length > 0 && selected.length === rows.length;

  const toggleAll = () => {
    const next = allSelected ? [] : rows.map((row) => getRowId(row));
    setSelected(next);
    onSelectionChange?.(next);
  };

  const toggleOne = (rowId) => {
    const next = selected.includes(rowId)
      ? selected.filter((id) => id !== rowId)
      : [...selected, rowId];
    setSelected(next);
    onSelectionChange?.(next);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        width: "100%",
        maxWidth: "100%",
        overflow: "hidden",
        border: "1px solid #D0CCCC",
        borderRadius: "12px",
        background: "#fff",
        ...sx,
      }}
    >
      <TableContainer
        sx={{
          width: "100%",
          maxHeight,
          overflowX: "auto",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          "&::-webkit-scrollbar": {
            height: "6px",
            width: "6px",
          },
        }}
      >
        {loading ? (
          <Box
            sx={{
              minHeight: maxHeight,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CircularProgress />
          </Box>
        ) : rows.length === 0 ? (
          <Box
            sx={{
              minHeight: maxHeight,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
          >
            <Typography
              sx={{
                fontSize: "22px",
                color: "#666",
                fontWeight: 500,
              }}
            >
              No Data Found
            </Typography>
          </Box>
        ) : (
          <MuiTable
            stickyHeader
            sx={{
              minWidth,
              "& th, & th .MuiTypography-root": {
                borderRadius: 0,
                whiteSpace: "nowrap",
                fontSize: "16px !important",
                fontWeight: "600 !important",
              },
              "& td, & td .MuiTypography-root": {
                borderRadius: 0,
                whiteSpace: "nowrap",
                fontSize: "14px !important",
              },
            }}
          >
            <TableHead>
              <TableRow
                sx={{
                  background: "#ECECEC",
                  "& th:first-of-type": {
                    borderTopLeftRadius: "10px",
                  },
                  "& th:last-of-type": {
                    borderTopRightRadius: "16px",
                  },
                }}
              >
                {selectable && (
                  <TableCell
                    padding="checkbox"
                    sx={{
                      background: "#E6E6E6",
                    }}
                  >
                    <Checkbox
                      size="small"
                      checked={allSelected}
                      indeterminate={selected.length > 0 && !allSelected}
                      onChange={toggleAll}
                    />
                  </TableCell>
                )}
                {columns.map((column, index) => (
                  <TableCell
                    key={index}
                    align={column.align || "left"}
                    sx={{
                      background: "#E6E6E6",
                      fontWeight: 600,
                      color: "#686767",
                      fontSize: "16px",
                      textAlign: "center",
                      py: 1.5,
                      minWidth: column.minWidth || "auto",
                    }}
                  >
                    {column.headerName}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {rows
                .slice(safePage * rowsPerPage, safePage * rowsPerPage + rowsPerPage)
                .map((row, rowIndex) => {
                  const rowId = getRowId(row);
                  const isExpanded =
                    renderExpandedRow &&
                    expandedRowId !== null &&
                    expandedRowId !== undefined &&
                    rowId === expandedRowId;

                  return (
                    <React.Fragment key={rowId ?? rowIndex}>
                      <TableRow
                        ref={(el) => {
                          rowRefs.current[rowId] = el;
                        }}
                        onClick={() => onRowClick && onRowClick(row)}
                        sx={{
                          cursor: onRowClick ? "pointer" : "default",
                          ...(getRowStyle ? getRowStyle(row) : {}),
                        }}
                      >
                        {selectable && (
                          <TableCell
                            padding="checkbox"
                            sx={{
                              borderBottom: isExpanded
                                ? "none"
                                : "2px solid #D0CCCC",
                            }}
                          >
                            <Checkbox
                              size="small"
                              checked={selected.includes(rowId)}
                              onChange={(event) => {
                                event.stopPropagation();
                                toggleOne(rowId);
                              }}
                              onClick={(event) => event.stopPropagation()}
                            />
                          </TableCell>
                        )}
                        {columns.map((column, colIndex) => (
                          <TableCell
                            key={colIndex}
                            align={column.align || "left"}
                            sx={{
                              fontSize: "14px",
                              fontWeight: 400,
                              color: "#000",
                              py: 2,
                              whiteSpace: "nowrap",
                              minWidth: column.minWidth || "auto",
                              textAlign: "center",
                              borderBottom: isExpanded
                                ? "none"
                                : "2px solid #D0CCCC",
                            }}
                          >
                            {column.renderCell
                              ? column.renderCell(row, safePage * rowsPerPage + rowIndex, rowIndex)
                              : row[column.field]}
                          </TableCell>
                        ))}
                      </TableRow>

                      {renderExpandedRow && (
                        <TableRow>
                          <TableCell
                            colSpan={columns.length + (selectable ? 1 : 0)}
                            sx={{
                              p: 0,
                              background: "#F7F7F7",
                              border: "none",
                            }}
                          >
                            <Collapse
                              in={isExpanded}
                              timeout="auto"
                              unmountOnExit
                              sx={{ background: "#F7F7F7" }}
                              onEntered={() => {
                                requestAnimationFrame(() => {
                                  rowRefs.current[rowId]?.scrollIntoView({
                                    behavior: "smooth",
                                    block: "nearest",
                                  });
                                });
                              }}
                            >
                              {renderExpandedRow(row)}
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
            </TableBody>
          </MuiTable>
        )}
      </TableContainer>
      <TablePagination
        component="div"
        count={totalRows}
        page={safePage}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Items per page"
        rowsPerPageOptions={rowsPerPageOptions}
        showFirstButton
        showLastButton
        sx={{
          borderTop: "1px solid #E5E5E5",
          "& .MuiTablePagination-toolbar": {
            minHeight: "52px",
            px: 2,
          },
          "& .MuiTablePagination-selectLabel": {
            fontSize: "14px",
            color: "#4B5563",
            fontWeight: 500,
          },
          "& .MuiTablePagination-displayedRows": {
            fontSize: "14px",
            color: "#1F2937",
            fontWeight: 600,
            mx: 2,
          },
          "& .MuiSelect-select": {
            fontSize: "14px",
            fontWeight: 600,
            color: "#1F2937",
          },
          "& .MuiIconButton-root": {
            color: "#4B5563",
            padding: "6px",
            "&:hover": {
              backgroundColor: "#F3F4F6",
            },
            "&.Mui-disabled": {
              color: "#D1D5DB",
            },
          },
        }}
      />
    </Paper>
  );
};

export default Table;
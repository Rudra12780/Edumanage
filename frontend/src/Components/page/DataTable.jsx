import React, { useState } from 'react';
import { Search } from 'lucide-react';
import '../css/SharedComponents.css';

const DataTable = ({
  title,
  subtitle,
  columns = [],
  data = [],
  actionButton,
  searchPlaceholder = 'Search records...',
  filterKey = null,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = data.filter((item) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();

    if (filterKey && item[filterKey]) {
      return String(item[filterKey]).toLowerCase().includes(term);
    }

    // Default search across all primitive values
    return Object.values(item).some(val => 
      typeof val === 'string' || typeof val === 'number'
        ? String(val).toLowerCase().includes(term)
        : false
    );
  });

  return (
    <div className="em-table-container">
      <div className="em-table-header-bar">
        <div className="em-table-title-area">
          {title && <h3>{title}</h3>}
          {subtitle && <p>{subtitle}</p>}
        </div>

        <div className="em-table-actions">
          <div className="em-table-search">
            <Search size={15} />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {actionButton}
        </div>
      </div>

      <div className="em-responsive-table-wrapper">
        <table className="em-table">
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th key={index} style={col.width ? { width: col.width } : {}}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((row, rowIndex) => (
                <tr key={row.id || rowIndex}>
                  {columns.map((col, colIndex) => (
                    <td key={colIndex}>
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                  No matching records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;

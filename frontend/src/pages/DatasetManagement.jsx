import React, { useState, useEffect } from 'react';
import { Upload, Search, ChevronLeft, ChevronRight, FileSpreadsheet, CheckCircle, AlertCircle, Database } from 'lucide-react';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { api } from '../services/api';

export default function DatasetManagement() {
  const [stats, setStats] = useState(null);
  const [columnsInfo, setColumnsInfo] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState(null);

  // Search & Pagination states
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  const loadData = async (currentPage = 1, currentSearch = search, currentSort = sortBy, currentOrder = sortOrder) => {
    try {
      setLoading(true);
      const [statRes, colRes, prevRes] = await Promise.all([
        api.getDatasetStatistics(),
        api.getDatasetColumns(),
        api.getDatasetPreview({
          page: currentPage,
          page_size: 10,
          search: currentSearch,
          sort_by: currentSort,
          sort_order: currentOrder
        })
      ]);

      setStats(statRes);
      setColumnsInfo(colRes);
      setPreviewData(prevRes);
    } catch (err) {
      console.error("Dataset load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(1);
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setUploadMsg({ type: 'error', text: 'Please select a valid CSV dataset file.' });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      setUploadMsg(null);
      const res = await api.uploadDataset(formData);
      setUploadMsg({ type: 'success', text: `Dataset "${res.filename}" uploaded & inspected successfully!` });
      await loadData(1);
    } catch (err) {
      setUploadMsg({ type: 'error', text: err.response?.data?.error || 'Failed to upload CSV dataset.' });
    } finally {
      setUploading(false);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearch(query);
    setPage(1);
    loadData(1, query, sortBy, sortOrder);
  };

  const handleSort = (col) => {
    let nextOrder = 'asc';
    if (sortBy === col && sortOrder === 'asc') {
      nextOrder = 'desc';
    }
    setSortBy(col);
    setSortOrder(nextOrder);
    loadData(page, search, col, nextOrder);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    loadData(newPage, search, sortBy, sortOrder);
  };

  if (loading && !previewData) {
    return <LoadingSpinner text="Inspecting corn pest dataset structure..." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Upload Zone Card */}
      <div className="glass-card" style={{ padding: '1.75rem 2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>
              Upload CSV Dataset
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8' }}>
              System dynamically detects columns, categorical attributes, and pest target labels.
            </p>
          </div>

          <label className="btn-primary" style={{ cursor: 'pointer' }}>
            <Upload style={{ width: '18px', height: '18px' }} />
            <span>{uploading ? 'Processing CSV...' : 'Choose CSV File'}</span>
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleFileUpload} 
              disabled={uploading} 
              style={{ display: 'none' }} 
            />
          </label>
        </div>

        {uploadMsg && (
          <div style={{
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            backgroundColor: uploadMsg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${uploadMsg.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            color: uploadMsg.type === 'success' ? '#34d399' : '#f87171',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            {uploadMsg.type === 'success' ? <CheckCircle style={{ width: '16px', height: '16px' }} /> : <AlertCircle style={{ width: '16px', height: '16px' }} />}
            <span>{uploadMsg.text}</span>
          </div>
        )}
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <StatCard 
          title="Total Records" 
          value={stats?.total_records?.toLocaleString() || 0} 
          subtext="Raw rows loaded" 
          icon={Database} 
          color="emerald" 
        />
        <StatCard 
          title="Total Columns" 
          value={stats?.total_columns || 0} 
          subtext={`${columnsInfo?.numerical_cols?.length || 0} numeric, ${columnsInfo?.categorical_cols?.length || 0} categorical`} 
          icon={FileSpreadsheet} 
          color="blue" 
        />
        <StatCard 
          title="Missing Values" 
          value={stats?.missing_total || 0} 
          subtext={`${Object.keys(stats?.missing_cols || {}).length} columns affected`} 
          icon={AlertCircle} 
          color="amber" 
        />
        <StatCard 
          title="Duplicate Records" 
          value={stats?.duplicate_count || 0} 
          subtext="Identified for cleaning" 
          icon={CheckCircle} 
          color="purple" 
        />
      </div>

      {/* Column Schema Details */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', marginBottom: '1rem' }}>
          Detected Column Schema & Data Types
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
          {columnsInfo?.columns?.map((col) => {
            const isTarget = col === columnsInfo.target_column;
            const isNum = columnsInfo.numerical_cols.includes(col);
            return (
              <div key={col} style={{
                padding: '0.5rem 0.85rem',
                borderRadius: '8px',
                backgroundColor: isTarget ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                border: `1px solid ${isTarget ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255, 255, 255, 0.08)'}`,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: isTarget ? '#34d399' : '#e2e8f0' }}>
                  {col}
                </span>
                <span style={{
                  fontSize: '0.7rem',
                  padding: '0.15rem 0.4rem',
                  borderRadius: '4px',
                  backgroundColor: isTarget ? '#064e3b' : isNum ? 'rgba(14, 165, 233, 0.2)' : 'rgba(168, 85, 247, 0.2)',
                  color: isTarget ? '#34d399' : isNum ? '#38bdf8' : '#c084fc',
                  fontWeight: 700
                }}>
                  {isTarget ? 'TARGET' : isNum ? 'NUMERIC' : 'CATEGORY'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Data Table Preview */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
              Dataset Table Preview
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Showing page {previewData?.page} of {previewData?.total_pages} ({previewData?.filtered_records} records)
            </p>
          </div>

          <div style={{ position: 'relative', width: '280px' }}>
            <Search style={{ width: '16px', height: '16px', color: '#64748b', position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search dataset records..." 
              value={search}
              onChange={handleSearchChange}
              style={{ paddingLeft: '2.4rem' }}
            />
          </div>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                {previewData?.columns?.map((col) => (
                  <th key={col} onClick={() => handleSort(col)} style={{ cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span>{col}</span>
                      {sortBy === col && (
                        <span style={{ fontSize: '0.7rem', color: '#10b981' }}>
                          {sortOrder === 'asc' ? '▲' : '▼'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewData?.records?.map((row, idx) => (
                <tr key={idx}>
                  {previewData.columns.map((col) => (
                    <td key={col} style={{
                      fontWeight: col === columnsInfo?.target_column ? 600 : 400,
                      color: col === columnsInfo?.target_column ? '#34d399' : 'inherit'
                    }}>
                      {row[col] === '' ? <span style={{ color: '#ef4444', fontStyle: 'italic' }}>null</span> : row[col]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.25rem' }}>
          <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
            Page {previewData?.page} of {previewData?.total_pages}
          </span>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              disabled={previewData?.page <= 1} 
              onClick={() => handlePageChange(previewData.page - 1)}
              className="btn-secondary"
              style={{ padding: '0.4rem 0.8rem' }}
            >
              <ChevronLeft style={{ width: '16px', height: '16px' }} />
              <span>Previous</span>
            </button>

            <button 
              disabled={previewData?.page >= previewData?.total_pages} 
              onClick={() => handlePageChange(previewData.page + 1)}
              className="btn-secondary"
              style={{ padding: '0.4rem 0.8rem' }}
            >
              <span>Next</span>
              <ChevronRight style={{ width: '16px', height: '16px' }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import './Settings.css';
import BottomNav from './BottomNav';

const Settings = ({ monitors = [], monitorSettings = {}, userRole, allowedTo = [], onAddMonitor, onClose, onEditMonitor, onResetMonitor, onDeleteMonitor, onUpdateMonitor, onFetchMonitorSettings }) => {
  const navigate = useNavigate();
  const [settingsData, setSettingsData] = useState({
    A2: '',
    D3: '',
    D4: '',
    USL: '',
    LSL: '',
    spcDataPointsSize: '',
    machineName: '',
    machineIP: '',
    toolOffsetNumber: '',
    offsetSize: ''
  });
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedAction, setSelectedAction] = useState('');
  const [monitorCode, setMonitorCode] = useState('');
  const [editingMonitor, setEditingMonitor] = useState(null);

  // Fetch monitor settings when component mounts
  useEffect(() => {
    if (typeof onFetchMonitorSettings === 'function') {
      onFetchMonitorSettings();
    }
  }, [onFetchMonitorSettings]);

  const handleCancel = () => {
    setIsFormVisible(false);
    setSelectedAction('');
    setEditingMonitor(null);
    setMonitorCode('');
    // Reset form data
    setSettingsData({
      A2: '',
      D3: '',
      D4: '',
      USL: '',
      LSL: '',
      spcDataPointsSize: '',
      machineName: '',
      machineIP: '',
      toolOffsetNumber: '',
      offsetSize: ''
    });
  };

  const handleActionSelect = (action) => {
    setSelectedAction(action);
    setIsFormVisible(true);
  };

  const handleEditMonitor = () => {
    if (!validateSettings()) return;
    onEditMonitor(settingsData);
    handleCancel();
  };

  const handleAddMonitor = () => {
    if (!validateSettings()) return;
    onAddMonitor(settingsData);
    handleCancel();
  };

  const handleUpdateMonitor = () => {
    if (!validateSettings()) return;
    const updatedData = { ...settingsData, monitorCode: editingMonitor?.monitorCode };
    onUpdateMonitor(updatedData);
    handleCancel();
  };

  const handleDeleteMonitor = () => {
    if (!monitorCode) {
      alert('Please enter monitor code');
      return;
    }
    if (window.confirm(`Are you sure you want to delete monitor code: ${monitorCode}?`)) {
      onDeleteMonitor(monitorCode);
      handleCancel();
    }
  };

  const handleMonitorUpdate = (monitor) => {
    setEditingMonitor(monitor);
    setSelectedAction('update');
    setIsFormVisible(true);
    // Prefill form with monitor data
    setSettingsData({
      A2: monitor.a2 || '',
      D3: monitor.d3 || '',
      D4: monitor.d4 || '',
      USL: monitor.usl || '',
      LSL: monitor.lsl || '',
      spcDataPointsSize: monitor.spcDataPointsSize || monitor.datapointSize || '',
      machineName: monitor.machineName || '',
      machineIP: monitor.machineIP || '',
      toolOffsetNumber: monitor.toolOffsetNumber || '',
      offsetSize: monitor.offsetSize || ''
    });
  };

  const validateSettings = () => {
    if (!settingsData.machineName) {
      alert('Machine Name is required');
      return false;
    }
    if (settingsData.spcDataPointsSize > 30) {
      alert('SPC Data points size cannot exceed 30');
      return false;
    }
    return true;
  };

  return (
    <div className="settings-container">
      
      {!isFormVisible && (
        <div className="monitor-list">
          <h3>Available Monitors</h3>
          {(!monitors || monitors.length === 0) && (
            <p style={{ color: '#777' }}>No monitors available</p>
          )}
          {monitors && monitors.map((m) => {
            // Combine runtime data with settings data for complete monitor information
            const fullMonitorData = { 
              ...m, 
              ...(monitorSettings[m.monitorCode] || {}) 
            };
            
            return (
              <div key={m.monitorCode} className="monitor-row" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <div style={{ flex: 1 }}>
                  <b>Monitor:</b> {m.monitorCode} {fullMonitorData.machineName ? `• ${fullMonitorData.machineName}` : ''}
                </div>
                <button onClick={() => onResetMonitor && onResetMonitor(m.monitorCode)}>Reset</button>
                <button onClick={() => handleMonitorUpdate(fullMonitorData)}>Update</button>
                <button onClick={() => onDeleteMonitor && onDeleteMonitor(m.monitorCode)}>Delete</button>
              </div>
            );
          })}
          
          <div className="action-buttons" style={{ marginTop: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={() => handleActionSelect('add')}>Add Monitor</button>
            <button onClick={() => handleActionSelect('delete')}>Delete Monitor</button>
          </div>
        </div>
      )}

      {isFormVisible && (
        <div className="settings-form">
          <h3>
            {selectedAction === 'add' && 'Add New Monitor'}
            {selectedAction === 'update' && `Update Monitor ${editingMonitor?.monitorCode}`}
            {selectedAction === 'delete' && 'Delete Monitor'}
          </h3>

          {(selectedAction === 'add' || selectedAction === 'update') && (
            <div className="form-fields">
              <div className="settings-group">
                <label>A2 (float):</label>
                <input
                  type="number"
                  step="0.01"
                  value={settingsData.A2}
                  onChange={(e) => setSettingsData({ ...settingsData, A2: e.target.value })}
                />
              </div>
              <div className="settings-group">
                <label>D3 (float):</label>
                <input
                  type="number"
                  step="0.01"
                  value={settingsData.D3}
                  onChange={(e) => setSettingsData({ ...settingsData, D3: e.target.value })}
                />
              </div>
              <div className="settings-group">
                <label>D4 (float):</label>
                <input
                  type="number"
                  step="0.01"
                  value={settingsData.D4}
                  onChange={(e) => setSettingsData({ ...settingsData, D4: e.target.value })}
                />
              </div>
              <div className="settings-group">
                <label>USL (float):</label>
                <input
                  type="number"
                  step="0.01"
                  value={settingsData.USL}
                  onChange={(e) => setSettingsData({ ...settingsData, USL: e.target.value })}
                />
              </div>
              <div className="settings-group">
                <label>LSL (float):</label>
                <input
                  type="number"
                  step="0.01"
                  value={settingsData.LSL}
                  onChange={(e) => setSettingsData({ ...settingsData, LSL: e.target.value })}
                />
              </div>
              <div className="settings-group">
                <label>SPC Data points size (max 30):</label>
                <input
                  type="number"
                  max="30"
                  value={settingsData.spcDataPointsSize}
                  onChange={(e) => setSettingsData({ ...settingsData, spcDataPointsSize: e.target.value })}
                />
              </div>
              <div className="settings-group">
                <label>Machine Name:</label>
                <input
                  type="text"
                  value={settingsData.machineName}
                  onChange={(e) => setSettingsData({ ...settingsData, machineName: e.target.value })}
                />
              </div>
              <div className="settings-group">
                <label>Machine IP address:</label>
                <input
                  type="text"
                  value={settingsData.machineIP}
                  onChange={(e) => setSettingsData({ ...settingsData, machineIP: e.target.value })}
                />
              </div>
              <div className="settings-group">
                <label>Tool offset number:</label>
                <input
                  type="number"
                  value={settingsData.toolOffsetNumber}
                  onChange={(e) => setSettingsData({ ...settingsData, toolOffsetNumber: e.target.value })}
                />
              </div>
              <div className="settings-group">
                <label>Offset size:</label>
                <input
                  type="number"
                  value={settingsData.offsetSize}
                  onChange={(e) => setSettingsData({ ...settingsData, offsetSize: e.target.value })}
                />
              </div>
            </div>
          )}

          {selectedAction === 'delete' && (
            <div className="settings-group">
              <label>Monitor Code:</label>
              <input
                type="text"
                value={monitorCode}
                onChange={(e) => setMonitorCode(e.target.value)}
              />
            </div>
          )}

          <div className="form-buttons">
            {selectedAction === 'add' && (
              <button onClick={handleAddMonitor}>Add Monitor</button>
            )}
            {selectedAction === 'update' && (
              <button onClick={handleUpdateMonitor}>Update Monitor</button>
            )}
            {selectedAction === 'delete' && (
              <button onClick={handleDeleteMonitor}>Delete Monitor</button>
            )}
            <button onClick={handleCancel}>Cancel</button>
          </div>
        </div>
      )}

      {createPortal(
        (
          <BottomNav
            userRole={userRole}
            allowedTo={allowedTo}
            onMonitorClick={() => navigate('/monitor')}
            onSettingsClick={() => navigate('/settings')}
            onAdminClick={() => navigate('/admin')}
            onSecurityClick={() => navigate('/security')}
          />
        ),
        document.body
      )}
    </div>
  );
};

export default Settings;

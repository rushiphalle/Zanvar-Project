// MonitorView.jsx
import React, { useState } from "react";
import ChartComponent from "./ChartComponent"; // adjust path if needed
import Settings from "./Settings";
import BottomNav from "./BottomNav";
import './MonitorView.css';
import { useNavigate } from "react-router-dom";

const MonitorView = ({ monitorData = [], userRole, allowedTo = [] }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeModal, setActiveModal] = useState('');
  const [dummyMonitors, setDummyMonitors] = useState([]);
  const navigate = useNavigate();

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  const handleAdminClick = () => {
    navigate('/admin');
  };

  const handleSecurityClick = () => {
    navigate('/security');
  };

  const handleMonitorClick = () => {
    navigate('/monitor');
  };

  const handleAddMonitor = (newMonitor) => {
    setDummyMonitors(prev => [...prev, newMonitor]);
    setIsModalOpen(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setActiveModal('');
  };

  return (
    <div className="monitor-container">
      {/* Removed Settings modal on Monitor button; stays on /monitor */}

      {monitorData.length === 0 && (
        <p style={{ color: "#ccc", textAlign: "center" }}>
          No monitor data available
        </p>
      )}

      {monitorData.map((monitor, index) => {
        console.log(`Monitor ${index} complete data:`, JSON.stringify(monitor, null, 2));

        return (
          <div key={index} className="monitor-card">
            <h3>Monitor {monitor.monitorCode}</h3>

            {/* X-Chart */}
            <ChartComponent
              title="X-Chart"
              tableData={monitor.tableData
                .map((d, i) => ({
                  sample: i + 1,
                  value: d.value ?? d.Value ?? null
                }))
                .slice(-10)} // Keep only last 10 points
              UCL_X={monitor.UCL_X}
              LCL_X={monitor.LCL_X}
              USL={monitor.usl}
              LSL={monitor.lsl}
              X_bar={monitor["X-bar"]}
            />

            {/* MR-Chart */}
            <ChartComponent
              title="MR-Chart"
              tableData={monitor.tableData.map((d, i, arr) => {
                const mr = d.MR ?? d.mr;
                if (mr != null) return { sample: i + 1, value: mr }; // use backend value if exists

                // if MR missing, calculate it as abs diff from previous value
                if (i === 0) return { sample: i + 1, value: null };
                const prevVal = arr[i - 1].value ?? arr[i - 1].Value;
                const currVal = d.value ?? d.Value;
                if (prevVal != null && currVal != null) {
                  return { sample: i + 1, value: Math.abs(currVal - prevVal) };
                }
                return { sample: i + 1, value: null };
              })}
              UCL_X={monitor.UCL_MR}
              LCL_X={monitor.LCL_MR}
              USL={monitor.usl}
              LSL={monitor.lsl}
              X_bar={monitor.avgMR}
              midLineLabel="BAR"
            />

            {/* Stats */}
            <div className="monitor-stats">
              <p><b>Cp:</b> {monitor.cp}</p>
              <p><b>Cpk:</b> {monitor.cpk}</p>
              <p><b>Standard Deviation:</b> {monitor.stdDev}</p>
              <p><b>Mean:</b> {monitor["X-bar"]}</p>
            </div>
          </div>
        );
      })}

      {/* Dummy monitors */}
      {dummyMonitors.map((monitor, index) => (
        <div key={`dummy-${index}`} className="monitor-card">
          <h3>Dummy Monitor {index + 1}</h3>
          <p><b>Machine Name:</b> {monitor.machineName}</p>
          <p><b>Machine IP:</b> {monitor.machineIP}</p>
          <p><b>SPC Data Points:</b> {monitor.spcDataPointsSize}</p>
          <p><b>Tool Offset:</b> {monitor.toolOffsetNumber}</p>
          <p><b>Offset Size:</b> {monitor.offsetSize}</p>
        </div>
      ))}

      <BottomNav 
        onMonitorClick={handleMonitorClick}
        onSettingsClick={handleSettingsClick}
        onAdminClick={handleAdminClick}
        onSecurityClick={handleSecurityClick}
        userRole={userRole}
        allowedTo={allowedTo}
      />
    </div>
  );
}

export default MonitorView;
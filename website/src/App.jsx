import React, { useState, useEffect } from "react";
import MonitorView from "./components/MonitorView";
import { subscribe, update as apiUpdate, deleteM as apiDelete, logout as apiLogout, reset as apiReset, getSettings } from "./utils/api1";
import LoginForm from "./components/LoginPage";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import Settings from "./components/Settings";
import Admin from "./components/Admin";
import Security from "./components/Security";

export default function App() {
  const [monitorData, setMonitorData] = useState([]);
  const [monitorSettings, setMonitorSettings] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true"
  );
  const [userRole, setUserRole] = useState(localStorage.getItem("userRole") || "");
  const [allowedTo, setAllowedTo] = useState(() => {
    try { return JSON.parse(localStorage.getItem("allowedTo") || "[]"); } catch { return []; }
  });
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = (role = "", permissions = []) => {
    localStorage.setItem("isLoggedIn", "true");
    if (role) {
      localStorage.setItem("userRole", role);
      setUserRole(role);
    }
    if (Array.isArray(permissions)) {
      localStorage.setItem("allowedTo", JSON.stringify(permissions));
      setAllowedTo(permissions);
    }
    setIsLoggedIn(true);
    // Landing route priority based on permissions
    if (permissions?.includes("SECURITY")) navigate("/security", { replace: true });
    else if (permissions?.includes("MONITOR")) navigate("/monitor", { replace: true });
    else if (permissions?.includes("SETTING")) navigate("/settings", { replace: true });
    else navigate("/login", { replace: true });
  };

  const handleLogout = async () => {
    try {
      await apiLogout();
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userRole");
      localStorage.removeItem("allowedTo");
    } finally {
      setIsLoggedIn(false);
      setUserRole("");
      setAllowedTo([]);
      navigate("/login", { replace: true });
    }
  };

  const handleDeleteMonitor = (monitorCode) => {
    try {
      console.log("Deleting monitor", monitorCode);
      apiDelete(monitorCode);
      setMonitorData((prev) => prev.filter((m) => m.monitorCode !== monitorCode));
    } catch (e) {
      console.error("Delete monitor failed", e);
    }
  };

  const handleUpdateMonitor = (updatedData) => {
    try {
      console.log("Updating monitor with data:", updatedData);
      const USL = parseFloat(updatedData.USL) || 0;
      const LSL = parseFloat(updatedData.LSL) || 0;
      const D3 = parseFloat(updatedData.D3) || 0;
      const D4 = parseFloat(updatedData.D4) || 0;
      const A2 = parseFloat(updatedData.A2) || 0;
      const bufferSizeName = String(updatedData.spcDataPointsSize || "");
      const machineName = updatedData.machineName || "";
      const machineIP = updatedData.machineIP || "";
      const toolOffsetNum = parseInt(updatedData.toolOffsetNumber) || 0;
      const offsetSize = parseInt(updatedData.offsetSize) || 0;
      
      apiUpdate(updatedData.monitorCode, USL, LSL, D3, D4, A2, bufferSizeName, machineName, machineIP, toolOffsetNum, offsetSize);
      
      // Update local state
      setMonitorData((prev) => prev.map((m) => 
        m.monitorCode === updatedData.monitorCode 
          ? { ...m, ...updatedData, usl: USL, lsl: LSL, d3: D3, d4: D4, a2: A2 }
          : m
      ));
    } catch (e) {
      console.error("Update monitor failed", e);
    }
  };

  const handleAddMonitor = async (newMonitorData) => {
    try {
      console.log("Adding new monitor with data:", newMonitorData);
      const monitorCode = `MON_${Date.now()}`;
      
      // Prepare data for the API call
      const USL = parseFloat(newMonitorData.USL) || 0;
      const LSL = parseFloat(newMonitorData.LSL) || 0;
      const D3 = parseFloat(newMonitorData.D3) || 0;
      const D4 = parseFloat(newMonitorData.D4) || 0;
      const A2 = parseFloat(newMonitorData.A2) || 0;
      const bufferSizeName = String(newMonitorData.spcDataPointsSize || "");
      const machineName = newMonitorData.machineName || "";
      const machineIP = newMonitorData.machineIP || "";
      const toolOffsetNum = parseInt(newMonitorData.toolOffsetNumber) || 0;
      const offsetSize = parseInt(newMonitorData.offsetSize) || 0;
      
      // Call the API to add/update the monitor
      const response = await apiUpdate(
        monitorCode, 
        USL, 
        LSL, 
        D3, 
        D4, 
        A2, 
        bufferSizeName, 
        machineName, 
        machineIP, 
        toolOffsetNum, 
        offsetSize
      );

      if (response && response.code === 200) {
        // Create the new monitor object
        const newMonitor = {
          monitorCode,
          USL,
          LSL,
          D3,
          D4,
          A2,
          spcDataPointsSize: bufferSizeName,
          machineName,
          machineIP,
          toolOffsetNumber: toolOffsetNum,
          offsetSize,
          tableData: [],
          // Add other required fields with default values
          X_bar: 0,
          stdDev: 0,
          avgMR: 0,
          UCL_X: 0,
          LCL_X: 0,
          UCL_MR: 0,
          LCL_MR: 0,
          cp: 0,
          cpk: 0,
          isDrifting: false
        };
        
        // Update the local state
        setMonitorData(prev => [...prev, newMonitor]);
        
        // Show success message
        alert(`Monitor ${monitorCode} has been added successfully`);
        
        // Navigate to the monitor view
        navigate("/monitor");
      } else {
        throw new Error(response?.reason || 'Failed to add monitor');
      }
    } catch (error) {
      console.error("Add monitor failed", error);
      alert(`Failed to add monitor: ${error.message || 'Unknown error'}`);
    }
  };

  const handleResetMonitor = async (monitorCode) => {
    try {
      console.log("Resetting monitor", monitorCode);
      const response = await apiReset(monitorCode);
      if (response.code === 200) {
        alert(`Monitor ${monitorCode} has been reset successfully`);
        // Optionally refresh monitor data or clear local data for this monitor
        setMonitorData((prev) => prev.map((m) => 
          m.monitorCode === monitorCode 
            ? { ...m, tableData: [] } // Clear table data for the reset monitor
            : m
        ));
      } else {
        alert(`Failed to reset monitor: ${response.reason}`);
      }
    } catch (e) {
      console.error("Reset monitor failed", e);
      alert("Failed to reset monitor");
    }
  };

  const fetchMonitorSettings = async () => {
    try {
      const response = await getSettings();
      if (response.code === 200) {
        setMonitorSettings(response.settings);
      } else {
        console.warn("Failed to fetch monitor settings:", response.reason);
      }
    } catch (error) {
      console.error("Error fetching monitor settings:", error);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) return; // don't subscribe if not logged in
    if (!allowedTo?.includes("MONITOR")) return; // only if allowed

    let unsub;
    let cancelled = false;

    (async () => {
      try {
        const res = await subscribe((incoming) => {
          if (cancelled) return;
          console.log("📡 Incoming backend data:", JSON.stringify(incoming, null, 2));

          setMonitorData((prev) => {
            const idx = prev.findIndex((m) => m.monitorCode === incoming.monitorCode);
            if (idx !== -1) {
              const updated = [...prev];
              const newTableData = [
                ...(updated[idx].tableData || []),
                ...(incoming.tableData || [])
              ].slice(-10); // keep last 10

              updated[idx] = {
                ...updated[idx],
                ...incoming,
                tableData: newTableData,
              };
              return updated;
            }
            return [
              ...prev,
              {
                ...incoming,
                tableData: incoming.tableData || [],
              },
            ];
          });
        });

        if (res && res.code === 200) {
          unsub = res.unsubscribe;
        } else if (res && res.code === 401) {
          console.warn("Subscribe unauthorized (401):", res.reason);
          handleLogout();
        } else if (res && res.code === 403) {
          console.warn("Subscribe forbidden (403):", res.reason);
        } else if (res && res.code === 503) {
          console.warn("Service unavailable (503):", res.reason);
        } else {
          console.warn("Subscribe failed:", res);
        }
      } catch (e) {
        console.error("Subscribe error:", e);
      }
    })();

    return () => {
      cancelled = true;
      try { unsub?.(); } catch {}
    };
  }, [isLoggedIn, allowedTo]); // only subscribe when allowed
  
  const normalizedRole = String(userRole || '').toLowerCase().replace(/\s+/g, '');

  return (
    <Routes>
      <Route
        path="/login"
        element={<LoginForm onLogin={handleLogin} />}
      />
      <Route
        path="/monitor"
        element={
          isLoggedIn ? (
            allowedTo?.includes("MONITOR") ? (
              <MonitorView monitorData={monitorData} userRole={userRole} allowedTo={allowedTo} />
            ) : (
              <Navigate to="/" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/settings"
        element={
          !isLoggedIn ? (
            <Navigate to="/login" replace />
          ) : allowedTo?.includes("SETTING") ? (
            <div style={{ padding: 16 }}>
              <Settings
                monitors={monitorData}
                monitorSettings={monitorSettings}
                userRole={userRole}
                allowedTo={allowedTo}
                onAddMonitor={handleAddMonitor}
                onEditMonitor={() => {}}
                onResetMonitor={handleResetMonitor}
                onDeleteMonitor={handleDeleteMonitor}
                onUpdateMonitor={handleUpdateMonitor}
                onClose={() => navigate('/monitor')}
                onFetchMonitorSettings={fetchMonitorSettings}
              />
            </div>
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/admin"
        element={
          !isLoggedIn ? (
            <Navigate to="/login" replace />
          ) : (
            <div style={{ padding: 16 }}>
              <Admin userRole={userRole} allowedTo={allowedTo} />
            </div>
          )
        }
      />
      <Route
        path="/security"
        element={
          !isLoggedIn ? (
            <Navigate to="/login" replace />
          ) : allowedTo?.includes("SECURITY") ? (
            <div style={{ padding: 16 }}>
              <Security userRole={userRole} onLogout={handleLogout} allowedTo={allowedTo} />
            </div>
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/"
        element={
          <Navigate 
            to={
              isLoggedIn 
                ? (allowedTo?.includes("SECURITY") 
                    ? "/security" 
                    : allowedTo?.includes("MONITOR") 
                      ? "/monitor" 
                      : allowedTo?.includes("SETTING") 
                        ? "/settings" 
                        : "/login"
                  )
                : "/login"
            } 
            replace 
          />
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

<<<<<<< Updated upstream
import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { subscribe, update, reset, deleteM } from "./utils/api";
import { ReferenceLine } from "recharts";

function App() {
  const [editingMonitor, setEditingMonitor] = useState(null);
  const [editForm, setEditForm] = useState({
    A2: '', D3: '', D4: '', USL: '', LSL: '', size: '', name: '', ip: '', offsetNo: '', offsetSize: ''
  });
  const [monitors, setMonitors] = useState([]);
  const [form, setForm] = useState({
    A2: '', D3: '', D4: '', USL: '', LSL: '', size: '', name: '', ip: '', offsetNo: '', offsetSize: ''
  });

  useEffect(() => {
    subscribe((incoming) => {
      setMonitors((prev) => {
        const index = prev.findIndex(m => m.id === incoming.monitorCode);
        const values = incoming.tableData.map((d, i) => ({ index: i + 1, value: d.value }));
        const mr = incoming.tableData.map((d, i) => ({ index: i + 1, value: d.MR }));
        const monitorData = {
          id: incoming.monitorCode,
          form: {
            A2: incoming.a2,
            D3: incoming.d3,
            D4: incoming.d4,
            USL: incoming.usl,
            LSL: incoming.lsl,
            size: incoming.datapointSize,
            name: incoming.machineName,
            ip: incoming.machineIP,
            offsetNo: incoming.toolOffsetNumber,
            offsetSize: incoming.offsetSize
          },
          values,
          mr,
          stats: {
            xbar: incoming["X-bar"],
            avgMR: incoming.avgMR,
            stdDev: incoming.stdDev,
            UCL: incoming.UCL_X,
            LCL: incoming.LCL_X,
            Cp: incoming.cp,
            Cpk: incoming.cpk
          }
        };

        if (index >= 0) {
          const updated = [...prev];
          updated[index] = monitorData;
          return updated;
        }
        return [...prev, monitorData];
      });
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const addMonitor = () => {
    const monitorCode = (monitors.length + 700).toString();
    update(
      monitorCode,
      parseFloat(form.USL),
      parseFloat(form.LSL),
      parseFloat(form.D3),
      parseFloat(form.D4),
      parseFloat(form.A2),
      form.size,
      form.ip,
      parseFloat(form.offsetNo),
      parseFloat(form.offsetSize)
    );
    setForm({ A2: '', D3: '', D4: '', USL: '', LSL: '', size: '', name: '', ip: '', offsetNo: '', offsetSize: '' });
  };

  const resetMonitor = (id) => {
    reset(id);
  };

  const deleteMonitor = (id) => {
    deleteM(id);
    setMonitors(prev => prev.filter(m => m.id !== id));
  };

  const openEditPopup = (monitor) => {
    setEditingMonitor(monitor.id);
    setEditForm({ ...monitor.form });
  };

  const saveEdit = () => {
    update(
      editingMonitor,
      parseFloat(editForm.USL),
      parseFloat(editForm.LSL),
      parseFloat(editForm.D3),
      parseFloat(editForm.D4),
      parseFloat(editForm.A2),
      editForm.size,
      editForm.ip,
      parseFloat(editForm.offsetNo),
      parseFloat(editForm.offsetSize)
    );
    setEditingMonitor(null);
  };

  return (
    
    <div style={{ display: "flex", height: "100vh", fontFamily: "system-ui" }}>
  <div style={{
    width: "80px",
    background: "#2456D5",
    color: "white",
    writingMode: "vertical-rl",
    textAlign: "center",
    padding: "1rem 0",
    fontWeight: "bold",
    fontSize: "1.2rem",
    letterSpacing: "2px",
    boxShadow: "2px 0 10px rgba(0,0,0,0.2)"
  }}>
    WEBSITE
  </div>
  <div style={{
    backgroundColor: "white",
    borderRadius: "10px",
    padding: "1rem",
    marginBottom: "2rem",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
  }}>
        <h2 style={{ marginBottom: "1rem" }}>Add New Monitor</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
        {Object.keys(form).map((key) => (
      <input
        key={key}
        name={key}
        placeholder={key}
        value={form[key]}
        onChange={handleChange}
        style={{
          flex: "1 0 30%",
          minWidth: "120px",
          padding: "8px",
          border: "1px solid #ccc",
          borderRadius: "6px"
        }}
            />
          ))}
          <button
    onClick={addMonitor}
    style={{
      marginTop: "1rem",
      background: "#2456D5",
      color: "white",
      padding: "8px 16px",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontWeight: "bold"
    }}
  >
    + ADD MONITOR
  </button>
        </div>

        {monitors.map(({ id, form, values, mr, stats }) => (
          <div key={id} style={{
            background: "white",
            borderRadius: "10px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
            padding: "1.5rem",
            marginBottom: "2rem",
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem"
          }}>
            <div style={{ flex: 2, minWidth: 0 }}>
              <h3>For #{id}</h3>
              <div style={{ width: "100%", height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
  <LineChart data={values}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="index" />
    <YAxis />
    <Tooltip />
    <Line type="monotone" dataKey="value" stroke="blue" />

    {/* Reference Lines for Control Limits */}
    <ReferenceLine y={stats?.UCL} stroke="red" strokeDasharray="5 5" label={{ value: 'UCL', position: 'right', fill: 'red' }} />
<ReferenceLine y={stats?.LCL} stroke="red" strokeDasharray="5 5" label={{ value: 'LCL', position: 'right', fill: 'red' }} />
<ReferenceLine y={stats?.xbar} stroke="green" strokeDasharray="5 5" label={{ value: 'CL', position: 'right', fill: 'green' }} />
  </LineChart>
</ResponsiveContainer>
              </div>
              <div style={{ width: "100%", height: 150, marginTop: 20 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mr}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="index" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="blue" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div style={{ flex: 1, marginLeft: "1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ color: "black" }}>
  <p style={{ color: "black" }}><b>X-bar:</b> {stats?.xbar?.toFixed(5)}</p>
  <p style={{ color: "black" }}><b>Average MR:</b> {stats?.avgMR?.toFixed(5)}</p>
  <p style={{ color: "black" }}><b>Standard Deviation:</b> {stats?.stdDev}</p>
  <p style={{ color: "black" }}><b>USL:</b> {form.USL}</p>
  <p style={{ color: "black" }}><b>LSL:</b> {form.LSL}</p>
  <p style={{ color: "black" }}><b>UCL:</b> {stats?.UCL}</p>
  <p style={{ color: "black" }}><b>LCL:</b> {stats?.LCL}</p>
  <p style={{ color: "black" }}><b>Cp:</b> {stats?.Cp}</p>
  <p style={{ color: "black" }}><b>Cpk:</b> {stats?.Cpk}</p>
</div>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <button onClick={() => resetMonitor(id)} style={{
  background: "#007bff",
  color: "white",
  padding: "6px 12px",
  borderRadius: "6px",
  border: "none",
  fontWeight: "bold",
  cursor: "pointer"
}}>RESET</button>

<button onClick={() => deleteMonitor(id)} style={{
  background: "red",
  color: "white",
  padding: "6px 12px",
  borderRadius: "6px",
  border: "none",
  fontWeight: "bold",
  cursor: "pointer"
}}>DELETE</button>

<button onClick={() => openEditPopup({ id, form })} style={{
  background: "#28a745",
  color: "white",
  padding: "6px 12px",
  borderRadius: "6px",
  border: "none",
  fontWeight: "bold",
  cursor: "pointer"
}}>EDIT</button>
              </div>
              <div style={{ maxHeight: "200px", overflowY: "auto", border: "1px solid #ccc", borderRadius: "4px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead style={{ position: "sticky", top: 0, background: "#f9f9f9", color: "black" }}>
                    <tr>
                      <th style={{ border: "1px solid #ccc", padding: "4px", color: "black"  }}>INDEX</th>
                      <th style={{ border: "1px solid #ccc", padding: "4px" , color: "black" }}>VALUE</th>
                      <th style={{ border: "1px solid #ccc", padding: "4px" , color: "black" }}>MR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {values.map((d, i) => (
                      <tr key={i}>
                        <td style={{ border: "1px solid #ccc", padding: "4px", color: "black" }}>{d.index}</td>
                        <td style={{ border: "1px solid #ccc", padding: "4px", color: "black" }}>{d.value.toFixed(5)}</td>
                        <td style={{ border: "1px solid #ccc", padding: "4px", color: "black" }}>{mr[i]?.value.toFixed(5)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}

        {/* EDIT MONITOR POPUP */}
        {editingMonitor && (
          <div style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000
          }}>
            <div style={{
              background: "white",
              padding: "2rem",
              borderRadius: "10px",
              width: "60%",
              boxShadow: "0 2px 20px rgba(0,0,0,0.2)"
            }}>
              <h3 style={{ marginBottom: "1rem" }}>Edit Monitor #{editingMonitor}</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {Object.keys(editForm).map((key) => (
                  <input
                    key={key}
                    name={key}
                    placeholder={key}
                    value={editForm[key]}
                    onChange={handleEditChange}
                    style={{
                      flex: "1 0 30%",
                      minWidth: "120px",
                      padding: "8px",
                      border: "1px solid #ccc",
                      borderRadius: "6px"
                    }}
                  />
                ))}
              </div>
              <div style={{ marginTop: "1rem", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button onClick={() => setEditingMonitor(null)} style={{
                  padding: "8px 16px", border: "none", borderRadius: "6px", background: "#ccc"
                }}>Cancel</button>
                <button onClick={saveEdit} style={{
                  padding: "8px 16px", background: "#28a745", color: "white", border: "none", borderRadius: "6px", fontWeight: "bold"
                }}>Save</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App; 
=======
import React, { useState, useEffect } from "react";
import MonitorView from "./components/MonitorView";
import { subscribe, update as apiUpdate, deleteM as apiDelete, logout as apiLogout, reset as apiReset, getSettings } from "./utils/api1";
import LoginForm from "./components/LoginPage"; // import your login form
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
      // Generate a monitor code for the new monitor
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
        element={<Navigate to={isLoggedIn ? (allowedTo?.includes("SECURITY") ? "/security" : allowedTo?.includes("MONITOR") ? "/monitor" : allowedTo?.includes("SETTING") ? "/settings" : "/login") : "/login"} replace />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
>>>>>>> Stashed changes

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

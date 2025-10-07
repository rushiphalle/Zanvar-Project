import styles from './Table.module.css'
import { getTableData, updateTable } from '../../utils/api'
import { useEffect, useState } from 'react';
import { useSpinner } from '../../utils/SpinnerContext';
import { useAuth } from '../../utils/AuthContext';

export default function Table() {
  const { setSpinner } = useSpinner();
  const { setUser } = useAuth();
  const [tableData, setTable] = useState([]);
  const handleChange = (index, fieldIndex, value) => {
    // map fieldIndex to key
    const fieldMap = ["a2", "d3", "d4"];
    const key = fieldMap[fieldIndex];

    // update the right row and column
    const newData = [...tableData];
    newData[index][key] = parseFloat(value); // or just `value` if you want strings
    setTable(newData);
  };

  const handleUpdate = async()=>{
    setSpinner("Updating Data");
    let ack = await updateTable(tableData);
    setSpinner(null);
    if (ack.code === 200) {
      alert("Updated Successfully");
      refresh();
    } else if (ack.code === 401) {
      alert("Oops! Session Expired, Please Relogin");
      setUser(null);
    } else {
      alert(ack.reason);
    }
  }

  const refresh = async () => {
    setSpinner("Fetching Table Data");
    let ack = await getTableData();
    setSpinner(null);
    if (ack.code === 200) {
      setTable(ack.table);
    } else if (ack.code === 401) {
      alert("Oops! Session Expired, Please Relogin");
      setUser(null);
    } else {
      alert(ack.reason);
    }
  }
  useEffect(() => {
    refresh();
    window.scrollTo(0,0);
  }, []);
  return (
    <div style={{ marginBottom: "50px", minHeight: "100vh" }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: "center", margin: '20px 10px', width: "calc(100vw - 20px)" }}><h2>SPC TABLE</h2><button style={{ marginLeft: 'auto', padding: "10px 30px", background: "rgba(247, 247, 247)", border: "0px", boxShadow: "0px 0px 2px gray", borderRadius: "10px", fontSize: "16px", fontWeight: "bold" }} onClick={() => { refresh() }}>Refresh</button></div>
      <div className={styles.container}>
        <div className={styles.tableContainer}>
          <div className={styles.tableHeader}>
            <span>Sample Size</span>
            <span>a2</span>
            <span>d3</span>
            <span>d4</span>
          </div>

          {tableData.map((tableD, index) => (
            <div key={index} className={styles.tableRow}>
              <span className={styles.sampleIndex}>{index + 1}</span>
              <input
                type="number"
                value={tableD.a2}
                onChange={(e) => handleChange(index, 0, e.target.value)}
              />
              <input
                type="number"
                value={tableD.d3}
                onChange={(e) => handleChange(index, 1, e.target.value)}
              />
              <input
                type="number"
                value={tableD.d4}
                onChange={(e) => handleChange(index, 2, e.target.value)}
              />
            </div>
          ))}
        </div>
        <button onClick={handleUpdate} className={styles.button}>Update Table</button>
      </div>
    </div>
  )
}


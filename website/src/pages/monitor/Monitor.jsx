import { useEffect, useState } from "react";
import ChartComponent from "../../components/chart/ChartComponent";
import styles from './Monitor.module.css'
import {subscribe} from '../../utils/api'
import { useAuth } from '../../utils/AuthContext'
import { useSpinner } from '../../utils/SpinnerContext'

function Screen({screendata}){
    let valueTable = screendata.tableData.map((row)=>(row.value));
    let mrTable = screendata.tableData.map((row)=>(row.MR))
    return (
        <div className={styles.container}>
            <h2 className={styles.monitorName}>{screendata.monitorCode}</h2>
            <div className={styles.calculationBox}>
                <div><strong>CP: </strong>{screendata.cp}</div>
                <div><strong>CPK: </strong>{screendata.cpk}</div>
                <div><strong>Standerd Dev: </strong>{screendata.stdDev}</div>
                <div><strong>XBar: </strong>{screendata.xBar}</div>
                <div><strong>MR Bar: </strong>{screendata.avgMR}</div>
            </div>
            <div className={styles.graphBox}>
                <ChartComponent title="X-Chart" tableData = {valueTable} midLineLabel = "Bar" UCL={screendata.UCL_X} LCL={screendata.LCL_X} USL = {screendata.usl} LSL={screendata.lsl} X_bar={screendata.xBar}/>
            </div>
            <div className={styles.graphBox}>
                <ChartComponent title="MR-Chart" tableData = {mrTable} midLineLabel = "MR Bar" UCL={screendata.UCL_MR} LCL={screendata.LCL_MR}  X_bar={screendata.avgMR}/>
            </div>
        </div>
    )
    //   return (
    //     <div className={styles.container}>
    //         <h2 className={styles.monitorName}>#700</h2>
    //         <div className={styles.calculationBox}>
    //             <div><strong>CP: </strong>screendata.cp</div>
    //             <div><strong>CPK: </strong>screendata.cpk</div>
    //             <div><strong>Standerd Dev: </strong>screendata.stdDev</div>
    //             <div><strong>XBar: </strong>25.971</div>
    //             <div><strong>MR Bar: </strong>screendata.avgMR</div>
    //         </div>
    //         <div className={styles.graphBox}>
    //             <ChartComponent title="X-Chart" tableData = {[10,11,10,12,9,11]} midLineLabel = "Bar" UCL={12} LCL={9} USL = {9.5} LSL={11.5} X_bar={10}/>
    //         </div>
    //         <div className={styles.graphBox}>
    //             <ChartComponent title="MR-Chart" tableData = {[10,11,10,12,9,11]} midLineLabel = "MR Bar" UCL={12} LCL={9}  X_bar={10}/>
    //         </div>
    //     </div>
    // )
}

export default function Monitor() {
  const [data, setData] = useState([]);
  const { setUser } = useAuth();
  const { setSpinner } = useSpinner();

  const handleNewData = (d) => {
    setData((prevData) => {
      const exists = prevData.some((item) => item.monitorCode === d.monitorCode);
      if (exists) {
        return prevData.map((monitorData) =>
          monitorData.monitorCode === d.monitorCode ? d : monitorData
        );
      }
      return [...prevData, d];
    });
  };

  let ack;
  const sub = async () => {
    setData([]);
    setSpinner("Subscribing To Monitor");
    try {
      ack = await subscribe((d) => {
        handleNewData(d);
      });
      console.log("ack=", ack);
      setSpinner(null);

      if (ack.code === 2000) {
        console.log("Subscribed successfully!");
      }
    } catch (ack) {
      setSpinner(null);
      console.log("ack error=", ack);

      if (ack.code === 1008 || ack.code == 1000) {
        alert("Oops! Session Expired! Please Relogin");
        setUser(null);
      } else if (ack.code === 4003) {
        alert("You Are Not Allowed To This");
      } else if (ack.code === 1013) {
        alert("Server full, please try again later");
      }else{
        alert("Something Went Wrong! If Thi Issue persist please contact IT manager");
      }
    }
  };

  useEffect(() => {
    window.scrollTo(0,0);
    sub();
    return () => {
      console.log("Called Log  "+  JSON.stringify(ack));
      if (ack?.unsubscribe) {
        ack.unsubscribe();
      }
    };
  }, []);

  return (
    <div style={{ marginBottom: "50px" }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: "center", margin: '20px 10px', width: "calc(100vw - 20px)" }}><h2>Live Monitor</h2><button style={{ marginLeft: 'auto', padding: "10px 30px", background: "rgba(247, 247, 247)", border: "0px", boxShadow: "0px 0px 2px gray", borderRadius: "10px", fontSize: "16px", fontWeight: "bold" }} onClick={sub}>Refresh</button></div>

      {data.map((monitorData, idx) => (
        <Screen key={idx} screendata={monitorData} />
      ))}
      {
        data.length ? <></> : <div>Loading Monitors... Please Wait</div>
      }
    </div>
  );
}

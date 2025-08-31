import styles from './Settings.module.css'
import { reset, deleteM, update, getSettings } from '../../utils/api'
import { useEffect, useState } from 'react';
import { useSpinner } from '../../utils/SpinnerContext';
import { useAuth } from '../../utils/AuthContext';

function SettingBoard({ refreshAction, monitorCode, settingData }) {
  const [shown, setShown] = useState(false);
  const { setUser } = useAuth();
  const { setSpinner } = useSpinner();
  const handleDelete = async () => {
    setSpinner("Deleting Monitor")
    let ack = await deleteM(monitorCode);
    setSpinner(null);
    if (ack.code == 200) {
      refreshAction();
      alert("Operation Successful");
    } else if (ack.code === 401) {
      alert("Oops! Session Expired, Please Relogin");
      setUser(null);
    } else {
      alert(ack.reason);
    }
  };
  const handleReset = async () => {
    setSpinner("Resetting Monitor")
    let ack = await reset(monitorCode);
    setSpinner(null);
    if (ack.code == 200) {
      refreshAction();
      alert("Operation Successful");
    } else if (ack.code === 401) {
      alert("Oops! Session Expired, Please Relogin");
      setUser(null);
    } else {
      alert(ack.reason);
    }
  };
  const handleEdit = () => {
    setShown(true);
  }
  return (
    <div className={styles.boardContainer}>
      {shown ? <SettingForm refreshAction={refreshAction} monitorCode={monitorCode} a2={settingData.a2} d3={settingData.d3} d4={settingData.d4} usl={settingData.usl} lsl={settingData.lsl} datapointSize={settingData.datapointSize} machineName={settingData.machineName} machineIP={settingData.machineIP} toolOffsetNumber={settingData.toolOffsetNumber} offsetSize={settingData.offsetSize} closeEvent={() => setShown(false)} /> : <></>}
      <div className={styles.boardHeader}>
        <span>{monitorCode}</span>
        <button onClick={handleReset}>&#x27F3;</button>
        <button onClick={handleDelete}>&#x1F5D1;</button>
        <button onClick={handleEdit}>&#x1F58A;</button>
      </div>
      <div className={styles.boardSettings}>
        <div><strong>Machine Name</strong> {settingData.machineName}</div>
        <div><strong>Machine IP</strong> {settingData.machineIP}</div>
        <div><strong>A2</strong> {settingData.a2}</div>
        <div><strong>D3</strong> {settingData.d3}</div>
        <div><strong>D4</strong> {settingData.d4}</div>
        <div><strong>USL</strong> {settingData.usl}</div>
        <div><strong>LSL</strong> {settingData.lsl}</div>
        <div><strong>Data Point Size</strong> {settingData.datapointSize}</div>
        <div><strong>Tool Offset Number</strong> {settingData.toolOffsetNumber}</div>
        <div><strong>Offset Size</strong> {settingData.offsetSize}</div>
      </div>
    </div>
  );
}

function SettingForm({ refreshAction, monitorCode, a2, d3, d4, usl, lsl, datapointSize, machineName, machineIP, toolOffsetNumber, offsetSize, closeEvent }) {
  const [code, setCode] = useState(monitorCode || "");
  const [a2State, setA2] = useState(a2 || (a2==0 ? 0: ""));
  const [d3State, setD3] = useState(d3 || (d3==0 ? 0: ""));
  const [d4State, setD4] = useState(d4 || (d4==0 ? 0: ""));
  const [uslState, setUSL] = useState(usl || (usl==0 ? 0: ""));
  const [lslState, setLSL] = useState(lsl || (lsl==0 ? 0: ""));
  const [datapointSizeState, setDatapointSize] = useState(datapointSize || "");
  const [machineNameState, setMachineName] = useState(machineName || "");
  const [machineIPState, setIP] = useState(machineIP || "");
  const [toolOffsetNumberState, setToolOffsetNum] = useState(toolOffsetNumber ||  (toolOffsetNumber==0 ? 0: ""));
  const [offsetSizeState, setOffsetSize] = useState(offsetSize || (offsetSize==0 ? 0: ""));
  const { setUser } = useAuth();
  const { setSpinner } = useSpinner();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSpinner("Updating Settings");
    let ack = await update(code, Number(uslState), Number(lslState), Number(d3State), Number(d4State), Number(a2State), Number(datapointSizeState), machineNameState, machineIPState, Number(toolOffsetNumberState), Number(offsetSizeState));
    setSpinner(null);
    if (ack.code == 200) {
      alert("Setting Data Modified Successfully");
      refreshAction();
      closeEvent();
    } else if (ack.code === 401) {
      alert("Oops! Session Expired, Please Relogin");
      setUser(null);
    } else {
      alert(ack.reason);
    }
  };

  return (
    <div className={styles.formContainer}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="monitorCode">Monitor Code</label>
          <input
            id="monitorCode"
            type="text"
            placeholder="#700"
            required
            maxlength="31"
            value={code}
            disabled={monitorCode}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="machineName">Machine Name</label>
          <input
            id="machineName"
            type="text"
            placeholder="Machine A"
            required
            maxlength="31" 
            value={machineNameState}
            onChange={(e) => setMachineName(e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="machineIP">Machine IP</label>
          <input
            id="machineIP"
            type="text"
            placeholder="192.16.4.1"
            required
            maxlength="15" 
            value={machineIPState}
            onChange={(e) => setIP(e.target.value)}
          />
        </div>

        <div className={styles.superHolder}>

          <div className={styles.formGroup}>
            <label htmlFor="datapointSize">Datapoint Size</label>
            <input
              id="datapointSize"
              type="number"
              placeholder="10"
              required
              max="30"
              value={datapointSizeState}
              onChange={(e) => setDatapointSize(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="a2">A2</label>
            <input
              id="a2"
              type="number"
              placeholder="1.50"
              required
              value={a2State}
              onChange={(e) => setA2(e.target.value)}
            />
          </div>
        </div>
        <div className={styles.superHolder}>
          <div className={styles.formGroup}>
            <label htmlFor="d3">D3</label>
            <input
              id="d3"
              type="number"
              placeholder="3.50"
              required
              value={d3State}
              onChange={(e) => setD3(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="d4">D4</label>
            <input
              id="d4"
              type="number"
              placeholder="0"
              required
              value={d4State}
              onChange={(e) => setD4(e.target.value)}
            />
          </div>
        </div>
        <div className={styles.superHolder}>
          <div className={styles.formGroup}>
            <label htmlFor="usl">USL</label>
            <input
              id="usl"
              type="number"
              placeholder="26.00"
              required
              value={uslState}
              onChange={(e) => setUSL(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="lsl">LSL</label>
            <input
              id="lsl"
              type="number"
              placeholder="25.500"
              required
              value={lslState}
              onChange={(e) => setLSL(e.target.value)}
            />
          </div>
        </div>
        <div className={styles.superHolder}>
          <div className={styles.formGroup}>
            <label htmlFor="offsetSize">Offset Size</label>
            <input
              id="offsetSize"
              type="number"
              placeholder="10"
              required
              value={offsetSizeState}
              onChange={(e) => setOffsetSize(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="toolOffsetNumber">Tool Offset Number</label>
            <input
              id="toolOffsetNumber"
              type="number"
              placeholder="0"
              required
              value={toolOffsetNumberState}
              onChange={(e) => setToolOffsetNum(e.target.value)}
            />
          </div>
        </div>

        <button type="submit" className={styles.submitBtn}>
          Update Monitor
        </button>
        <button type="close" className={styles.closeBtn} onClick={closeEvent}>
          Close Form
        </button>
      </form>
    </div>

  );
}


export default function Settings() {
  const [shown, setShown] = useState(false);
  const [settings, setSettings] = useState([]);
  const { setSpinner } = useSpinner();
  const { setUser } = useAuth();
  const refresh = async () => {
    setSpinner("Fetching Settings");
    let ack = await getSettings();
    setSpinner(null);
    if (ack.code === 200) {
      const temp = Object.entries(ack.settings).map(([key, value]) => ({
        monitorCode: key,
        settingData: value
      }));
      setSettings(temp);
    } else if (ack.code === 401) {
      alert("Oops! Session Expired, Please Relogin");
      setUser(null);
    } else {
      alert(ack.reason);
    }
  }
  useEffect(() => {
    refresh();
  }, []);
  return (
    <div style={{ marginBottom: "50px", minHeight: "100vh" }}>
      {shown ? <SettingForm refreshAction={refresh} closeEvent={() => setShown(false)} /> : <></>}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent:"center", margin: '20px 10px', width: "calc(100vw - 20px)" }}><h2>SPC SETTINGS</h2><button style={{ marginLeft: 'auto', padding:"10px 30px", background:"rgba(247, 247, 247)", border:"0px", boxShadow:"0px 0px 2px gray", borderRadius:"10px", fontSize:"16px", fontWeight:"bold" }} onClick={() => { setShown(true) }}>Add Monitor</button></div>

      {settings.map(setting => <SettingBoard refreshAction={refresh} monitorCode={setting.monitorCode} settingData={setting.settingData} />)}
      {!settings.length ? <div>No Settings Found</div> : <></>}
    </div>
  )
}
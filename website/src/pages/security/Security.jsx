import { useEffect, useState } from 'react';
import styles from './Security.module.css';
import {updateRole,  getSecurityCreds, updateWifi, deleteRole, logout } from '../../utils/api';
import { useAuth } from '../../utils/AuthContext';
import { useSpinner } from '../../utils/SpinnerContext';

function RoleCard({ userAlias, username, password, allowedTo, refreshAction, updateFormTrigger }) {
    const {setUser} = useAuth();
    const {setSpinner} = useSpinner();
    const handleDelete = async() => {
        setSpinner("Deleting Role");
        let ack = await deleteRole(username);
        setSpinner(null);
        if(ack.code == 200){
          refreshAction();
          alert("Role Deleted SUccessfully");
        } else if (ack.code === 401) {
          alert("Oops! Session Expired, Please Relogin");
          setUser(null);
        }else {
          alert("Failed To Update With Error Code = " + ack.code);
        }
    }
    const handleEdit = () => {
        updateFormTrigger({ userAlias, username, password, allowedTo});
    }
    return (
        <div className={styles.roleContainer}>
            <h3>{userAlias}</h3>
            <div>
                <button onClick={handleEdit}>&#x1F58A;</button>
                <button onClick={handleDelete}>&#x1F5D1;</button>
            </div>
        </div>
    );
}

function RoleForm({ userAlias, username, password, allowedTo, closeEvent, refreshAction }) {
  const [userAliasState, setUserAlias] = useState(userAlias || "");
  const [usernameState, setUsername] = useState(username || "");
  const [passwordState, setPassword] = useState(password || "");
  const [allowedToState, setAllowedTo] = useState(allowedTo || []);
  const {setUser} = useAuth();
  const {setSpinner} = useSpinner();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!allowedToState.length) {
      alert("Please give at least one permission");
      return;
    }
    setSpinner("Updating Role Credintials");
    let ack = await updateRole(usernameState, passwordState, userAliasState, allowedToState);
    setSpinner(null);
    if(ack.code == 200){
        refreshAction();
        alert("User Role Modified Successfully");
        closeEvent();
    } else if (ack.code === 401) {
      alert("Oops! Session Expired, Please Relogin");
      setUser(null);
    } else {
        alert("Failed To Update With Error Code = " + ack.code);
    }
  };

  const togglePermission = (perm) => {
    setAllowedTo((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  return (
    <div className={styles.formContainer}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2 className={styles.title}>Update Role</h2>

        <div className={styles.field}>
          <label>User Alias</label>
          <input
            type="text"
            value={userAliasState}
            required
            maxLength="31"
            onChange={(e) => setUserAlias(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label>Username</label>
          <input
            type="text"
            value={usernameState}
            required
            maxLength="31"
            disabled={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label>Password</label>
          <input
            type="password"
            value={passwordState}
            required
            maxLength="31"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className={styles.permissions}>
          <h4>Permissions</h4>

          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={allowedToState.includes("SETTING")}
              onChange={() => togglePermission("SETTING")}
            />
            Settings
          </label>

          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={allowedToState.includes("MONITOR")}
              onChange={() => togglePermission("MONITOR")}
            />
            Monitor
          </label>

          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={allowedToState.includes("SECURITY")}
              onChange={() => togglePermission("SECURITY")}
            />
            Security
          </label>
        </div>

        <button type="submit" className={styles.button}>
          Update Role
        </button>
        <button type="close" className={styles.button} onClick={closeEvent}>
          Cancle
        </button>
      </form>
    </div>
  );
}


export default function Security() {
    const [ssid, setSsid] = useState();
    const [password, setPasswrod] = useState();
    const [roles, setRoles] = useState([]);
    const [shown, setShown] = useState(false);
    const { setUser } = useAuth();
    const { setSpinner } = useSpinner();
    const handleUpdateWIFI = async(e) => {
        e.preventDefault();
        alert("After Updating Wifi credintials you qill be disconnected from server, plase note the new credintials as its irevertable");
        await logout();
        setUser(null);
        let ack = await updateWifi(ssid, password);
        if(ack.code == 200){
          alert("WIFI Data Modified Successfully");
          refresh();
          closeEvent();
        }else{
            alert("Failed To Update With Error Code = " + ack.code);
        }
    }
    const refresh = async()=>{
        setSpinner("Fetching Data");
        let ack = await getSecurityCreds();
        setSpinner(null);
        if(ack.code == 200){
           setSsid(ack.creds.wifi.ssid);
           setPasswrod(ack.creds.wifi.password);
           setRoles(ack.creds.users);
        }else if (ack.code === 401) {
          alert("Oops! Session Expired, Please Relogin");
          setUser(null);
        } else{
          alert(ack.reason);
        }
    }
    useEffect(()=>{
        refresh();
    }, []);
    return (
        <div className={styles.container}>
            {shown ? <RoleForm  userAlias={shown.userAlias} username={shown.username} password={shown.password} allowedTo = {shown.allowedTo} closeEvent={()=>setShown(null)} refreshAction={refresh}/> : <></>}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent:"center", margin: '20px 10px', width: "calc(100vw - 20px)" }}><h2>Security Panel</h2><button style={{ marginLeft: 'auto', padding:"10px 30px", background:"rgba(247, 247, 247)", border:"0px", boxShadow:"0px 0px 2px gray", borderRadius:"10px", fontSize:"16px", fontWeight:"bold" }} onClick={refresh}>Refresh</button></div>
            <hr style={{width:"110%"}}/>

            <div className={styles.wifibox}>
                <h2>Wifi Credintials</h2>
                <form onSubmit={(e) => handleUpdateWIFI(e)}>
                    <div>
                        <label htmlFor="">Wifi SSID</label>
                        <input type="text" value={ssid} placeholder='Enter ssid' required onChange={(e) => setSsid(e.target.value)} />
                    </div>
                    <div>
                        <label htmlFor="">Wifi Password</label>
                        <input type="text" value={password} placeholder='Enter Password ' required onChange={(e) => setPasswrod(e.target.value)} />
                    </div>
                    <button type="submit">Update Credintials</button>
                </form>
            </div>
            
            <div className={styles.rolebox}>
                <h2 className={styles.roleBoxHeader}>User Roles</h2>
                {
                    roles.map((role) =>
                        <RoleCard userAlias={role.userAlias} username={role.username} password={role.password} allowedTo={role.allowedTo} refreshAction={refresh} updateFormTrigger={setShown}/>
                    )
                }
                <button className={styles.addbtn} onClick={() => setShown({})}>Add Role</button>
            </div>
        </div>
    );
}
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext";
import { login } from '../../utils/api';  
import styles from './Login.module.css';  
import logo from '../../assets/logo.jpg';
import profile from '../../assets/profile.svg';
import lock from '../../assets/lock.svg';
import eye1 from '../../assets/eye1.svg';
import eye2 from '../../assets/eye2.svg';
import { useSpinner } from "../../utils/SpinnerContext";

export default function Login(){
    const {user, setUser} = useAuth();
    const [username, setUsername] = useState();
    const [password, setPassword] = useState();
    const [shown, setShown] = useState(false);
    const navigate = useNavigate();
    const { setSpinner } = useSpinner();
    const handleLogin = async(e)=>{
        e.preventDefault();
        setSpinner("Logging In");
        let ack = await login(username, password);
        setSpinner(null);
        if(ack.code == 200){
            setUser(ack);
            navigate('/profile');
        }else{
            alert(ack.reason);
        }
    }
    return(
        <div className={styles.container}>
            <div className={styles.curve}>
            {/* <div className={styles.head}> */}
                <img className={styles.logo} src={logo} alt="" />
                <h1>Login</h1>
            </div>
            <form onSubmit={(e)=>{handleLogin(e)}} className={styles.form}>
                <div className={styles.inputHolder}>
                    <img src={profile} alt="" />
                    <input placeholder="username" type="text" required onChange={(e)=>{setUsername(e.target.value)}}/>
                </div>                
                <div className={styles.inputHolder}>
                    <img src={lock} alt="" />
                    <input placeholder="password" type={shown? "text":"password"} required onChange={(e)=>{setPassword(e.target.value)}}/>
                    <img src={shown? eye1 : eye2} alt="" onClick={()=>{setShown(prev=>!prev)}}/>
                </div>
                <button type="submit">Login</button>
            </form>
        </div>
    ); 
}  
import logo from '../../assets/logo.jpg'
import { useAuth } from '../../utils/AuthContext';
import styles from './Profile.module.css';
import { logout } from '../../utils/api';

export default function Profile(){
    const {user, setUser} = useAuth();
    return (
        <div className={styles.container}>

            <span className={styles.profilebox}>
                <img src={logo} alt="" />
                <h2>{user.userAlias}</h2>
                <h3>@{user.username}</h3>
            </span>
            <button onClick={()=>{setUser(null); logout()}}>Logout</button>
        </div>
    );
}
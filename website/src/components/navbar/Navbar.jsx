import styles from './Navbar.module.css'
import { Link } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';

export default function Navbar(){
    const { user } = useAuth();
    return(
        <nav className={styles.navbar}>
            <ul>
                {user?.allowedTo?.includes("SETTING") && (
                  <li><Link to="/settings"><span>SETTINGS</span></Link></li>
                )}
                {user?.allowedTo?.includes("MONITOR") && (
                  <li><Link to="/monitor"><span>MONITOR</span></Link></li>
                )}
                {user?.allowedTo?.includes("SECURITY") && (
                  <li><Link to="/security"><span>SECURITY</span></Link></li>
                )}
                <li><Link to="/profile"><span>PROFILE</span></Link></li>
            </ul>
        </nav>
    );
}

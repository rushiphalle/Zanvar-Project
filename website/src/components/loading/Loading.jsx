import styles from './Loading.module.css';

export default function Loading({message}){
    return(
        <div className={styles.container}>
            <div className={styles.spinner}>

            </div>
            <h3 className={styles.message}>
                {message}...
            </h3>
        </div>
    );
}
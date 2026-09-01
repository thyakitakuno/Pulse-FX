import { APP_NAME, DISCLAIMER } from '@pulse-fx/shared';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>{APP_NAME}</h1>
        <p>{DISCLAIMER}</p>
      </main>
    </div>
  );
}

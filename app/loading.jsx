import styles from "../styles/Loading.module.css";

export default function Loading() {
  return (
    <div className={styles.page}>
      <div className={styles.chips}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <span key={i} className={styles.chip} />
        ))}
      </div>
      <div className={styles.grid}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className={styles.card}>
            <div className={styles.thumb} />
            <div className={styles.row}>
              <div className={styles.avatar} />
              <div style={{ flex: 1 }}>
                <div className={styles.line} />
                <div className={`${styles.line} ${styles.short}`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

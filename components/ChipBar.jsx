"use client";

import styles from "../styles/ChipBar.module.css";
import { chips } from "../lib/videos";

const ChipBar = ({ active, onChange }) => {
  return (
    <div className={styles.chipBar}>
      {chips.map((chip) => (
        <button
          key={chip}
          className={`${styles.chip} ${active === chip ? styles.active : ""}`}
          onClick={() => onChange(chip)}
        >
          {chip}
        </button>
      ))}
    </div>
  );
};

export default ChipBar;

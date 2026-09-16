"use client";

import { useRouter } from "next/navigation";
import { SiYoutubeshorts } from "react-icons/si";
import styles from "../styles/ShortsShelf.module.css";
import { shorts } from "../lib/videos";

const ShortsShelf = () => {
  const router = useRouter();
  return (
    <section className={styles.shelf}>
      <div className={styles.head}>
        <SiYoutubeshorts size={22} color="#ff0000" /> <h2>Shorts</h2>
      </div>
      <div className={styles.row}>
        {shorts.map((s) => (
          <div key={s.id} className={styles.card} onClick={() => router.push(`/shorts/${s.id}`)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.thumbnail} alt={s.title} loading="lazy" />
            <p className={styles.title}>{s.title}</p>
            <p className={styles.views}>{s.views}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ShortsShelf;

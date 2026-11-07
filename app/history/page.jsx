"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaHistory } from "react-icons/fa";
import styles from "../../styles/SearchPage.module.css";
import DbThumb from "../../components/DbThumb";
import { findVideo, rowKey } from "../../lib/videos";

export default function HistoryPage() {
  const router = useRouter();
  const [ids, setIds] = useState(null);

  useEffect(() => {
    try {
      setIds(JSON.parse(localStorage.getItem("yt-history") || "[]"));
    } catch {
      setIds([]);
    }
  }, []);

  const clear = () => {
    localStorage.removeItem("yt-history");
    setIds([]);
  };

  if (ids === null) return <div style={{ padding: 24 }}>Loading…</div>;

  const list = ids.map((id) => findVideo(id)).filter(Boolean);

  return (
    <div className={styles.page}>
      <h1 className={styles.heading} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 22, fontWeight: 700 }}>
        <FaHistory /> Watch history
      </h1>
      {list.length > 0 && (
        <button className={styles.clearBtn} onClick={clear}>
          Clear all watch history
        </button>
      )}
      {list.length === 0 && <p className={styles.empty}>Videos you watch will show up here.</p>}
      {list.map((v) => (
        <div
          key={v.id}
          className={styles.row}
          role="link"
          tabIndex={0}
          onClick={() => router.push(`/watch/${v.id}`)}
          onKeyDown={rowKey(() => router.push(`/watch/${v.id}`))}
        >
          <DbThumb video={v} />
          <div>
            <div className={styles.title}>{v.title}</div>
            <div className={styles.meta}>{v.views} • {v.uploadedAt}</div>
            <div className={styles.channelRow}>
              <span className={styles.avatar} style={{ background: v.avatarColor || "#606060" }}>
                {(v.channel || "?").charAt(0)}
              </span>
              <span className={styles.channel}>{v.channel}</span>
            </div>
            <div className={styles.desc}>{(v.description || "").slice(0, 140)}...</div>
          </div>
        </div>
      ))}
    </div>
  );
}

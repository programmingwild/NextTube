"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MdOutlineWatchLater } from "react-icons/md";
import styles from "../../styles/SearchPage.module.css";
import DbThumb from "../../components/DbThumb";
import { rowKey, videos, store } from "../../lib/videos";

export default function WatchLaterPage() {
  const router = useRouter();
  const [list, setList] = useState(null);

  useEffect(() => {
    let uploads = [];
    try {
      uploads = JSON.parse(localStorage.getItem("yt-uploads") || "[]");
    } catch {}
    const catalog = [...uploads, ...videos];
    setList(
      store.getWatchLater()
        .map((id) => catalog.find((v) => String(v.id) === String(id)))
        .filter(Boolean)
    );
  }, []);

  const remove = (id) => {
    store.toggleWatchLater(id);
    setList((l) => l.filter((v) => String(v.id) !== String(id)));
  };

  if (list === null) return <div style={{ padding: 24 }}>Loading…</div>;

  return (
    <div className={styles.page}>
      <h1 className={styles.heading} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 22, fontWeight: 700 }}>
        <MdOutlineWatchLater /> Watch Later
      </h1>
      {list.length === 0 && <p className={styles.empty}>Save videos with the Save button under any video and they’ll wait for you here.</p>}
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
          <div style={{ flex: 1 }}>
            <div className={styles.title}>{v.title}</div>
            <div className={styles.meta}>{v.views} • {v.uploadedAt}</div>
            <div className={styles.channelRow}>
              <span className={styles.avatar} style={{ background: v.avatarColor || "#606060" }}>
                {(v.channel || "?").charAt(0)}
              </span>
              <span className={styles.channel}>{v.channel}</span>
            </div>
            <button
              className={styles.clearBtn}
              onClick={(e) => { e.stopPropagation(); remove(v.id); }}
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

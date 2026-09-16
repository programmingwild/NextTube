"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaRegHeart } from "react-icons/fa";
import styles from "../../styles/SearchPage.module.css";
import { videos } from "../../lib/videos";
import { cloudGetLikes } from "../../lib/cloud";

function catalogOf() {
  let uploads = [];
  try {
    uploads = JSON.parse(localStorage.getItem("yt-uploads") || "[]");
  } catch {}
  return [...uploads, ...videos];
}

export default function LikedPage() {
  const router = useRouter();
  const [list, setList] = useState(null);

  useEffect(() => {
    let live = true;
    let liked = {};
    try {
      liked = JSON.parse(localStorage.getItem("yt-liked") || "{}");
    } catch {}
    const toList = (map) => {
      const ids = Object.keys(map).filter((k) => map[k] === "like");
      const catalog = catalogOf();
      setList(ids.map((id) => catalog.find((v) => String(v.id) === String(id))).filter(Boolean));
    };
    toList(liked);
    cloudGetLikes().then((map) => {
      if (live && map) toList({ ...liked, ...map });
    });
    return () => {
      live = false;
    };
  }, []);

  if (list === null) return <div style={{ padding: 24 }}>Loading…</div>;

  return (
    <div className={styles.page}>
      <h1 className={styles.heading} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 22, fontWeight: 700 }}>
        <FaRegHeart /> Liked videos
      </h1>
      {list.length === 0 && <p className={styles.empty}>Videos you like will show up here. Tap Like under any video.</p>}
      {list.map((v) => (
        <div key={v.id} className={styles.row} onClick={() => router.push(`/watch/${v.id}`)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={v.thumbnail} alt={v.title} loading="lazy" />
          <div>
            <div className={styles.title}>{v.title}</div>
            <div className={styles.meta}>{v.views} • {v.uploadedAt}</div>
            <div className={styles.channelRow}>
              <span className={styles.avatar} style={{ background: v.avatarColor || "#606060" }}>
                {v.channel.charAt(0)}
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

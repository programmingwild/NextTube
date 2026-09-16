"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../../../styles/SearchPage.module.css";
import { videos, store } from "../../../lib/videos";

export default function PlaylistDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [pl, setPl] = useState(null);

  useEffect(() => {
    setPl(store.getPlaylists().find((p) => p.id === params?.id) || false);
  }, [params?.id]);

  if (pl === null) return <div style={{ padding: 24 }}>Loading…</div>;
  if (pl === false) {
    return (
      <div className={styles.page}>
        <h1 className={styles.heading}>Playlist not found</h1>
        <Link href="/playlists">← All playlists</Link>
      </div>
    );
  }

  const list = pl.ids
    .map((id) => videos.find((v) => String(v.id) === String(id)))
    .filter(Boolean);

  const removeVideo = (vid) => {
    const updated = store.toggleInPlaylist(pl.id, vid);
    setPl({ ...updated });
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.heading} style={{ fontSize: 22, fontWeight: 700 }}>{pl.name}</h1>
      <p className={styles.meta}>{list.length} video{list.length === 1 ? "" : "s"}</p>
      {list.length === 0 && <p className={styles.empty}>Nothing here yet — open any video and use the Save button to add it.</p>}
      {list.map((v) => (
        <div key={v.id} className={styles.row} onClick={() => router.push(`/watch/${v.id}`)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={v.thumbnail} alt={v.title} loading="lazy" />
          <div style={{ flex: 1 }}>
            <div className={styles.title}>{v.title}</div>
            <div className={styles.meta}>{v.channel} • {v.views}</div>
            <button className={styles.clearBtn} onClick={(e) => { e.stopPropagation(); removeVideo(v.id); }}>
              Remove from playlist
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

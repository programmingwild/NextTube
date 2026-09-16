"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MdOutlineVideoLibrary } from "react-icons/md";
import styles from "../../styles/SearchPage.module.css";
import plStyles from "../../styles/Playlists.module.css";
import { videos, store } from "../../lib/videos";

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState(null);
  const [name, setName] = useState("");

  useEffect(() => {
    setPlaylists(store.getPlaylists());
  }, []);

  const create = () => {
    if (!name.trim()) return;
    setPlaylists((p) => [...p, store.createPlaylist(name)]);
    setName("");
  };

  const remove = (pid) => {
    if (!window.confirm("Delete this playlist?")) return;
    store.deletePlaylist(pid);
    setPlaylists((p) => p.filter((x) => x.id !== pid));
  };

  if (playlists === null) return <div style={{ padding: 24 }}>Loading…</div>;

  return (
    <div className={styles.page}>
      <h1 className={styles.heading} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 22, fontWeight: 700 }}>
        <MdOutlineVideoLibrary /> Playlists
      </h1>
      <div className={plStyles.createRow}>
        <input
          placeholder="New playlist name…"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && create()}
        />
        <button onClick={create}>Create</button>
      </div>
      {playlists.length === 0 && <p className={styles.empty}>No playlists yet. Create one, then add videos from any watch page.</p>}
      {playlists.map((p) => {
        const thumbs = p.ids.slice(0, 3).map((id) => {
          const v = videos.find((x) => String(x.id) === String(id));
          return v?.thumbnail;
        }).filter(Boolean);
        return (
          <div key={p.id} className={plStyles.card}>
            <Link href={`/playlists/${p.id}`} className={plStyles.main}>
              <div className={plStyles.stack}>
                {thumbs.length === 0 && <span className={plStyles.emptyThumb}>Empty</span>}
                {thumbs.map((t, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={t} alt="" loading="lazy" />
                ))}
              </div>
              <div>
                <div className={plStyles.name}>{p.name}</div>
                <div className={plStyles.count}>{p.ids.length} video{p.ids.length === 1 ? "" : "s"}</div>
              </div>
            </Link>
            <button className={styles.clearBtn} onClick={() => remove(p.id)}>Delete</button>
          </div>
        );
      })}
    </div>
  );
}

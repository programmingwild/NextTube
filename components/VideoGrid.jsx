"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/VideoGrid.module.css";
import VideoCard from "./VideoCard";
import ChipBar from "./ChipBar";
import ShortsShelf from "./ShortsShelf";
import { filterByChip, rankVideos, hasSignals, store } from "../lib/videos";

const VideoGrid = () => {
  const [chip, setChip] = useState("All");
  const [uploads, setUploads] = useState([]);
  const [personalized, setPersonalized] = useState(false);
  const [hidden, setHidden] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Short skeleton like real YouTube for perceived speed
    const t = setTimeout(() => {
      setUploads(store.getUploads());
      setPersonalized(hasSignals());
      try {
        setHidden(JSON.parse(localStorage.getItem("yt-hidden") || "[]").map(String));
      } catch {}
      setLoading(false);
    }, 450);
    return () => clearTimeout(t);
  }, []);

  const mine = chip === "All" ? uploads : uploads.filter((v) => v.category === chip);
  const catalog = filterByChip(chip);
  const list = rankVideos([...mine, ...catalog]).filter((v) => !hidden.includes(String(v.id)));
  const go = (id) => router.push(`/watch/${id}`);
  const hide = (id) => setHidden((h) => [...h, String(id)]);
  const first = list.slice(0, 6);
  const rest = list.slice(6);

  if (loading) {
    return (
      <>
        <ChipBar active={chip} onChange={setChip} />
        <div className={styles.videoGrid}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={styles.skeleton}>
              <div className={styles.skeletonThumb} />
              <div className={styles.skeletonRow}>
                <div className={styles.skeletonAvatar} />
                <div className={styles.skeletonLines}><span /><span /></div>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <ChipBar active={chip} onChange={setChip} />
      {personalized && chip === "All" && (
        <p style={{ padding: "4px 24px 0", fontSize: 13, color: "var(--yt-text-2)" }}>
          Recommended based on your watch activity ✦
        </p>
      )}
      <div className={styles.videoGrid}>
        {list.length === 0 && <p className={styles.empty}>No videos in this category yet.</p>}
        {first.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            onClick={() => go(video.id)}
            onHide={hide}
          />
        ))}
      </div>
      {(chip === "All" || rest.length > 0) && <ShortsShelf />}
      {rest.length > 0 && (
        <div className={styles.videoGrid}>
          {rest.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onClick={() => go(video.id)}
              onHide={hide}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default VideoGrid;

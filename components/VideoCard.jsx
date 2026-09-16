"use client";

import { useEffect, useState } from "react";
import { BsThreeDotsVertical, BsCheckCircleFill } from "react-icons/bs";
import styles from "../styles/VideoCard.module.css";
import { useMediaUrl } from "../lib/media";
import { store } from "../lib/videos";

const VideoCard = ({ video, onClick, onHide }) => {
  const blobThumb = useMediaUrl(video?.thumbId);
  const [progress, setProgress] = useState(0);
  const [menu, setMenu] = useState(false);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    const p = store.getProgress(video?.id);
    if (p) setProgress(Math.min(100, (p.time / p.dur) * 100));
    setSaved(store.isWatchLater(video?.id));
  }, [video?.id]);
  if (!video) return null;
  const thumbSrc = blobThumb || video.thumbnail;

  const toggleSave = (e) => {
    e.stopPropagation();
    setSaved(store.toggleWatchLater(video.id));
    setMenu(false);
  };
  const hide = (e) => {
    e.stopPropagation();
    try {
      const hidden = JSON.parse(localStorage.getItem("yt-hidden") || "[]");
      localStorage.setItem("yt-hidden", JSON.stringify([...hidden, String(video.id)]));
    } catch {}
    setMenu(false);
    onHide?.(video.id);
  };

  return (
    <div className={styles.videoCard} onClick={onClick}>
      <div className={styles.thumbWrap}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={thumbSrc} alt={video.title} className={styles.thumbnail} loading="lazy" />
        <span className={video.duration === "LIVE" ? styles.live : styles.duration}>
          {video.duration}
        </span>
        {progress > 1 && (
          <span className={styles.progressTrack}>
            <span className={styles.progressFill} style={{ width: `${progress}%` }} />
          </span>
        )}
        <div className={styles.hoverActions}>
          <button title="Watch later" onClick={toggleSave}>{saved ? "✓" : "🕒"}</button>
          <button title="Add to queue" onClick={(e) => e.stopPropagation()}>☰</button>
        </div>
      </div>
      <div className={styles.details}>
        <span className={styles.avatar} style={{ background: video.avatarColor || "#606060" }}>
          {video.channel.charAt(0)}
        </span>
        <div className={styles.meta}>
          <h3 className={styles.title}>{video.title}</h3>
          <p className={styles.channel}>
            {video.channel}{" "}
            {video.verified && <BsCheckCircleFill size={12} style={{ verticalAlign: -1, color: "#606060" }} />}
          </p>
          <p className={styles.views}>{video.views} • {video.uploadedAt}</p>
        </div>
        <span className={styles.menuWrap}>
          <button
            className={styles.menuButton}
            title="More"
            onClick={(e) => { e.stopPropagation(); setMenu((m) => !m); }}
          >
            <BsThreeDotsVertical />
          </button>
          {menu && (
            <span className={styles.menu} onClick={(e) => e.stopPropagation()}>
              <button onClick={toggleSave}>{saved ? "Remove from Watch Later" : "Save to Watch Later"}</button>
              <button onClick={hide}>Not interested</button>
              <button onClick={(e) => { e.stopPropagation(); setMenu(false); alert("Share link copied!"); }}>
                Share
              </button>
            </span>
          )}
        </span>
      </div>
    </div>
  );
};

export default VideoCard;

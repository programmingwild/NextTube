"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { BiLike, BiDislike, BiSolidLike } from "react-icons/bi";
import { IoMdShareAlt } from "react-icons/io";
import styles from "../../../styles/Shorts.module.css";
import { getShort, getVideoById } from "../../../lib/videos";

export default function ShortPage() {
  const params = useParams();
  const router = useRouter();
  const short = getShort(params?.id);
  const [liked, setLiked] = useState(false);

  if (!short) {
    return (
      <div style={{ padding: 40 }}>
        <h2>Short not found</h2>
        <Link href="/">← Back</Link>
      </div>
    );
  }

  const video = getVideoById(short.videoId);

  return (
    <div className={styles.shortsPage}>
      <div className={styles.back}><Link href="/">← Back</Link></div>
      <div className={styles.frame}>
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video key={video.videoUrl} src={video.videoUrl} controls autoPlay loop playsInline />
        <div className={styles.meta}>
          <b>{short.title}</b>
          <p>{video.channel} • {short.views}</p>
        </div>
      </div>
      <div className={styles.rail}>
        <div>
          <button onClick={() => setLiked((v) => !v)} aria-label="Like">
            {liked ? <BiSolidLike /> : <BiLike />}
          </button>
          <span>Like</span>
        </div>
        <div>
          <button aria-label="Dislike"><BiDislike /></button>
          <span>Dislike</span>
        </div>
        <div>
          <button
            aria-label="Share"
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href).catch(() => {});
              alert("Link copied!");
            }}
          >
            <IoMdShareAlt />
          </button>
          <span>Share</span>
        </div>
        <div>
          <button aria-label="Open full video" onClick={() => router.push(`/watch/${video.id}`)}>▶</button>
          <span>Full video</span>
        </div>
      </div>
    </div>
  );
}

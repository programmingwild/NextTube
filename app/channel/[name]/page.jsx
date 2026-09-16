"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { BsCheckCircleFill } from "react-icons/bs";
import styles from "../../../styles/SearchPage.module.css";
import chStyles from "../../../styles/Channel.module.css";
import { videos, store } from "../../../lib/videos";

export default function ChannelPage() {
  const params = useParams();
  const router = useRouter();
  const name = decodeURIComponent(params?.name || "");
  const [subscribed, setSubscribed] = useState(false);
  const [uploads, setUploads] = useState([]);

  const channelVideos = videos.filter((v) => v.channel === name);

  useEffect(() => {
    setSubscribed(store.isSubscribed(name));
    setUploads(store.getUploads().filter((v) => v.channel === name));
  }, [name]);

  const all = [...uploads, ...channelVideos];
  const info = all[0];

  if (!info) {
    return (
      <div className={styles.page}>
        <h1 className={styles.heading}>Channel not found</h1>
        <Link href="/">← Home</Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={chStyles.bannerArt} style={{ "--art": info.avatarColor || "#606060" }} />
      <div className={chStyles.banner}>
        <span className={chStyles.bigAvatar} style={{ background: info.avatarColor || "#606060" }}>
          {name.charAt(0)}
        </span>
        <div style={{ flex: 1 }}>
          <h1 className={chStyles.name}>
            {name} {info.verified && <BsCheckCircleFill size={16} color="#606060" />}
          </h1>
          <p className={chStyles.meta}>
            {info.channelSubs} • {all.length} videos
          </p>
          <p className={chStyles.meta}>Sharing knowledge, one upload at a time.</p>
        </div>
        <button
          className={`${chStyles.subBtn} ${subscribed ? chStyles.subbed : ""}`}
          onClick={() => setSubscribed(store.toggleSub(name))}
        >
          {subscribed ? "Subscribed" : "Subscribe"}
        </button>
      </div>

      <div className={chStyles.tabs}>
        {["Videos", "Shorts", "Playlists", "About"].map((t, i) => (
          <span key={t} className={i === 0 ? chStyles.activeTab : ""}>{t}</span>
        ))}
      </div>

      {all.map((v) => (
        <div key={v.id} className={styles.row} onClick={() => router.push(`/watch/${v.id}`)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={v.thumbnail} alt={v.title} loading="lazy" />
          <div>
            <div className={styles.title}>{v.title}</div>
            <div className={styles.meta}>{v.views} • {v.uploadedAt}</div>
            <div className={styles.desc}>{(v.description || "").slice(0, 140)}...</div>
          </div>
        </div>
      ))}
    </div>
  );
}

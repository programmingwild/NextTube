"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MdSubscriptions } from "react-icons/md";
import styles from "../../styles/SearchPage.module.css";
import DbThumb from "../../components/DbThumb";
import { allVideos, rowKey } from "../../lib/videos";
import { cloudGetSubs } from "../../lib/cloud";

export default function SubscriptionsPage() {
  const router = useRouter();
  const [channels, setChannels] = useState(null);

  useEffect(() => {
    let live = true;
    try {
      setChannels(JSON.parse(localStorage.getItem("yt-subs") || "[]"));
    } catch {
      setChannels([]);
    }
    cloudGetSubs().then((remote) => {
      if (!live || !remote) return;
      setChannels((local) => {
        const merged = [...new Set([...local, ...remote])];
        try {
          localStorage.setItem("yt-subs", JSON.stringify(merged));
        } catch {}
        return merged;
      });
    });
    return () => {
      live = false;
    };
  }, []);

  if (channels === null) return <div style={{ padding: 24 }}>Loading…</div>;

  const list = allVideos().filter((v) => channels.includes(v.channel));

  return (
    <div className={styles.page}>
      <h1 className={styles.heading} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 22, fontWeight: 700 }}>
        <MdSubscriptions /> Subscriptions
      </h1>
      {channels.length === 0 && (
        <p className={styles.empty}>You haven’t subscribed to any channels yet. Hit Subscribe under a video.</p>
      )}
      {channels.length > 0 && list.length === 0 && (
        <p className={styles.empty}>No recent videos from your subscriptions.</p>
      )}
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
                {v.channel.charAt(0)}
              </span>
              <span className={styles.channel}>{v.channel}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

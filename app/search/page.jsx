"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import styles from "../../styles/SearchPage.module.css";
import DbThumb from "../../components/DbThumb";
import { searchAll, rowKey } from "../../lib/videos";

function SearchResults() {
  const params = useSearchParams();
  const router = useRouter();
  const q = params.get("q") || "";
  const results = searchAll(q);

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>
        {results.length} result{results.length === 1 ? "" : "s"} for “{q}”
      </h1>
      {results.map((v) => (
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
      {results.length === 0 && (
        <p className={styles.empty}>Try different keywords or check the spelling.</p>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Searching…</div>}>
      <SearchResults />
    </Suspense>
  );
}

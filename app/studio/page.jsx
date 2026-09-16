"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaVideo } from "react-icons/fa";
import styles from "../../styles/Studio.module.css";
import DbThumb from "../../components/DbThumb";
import { chips, store } from "../../lib/videos";
import { saveBlob, deleteBlob } from "../../lib/media";

export default function StudioPage() {
  const router = useRouter();
  const [uploads, setUploads] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Coding");
  const [duration, setDuration] = useState("10:00");
  const [thumb, setThumb] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [thumbFile, setThumbFile] = useState(null);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    setUploads(store.getUploads());
  }, []);

  const fillSample = () => {
    setThumb("https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1280&auto=format&fit=crop");
    setVideoUrl("/videos/sample1.mp4");
  };

  const publish = async () => {
    if (!title.trim()) {
      alert("Give your video a title.");
      return;
    }
    if (!videoFile && !videoUrl.trim()) {
      alert("Choose a video file or paste a video URL (or use the sample clip).");
      return;
    }
    setPublishing(true);
    try {
      let mediaId = null;
      let thumbId = null;
      if (videoFile) mediaId = await saveBlob(videoFile);
      if (thumbFile) thumbId = await saveBlob(thumbFile);
      const video = {
        id: `u-${Date.now()}`,
        title: title.trim(),
        channel: "My Channel",
        channelSubs: "0 subscribers",
        subsCount: 0,
        views: "0 views",
        viewsCount: 0,
        likesCount: 0,
        uploadedAt: "Just now",
        duration: duration.trim() || "0:00",
        category,
        avatarColor: "#6a1b9a",
        verified: false,
        description: description.trim() || "No description yet.",
        thumbnail: thumb.trim() || (thumbId ? "" : "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1280&auto=format&fit=crop"),
        videoUrl: videoUrl.trim(),
        mediaId,
        thumbId,
      };
      store.addUpload(video);
      setUploads((u) => [video, ...u]);
      setTitle(""); setDescription(""); setThumb(""); setVideoUrl("");
      setVideoFile(null); setThumbFile(null); setDuration("10:00");
    } catch {
      alert("Could not save the files in this browser. Try smaller files or a video URL.");
    } finally {
      setPublishing(false);
    }
  };

  const remove = async (v) => {
    if (!window.confirm("Delete this video permanently?")) return;
    if (v.mediaId) await deleteBlob(v.mediaId);
    if (v.thumbId) await deleteBlob(v.thumbId);
    store.deleteUpload(v.id);
    setUploads((u) => u.filter((x) => String(x.id) !== String(v.id)));
  };

  if (uploads === null) return <div style={{ padding: 24 }}>Loading…</div>;

  const totalViews = uploads.reduce((s, v) => s + (v.viewsCount || 0), 0);

  return (
    <div className={styles.page}>
      <h1 className={styles.title} style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <FaVideo /> YouTube Studio
      </h1>
      <p className={styles.sub}>Upload videos, track them, manage your mini channel.</p>

      <div className={styles.stats}>
        <div className={styles.stat}><b>{uploads.length}</b><span>Videos published</span></div>
        <div className={styles.stat}><b>{totalViews.toLocaleString("en-IN")}</b><span>Total views on uploads</span></div>
        <div className={styles.stat}><b>{uploads.filter((v) => v.category === "Coding").length}</b><span>Coding uploads</span></div>
      </div>

      <div className={styles.form}>
        <h2>Upload a video</h2>
        <input placeholder="Title (required)" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <div className={styles.formRow}>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {chips.filter((c) => c !== "All" && c !== "Live").map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <input placeholder="Duration (e.g. 12:34)" value={duration} onChange={(e) => setDuration(e.target.value)} />
        </div>
        <input placeholder="Thumbnail image URL" value={thumb} onChange={(e) => setThumb(e.target.value)} />
        <label style={{ fontSize: 13 }}>
          Thumbnail file (stored in this browser)
          <input type="file" accept="image/*" onChange={(e) => setThumbFile(e.target.files?.[0] || null)} />
        </label>
        <input placeholder="Video file URL (.mp4)" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
        <label style={{ fontSize: 13 }}>
          Video file (stored in this browser, survives reloads)
          <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} />
        </label>
        {videoFile && <p className={styles.sub} style={{ margin: 0 }}>Selected: {videoFile.name}</p>}
        <button className={styles.sampleBtn} onClick={fillSample}>Use the bundled sample clip instead →</button>
        <button className={styles.publish} onClick={publish} disabled={publishing}>
          {publishing ? "Publishing…" : "Publish"}
        </button>
      </div>

      <h2 className={styles.title} style={{ fontSize: 18 }}>Your videos</h2>
      <p className={styles.sub}>Stored locally in this browser.</p>
      {uploads.length === 0 && <p className={styles.empty}>Nothing published yet — your first upload will appear here and on your channel page.</p>}
      {uploads.map((v) => (
        <div key={v.id} className={styles.row} onClick={() => router.push(`/watch/${v.id}`)}>
          <DbThumb video={v} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className={styles.rowTitle}>{v.title}</div>
            <div className={styles.rowMeta}>{v.views} • {v.uploadedAt} • {v.category} • {v.duration}</div>
          </div>
          <button
            className={styles.deleteBtn}
            onClick={(e) => { e.stopPropagation(); remove(v); }}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

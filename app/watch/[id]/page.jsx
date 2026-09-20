"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { BiLike, BiDislike, BiSolidLike, BiSolidDislike } from "react-icons/bi";
import { IoMdShareAlt } from "react-icons/io";
import { TiDownload } from "react-icons/ti";
import { BsThreeDots, BsCheckCircleFill } from "react-icons/bs";
import { MdOutlineWatchLater, MdOutlineTheaters, MdPlaylistAdd } from "react-icons/md";
import styles from "../../../styles/Watch.module.css";
import DbThumb from "../../../components/DbThumb";
import { getAnyVideo, videos, formatCount, rankVideos, store } from "../../../lib/videos";
import { useMediaUrl } from "../../../lib/media";
import { cloudGetLikes, cloudSetLike, cloudGetSubs, cloudToggleSub, cloudGetComments, cloudPostComment } from "../../../lib/cloud";

const seedComments = [
  { id: 1, user: "Priya", time: "2 days ago", text: "This finally made it click for me. Thank you!", likes: 214 },
  { id: 2, user: "Arjun", time: "1 week ago", text: "Watching at 1.5x speed, great pacing.", likes: 96 },
];

export default function WatchPage() {
  const params = useParams();
  const router = useRouter();
  const video = getAnyVideo(params?.id);
  const blobVideoUrl = useMediaUrl(video?.mediaId);
  const playSrc = blobVideoUrl || video?.videoUrl;
  const videoRef = useRef(null);

  const [subscribed, setSubscribed] = useState(false);
  const [liked, setLiked] = useState(null);
  const [likeCount, setLikeCount] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState(seedComments);
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [extraViews, setExtraViews] = useState(0);
  const [saved, setSaved] = useState(false);
  const [theater, setTheater] = useState(false);
  const [autoplay, setAutoplay] = useState(true);
  const [showPl, setShowPl] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [liveCount, setLiveCount] = useState(0);
  const lastSave = useRef(0);

  useEffect(() => {
    try {
      setAutoplay(localStorage.getItem("yt-autoplay") !== "off");
    } catch {}
  }, []);

  const toggleAutoplay = () => {
    const next = !autoplay;
    setAutoplay(next);
    try {
      localStorage.setItem("yt-autoplay", next ? "on" : "off");
    } catch {}
  };

  // Keyboard shortcuts like YouTube: Space/K play, J/L ±10s, arrows ±5s, F fullscreen, M mute
  useEffect(() => {
    const onKey = (e) => {
      const v = videoRef.current;
      if (!v) return;
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          e.preventDefault();
          v.paused ? v.play() : v.pause();
          break;
        case "arrowright":
          v.currentTime += 5;
          break;
        case "arrowleft":
          v.currentTime -= 5;
          break;
        case "l":
          v.currentTime += 10;
          break;
        case "j":
          v.currentTime -= 10;
          break;
        case "f":
          if (document.fullscreenElement) document.exitFullscreen();
          else v.parentElement?.requestFullscreen?.();
          break;
        case "m":
          v.muted = !v.muted;
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!video) return;
    let live = true;
    setSubscribed(store.isSubscribed(video.channel));
    setLiked(store.getLiked(video.id));
    setLikeCount(video.likesCount || 0);
    setComments(store.getComments(video.id) ?? seedComments);
    setExtraViews(store.bumpViews(video.id));
    setSaved(store.isWatchLater(video.id));
    setPlaylists(store.getPlaylists());
    store.pushHistory(video.id);
    // Cloud wins when signed in (falls back to local silently)
    cloudGetLikes().then((map) => {
      if (live && map && video.id in map) setLiked(map[video.id]);
    });
    cloudGetSubs().then((list) => {
      if (live && list) setSubscribed(list.includes(video.channel));
    });
    cloudGetComments(video.id).then((remote) => {
      if (live && remote && remote.length > 0) {
        setComments(remote);
        store.setComments(video.id, remote);
      }
    });
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video?.id]);

  // LIVE videos: viewer count ticks like a real stream
  // (kept above the early return — hooks must run unconditionally)
  useEffect(() => {
    if (video?.uploadedAt !== "LIVE") return;
    setLiveCount(video.viewsCount + extraViews);
    const t = setInterval(() => {
      setLiveCount((c) => Math.max(0, c + Math.floor(Math.random() * 31) - 10));
    }, 3000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video?.id]);

  if (!video) {
    return (
      <div className={styles.notFound}>
        <h2>Video not found</h2>
        <Link href="/" className={styles.back}>← Back to home</Link>
      </div>
    );
  }

  const upNext = rankVideos(
    videos.filter((v) => String(v.id) !== String(video.id)),
    video.id
  );

  const handleEnded = () => {
    store.clearProgress(video.id);
    if (autoplay && upNext.length > 0) router.push(`/watch/${upNext[0].id}`);
  };

  const handleLoaded = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const p = store.getProgress(video.id);
    if (p && p.time > 10 && p.time < v.duration - 15) {
      v.currentTime = p.time;
    }
  };

  const handleTime = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const now = Date.now();
    if (now - lastSave.current < 5000) return;
    lastSave.current = now;
    store.setProgress(video.id, v.currentTime, v.duration);
  };

  const totalViews = video.viewsCount + extraViews;
  const viewsLabel =
    video.uploadedAt === "LIVE"
      ? `${formatCount(liveCount || video.viewsCount + extraViews)} watching now`
      : `${formatCount(totalViews)} views`;

  const toggleLike = (val) => {
    const next = liked === val ? null : val;
    setLiked(next);
    store.setLiked(video.id, next);
    setLikeCount((c) => c + (next === "like" ? 1 : 0) - (liked === "like" ? 1 : 0));
    cloudSetLike(video.id, next);
  };

  const toggleSub = () => {
    const next = !subscribed;
    setSubscribed(store.toggleSub(video.channel));
    cloudToggleSub(video.channel, next);
  };

  const saveComments = (list) => {
    setComments(list);
    store.setComments(video.id, list);
  };

  const toggleCommentLike = (id, isReply = false, parentId = null) => {
    const bump = (c) => {
      if (c.id !== id) return c;
      const on = !c.likedByMe;
      return { ...c, likedByMe: on, likes: (c.likes || 0) + (on ? 1 : -1) };
    };
    const next = isReply
      ? comments.map((c) => (c.id === parentId ? { ...c, replies: (c.replies || []).map(bump) } : c))
      : comments.map(bump);
    saveComments(next);
  };

  const postReply = (parentId) => {
    if (!replyText.trim()) return;
    const next = comments.map((c) =>
      c.id === parentId
        ? { ...c, replies: [...(c.replies || []), { id: Date.now(), user: "You", time: "just now", text: replyText.trim(), likes: 0 }] }
        : c
    );
    saveComments(next);
    setReplyText("");
    setReplyTo(null);
  };

  const postComment = () => {
    if (!commentText.trim()) return;
    const text = commentText.trim();
    const optimistic = { id: Date.now(), user: "You", time: "just now", text, likes: 0 };
    const next = [optimistic, ...comments];
    setComments(next);
    store.setComments(video.id, next);
    setCommentText("");
    cloudPostComment(video.id, text).then((saved) => {
      if (!saved) return;
      setComments((cur) => {
        const merged = cur.map((c) => (c.id === optimistic.id ? saved : c));
        store.setComments(video.id, merged);
        return merged;
      });
    });
  };

  const toSeconds = (t) => {
    const parts = t.split(":").map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return 0;
  };

  const renderDesc = (text) => {
    return text.split("\n").map((line, i) => {
      const m = line.match(/^\s*(\d{1,2}:\d{2}(?::\d{2})?)\s+(.*)$/);
      if (m) {
        return (
          <div key={i}>
            <button
              className={styles.chapter}
              onClick={(e) => {
                e.stopPropagation();
                if (videoRef.current) {
                  videoRef.current.currentTime = toSeconds(m[1]);
                  videoRef.current.play()?.catch(() => {});
                }
              }}
            >
              {m[1]}
            </button>{" "}
            {m[2]}
          </div>
        );
      }
      return <div key={i}>{line || "\u00a0"}</div>;
    });
  };

  const handleDownload = () => {
    const isPremium = localStorage.getItem("isPremiumUser") === "true";
    const today = new Date().toLocaleDateString();
    const last = localStorage.getItem("lastDownloadDate");
    const count = parseInt(localStorage.getItem("downloadCount") || "0", 10);
    if (!isPremium && last === today && count >= 1) {
      alert("You have reached your daily download limit. Upgrade to premium for unlimited downloads.");
      return;
    }
    localStorage.setItem("lastDownloadDate", today);
    localStorage.setItem("downloadCount", String(last !== today ? 1 : count + 1));
    const a = document.createElement("a");
    a.href = blobVideoUrl || video.videoUrl;
    a.download = `${video.title}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className={`${styles.watch} ${theater ? styles.theaterMode : ""}`}>
      <div className={styles.primary}>
        <div className={styles.playerWrap}>
          <div
            className={styles.ambient}
            aria-hidden
            style={{ backgroundImage: `url(${video.thumbnail})` }}
          />
          <div className={styles.player}>
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video
              ref={videoRef}
              key={playSrc || video.videoUrl}
              src={playSrc}
              controls
              autoPlay
              playsInline
              onEnded={handleEnded}
              onLoadedMetadata={handleLoaded}
              onTimeUpdate={handleTime}
              onPause={handleTime}
            />
          </div>
        </div>

        <h1 className={styles.title}>{video.title}</h1>

        <div className={styles.row}>
          <div className={styles.channel}>
            <span className={styles.avatar} style={{ background: video.avatarColor || "#606060" }}>
              {video.channel.charAt(0)}
            </span>
            <div>
              <div className={styles.name}>
                <Link href={`/channel/${encodeURIComponent(video.channel)}`}>
                  {video.channel}
                </Link>{" "}
                {video.verified && <BsCheckCircleFill size={13} color="#606060" />}
              </div>
              <div className={styles.subs}>
                {(subscribed ? video.subsCount + 1 : video.subsCount).toLocaleString("en-IN")} subscribers
              </div>
            </div>
            <button
              className={`${styles.subscribe} ${subscribed ? styles.subscribed : ""}`}
              onClick={toggleSub}
            >
              {subscribed ? "Subscribed" : "Subscribe"}
            </button>
          </div>

          <div className={styles.actions}>
            <span className={styles.segment}>
              <button onClick={() => toggleLike("like")} title="I like this">
                {liked === "like" ? <BiSolidLike size={19} /> : <BiLike size={19} />}{" "}
                {formatCount(likeCount)}
              </button>
              <span className={styles.divider} />
              <button onClick={() => toggleLike("dislike")} aria-label="I dislike this" title="I dislike this">
                {liked === "dislike" ? <BiSolidDislike size={19} /> : <BiDislike size={19} />}
              </button>
            </span>
            <button
              className={styles.pill}
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href).catch(() => {});
                alert("Link copied to clipboard!");
              }}
            >
              <IoMdShareAlt size={19} /> Share
            </button>
            <button className={styles.pill} onClick={handleDownload}>
              <TiDownload size={19} /> Download
            </button>
            <button
              className={styles.pill}
              onClick={() => setSaved(store.toggleWatchLater(video.id))}
              title={saved ? "Remove from Watch Later" : "Save to Watch Later"}
            >
              <MdOutlineWatchLater size={19} /> {saved ? "Saved" : "Save"}
            </button>
            <button
              className={styles.pill}
              onClick={() => setTheater((t) => !t)}
              title="Theater mode"
            >
              <MdOutlineTheaters size={19} /> {theater ? "Default" : "Theater"}
            </button>
            <span className={styles.plWrap}>
              <button className={styles.pill} onClick={() => setShowPl((s) => !s)} title="Save to playlist">
                <MdPlaylistAdd size={19} /> Save
              </button>
              {showPl && (
                <span className={styles.plPop}>
                  <h4>Save to playlist</h4>
                  {playlists.length === 0 && <h4 style={{ fontWeight: 400 }}>No playlists yet.</h4>}
                  {playlists.map((p) => (
                    <button
                      key={p.id}
                      className={styles.plItem}
                      onClick={() => setPlaylists((pls) => pls.map((x) => x.id === p.id ? store.toggleInPlaylist(p.id, video.id) : x))}
                    >
                      <input
                        type="checkbox"
                        readOnly
                        checked={p.ids.some((x) => String(x) === String(video.id))}
                      />
                      {p.name}
                    </button>
                  ))}
                  <Link href="/playlists" className={styles.plLink}>+ New playlist</Link>
                </span>
              )}
            </span>
            <button className={styles.pill} aria-label="More actions">
              <BsThreeDots size={17} />
            </button>
          </div>
        </div>

        <div className={styles.desc} onClick={() => setExpanded((e) => !e)}>
          <div className={styles.descMeta}>
            {viewsLabel} • {video.uploadedAt} • #{video.category}
          </div>
          <div style={{ whiteSpace: "pre-line" }}>
            {expanded ? renderDesc(video.description) : `${video.description.slice(0, 130)}...more`}
          </div>
        </div>

        <h2 className={styles.commentsTitle}>{comments.length} Comments</h2>
        <div className={styles.addRow}>
          <span className={styles.miniAvatar}>Y</span>
          <input
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && postComment()}
          />
        </div>
        {commentText && (
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginBottom: 16 }}>
            <button className={styles.pill} onClick={() => setCommentText("")}>Cancel</button>
            <button className={styles.pill} onClick={postComment}>Comment</button>
          </div>
        )}
        {comments.map((c) => (
          <div key={c.id} className={styles.comment}>
            <span className={styles.commentAvatar}>{c.user.charAt(0)}</span>
            <div style={{ flex: 1 }}>
              <div className={styles.commentHead}><b>@{c.user}</b><span>{c.time}</span></div>
              <div className={styles.commentText}>{c.text}</div>
              <div className={styles.commentActions}>
                <button
                  aria-label="Like comment"
                  onClick={() => toggleCommentLike(c.id)}
                  style={{ color: c.likedByMe ? "#065fd4" : undefined }}
                >
                  <BiLike /> {c.likes || ""}
                </button>
                <button aria-label="Dislike comment"><BiDislike /></button>
                <button onClick={() => { setReplyTo(replyTo === c.id ? null : c.id); setReplyText(""); }}>
                  Reply
                </button>
              </div>
              {(c.replies || []).map((r) => (
                <div key={r.id} className={styles.comment} style={{ margin: "10px 0 0" }}>
                  <span className={styles.commentAvatar}>{r.user.charAt(0)}</span>
                  <div style={{ flex: 1 }}>
                    <div className={styles.commentHead}><b>@{r.user}</b><span>{r.time}</span></div>
                    <div className={styles.commentText}>{r.text}</div>
                    <div className={styles.commentActions}>
                      <button
                        aria-label="Like reply"
                        onClick={() => toggleCommentLike(r.id, true, c.id)}
                        style={{ color: r.likedByMe ? "#065fd4" : undefined }}
                      >
                        <BiLike /> {r.likes || ""}
                      </button>
                      <button aria-label="Dislike reply"><BiDislike /></button>
                    </div>
                  </div>
                </div>
              ))}
              {replyTo === c.id && (
                <div className={styles.addRow} style={{ margin: "10px 0 0" }}>
                  <span className={styles.miniAvatar}>Y</span>
                  <input
                    placeholder="Add a reply..."
                    value={replyText}
                    autoFocus
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && postReply(c.id)}
                  />
                  <button className={styles.pill} onClick={() => postReply(c.id)}>Reply</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <aside className={styles.secondary}>
        <div className={styles.railHead}>
          <span>Up next</span>
          <label className={styles.autoplayToggle} title="Autoplay">
            Autoplay
            <button
              role="switch"
              aria-checked={autoplay}
              className={`${styles.switch} ${autoplay ? styles.switchOn : ""}`}
              onClick={toggleAutoplay}
            >
              <span className={styles.knob} />
            </button>
          </label>
        </div>
        <div className={styles.railChips}>
          {["All", "From " + video.channel, "Related", "Recently uploaded"].map((c, i) => (
            <button key={c} className={`${styles.railChip} ${i === 0 ? styles.active : ""}`}>{c}</button>
          ))}
        </div>
        {upNext.map((v) => (
          <div key={v.id} className={styles.upnext} onClick={() => router.push(`/watch/${v.id}`)}>
            <DbThumb video={v} />
            <div>
              <div className={styles.upTitle}>{v.title}</div>
              <div className={styles.upMeta}>{v.channel}</div>
              <div className={styles.upMeta}>{v.views} • {v.uploadedAt}</div>
            </div>
          </div>
        ))}
      </aside>
    </div>
  );
}

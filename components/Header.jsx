"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaBars, FaMicrophone, FaRegBell } from "react-icons/fa";
import { AiOutlineSearch } from "react-icons/ai";
import { MdAdd } from "react-icons/md";
import ThemeToggle from "./ThemeToggle";
import UserAccount from "./UserAccount";
import AuthForm from "./AuthForm";
import { useSession, getSupabase } from "../lib/supabase";
import styles from "../styles/Header.module.css";
import { useSidebar } from "./SidebarContext";
import { searchVideos, videos } from "../lib/videos";

const Header = () => {
  const { toggleSidebar } = useSidebar();
  const router = useRouter();
  const [showUserAccount, setShowUserAccount] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [readIds, setReadIds] = useState([]);
  const [uploads, setUploads] = useState([]);
  const { user, cloud } = useSession();

  useEffect(() => {
    import("../lib/videos").then((m) => setUploads(m.store.getUploads()));
    try {
      setReadIds(JSON.parse(localStorage.getItem("yt-notif-read") || "[]"));
    } catch {}
  }, []);
  const [searchTerm, setSearchTerm] = useState("");
  const [focused, setFocused] = useState(false);

  const results = searchTerm.trim() ? searchVideos(searchTerm).slice(0, 6) : [];
  const showSuggest = focused && searchTerm.trim().length > 0;

  const goSearch = (value = searchTerm) => {
    const q = value.trim();
    if (!q) return;
    setFocused(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const notifs = [...uploads, ...videos].slice(0, 8);
  const unread = notifs.filter((n) => !readIds.includes(String(n.id))).length;

  const openNotif = () => {
    setShowNotif((v) => {
      if (!v) {
        const ids = notifs.map((n) => String(n.id));
        setReadIds(ids);
        try {
          localStorage.setItem("yt-notif-read", JSON.stringify(ids));
        } catch {}
      }
      return !v;
    });
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.left}>
          <button className={styles.iconButton} onClick={toggleSidebar} aria-label="Menu" title="Menu">
            <FaBars className={styles.icon} />
          </button>
          <Link href="/" className={styles.logo} title="YouTube Home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/b/b8/YouTube_Logo_2017.svg"
              alt="YouTube"
              className={styles.logoImage}
            />
            <span className={styles.countryCode}>IN</span>
          </Link>
        </div>

        <div className={styles.center}>
          <div className={styles.searchWrap}>
            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder="Search"
                className={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setTimeout(() => setFocused(false), 120)}
                onKeyDown={(e) => e.key === "Enter" && goSearch()}
                aria-label="Search"
              />
              <button className={styles.searchButton} onClick={() => goSearch()} aria-label="Search" title="Search">
                <AiOutlineSearch className={styles.searchIcon} />
              </button>
            </div>
            {showSuggest && (
              <div className={styles.suggest}>
                {results.length === 0 && <div className={styles.suggestEmpty}>No suggestions</div>}
                {results.map((v) => (
                  <button key={v.id} onClick={() => router.push(`/watch/${v.id}`)}>
                    <AiOutlineSearch size={15} /> <span>{v.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button className={styles.micButton} aria-label="Search with your voice" title="Search with your voice">
            <FaMicrophone />
          </button>
        </div>

        <div className={styles.right}>
          <ThemeToggle />
          <button className={styles.createButton} title="Create">
            <MdAdd size={20} /> <span>Create</span>
          </button>
          <span className={styles.notifWrap}>
            <button className={styles.iconButton} aria-label="Notifications" title="Notifications" onClick={openNotif}>
              <FaRegBell className={styles.icon} />
              {unread > 0 && <span className={styles.badge}>{unread > 9 ? "9+" : unread}</span>}
            </button>
            {showNotif && (
              <span className={styles.notifPanel}>
                <b className={styles.notifHead}>Notifications</b>
                {notifs.map((n) => (
                  <button
                    key={n.id}
                    className={styles.notifRow}
                    onClick={() => { setShowNotif(false); router.push(`/watch/${n.id}`); }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={n.thumbnail} alt="" />
                    <span>
                      <span className={styles.notifTitle}>{n.title}</span>
                      <span className={styles.notifMeta}>{n.channel} • {n.uploadedAt}</span>
                    </span>
                    {!readIds.includes(String(n.id)) && <i className={styles.unreadDot} />}
                  </button>
                ))}
              </span>
            )}
          </span>
          <button
            className={styles.avatar}
            onClick={() => setShowUserAccount((v) => !v)}
            aria-label="Account"
            title={user ? user.email : cloud ? "Sign in" : "Account"}
          >
            {user ? (user.email?.charAt(0).toUpperCase() || "U") : "E"}
          </button>
        </div>
      </header>

      {showUserAccount && (
        <div className={styles.popupBackdrop} onClick={() => setShowUserAccount(false)}>
          <div className={styles.popupContent} onClick={(e) => e.stopPropagation()}>
            {user || !cloud ? (
              <UserAccount
                user={user}
                onClose={() => setShowUserAccount(false)}
                onSignOut={async () => {
                  await getSupabase()?.auth.signOut();
                  setShowUserAccount(false);
                }}
              />
            ) : (
              <AuthForm onDone={() => setShowUserAccount(false)} />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Header;

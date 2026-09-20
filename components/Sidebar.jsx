"use client";

import Link from "next/link";
import {
  FaHome,
  FaRegClock,
  FaHistory,
  FaRegHeart,
  FaVideo,
  FaCog,
  FaUserCircle,
  FaFire,
} from "react-icons/fa";
import {
  MdSubscriptions,
  MdOutlineWatchLater,
  MdOutlineFeedback,
  MdOutlineVideoLibrary,
} from "react-icons/md";
import { SiYoutubeshorts } from "react-icons/si";
import { IoMusicalNotes, IoHelpCircleOutline } from "react-icons/io5";
import { RiGamepadLine } from "react-icons/ri";
import { BiNews } from "react-icons/bi";
import { MdOutlineSportsSoccer } from "react-icons/md";
import { useSidebar } from "./SidebarContext";
import styles from "../styles/Sidebar.module.css";

const subscriptions = [
  "CodeAcademy",
  "TechSavvy",
  "DevMaster",
  "WebDesignPro",
  "FullStackHQ",
  "TechTrends",
];

const Sidebar = () => {
  const { isCollapsed, mobileOpen, closeMobile } = useSidebar();

  return (
    <>
      {mobileOpen && (
        <div
          className={styles.backdrop}
          onClick={closeMobile}
          aria-hidden
        />
      )}
      <nav
        className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""} ${mobileOpen ? styles.drawerOpen : ""}`}
        onClick={(e) => {
          // Close drawer when any link inside is tapped
          if (e.target.closest("a")) closeMobile();
        }}
      >
      <ul>
        <li className={styles.active}>
          <Link href="/" className={styles.link}>
            <FaHome className={`${styles.icon} ${isCollapsed ? styles.collapsedIcon : ""}`} />
            {!isCollapsed && "Home"}
          </Link>
        </li>
        <li>
          <Link href="/shorts/s1" className={styles.link}>
            <SiYoutubeshorts className={`${styles.icon} ${isCollapsed ? styles.collapsedIcon : ""}`} />
            {!isCollapsed && "Shorts"}
          </Link>
        </li>
        <li>
          <Link href="/subscriptions" className={styles.link}>
            <MdSubscriptions className={`${styles.icon} ${isCollapsed ? styles.collapsedIcon : ""}`} />
            {!isCollapsed && "Subscriptions"}
          </Link>
        </li>
        <hr />
        {!isCollapsed && <li className={styles.sectionHeader}>You</li>}
        <li>
          <Link href="/history" className={styles.link}>
            <FaHistory className={`${styles.icon} ${isCollapsed ? styles.collapsedIcon : ""}`} />
            {!isCollapsed && "History"}
          </Link>
        </li>
        <li>
          <Link href="/playlists" className={styles.link}>
            <MdOutlineVideoLibrary className={`${styles.icon} ${isCollapsed ? styles.collapsedIcon : ""}`} />
            {!isCollapsed && "Playlists"}
          </Link>
        </li>
        <li>
          <Link href="/studio" className={styles.link}>
            <FaVideo className={`${styles.icon} ${isCollapsed ? styles.collapsedIcon : ""}`} />
            {!isCollapsed && "Your videos"}
          </Link>
        </li>
        <li>
          <Link href="/watch-later" className={styles.link}>
            <MdOutlineWatchLater className={`${styles.icon} ${isCollapsed ? styles.collapsedIcon : ""}`} />
            {!isCollapsed && "Watch Later"}
          </Link>
        </li>
        <li>
          <Link href="/liked" className={styles.link}>
            <FaRegHeart className={`${styles.icon} ${isCollapsed ? styles.collapsedIcon : ""}`} />
            {!isCollapsed && "Liked videos"}
          </Link>
        </li>
        <hr />
        {!isCollapsed && <li className={styles.sectionHeader}>Subscriptions</li>}
        {subscriptions.map((name) => (
          <li key={name} className={styles.subscription}>
            <Link href={`/channel/${encodeURIComponent(name)}`} className={styles.link}>
              <span className={styles.avatarLetter}>{name.charAt(0)}</span>
              {!isCollapsed && <span className={styles.subName}>{name}</span>}
            </Link>
          </li>
        ))}
        <hr />
        {!isCollapsed && <li className={styles.sectionHeader}>Explore</li>}
        <li>
          <FaFire className={`${styles.icon} ${isCollapsed ? styles.collapsedIcon : ""}`} />
          {!isCollapsed && "Trending"}
        </li>
        <li>
          <IoMusicalNotes className={`${styles.icon} ${isCollapsed ? styles.collapsedIcon : ""}`} />
          {!isCollapsed && "Music"}
        </li>
        <li>
          <RiGamepadLine className={`${styles.icon} ${isCollapsed ? styles.collapsedIcon : ""}`} />
          {!isCollapsed && "Gaming"}
        </li>
        <li>
          <BiNews className={`${styles.icon} ${isCollapsed ? styles.collapsedIcon : ""}`} />
          {!isCollapsed && "News"}
        </li>
        <li>
          <MdOutlineSportsSoccer className={`${styles.icon} ${isCollapsed ? styles.collapsedIcon : ""}`} />
          {!isCollapsed && "Sports"}
        </li>
        <hr />
        <li>
          <FaCog className={`${styles.icon} ${isCollapsed ? styles.collapsedIcon : ""}`} />
          {!isCollapsed && "Settings"}
        </li>
        <li>
          <IoHelpCircleOutline className={`${styles.icon} ${isCollapsed ? styles.collapsedIcon : ""}`} />
          {!isCollapsed && "Help"}
        </li>
        <li>
          <MdOutlineFeedback className={`${styles.icon} ${isCollapsed ? styles.collapsedIcon : ""}`} />
          {!isCollapsed && "Send feedback"}
        </li>
      </ul>
      </nav>
    </>
  );
};

export default Sidebar;

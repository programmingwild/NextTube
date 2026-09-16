"use client";

import { useMediaUrl } from "../lib/media";

// Image that resolves IndexedDB blob thumbnails (uploads) with URL fallback
const DbThumb = ({ video, className, alt }) => {
  const blobUrl = useMediaUrl(video?.thumbId);
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={blobUrl || video?.thumbnail} alt={alt || video?.title} className={className} loading="lazy" />;
};

export default DbThumb;

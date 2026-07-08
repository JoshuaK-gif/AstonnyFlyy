import { useState } from "react";

export default function SmoothImage({ src, alt, className }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      style={{ opacity: loaded ? 1 : 0, transition: "opacity 0.5s ease" }}
      onLoad={() => setLoaded(true)}
    />
  );
}

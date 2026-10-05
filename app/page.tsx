"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

type PresetLink = {
  type?: string;
  url: string;
  title?: string;
  thumb?: string;
  source?: string;
  detail?: string;
  byAuthor?: boolean;
};

type VideoStats = {
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
};

type VideoInfo = {
  id?: string;
  url?: string;
  description?: string;
  createTime?: string;
  stats?: VideoStats;
  cover?: string;
  playUrl?: string;
  playUrlNoWm?: string;
  width?: number;
  height?: number;
};

type AuthorDetail = {
  uniqueId?: string;
  nickname?: string;
  bio?: string;
  bioLink?: string;
  avatar?: string;
};

type FinderResult = {
  ok?: boolean;
  found?: boolean;
  author?: string;
  videoUrl?: string;
  presetLinks?: PresetLink[];
  input?: string;
  video?: VideoInfo;
  authorDetail?: AuthorDetail;
  otherLinks?: {
    url: string;
    source?: string;
    detail?: string;
  }[];
  scanned?: {
    description?: boolean;
    bio?: boolean;
    bioLinkPage?: boolean;
    comments?: number;
    replies?: number;
  };
  error?: string;
};

type HistoryItem = {
  url: string;
  time: number;
};

function formatNumber(value?: number) {
  if (typeof value !== "number") return "0";

  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);
}

function getPresetSize(type?: string) {
  if (!type) return "PRESET";

  return type.toUpperCase();
}

function isXmlLink(
  link:
    | PresetLink
    | {
        url: string;
        source?: string;
        detail?: string;
      }
) {
  const value = link.url?.trim();

  if (!value) return false;

  const type =
    "type" in link
      ? String(link.type || "").toLowerCase()
      : "";

  if (type.includes("xml")) {
    return true;
  }

  try {
    const parsed = new URL(value);

    const host = parsed.hostname.toLowerCase();
    const path = parsed.pathname.toLowerCase();

    if (path.endsWith(".xml")) {
      return true;
    }

    if (
      host === "drive.google.com" ||
      host.endsWith(".drive.google.com")
    ) {
      return true;
    }

    if (
      host === "whatsapp.com" ||
      host.endsWith(".whatsapp.com")
    ) {
      if (
        path.startsWith("/channel/") ||
        path.includes("/channel/")
      ) {
        return true;
      }
    }

    return false;
  } catch {
    return false;
  }
}

function isTikTok(value: string) {
  try {
    const url = new URL(value.trim());

    return (
      /(^|\.)tiktok\.com$/i.test(url.hostname) ||
      /(^|\.)vt\.tiktok\.com$/i.test(url.hostname)
    );
  } catch {
    return false;
  }
}

function Icon({
  name,
  size = 20
}: {
  name:
    | "search"
    | "sparkle"
    | "menu"
    | "play"
    | "eye"
    | "heart"
    | "comment"
    | "user"
    | "link"
    | "external"
    | "copy"
    | "check"
    | "clock"
    | "bookmark"
    | "home"
    | "arrow";
  size?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const
  };

  switch (name) {
    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4-4" />
        </svg>
      );

    case "sparkle":
      return (
        <svg {...common}>
          <path d="m12 3-1.4 5.6L5 10l5.6 1.4L12 17l1.4-5.6L19 10l-5.6-1.4L12 3Z" />
          <path d="m19 16-.7 2.3L16 19l2.3.7L19 22l.7-2.3L22 19l-2.3-.7L19 16Z" />
        </svg>
      );

    case "menu":
      return (
        <svg {...common}>
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      );

    case "play":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M8 5.5v13L19 12 8 5.5Z" />
        </svg>
      );

    case "eye":
      return (
        <svg {...common}>
          <path d="M2.5 12s3.2-5 9.5-5 9.5 5 9.5 5-3.2 5-9.5 5-9.5-5-9.5-5Z" />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      );

    case "heart":
      return (
        <svg {...common}>
          <path d="M20.8 8.9c0 5-8.8 10-8.8 10s-8.8-5-8.8-10A4.7 4.7 0 0 1 12 6.3a4.7 4.7 0 0 1 8.8 2.6Z" />
        </svg>
      );

    case "comment":
      return (
        <svg {...common}>
          <path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.4 8.4 0 0 1-3.4-.7L4 20l1.7-4.1A7.2 7.2 0 0 1 4 11.5 7.5 7.5 0 0 1 12 4a7.5 7.5 0 0 1 8 7.5Z" />
        </svg>
      );

    case "user":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 20c.8-3.2 3-5 7-5s6.2 1.8 7 5" />
        </svg>
      );

    case "link":
      return (
        <svg {...common}>
          <path d="M10 13.5 14 10" />
          <path d="M7.5 15.5 6 17a3.2 3.2 0 0 1-4.5-4.5l3-3A3.2 3.2 0 0 1 9 9" />
          <path d="M16.5 8.5 18 7a3.2 3.2 0 0 1 4.5 4.5l-3 3A3.2 3.2 0 0 1 15 15" />
        </svg>
      );

    case "external":
      return (
        <svg {...common}>
          <path d="M14 4h6v6" />
          <path d="m20 4-9 9" />
          <path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" />
        </svg>
      );

    case "copy":
      return (
        <svg {...common}>
          <rect x="8" y="8" width="11" height="11" rx="2" />
          <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
        </svg>
      );

    case "check":
      return (
        <svg {...common}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      );

    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7v5l3 2" />
        </svg>
      );

    case "bookmark":
      return (
        <svg {...common}>
          <path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-3.5L6 21V4.5Z" />
        </svg>
      );

    case "home":
      return (
        <svg {...common}>
          <path d="m3.5 10 8.5-7 8.5 7" />
          <path d="M5.5 9v11h13V9" />
          <path d="M9.5 20v-6h5v6" />
        </svg>
      );

    case "arrow":
      return (
        <svg {...common}>
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </svg>
      );

    default:
      return null;
  }
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [result, setResult] =
    useState<FinderResult | null>(null);

  const [status, setStatus] = useState<
    "idle" | "running" | "done" | "error"
  >("idle");

  const [progress, setProgress] = useState(
    "Siap mengekstrak preset."
  );

  const [error, setError] = useState("");
  const [copied, setCopied] =
    useState<string | null>(null);

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState("home");

  const eventSourceRef =
    useRef<EventSource | null>(null);

  useEffect(() => {
    try {
      const stored =
        localStorage.getItem("zx_preset_history");

      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch {
      setHistory([]);
    }

    return () => {
      eventSourceRef.current?.close();
    };
  }, []);

  const saveHistory = useCallback((value: string) => {
    try {
      const old: HistoryItem[] = JSON.parse(
        localStorage.getItem("zx_preset_history") || "[]"
      );

      const next = [
        {
          url: value,
          time: Date.now()
        },
        ...old.filter(
          (item) => item.url !== value
        )
      ].slice(0, 10);

      localStorage.setItem(
        "zx_preset_history",
        JSON.stringify(next)
      );

      setHistory(next);
    } catch {
      // Abaikan galat localStorage
    }
  }, []);

  const search = useCallback(() => {
    const value = url.trim();

    if (!value) {
      setError("Tempel tautan video TikTok terlebih dahulu.");
      setStatus("error");
      return;
    }

    if (!isTikTok(value)) {
      setError("Format URL bukan tautan TikTok yang valid.");
      setStatus("error");
      return;
    }

    eventSourceRef.current?.close();

    setResult(null);
    setError("");
    setStatus("running");
    setProgress("Menghubungkan ke parser stream...");

    saveHistory(value);

    const endpoint =
      `/api/find?url=${encodeURIComponent(value)}`;

    const source = new EventSource(endpoint);

    eventSourceRef.current = source;

    source.addEventListener("log", (event) => {
      const message =
        (event as MessageEvent).data;

      if (typeof message === "string") {
        setProgress(
          message.replace(/^"|"$/g, "")
        );
      }
    });

    source.addEventListener("result", (event) => {
      try {
        const parsed = JSON.parse(
          (event as MessageEvent).data
        ) as FinderResult;

        if (!parsed.ok) {
          setStatus("error");

          setError(
            parsed.error ||
              "Gagal mengekstrak preset dari tautan ini."
          );

          source.close();
          return;
        }

        setResult(parsed);
        setStatus("done");
        setProgress("Ekstraksi preset selesai.");

        source.close();
      } catch {
        setStatus("error");
        setError(
          "Server mengembalikan format respons tidak terbaca."
        );

        source.close();
      }
    });

    source.addEventListener("error", () => {
      if (
        source.readyState ===
        EventSource.CLOSED
      ) {
        if (status !== "done") {
          setStatus("error");

          setError(
            "Koneksi ekstraksi terputus sebelum data diterima."
          );
        }
      }
    });
  }, [url, saveHistory, status]);

  const clearResult = () => {
    eventSourceRef.current?.close();

    setResult(null);
    setStatus("idle");
    setProgress("Siap mengekstrak preset.");
    setError("");
  };

  const copyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);

      setCopied(link);

      window.setTimeout(() => {
        setCopied((current) =>
          current === link ? null : current
        );
      }, 1800);
    } catch {
      setError("Gagal menyalin tautan.");
    }
  };

  const allPresetLinks =
    result?.presetLinks || [];

  const otherLinks =
    result?.otherLinks || [];

  const xmlLinks = useMemo(() => {
    const candidates = [
      ...allPresetLinks.filter((link) =>
        isXmlLink(link)
      ),

      ...otherLinks.filter((link) =>
        isXmlLink(link)
      )
    ];

    const seen = new Set<string>();

    return candidates.filter((link) => {
      const value = link.url?.trim();

      if (!value) return false;

      if (seen.has(value)) {
        return false;
      }

      seen.add(value);

      return true;
    });
  }, [allPresetLinks, otherLinks]);

  const presets = useMemo(
    () =>
      allPresetLinks.filter(
        (link) => !isXmlLink(link)
      ),
    [allPresetLinks]
  );

  const video = result?.video;
  const author = result?.authorDetail;

  const profileUrl = useMemo(() => {
    if (!author?.uniqueId) return null;

    return `https://www.tiktok.com/@${author.uniqueId}`;
  }, [author?.uniqueId]);

  return (
    <main className="site-shell">
      <section className="hero">
        <div className="hero-image" />
        <div className="hero-overlay" />

        <header className="topbar">
          <div className="brand">
            <div className="brand-sparkle">
              <Icon
                name="sparkle"
                size={22}
              />
            </div>

            <div>
              <div className="brand-name">
                ZX
              </div>

              <div className="brand-sub">
                PRESET FINDER
              </div>
            </div>
          </div>

          <div className="hero-actions">
            <span className="finder-pill">
              • PRESET EXTRACTOR UTILITY
            </span>

            <button
              className="icon-button menu-button"
              aria-label="Menu"
              type="button"
            >
              <Icon
                name="menu"
                size={22}
              />
            </button>
          </div>
        </header>

        <div className="hero-copy">
          <div className="script-line">
            <Icon
              name="sparkle"
              size={14}
            />
            Stream & Preset Inspector
          </div>

          <h1>
            ALIGHT MOTION
            <br />
            PRESET FINDER
          </h1>

          <p>
            Ekstrak otomatis preset XML, Google Drive, & link 5MB langsung dari konten VT TikTok.
          </p>
        </div>
      </section>

      <div className="content-wrap">
        <section className="search-card">
          <div className="tiktok-symbol">
            ♪
          </div>

          <input
            value={url}
            onChange={(event) =>
              setUrl(event.target.value)
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                search();
              }
            }}
            placeholder="Tempel tautan video TikTok di sini..."
            aria-label="TikTok URL"
            spellCheck={false}
          />

          {url && (
            <button
              className="clear-search"
              type="button"
              onClick={() => setUrl("")}
              aria-label="Clear"
            >
              ×
            </button>
          )}

          <button
            className="search-button"
            type="button"
            onClick={search}
            disabled={status === "running"}
            aria-label="Search"
          >
            Inspect
          </button>
        </section>

        {status === "running" && (
          <section className="progress-card">
            <div className="progress-spinner" />

            <div>
              <strong>
                MEMPROSES DATA VT...
              </strong>

              <span>{progress}</span>
            </div>
          </section>
        )}

        {status === "error" && error && (
          <section className="error-card">
            <div className="error-icon">
              !
            </div>

            <div>
              <strong>
                EKSTRAKSI TERHENTI
              </strong>

              <span>{error}</span>
            </div>

            <button
              type="button"
              onClick={clearResult}
            >
              ×
            </button>
          </section>
        )}

        {status === "idle" && !result && (
          <section className="welcome-card">
            <div className="welcome-icon">
              <Icon
                name="sparkle"
                size={24}
              />
            </div>

            <div>
              <h2>
                METODE INSPEKSI PRESET
              </h2>

              <p>
                Sistem akan membaca deskripsi, pinned comment, profil kreator, serta link bio akun target untuk mengekstrak seluruh tautan preset Alight Motion & XML.
              </p>
            </div>
          </section>
        )}

        {result && (
          <>
            <section className="result-video-card">
              <div className="video-preview">
                {video?.playUrlNoWm ||
                video?.playUrl ? (
                  <video
                    src={
                      video.playUrlNoWm ||
                      video.playUrl
                    }
                    poster={video.cover}
                    controls
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <img
                    src={
                      video?.cover ||
                      "/hero.jpg"
                    }
                    alt=""
                  />
                )}

                {!video?.playUrlNoWm &&
                  !video?.playUrl &&
                  video?.cover && (
                    <div className="video-play-fallback">
                      <Icon
                        name="play"
                        size={24}
                      />
                    </div>
                  )}
              </div>

              <div className="video-info">
                <div className="video-author-row">
                  {author?.avatar ? (
                    <img
                      src={author.avatar}
                      alt=""
                      className="avatar large-avatar"
                    />
                  ) : (
                    <div className="avatar avatar-placeholder large-avatar">
                      <Icon
                        name="user"
                        size={18}
                      />
                    </div>
                  )}

                  <div className="author-heading">
                    <strong>
                      {result.author ||
                        `@${
                          author?.uniqueId ||
                          "unknown"
                        }`}
                    </strong>

                    <span>
                      {author?.nickname ||
                        "TikTok Creator"}
                    </span>
                  </div>

                  {profileUrl && (
                    <a
                      href={profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="round-external"
                      aria-label="Open TikTok profile"
                    >
                      <Icon
                        name="external"
                        size={16}
                      />
                    </a>
                  )}
                </div>

                {video?.description && (
                  <p className="description">
                    {video.description}
                  </p>
                )}

                <div className="stats-row">
                  <div className="stat">
                    <Icon
                      name="eye"
                      size={16}
                    />

                    <strong>
                      {formatNumber(
                        video?.stats?.views
                      )}
                    </strong>

                    <span>VIEWS</span>
                  </div>

                  <div className="stat">
                    <Icon
                      name="heart"
                      size={16}
                    />

                    <strong>
                      {formatNumber(
                        video?.stats?.likes
                      )}
                    </strong>

                    <span>LIKES</span>
                  </div>

                  <div className="stat">
                    <Icon
                      name="comment"
                      size={16}
                    />

                    <strong>
                      {formatNumber(
                        video?.stats?.comments
                      )}
                    </strong>

                    <span>COMMENTS</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="account-card">
              <div className="account-top">
                {author?.avatar ? (
                  <img
                    src={author.avatar}
                    alt=""
                    className="avatar account-avatar"
                  />
                ) : (
                  <div className="avatar account-avatar avatar-placeholder">
                    <Icon
                      name="user"
                      size={18}
                    />
                  </div>
                )}

                <div className="account-name">
                  <span>TARGET ACCOUNT</span>

                  <strong>
                    {result.author ||
                      `@${
                        author?.uniqueId ||
                        "unknown"
                      }`}
                  </strong>
                </div>

                {profileUrl && (
                  <a
                    href={profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="profile-button"
                  >
                    Profil
                    <Icon
                      name="arrow"
                      size={13}
                    />
                  </a>
                )}
              </div>

              <div className="account-details">
                {author?.bio && (
                  <div className="detail-item">
                    <Icon
                      name="user"
                      size={14}
                    />

                    <span>
                      {author.bio.split("\n")[0]}
                    </span>
                  </div>
                )}

                {author?.bioLink && (
                  <a
                    href={author.bioLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="detail-item link-detail"
                  >
                    <Icon
                      name="link"
                      size={14}
                    />

                    <span>
                      {author.bioLink}
                    </span>
                  </a>
                )}
              </div>
            </section>

            {/* PRESET 5MB SECTION */}
            <section className="preset-section">
              <div className="section-heading">
                <div className="section-title">
                  <Icon
                    name="sparkle"
                    size={16}
                  />

                  <h2>
                    TAUTAN PRESET 5MB
                  </h2>

                  <span className="count-pill">
                    {presets.length} DITEMUKAN
                  </span>
                </div>
              </div>

              {presets.length === 0 ? (
                <div className="empty-card">
                  <strong>
                    Preset 5MB Tidak Ditemukan
                  </strong>

                  <span>
                    Tidak ada link langsung Alight Creative 5MB di dalam video ini.
                  </span>
                </div>
              ) : (
                <div className="preset-list">
                  {presets.map(
                    (preset, index) => {
                      const isCopied =
                        copied ===
                        preset.url;

                      return (
                        <article
                          className="preset-card"
                          key={`${preset.url}-${index}`}
                        >
                          <div className="preset-thumb-wrap">
                            {preset.thumb ? (
                              <img
                                src={
                                  preset.thumb
                                }
                                alt=""
                                className="preset-thumb"
                                loading="lazy"
                              />
                            ) : (
                              <div className="preset-thumb fallback-thumb">
                                <Icon
                                  name="sparkle"
                                  size={24}
                                />
                              </div>
                            )}

                            <span className="size-badge">
                              {getPresetSize(
                                preset.type
                              )}
                            </span>
                          </div>

                          <div className="preset-content">
                            <h3>
                              {preset.title ||
                                "Alight Motion 5MB Preset"}
                            </h3>

                            <div className="preset-badges">
                              <span className="type-badge">
                                {getPresetSize(
                                  preset.type
                                )}
                              </span>

                              {preset.byAuthor && (
                                <span className="author-badge">
                                  ORIGINAL AUTHOR
                                </span>
                              )}
                            </div>

                            <div className="preset-url">
                              {preset.url}
                            </div>

                            <div className="preset-actions">
                              <a
                                href={
                                  preset.url
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="open-button"
                              >
                                <Icon
                                  name="external"
                                  size={13}
                                />
                                Buka
                              </a>

                              <button
                                type="button"
                                className={`copy-button ${
                                  isCopied
                                    ? "copied"
                                    : ""
                                }`}
                                onClick={() =>
                                  copyLink(
                                    preset.url
                                  )
                                }
                              >
                                <Icon
                                  name={isCopied ? "check" : "copy"}
                                  size={13}
                                />
                                {isCopied
                                  ? "Tersalin"
                                  : "Salin Link"}
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    }
                  )}
                </div>
              )}
            </section>

            {/* PRESET XML SECTION */}
            {xmlLinks.length > 0 && (
              <section className="preset-section">
                <div className="section-heading">
                  <div className="section-title">
                    <Icon
                      name="link"
                      size={16}
                    />

                    <h2>
                      TAUTAN PRESET XML / CLOUD
                    </h2>

                    <span className="count-pill">
                      {xmlLinks.length} DITEMUKAN
                    </span>
                  </div>
                </div>

                <div className="preset-list">
                  {xmlLinks.map(
                    (link, index) => {
                      const isCopied =
                        copied === link.url;

                      return (
                        <article
                          className="preset-card"
                          key={`xml-${link.url}-${index}`}
                        >
                          <div className="preset-thumb-wrap">
                            <div className="preset-thumb fallback-thumb">
                              <span
                                style={{
                                  fontWeight: 900,
                                  fontSize: 16,
                                  letterSpacing:
                                    "0.08em"
                                }}
                              >
                                XML
                              </span>
                            </div>

                            <span className="size-badge">
                              XML
                            </span>
                          </div>

                          <div className="preset-content">
                            <h3>
                              {link.detail ||
                                link.source ||
                                "Berkas XML Preset"}
                            </h3>

                            <div className="preset-badges">
                              <span className="type-badge">
                                XML PRESET
                              </span>
                            </div>

                            <div className="preset-url">
                              {link.url}
                            </div>

                            <div className="preset-actions">
                              <a
                                href={
                                  link.url
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="open-button"
                              >
                                <Icon
                                  name="external"
                                  size={13}
                                />
                                Buka XML
                              </a>

                              <button
                                type="button"
                                className={`copy-button ${
                                  isCopied
                                    ? "copied"
                                    : ""
                                }`}
                                onClick={() =>
                                  copyLink(
                                    link.url
                                  )
                                }
                              >
                                <Icon
                                  name={isCopied ? "check" : "copy"}
                                  size={13}
                                />
                                {isCopied
                                  ? "Tersalin"
                                  : "Salin Link"}
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    }
                  )}
                </div>
              </section>
            )}
          </>
        )}

        <footer className="footer">
          <div className="footer-sparkles">
            <span>
              ZX PRESET FINDER
            </span>
          </div>

          <p>
            Alight Motion Preset & XML Stream Utility • TikTok: @zx.image
          </p>
        </footer>
      </div>

      <nav className="bottom-nav">
        <button
          className={
            activeTab === "home"
              ? "active"
              : ""
          }
          type="button"
          onClick={() =>
            setActiveTab("home")
          }
        >
          <Icon
            name="home"
            size={18}
          />
          <span>Home</span>
        </button>

        <button
          className={
            activeTab === "history"
              ? "active"
              : ""
          }
          type="button"
          onClick={() =>
            setActiveTab("history")
          }
        >
          <Icon
            name="clock"
            size={18}
          />
          <span>History</span>
        </button>

        <button
          className={
            activeTab === "saved"
              ? "active"
              : ""
          }
          type="button"
          onClick={() =>
            setActiveTab("saved")
          }
        >
          <Icon
            name="bookmark"
            size={18}
          />
          <span>Saved</span>
        </button>

        <button
          className={
            activeTab === "profile"
              ? "active"
              : ""
          }
          type="button"
          onClick={() =>
            setActiveTab("profile")
          }
        >
          <Icon
            name="user"
            size={18}
          />
          <span>Profile</span>
        </button>
      </nav>
    </main>
  );
}

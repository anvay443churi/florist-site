import { useEffect, useRef, useState, useMemo } from "react";

/* ---------------------------------------------------------
   Generic full-bloom flower: draws `petals` individual petal
   shapes radially around a center, so any flower can easily
   have a dense, obviously-a-flower silhouette.
--------------------------------------------------------- */
function petalPath(len, width) {
  return `M30 30 C ${30 - width} ${30 - len * 0.35}, ${30 - width * 0.55} ${30 - len}, 30 ${30 - len} C ${30 + width * 0.55} ${30 - len}, ${30 + width} ${30 - len * 0.35}, 30 30 Z`;
}
const FullBloom = ({ size = 44, petals = 12, colorA = "#FF4D7A", colorB = "#FF8FAD", center = "#FFD86B", len = 17, width = 8 }) => {
  const items = [];
  for (let i = 0; i < petals; i++) {
    const angle = (360 / petals) * i;
    items.push(
      <g key={i} transform={`rotate(${angle} 30 30)`}>
        <path d={petalPath(len, width)} fill={i % 2 === 0 ? colorA : colorB} />
      </g>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      {items}
      <circle cx="30" cy="30" r="5.5" fill={center} />
    </svg>
  );
};

const Rose = ({ size = 44 }) => <FullBloom size={size} petals={12} colorA="#FF4D7A" colorB="#FF8FAD" center="#FFD86B" len={17} width={8.5} />;
const Marigold = ({ size = 44 }) => <FullBloom size={size} petals={16} colorA="#FFB238" colorB="#FF8A1E" center="#FFE08A" len={15} width={6} />;
const Jasmine = ({ size = 44 }) => (
  <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
    <g fill="#F2E4D8" stroke="#0E8577" strokeWidth="1.1">
      <circle cx="20" cy="26" r="7" />
      <circle cx="34" cy="20" r="7" />
      <circle cx="44" cy="32" r="7" />
      <circle cx="30" cy="40" r="7" />
      <circle cx="30" cy="29" r="4" fill="#FFD86B" stroke="none" />
    </g>
  </svg>
);
const Tuberose = ({ size = 44 }) => (
  <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
    <path d="M30 8C30 22 30 38 30 54" stroke="#7FD858" strokeWidth="1.6" />
    <g fill="#F2E4D8" stroke="#7A2FD9" strokeWidth="1.1">
      <ellipse cx="30" cy="16" rx="9" ry="12" />
      <ellipse cx="30" cy="31" rx="9" ry="12" />
    </g>
  </svg>
);
const Orchid = ({ size = 44 }) => (
  <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
    <g fill="#B26CFF" stroke="#E4C7FF" strokeWidth="0.6">
      <path d="M30 40C18 40 12 28 20 18C22 28 26 32 30 34C34 32 38 28 40 18C48 28 42 40 30 40Z" />
      <circle cx="30" cy="30" r="5" fill="#FFD86B" stroke="none" />
    </g>
  </svg>
);
const Lotus = ({ size = 44 }) => (
  <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
    <g fill="#FF8FAD" stroke="#FFD86B" strokeWidth="0.6">
      <path d="M30 42C14 42 8 30 12 20C20 22 26 28 30 36C34 28 40 22 48 20C52 30 46 42 30 42Z" />
    </g>
    <path d="M30 42C30 48 30 52 30 56" stroke="#7FD858" strokeWidth="1.4" />
  </svg>
);
const Gerbera = ({ size = 44 }) => (
  <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
    <g stroke="#3FE0C5" strokeWidth="4" strokeLinecap="round">
      <path d="M30 30 L30 9 M30 30 L47 17 M30 30 L51 30 M30 30 L47 43 M30 30 L30 51 M30 30 L13 43 M30 30 L9 30 M30 30 L13 17" />
    </g>
    <circle cx="30" cy="30" r="6" fill="#FFB238" />
  </svg>
);

const FLOWER_ICONS = { rose: Rose, marigold: Marigold, jasmine: Jasmine, tuberose: Tuberose, orchid: Orchid, lotus: Lotus, gerbera: Gerbera };

/* ---------------------------------------------------------
   Bouquets that revolve around the stem as the user scrolls.
   Each owns a slice of the stem section's scroll progress.
--------------------------------------------------------- */
const BOUQUETS = [
  { id: "eternal-rose", title: "Eternal Rose", local: "Rose · Gulab", flowers: ["rose", "rose", "gerbera"], color: "#D6295A", glow: "#FF4D7A", desc: "Hand-tied stems for romance and everyday gifting.", price: "from ₹499", anchor: 0.14 },
  { id: "golden-marigold", title: "Golden Marigold", local: "Marigold · Genda", flowers: ["marigold", "marigold", "marigold"], color: "#C97A12", glow: "#FFB238", desc: "Full garlands for pooja, doorways and festivals.", price: "from ₹350", anchor: 0.34 },
  { id: "mogra-breeze", title: "Mogra Breeze", local: "Jasmine · Mogra", flowers: ["jasmine", "jasmine", "tuberose"], color: "#0E8577", glow: "#3FE0C5", desc: "Fragrant strands for hair and the evening mandir offering.", price: "from ₹250", anchor: 0.54 },
  { id: "rajnigandha-grace", title: "Rajnigandha Grace", local: "Tuberose · Rajnigandha", flowers: ["tuberose", "tuberose", "jasmine"], color: "#7A2FD9", glow: "#B26CFF", desc: "Tall white spikes with a heavy, sweet scent.", price: "from ₹399", anchor: 0.72 },
  { id: "sacred-lotus", title: "Sacred Lotus", local: "Lotus · Kamal", flowers: ["lotus", "lotus", "marigold"], color: "#B5457A", glow: "#FF8FAD", desc: "Seasonal — mainly for Ganesh Chaturthi and pooja.", price: "from ₹299", anchor: 0.86 },
];

const STEM_HEIGHT = 4300; // px scroll-height of the stem experience
const STEM_WIDTH = 1000; // svg viewBox units
const STEM_WAVES = 3.4;
const STEM_AMP_PCT = 9; // how far the stem itself wanders, in % of width

function buildStemPoints(count) {
  const pts = [];
  for (let i = 0; i <= count; i++) {
    const t = i / count;
    const y = t * STEM_HEIGHT;
    const xPct = 50 + STEM_AMP_PCT * Math.sin(t * STEM_WAVES * Math.PI * 2);
    pts.push({ t, y, xPct, x: (xPct / 100) * STEM_WIDTH });
  }
  return pts;
}
function smoothPath(pts) {
  if (!pts.length) return "";
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const midX = (pts[i - 1].x + pts[i].x) / 2;
    const midY = (pts[i - 1].y + pts[i].y) / 2;
    d += ` Q ${pts[i - 1].x.toFixed(1)} ${pts[i - 1].y.toFixed(1)} ${midX.toFixed(1)} ${midY.toFixed(1)}`;
  }
  const last = pts[pts.length - 1];
  d += ` L ${last.x.toFixed(1)} ${last.y.toFixed(1)}`;
  return d;
}

export default function GaneshFlorals() {
  const stemSectionRef = useRef(null);
  const pathRef = useRef(null);
  const [pathLength, setPathLength] = useState(null);
  const [progress, setProgress] = useState(0);
  const [navOpen, setNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const revealRefs = useRef([]);
  const [revealed, setRevealed] = useState({});

  const points = useMemo(() => buildStemPoints(80), []);
  const pathD = useMemo(() => smoothPath(points), [points]);

  const leaves = useMemo(() => {
    const arr = [];
    for (let i = 5; i < points.length - 3; i += 6) {
      arr.push({ ...points[i], side: Math.floor(i / 6) % 2 === 0 ? 1 : -1 });
    }
    return arr;
  }, [points]);

  useEffect(() => {
    if (pathRef.current) setPathLength(pathRef.current.getTotalLength());
  }, [pathD]);

  useEffect(() => {
    let raf = null;
    function measure() {
      raf = null;
      setScrolled(window.scrollY > 40);
      const el = stemSectionRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const total = rect.height - window.innerHeight;
        let p = total > 0 ? -rect.top / total : 0;
        p = Math.min(1, Math.max(0, p));
        setProgress(p);
      }
    }
    function onScroll() {
      if (raf) return;
      raf = requestAnimationFrame(measure);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    measure();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setRevealed((r) => ({ ...r, [entry.target.dataset.rid]: true }));
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const addReveal = (id) => (el) => {
    if (el) {
      el.dataset.rid = id;
      revealRefs.current.push(el);
    }
  };

  const WINDOW = 0.13;
  const bouquetStates = useMemo(() => {
    return BOUQUETS.map((b) => {
      let localT = (progress - (b.anchor - WINDOW)) / (WINDOW * 2);
      localT = Math.min(1, Math.max(0, localT));
      const angle = (localT - 0.5) * Math.PI * 0.85;
      const idx = Math.min(points.length - 1, Math.max(0, Math.round(b.anchor * points.length)));
      const anchorPt = points[idx];
      const ampPct = 15;
      const xPct = anchorPt.xPct + ampPct * Math.sin(angle);
      const opacity = Math.sin(Math.max(0.001, Math.min(0.999, localT)) * Math.PI);
      const scale = 0.92 + 0.28 * opacity;
      const topPct = b.anchor * 100;
      return { ...b, xPct, opacity, scale, topPct, anchorPt };
    });
  }, [progress, points]);
  const activeBouquet = BOUQUETS.find((b) => Math.abs(progress - b.anchor) < WINDOW * 1.15);

  return (
    <div className="gf-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@500;600;700&family=Pacifico&family=Playfair+Display:ital,wght@1,500;1,600&family=Poppins:wght@300;400;500;600;700&display=swap');
        .gf-root{
          --ink:#2B211C; --ink-dim:#6B5E52; --bg:#FFF8E7; --bg-alt:#FBEFD2; --bg-alt2:#F4E4BE;
          --gold:#E08A1E; --gold-soft:#C97A12; --rose:#FF4D7A; --rose-soft:#D6295A; --sage:#4C9A5B;
          --purple:#B26CFF; --teal:#3FE0C5; --line:rgba(43,33,26,0.14);
          --rose-deep:#D6295A; --gold-deep:#C97A12; --teal-deep:#0E8577; --purple-deep:#7A2FD9; --sage-deep:#3F8A4D;
          --stem:#AEDDBB; --stem-dark:#8FCB9F;
          background:var(--bg); color:var(--ink); font-family:'Poppins',sans-serif; font-weight:300;
          overflow-x:hidden; position:relative;
        }
        .gf-root *{box-sizing:border-box;}
        .gf-root a{color:inherit;text-decoration:none;}
        .gf-root button{font-family:inherit;border:none;background:none;color:inherit;cursor:pointer;}
        .gf-wrap{max-width:1240px;margin:0 auto;padding:0 40px;}
        @media(max-width:600px){.gf-wrap{padding:0 22px;}}

        .gf-header{position:fixed;top:0;left:0;right:0;z-index:500;padding:26px 0;transition:background .4s ease,padding .4s ease;}
        .gf-header.scrolled{background:rgba(255,248,231,0.88);backdrop-filter:blur(10px);padding:14px 0;border-bottom:1px solid var(--line);}
        .gf-header .gf-wrap{display:flex;align-items:center;justify-content:space-between;}
        .gf-logo{font-family:'Dancing Script',cursive;font-size:28px;font-weight:700;}
        .gf-logo span{color:var(--gold-soft);}
        .gf-nav{display:flex;gap:38px;}
        .gf-nav a{font-size:14px;color:var(--ink-dim);position:relative;padding-bottom:4px;}
        .gf-nav a::after{content:'';position:absolute;left:0;bottom:0;height:1px;width:0;background:var(--gold-soft);transition:width .3s ease;}
        .gf-nav a:hover{color:var(--ink);}
        .gf-nav a:hover::after{width:100%;}
        .gf-menu-btn{display:none;flex-direction:column;gap:5px;width:26px;}
        .gf-menu-btn span{height:1.5px;background:var(--ink);width:100%;}
        @media(max-width:860px){
          .gf-nav{position:fixed;inset:0;background:var(--bg);flex-direction:column;justify-content:center;align-items:center;gap:32px;
            transform:translateY(-100%);transition:transform .5s ease;}
          .gf-nav.open{transform:translateY(0);}
          .gf-nav a{font-size:24px;font-family:'Dancing Script',cursive;color:var(--ink);}
          .gf-menu-btn{display:flex;z-index:600;}
        }

        .gf-hero{position:relative;min-height:92svh;display:flex;flex-direction:column;align-items:center;justify-content:center;
          text-align:center;padding:150px 24px 80px;overflow:hidden;
          background:radial-gradient(ellipse at 18% 18%, rgba(255,77,122,0.22), transparent 55%),
                     radial-gradient(ellipse at 84% 22%, rgba(178,108,255,0.18), transparent 52%),
                     radial-gradient(ellipse at 78% 82%, rgba(255,178,56,0.22), transparent 55%),
                     radial-gradient(ellipse at 15% 80%, rgba(63,224,197,0.16), transparent 50%), var(--bg);}
        .gf-petal{position:absolute;top:-40px;opacity:.55;pointer-events:none;animation:gf-fall linear infinite;}
        @keyframes gf-fall{0%{transform:translateY(-10vh) translateX(0) rotate(0deg);}100%{transform:translateY(115vh) translateX(40px) rotate(360deg);}}
        .gf-hero h1{font-family:'Dancing Script',cursive;font-weight:700;font-size:clamp(44px,9vw,112px);line-height:1.03;max-width:16ch;
          opacity:0;transform:translateY(24px);animation:gf-rise 1s ease forwards .2s;}
        .gf-hero h1 em{font-style:normal;color:var(--rose-soft);}
        .gf-hero p{margin-top:26px;font-size:16px;color:var(--ink-dim);max-width:46ch;line-height:1.7;
          opacity:0;transform:translateY(16px);animation:gf-rise .9s ease forwards .55s;}
        @keyframes gf-rise{to{opacity:1;transform:translateY(0);}}
        .gf-hero-cta{margin-top:42px;display:flex;gap:18px;flex-wrap:wrap;justify-content:center;
          opacity:0;transform:translateY(16px);animation:gf-rise .9s ease forwards .8s;}
        .gf-btn{padding:15px 34px;border-radius:100px;font-size:14px;display:inline-block;transition:transform .35s ease,background .35s ease,color .35s ease;}
        .gf-btn-solid{background:var(--gold-soft);color:#3B2314;font-weight:500;}
        .gf-btn-solid:hover{transform:translateY(-3px);background:#F4D9A8;color:#5A3A22;}
        .gf-btn-outline{border:1px solid var(--line);}
        .gf-btn-outline:hover{border-color:var(--gold-soft);color:var(--gold-soft);transform:translateY(-3px);}
        .gf-scroll-cue{position:absolute;bottom:30px;left:50%;transform:translateX(-50%);font-size:11px;letter-spacing:.2em;color:var(--ink-dim);
          display:flex;flex-direction:column;align-items:center;gap:10px;}
        .gf-scroll-cue::after{content:'';width:1px;height:38px;background:linear-gradient(var(--gold-soft),transparent);animation:gf-scrolldown 1.8s ease infinite;}
        @keyframes gf-scrolldown{0%{opacity:0;}50%{opacity:1;}100%{opacity:0;}}

        .gf-marquee{border-top:1px solid var(--line);border-bottom:1px solid var(--line);overflow:hidden;padding:22px 0;background:var(--bg-alt);}
        .gf-marquee-track{display:flex;width:max-content;animation:gf-scroll 32s linear infinite;}
        .gf-marquee-track span{font-family:'Dancing Script',cursive;font-size:28px;padding:0 26px;white-space:nowrap;display:flex;align-items:center;gap:26px;
          background:linear-gradient(90deg,#FF4D7A,#FFB238,#3FE0C5,#B26CFF,#FF4D7A);background-size:300% 100%;
          -webkit-background-clip:text;background-clip:text;color:transparent;animation:gf-hue 10s linear infinite;}
        @keyframes gf-hue{to{background-position:300% 0;}}
        .gf-marquee-track span i{color:var(--gold-soft);font-style:normal;font-size:14px;-webkit-text-fill-color:var(--gold-soft);}
        @keyframes gf-scroll{from{transform:translateX(0);}to{transform:translateX(-50%);}}

        .gf-reveal{opacity:0;transform:translateY(30px);transition:opacity .8s ease,transform .8s ease;}
        .gf-reveal.in{opacity:1;transform:translateY(0);}

        .gf-about{padding:130px 0;}
        .gf-about .gf-wrap{display:grid;grid-template-columns:1.1fr .9fr;gap:80px;align-items:center;}
        .gf-kicker{font-family:'Pacifico',cursive;color:var(--rose-soft);font-size:20px;margin-bottom:14px;display:block;}
        .gf-about h2{font-family:'Dancing Script',cursive;font-weight:700;font-size:clamp(32px,4vw,50px);line-height:1.12;margin-bottom:22px;}
        .gf-about p{color:var(--ink-dim);line-height:1.85;font-size:15.5px;margin-bottom:14px;max-width:50ch;}
        @media(max-width:900px){.gf-about .gf-wrap{grid-template-columns:1fr;}}

        /* ---- stem section ---- */
        .gf-stem-section{position:relative;overflow:hidden;background:linear-gradient(var(--bg-alt),var(--bg) 12%, var(--bg) 88%, var(--bg-alt));}
        .gf-stem-sticky{position:sticky;top:0;height:0;overflow:visible;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;
          padding-top:12vh;pointer-events:none;z-index:6;text-align:center;}
        .gf-stem-sticky .gf-kicker{pointer-events:none;}
        .gf-stem-sticky h2{font-family:'Dancing Script',cursive;font-weight:700;font-size:clamp(34px,5vw,58px);min-height:1.2em;transition:color .4s ease;}
        .gf-stem-sticky p{color:var(--ink-dim);font-size:14px;max-width:40ch;margin-top:10px;}
        .gf-sticky-title-row{display:flex;align-items:center;justify-content:center;gap:18px;flex-wrap:wrap;}
        .gf-sticky-flower{display:inline-flex;animation:gf-bob 4.5s ease-in-out infinite;}
        .gf-sticky-flower.right{animation-delay:.8s;}
        @keyframes gf-bob{0%,100%{transform:translateY(0) rotate(-4deg);}50%{transform:translateY(-10px) rotate(4deg);}}
        @media(max-width:640px){.gf-sticky-flower{display:none;}}
        .gf-stem-canvas{position:absolute;top:0;left:0;width:100%;height:100%;}
        .gf-stem-svg{position:absolute;top:0;left:0;width:100%;height:100%;display:block;}
        .gf-leaf{transition:opacity .6s ease;}
        .gf-bouquet{position:absolute;left:50%;top:0;width:0;height:0;}
        .gf-bouquet-inner{position:absolute;transform:translate(-50%,-50%);width:240px;height:240px;}
        .gf-bouquet-glow{position:absolute;inset:-40px;border-radius:50%;filter:blur(6px);pointer-events:none;}
        .gf-flower-ring{position:absolute;inset:0;animation:gf-spin 34s linear infinite;}
        @keyframes gf-spin{to{transform:rotate(360deg);}}
        .gf-flower-ring > div{position:absolute;transform-origin:center;}
        .gf-bouquet-label{position:absolute;top:calc(100% + 14px);left:50%;transform:translateX(-50%);white-space:nowrap;text-align:center;transition:opacity .3s ease;}
        .gf-bouquet-label .bl-title{display:block;font-size:20px;font-weight:600;color:var(--ink);}
        .gf-bouquet-label .bl-local{display:block;font-family:'Pacifico',cursive;font-size:15px;margin-top:2px;}
        .gf-bouquet-label .bl-desc{display:block;font-size:12px;color:var(--ink-dim);margin-top:6px;max-width:220px;}
        .gf-bouquet-label .bl-price{display:block;font-size:11px;color:var(--gold-soft);margin-top:6px;letter-spacing:.02em;}

        .gf-occasions{padding:130px 0;}
        .gf-occ-scroll{display:flex;gap:22px;overflow-x:auto;padding-bottom:20px;margin:0 -40px;padding-left:40px;padding-right:40px;}
        .gf-occ-card{min-width:290px;background:linear-gradient(160deg,var(--bg-alt),var(--bg-alt2));border:1px solid var(--line);padding:32px 28px;min-height:250px;display:flex;flex-direction:column;justify-content:space-between;}
        .gf-occ-card .num{font-family:'Dancing Script',cursive;font-size:15px;color:var(--gold-soft);}
        .gf-occ-card h3{font-size:20px;font-weight:600;margin:16px 0 8px;}
        .gf-occ-card p{font-size:13.5px;color:var(--ink-dim);line-height:1.7;}

        .gf-stats{background:var(--bg-alt);border-top:1px solid var(--line);border-bottom:1px solid var(--line);}
        .gf-stats .gf-wrap{display:flex;flex-wrap:wrap;}
        .gf-stat{flex:1 1 200px;padding:36px 30px;border-left:1px solid var(--line);text-align:center;}
        .gf-stat:first-child{border-left:none;}
        .gf-stat .n{font-family:'Dancing Script',cursive;font-weight:700;font-size:42px;color:var(--gold-soft);}
        .gf-stat .l{font-size:13px;color:var(--ink-dim);margin-top:8px;}
        @media(max-width:700px){.gf-stat{border-left:none;border-top:1px solid var(--line);flex:1 1 45%;}}

        .gf-testi{padding:120px 0;text-align:center;}
        .gf-t-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:46px;margin-top:24px;}
        .gf-t-card q{font-family:'Playfair Display',serif;font-style:italic;font-weight:500;font-size:20px;line-height:1.55;display:block;}
        .gf-t-card .who{margin-top:18px;font-size:12.5px;color:var(--ink-dim);}
        @media(max-width:900px){.gf-t-grid{grid-template-columns:1fr;}}

        .gf-visit{background:var(--bg-alt);padding:120px 0;}
        .gf-visit .gf-wrap{display:grid;grid-template-columns:1fr 1fr;gap:70px;align-items:start;}
        .gf-visit h2{font-family:'Dancing Script',cursive;font-weight:700;font-size:clamp(32px,4vw,48px);margin-bottom:24px;}
        .gf-info-row{display:flex;gap:16px;padding:16px 0;border-top:1px solid var(--line);}
        .gf-info-row:last-of-type{border-bottom:1px solid var(--line);}
        .gf-info-row .label{width:100px;flex-shrink:0;font-size:12px;color:var(--gold-soft);padding-top:2px;}
        .gf-info-row .value{font-size:14.5px;color:var(--ink-dim);line-height:1.7;}
        .gf-map{border:1px solid var(--line);min-height:340px;filter:grayscale(.25) contrast(1.02) brightness(1.02);}
        .gf-map iframe{width:100%;height:100%;min-height:340px;border:0;display:block;}
        @media(max-width:900px){.gf-visit .gf-wrap{grid-template-columns:1fr;}}

        .gf-footer{padding:56px 0 30px;border-top:1px solid var(--line);}
        .gf-footer .gf-wrap{display:flex;flex-wrap:wrap;justify-content:space-between;gap:24px;align-items:center;}
        .gf-foot-logo{font-family:'Dancing Script',cursive;font-size:24px;}
        .gf-foot-links{display:flex;gap:24px;font-size:13px;color:var(--ink-dim);}
        .gf-foot-links a:hover{color:var(--gold-soft);}
        .gf-foot-copy{font-size:11.5px;color:var(--ink-dim);opacity:.6;width:100%;margin-top:22px;text-align:center;}
      `}</style>


      <header className={`gf-header ${scrolled ? "scrolled" : ""}`}>
        <div className="gf-wrap">
          <a href="#top" className="gf-logo">Ganesh <span>Florals</span></a>
          <nav className={`gf-nav ${navOpen ? "open" : ""}`}>
            <a href="#about" onClick={() => setNavOpen(false)}>About</a>
            <a href="#flowers" onClick={() => setNavOpen(false)}>Flowers</a>
            <a href="#occasions" onClick={() => setNavOpen(false)}>Occasions</a>
            <a href="#visit" onClick={() => setNavOpen(false)}>Visit Us</a>
          </nav>
          <button className="gf-menu-btn" onClick={() => setNavOpen((o) => !o)} aria-label="Menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </header>

      <section className="gf-hero" id="top">
        <svg className="gf-petal" style={{ left: "8%", width: 16, animationDuration: "14s" }} viewBox="0 0 20 20"><path d="M10 0C15 5 15 15 10 20C5 15 5 5 10 0Z" fill="#FF4D7A" /></svg>
        <svg className="gf-petal" style={{ left: "22%", width: 12, animationDuration: "18s", animationDelay: "3s" }} viewBox="0 0 20 20"><path d="M10 0C15 5 15 15 10 20C5 15 5 5 10 0Z" fill="#FFB238" /></svg>
        <svg className="gf-petal" style={{ left: "68%", width: 18, animationDuration: "16s", animationDelay: "1.5s" }} viewBox="0 0 20 20"><path d="M10 0C15 5 15 15 10 20C5 15 5 5 10 0Z" fill="#B26CFF" /></svg>
        <svg className="gf-petal" style={{ left: "80%", width: 13, animationDuration: "20s", animationDelay: "5s" }} viewBox="0 0 20 20"><path d="M10 0C15 5 15 15 10 20C5 15 5 5 10 0Z" fill="#3FE0C5" /></svg>
        <svg className="gf-petal" style={{ left: "45%", width: 15, animationDuration: "22s", animationDelay: "7s" }} viewBox="0 0 20 20"><path d="M10 0C15 5 15 15 10 20C5 15 5 5 10 0Z" fill="#7FD858" /></svg>

        <h1>Flowers, cut fresh<br />for your <em>every</em> moment</h1>
        <p>A neighbourhood flower shop growing, sourcing and arranging blooms daily — from garlands for the morning pooja to bouquets for the people you love.</p>
        <div className="gf-hero-cta">
          <a href="#flowers" className="gf-btn gf-btn-solid">See our flowers</a>
          <a href="#visit" className="gf-btn gf-btn-outline">Get directions</a>
        </div>
        <div className="gf-scroll-cue">SCROLL</div>
      </section>

      <div className="gf-marquee">
        <div className="gf-marquee-track">
          <span><i>❀</i>Rose<i>❀</i>Marigold<i>❀</i>Jasmine<i>❀</i>Tuberose<i>❀</i>Orchid<i>❀</i>Lotus<i>❀</i>Gerbera</span>
          <span><i>❀</i>Rose<i>❀</i>Marigold<i>❀</i>Jasmine<i>❀</i>Tuberose<i>❀</i>Orchid<i>❀</i>Lotus<i>❀</i>Gerbera</span>
        </div>
      </div>

      <section className="gf-about" id="about">
        <div className="gf-wrap">
          <div className={`gf-reveal ${revealed.a1 ? "in" : ""}`} ref={addReveal("a1")}>
            <span className="gf-kicker">Our story</span>
            <h2>Rooted a few minutes<br />from the Vashi flower market</h2>
            <p>Ganesh Florals started as a small pooja-flower stall and grew into a full florist by staying close to where the freshest stock in Navi Mumbai actually is — the Vashi wholesale market, just down the road.</p>
            <p>Every morning our team walks the market before sunrise, picks stock by hand, and has it arranged and ready at the shop before most people have had their first cup of chai.</p>
          </div>
          <div className={`gf-reveal ${revealed.a2 ? "in" : ""}`} ref={addReveal("a2")} style={{ display: "flex", justifyContent: "center" }}>
            <svg viewBox="0 0 300 300" width="100%" style={{ maxWidth: 320 }}>
              <path d="M150 140 C150 185, 140 232, 118 266" stroke="#9FD8AE" strokeWidth="3" fill="none" strokeLinecap="round" />
              <path d="M140 210 C122 208, 108 196, 104 180" stroke="#9FD8AE" strokeWidth="2.4" fill="none" strokeLinecap="round" />
              <g transform="translate(90,50)">
                <FullBloom size={120} petals={14} colorA="#FF4D7A" colorB="#FF8FAD" center="#FFD86B" len={19} width={9} />
              </g>
            </svg>
          </div>
        </div>
      </section>

      {/* ---------------- STEM + REVOLVING BOUQUETS ---------------- */}
      <section className="gf-stem-section" id="flowers" ref={stemSectionRef} style={{ height: STEM_HEIGHT }}>
        <div className="gf-stem-sticky">
          <span className="gf-kicker">What we grow, one at a time</span>
          <div className="gf-sticky-title-row">
            <span className="gf-sticky-flower left"><Marigold size={54} /></span>
            <h2 style={{ color: activeBouquet ? activeBouquet.color : "var(--ink)" }}>
              {activeBouquet ? `${activeBouquet.title} · ${activeBouquet.local}` : "Flowers we grow"}
            </h2>
            <span className="gf-sticky-flower right"><Rose size={54} /></span>
          </div>
          <p>{activeBouquet ? activeBouquet.desc : "Keep scrolling — each bouquet swings into view along the stem."}</p>
        </div>

        <div className="gf-stem-canvas">
          <svg className="gf-stem-svg" viewBox={`0 0 ${STEM_WIDTH} ${STEM_HEIGHT}`} preserveAspectRatio="none">
            <path
              ref={pathRef}
              d={pathD}
              fill="none"
              stroke="#9FD8AE"
              strokeWidth="7"
              strokeLinecap="round"
              style={{
                strokeDasharray: pathLength || 100000,
                strokeDashoffset: pathLength ? pathLength - pathLength * progress : 100000,
              }}
            />
            {leaves.map((leaf, idx) => {
              const visible = progress > leaf.t - 0.015;
              const d = leaf.side > 0 ? "M0 0 C 34 -12, 62 6, 80 0 C 62 16, 28 16, 0 0Z" : "M0 0 C -34 -12, -62 6, -80 0 C -62 16, -28 16, 0 0Z";
              return (
                <g key={idx} transform={`translate(${leaf.x},${leaf.y})`} className="gf-leaf" style={{ opacity: visible ? 0.85 : 0 }}>
                  <path d={d} fill="#B7E4C1" />
                </g>
              );
            })}
            {bouquetStates.map((b) => {
              if (b.opacity < 0.03) return null;
              const y = b.anchorPt.y;
              const x1 = b.anchorPt.x;
              const x2 = (b.xPct / 100) * STEM_WIDTH;
              const midX = (x1 + x2) / 2;
              return (
                <path
                  key={"branch-" + b.id}
                  d={`M ${x1} ${y} Q ${midX} ${y - 26} ${x2} ${y - 10}`}
                  fill="none"
                  stroke="#9FD8AE"
                  strokeWidth="4"
                  strokeLinecap="round"
                  style={{ opacity: b.opacity }}
                />
              );
            })}
          </svg>

          {bouquetStates.map((b) => (
            <div key={b.id} className="gf-bouquet" style={{ top: `${b.topPct}%` }}>
              <div
                className="gf-bouquet-inner"
                style={{
                  left: `${b.xPct - 50}%`,
                  transform: `translate(-50%,-50%) translateY(-10px) scale(${b.scale})`,
                  opacity: b.opacity,
                  zIndex: 5,
                }}
              >
                <div
                  className="gf-bouquet-glow"
                  style={{ background: `radial-gradient(circle, ${b.glow}77, ${b.glow}00 68%)` }}
                />
                <div className="gf-flower-ring">
                  {b.flowers.map((f, i) => {
                    const Icon = FLOWER_ICONS[f];
                    const fa = (i / b.flowers.length) * Math.PI * 2;
                    const r = 58;
                    return (
                      <div key={i} style={{ left: `calc(50% + ${Math.cos(fa) * r}px)`, top: `calc(50% + ${Math.sin(fa) * r}px)`, transform: "translate(-50%,-50%)" }}>
                        <Icon size={72} />
                      </div>
                    );
                  })}
                </div>
                <div className="gf-bouquet-label" style={{ opacity: b.opacity }}>
                  <span className="bl-title">{b.title}</span>
                  <span className="bl-local" style={{ color: b.color }}>{b.local}</span>
                  <span className="bl-desc">{b.desc}</span>
                  <span className="bl-price">{b.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="gf-occasions" id="occasions">
        <div className="gf-wrap">
          <div className={`gf-reveal ${revealed.o1 ? "in" : ""}`} ref={addReveal("o1")} style={{ maxWidth: 640, marginBottom: 60 }}>
            <span className="gf-kicker">Made to order</span>
            <h2 style={{ fontFamily: "'Dancing Script',cursive", fontWeight: 700, fontSize: "clamp(32px,4.6vw,54px)" }}>Bouquets &amp; decor by occasion</h2>
            <p style={{ marginTop: 16, color: "var(--ink-dim)", lineHeight: 1.75, fontSize: 15.5 }}>Tell us the date and the mood — we'll put something together, from a single hand-tied bunch to a full pandal.</p>
          </div>
        </div>
        <div className="gf-occ-scroll">
          {[
            ["Weddings", "Mandap & wedding decor", "Full floral décor for mandaps, entrances and stages, planned around your colours and date.", "#FF4D7A", "#D6295A"],
            ["Festivals", "Ganesh Chaturthi & festival flowers", "Marigold, lotus and mixed garlands for pandal decoration, sized for home or society setups.", "#FFB238", "#C97A12"],
            ["Daily pooja", "Garland subscriptions", "Fresh genda and mogra garlands delivered daily or weekly for your home mandir.", "#3FE0C5", "#0E8577"],
            ["Celebrations", "Birthdays & anniversaries", "Hand-tied bouquets and table arrangements, with same-day delivery nearby.", "#B26CFF", "#7A2FD9"],
            ["Business", "Corporate & events", "Reception arrangements, stage flowers and standing bouquets for openings and events.", "#7FD858", "#3F8A4D"],
            ["In memory", "Sympathy wreaths", "Simple, respectful wreaths and arrangements, arranged and delivered promptly.", "#FF8FAD", "#B5457A"],
          ].map(([num, title, desc, c, tc], i) => (
            <div className="gf-occ-card" key={i} style={{ borderTop: `3px solid ${c}` }}>
              <span className="num" style={{ color: tc }}>{num}</span>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="gf-stats">
        <div className="gf-wrap">
          {[["15+", "years serving customers", "#D6295A"], ["30+", "flower varieties", "#C97A12"], ["500+", "bouquets a month", "#0E8577"], ["Daily", "fresh market runs", "#7A2FD9"]].map(([n, l, c], i) => (
            <div className="gf-stat" key={i}><div className="n" style={{ color: c }}>{n}</div><div className="l">{l}</div></div>
          ))}
        </div>
      </section>

      <section className="gf-testi">
        <div className="gf-wrap">
          <div className={`gf-reveal ${revealed.t0 ? "in" : ""}`} ref={addReveal("t0")}>
            <span className="gf-kicker">From our customers</span>
            <h2 style={{ fontFamily: "'Dancing Script',cursive", fontWeight: 700, fontSize: "clamp(32px,4vw,50px)" }}>Kind words</h2>
          </div>
          <div className="gf-t-grid">
            {[
              ["Ordered garlands for Ganpati at 7am, delivered fresh before the visarjan prep even started.", "Deepa R.", "#D6295A"],
              ["Did our whole mandap on short notice and it still looked like we'd planned it for months.", "Rohan & Pooja", "#C97A12"],
              ["My mother only wants mogra from here now — she says it lasts longer than anywhere else.", "Anita K.", "#0E8577"],
            ].map(([quote, who, c], i) => (
              <div className={`gf-t-card gf-reveal ${revealed["t" + (i + 1)] ? "in" : ""}`} key={i} ref={addReveal("t" + (i + 1))}>
                <q style={{ color: c }}>{quote}</q>
                <div className="who">— {who}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="gf-visit" id="visit">
        <div className="gf-wrap">
          <div className={`gf-reveal ${revealed.v1 ? "in" : ""}`} ref={addReveal("v1")}>
            <h2>Visit the shop</h2>
            <div className="gf-info-row"><div className="label">Address</div><div className="value">Ganesh Florals, Sanpada, Navi Mumbai – 400705<br /><span style={{ opacity: 0.7, fontSize: 12.5 }}>(shop number &amp; landmark to be added)</span></div></div>
            <div className="gf-info-row"><div className="label">Hours</div><div className="value">Open daily, 7:00 AM – 9:30 PM</div></div>
            <div className="gf-info-row"><div className="label">Phone</div><div className="value">+917219768463 (WhatsApp orders welcome)</div></div>
            <div className="gf-info-row"><div className="label">Delivery</div><div className="value">Same-day delivery nearby on orders before 4 PM</div></div>
            <div className="gf-hero-cta" style={{ justifyContent: "flex-start", marginTop: 30, opacity: 1, transform: "none", animation: "none" }}>
              <a href="https://wa.me/917219768463" className="gf-btn gf-btn-solid">Order on WhatsApp</a>
            </div>
          </div>
          <div className={`gf-map gf-reveal ${revealed.v2 ? "in" : ""}`} ref={addReveal("v2")}>
            <iframe title="map" src="https://www.google.com/maps?q=Sanpada,+Navi+Mumbai&output=embed" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
          </div>
        </div>
      </section>

      <footer className="gf-footer">
        <div className="gf-wrap">
          <div className="gf-foot-logo">Ganesh Florals</div>
          <div className="gf-foot-links">
            <a href="#about">About</a>
            <a href="#flowers">Flowers</a>
            <a href="#occasions">Occasions</a>
            <a href="#visit">Visit Us</a>
          </div>
          <div className="gf-foot-copy">© {new Date().getFullYear()} Ganesh Florals, Navi Mumbai. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}

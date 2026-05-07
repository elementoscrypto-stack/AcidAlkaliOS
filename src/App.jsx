
import React, { useMemo, useState } from "react";
import { Search, Menu, X, Sparkles, Network, Database, BarChart3, Atom, Rocket, GitBranch } from "lucide-react";
import elements from "./data/elements.json";
import periodicLayout from "./data/periodicLayout.json";
import encounters from "./data/encounters.json";
import upgradeChecklist from "./data/upgradeChecklist.json";
import "./styles.css";

const catalog = Object.fromEntries(elements.map((e) => [e.symbol, e]));

function scoreFor(symbol) {
  const e = catalog[symbol] || catalog.Al;
  const base = {
    "Alkali metal": [4.8, 4.6, 1.2, 3.4],
    "Alkaline earth metal": [3.8, 3.2, 2.5, 2.7],
    "Transition metal": [2.7, 2.3, 3.4, 2.1],
    "Post-transition metal": [2.8, 3.1, 3.2, 2.4],
    Metalloid: [2.4, 2.7, 3.1, 2.2],
    Nonmetal: [2.8, 2.0, 2.5, 4.0],
    Halogen: [4.5, 2.8, 1.4, 4.2],
    "Noble gas": [0.8, 0.6, 0.8, 4.8],
    Lanthanide: [2.9, 2.6, 2.8, 1.9],
    Actinide: [3.2, 2.8, 2.4, 1.8],
  }[e.category] || [2.2, 2.1, 2.2, 2.2];
  const clamp = (v) => Math.max(0.5, Math.min(5, v));
  const wobble = ((e.atomicNumber % 7) - 3) * 0.12;
  const acid = clamp(base[0] + wobble);
  const alkaline = clamp(base[1] + ((e.atomicNumber % 6) - 2.5) * 0.1);
  const passivation = clamp(base[2] - wobble / 2);
  const diffusion = clamp(base[3] + ((e.atomicNumber % 5) - 2) * 0.1);
  return { acid, alkaline, passivation, diffusion, overall: (acid + alkaline + passivation + diffusion) / 4 };
}

function similar(symbol, limit = 4) {
  const src = catalog[symbol] || catalog.Al;
  const s = scoreFor(src.symbol);
  const srcDensity = parseFloat(src.density) || 0;
  const srcEN = src.electronegativity || 0;
  return elements
    .filter((e) => e.symbol !== src.symbol)
    .map((e) => {
      const t = scoreFor(e.symbol);
      const density = parseFloat(e.density) || 0;
      const en = e.electronegativity || 0;
      const behavior = Math.sqrt((s.acid - t.acid) ** 2 + (s.alkaline - t.alkaline) ** 2 + (s.passivation - t.passivation) ** 2 + (s.diffusion - t.diffusion) ** 2);
      const distance = Math.max(0.05, behavior + Math.min(Math.abs(srcDensity - density) / 10, 1.8) * 0.35 + Math.min(Math.abs(srcEN - en), 1.8) * 0.45 + (src.category === e.category ? -0.45 : 0));
      return { ...e, distance };
    })
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
}

function Panel({ children, className = "" }) { return <section className={"panel " + className}>{children}</section>; }
function Pill({ children }) { return <span className="pill">{children}</span>; }
function Metric({ icon, t, v, n }) { return <div className="metric"><div className="metricIcon">{icon}</div><small>{t}</small><b>{v}</b><em>{n}</em></div>; }
function band(x) { return x >= 4.4 ? "veryhigh" : x >= 3.5 ? "high" : x >= 2.5 ? "moderate" : x >= 1.5 ? "low" : "verylow"; }

const loops = ["Discovery", "Pattern", "Comparison", "Encounter", "Similarity", "Atlas", "Insight", "Prediction", "Collaboration", "Feed", "Reputation"];
const feed = [
  ["New similarity", "Aluminum ↔ Gallium", "High alkaline/passivation overlap"],
  ["Pattern alert", "Titanium oxide stability", "Passivation signal strengthened"],
  ["Encounter", "Magnesium acid response", "Gas evolution candidate reviewed"],
  ["Graph update", "Transition metals cluster", "Behaviour edges recalculated"],
];

export default function App() {
  const [route, setRoute] = useState("/");
  const [selected, setSelected] = useState("Al");
  const [layer, setLayer] = useState("acid");
  const [query, setQuery] = useState("");
  const [hover, setHover] = useState(null);
  const [compare, setCompare] = useState(["Al", "Cu"]);
  const [add, setAdd] = useState("Fe");
  const [menuOpen, setMenuOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return elements;
    return elements.filter((e) => e.name.toLowerCase().includes(q) || e.symbol.toLowerCase().includes(q) || e.category.toLowerCase().includes(q) || String(e.atomicNumber).includes(q));
  }, [query]);

  const nav = (path) => { setRoute(path); setMenuOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); };

  return (
    <div className="app">
      <button className="mobile-menu" onClick={() => setMenuOpen(true)}><Menu size={18} /> Menu</button>
      {menuOpen && <button className="overlay" onClick={() => setMenuOpen(false)} />}
      <aside className={menuOpen ? "open" : ""}>
        <div className="brand"><div className="eye" /><div><h1>ElementOS</h1><p>Explore. Compare. Understand Matter</p></div><button className="close" onClick={() => setMenuOpen(false)}><X size={16}/></button></div>
        {[["Dashboard","/",Sparkles],["Behavior Atlas","/atlas",Atom],["Element Explorer","/explorer",Search],["Comparisons","/compare",BarChart3],["Similarity Universe","/similarity",Network],["Behaviour Graph","/graph",GitBranch],["Encounters","/encounters",Database],["Roper Equation","/roper",Rocket],["Upgrade Log","/upgrades",Sparkles]].map(([label,path,Icon]) => (
          <button className={route === path ? "live" : ""} onClick={() => nav(path)} key={path}><span className="navLeft"><Icon size={15}/>{label}</span><span>{route === path ? "Live" : "Open"}</span></button>
        ))}
      </aside>
      <main>
        {route === "/" && <Dashboard nav={nav} />}
        {route === "/atlas" && <Atlas layer={layer} setLayer={setLayer} selected={selected} setSelected={setSelected} hover={hover} setHover={setHover} />}
        {route === "/explorer" && <Explorer selected={selected} setSelected={setSelected} filtered={filtered} query={query} setQuery={setQuery} nav={nav} />}
        {route === "/compare" && <Compare compare={compare} setCompare={setCompare} add={add} setAdd={setAdd} />}
        {route === "/similarity" && <Similarity selected={selected} setSelected={setSelected} />}
        {route === "/graph" && <Graph selected={selected} setSelected={setSelected} />}
        {route === "/encounters" && <Encounters />}
        {route === "/roper" && <Roper />}
        {route === "/upgrades" && <UpgradeLog />}
      </main>
    </div>
  );
}

function Dashboard({ nav }) {
  return <div className="page">
    <Panel className="hero">
      <div className="heroCopy">
        <Pill>Scientific Operating Environment</Pill>
        <h2>Element<span>OS</span></h2>
        <p>A premium scientific platform for exploring elements, comparing behaviour, mapping similarities, and building the GitHub of experimental science.</p>
        <div className="actions"><button onClick={() => nav("/atlas")}>Launch Atlas</button><button onClick={() => nav("/graph")}>Open Behaviour Graph</button><button onClick={() => nav("/roper")}>Roper Equation</button></div>
      </div>
      <div className="metrics"><Metric icon={<Atom size={18}/>} t="Elements Profiled" v="118/118" n="100% complete" /><Metric icon={<Database size={18}/>} t="Encounters" v="1,842" n="+23 this week" /><Metric icon={<Network size={18}/>} t="Data Points" v="18,956" n="prototype" /><Metric icon={<Rocket size={18}/>} t="Researchers" v="2,431" n="north star" /></div>
    </Panel>
    <div className="grid2">
      <Panel><h3>11 Viral Discovery Loops</h3>{loops.map((x, i) => <div className="row" key={x}><span className="rowName">{String(i+1).padStart(2,"0")} · {x}</span><span>active</span></div>)}</Panel>
      <Panel><h3>Discovery Feed</h3>{feed.map(([type,title,detail]) => <div className="feed" key={title}><small>{type}</small><b>{title}</b><p>{detail}</p></div>)}</Panel>
    </div>
    <Panel><h3>North Star</h3><p><b>Verified Material Interactions Recorded.</b> Every experiment, comparison, and behaviour edge makes ElementOS smarter and more valuable.</p></Panel>
  </div>;
}

function Atlas({ layer, setLayer, selected, setSelected, hover, setHover }) {
  const selectedElement = catalog[selected];
  const preview = hover ? catalog[hover] : null;
  const previewScore = hover ? scoreFor(hover)[layer] : 0;
  return <div className="page"><h2>Behavior Atlas</h2><div className="toolbar"><div className="layerbar">{["acid","alkaline","passivation","diffusion"].map((l) => <button className={layer === l ? "active" : ""} onClick={() => setLayer(l)} key={l}>{l}</button>)}</div><Pill>Layer: {layer}</Pill></div><div className="grid2"><Panel className="ptablePanel"><div className="ptable">{preview && <div className="hoverPreview"><b>{preview.symbol}</b><span>{preview.name}</span><small>{layer}: {previewScore.toFixed(2)}</small><small>Encounters: {encounters.filter((e) => e.symbol === preview.symbol).length || Math.round(scoreFor(preview.symbol).overall * 2)}</small></div>}{periodicLayout.map((row, ri) => <div className="periodrow" key={ri}>{row.map((sym, i) => sym ? <button key={sym} className={"tile " + band(scoreFor(sym)[layer])} onMouseEnter={() => setHover(sym)} onMouseLeave={() => setHover(null)} onClick={() => { setSelected(sym); setHover(null); }}><small>{catalog[sym].atomicNumber}</small>{sym}<em>{scoreFor(sym).overall.toFixed(1)}</em></button> : <div key={i} className="blank" />)}</div>)}</div></Panel><Panel><h3>Element Insight</h3><div className="bigsymbol">{selected}</div><h3>{selectedElement.name}</h3><p>{selectedElement.category}</p><p>Overall score: {scoreFor(selected).overall.toFixed(2)}</p><div className="miniStats">{Object.entries(scoreFor(selected)).map(([k,v]) => <div key={k}><span>{k}</span><b>{v.toFixed(2)}</b></div>)}</div></Panel></div></div>;
}

function Explorer({ selected, setSelected, filtered, query, setQuery, nav }) {
  const e = catalog[selected] || catalog.Al;
  const s = scoreFor(selected);
  const sims = similar(selected, 4);
  return <div className="page"><h2>Element Explorer</h2><div className="grid2"><Panel><div className="search"><Search size={16} /><input value={query} onChange={(ev) => setQuery(ev.target.value)} placeholder="Search all 118 elements..." /></div><div className="resultCount">{filtered.length} elements</div><div className="elementList">{filtered.map((el) => <button className={selected === el.symbol ? "active" : ""} onClick={() => setSelected(el.symbol)} key={el.symbol}>{el.name} ({el.symbol})<span>{el.atomicNumber}</span></button>)}</div></Panel><Panel><div className="elementHeader"><div className="bigsymbol">{e.symbol}</div><div><h3>{e.name}</h3><p>{e.category}</p></div></div><div className="propgrid">{["atomicWeight","density","meltingPoint","phase","electronegativity","dataStatus"].map((k) => <div key={k}><small>{k}</small><b>{String(e[k] ?? "—")}</b></div>)}</div><h3>Behaviour Scores</h3>{Object.entries(s).map(([k, v]) => <div className="bar" key={k}><span>{k}</span><i style={{ width: `${v / 5 * 100}%` }} /><b>{v.toFixed(2)}</b></div>)}<h3>Explore Next</h3>{sims.map((x) => <button className="sim" onClick={() => setSelected(x.symbol)} key={x.symbol}>{x.name}<span>{x.symbol} · {x.distance.toFixed(2)}</span></button>)}<div className="actions"><button onClick={() => nav("/compare")}>Open Comparison Engine</button><button onClick={() => nav("/similarity")}>Open Similarity Universe</button></div></Panel></div></div>;
}

function Compare({ compare, setCompare, add, setAdd }) {
  const selected = compare.map((s) => catalog[s]).filter(Boolean);
  const rows = ["acid", "alkaline", "passivation", "diffusion", "overall", "density", "meltingPoint", "phase", "electronegativity"];
  const addEl = () => { if (compare.length < 10 && !compare.includes(add)) setCompare([...compare, add]); };
  return <div className="page"><h2>Comparison Engine</h2><Panel><div className="actions"><select value={add} onChange={(e) => setAdd(e.target.value)}>{elements.map((e) => <option key={e.symbol} value={e.symbol}>{e.name} ({e.symbol})</option>)}</select><button onClick={addEl}>Add Element</button><button onClick={() => setCompare(["Al","Cu","Fe","Mg","Ti"])}>Launch Metals</button><button onClick={() => setCompare(["Cu","Ag","Au","Al","Ni"])}>Conductive Set</button></div><div className="chips">{selected.map((e) => <button key={e.symbol} onClick={() => compare.length > 1 && setCompare(compare.filter((s) => s !== e.symbol))}>{e.name} ×</button>)}</div><div className="tablewrap"><table><thead><tr><th>Metric</th>{selected.map((e) => <th key={e.symbol}>{e.symbol}<small>{e.name}</small></th>)}</tr></thead><tbody>{rows.map((r) => <tr key={r}><td>{r}</td>{selected.map((e) => { const sc = scoreFor(e.symbol); const val = sc[r] ?? e[r] ?? "—"; return <td key={e.symbol + r}><b>{typeof val === "number" ? val.toFixed(2) : String(val)}</b>{typeof val === "number" && <div className="mini"><i style={{ width: `${val / 5 * 100}%` }} /></div>}</td>; })}</tr>)}</tbody></table></div></Panel></div>;
}

function Similarity({ selected, setSelected }) {
  const e = catalog[selected];
  const sims = similar(selected, 4);
  const pos = [[50,10],[90,50],[50,90],[10,50]];
  return <div className="page"><h2>Similarity Universe</h2><div className="grid2"><Panel className="universe"><button className="core">{e.symbol}<small>{e.name}</small></button>{sims.map((s,i) => <button key={s.symbol} className="node" style={{ left: `${pos[i][0]}%`, top: `${pos[i][1]}%` }} onClick={() => setSelected(s.symbol)}>{s.symbol}<small>{s.distance.toFixed(2)}</small></button>)}</Panel><Panel><h3>Closest Behaviour Links</h3>{sims.map((s,i) => <button key={s.symbol} className="sim" onClick={() => setSelected(s.symbol)}>{i+1}. {s.name}<span>{s.category} · {s.distance.toFixed(2)}</span></button>)}<select value={selected} onChange={(e) => setSelected(e.target.value)}>{elements.map((e) => <option key={e.symbol} value={e.symbol}>{e.name} ({e.symbol})</option>)}</select></Panel></div></div>;
}

function Graph({ selected, setSelected }) {
  const nodes = elements.map((e, i) => { const a = i / elements.length * Math.PI * 2; const r = e.category === "Transition metal" ? 230 : e.category === "Noble gas" ? 195 : e.category === "Lanthanide" || e.category === "Actinide" ? 285 : 160; return { ...e, x: 390 + Math.cos(a) * r, y: 330 + Math.sin(a) * r }; });
  const lookup = Object.fromEntries(nodes.map((n) => [n.symbol, n]));
  const focus = new Set([selected, ...similar(selected, 4).map((e) => e.symbol)]);
  const edges = elements.flatMap((e) => similar(e.symbol, 2).map((s) => [e.symbol, s.symbol])).slice(0, 240);
  return <div className="page"><h2>Material Behaviour Graph</h2><div className="grid2"><Panel><div className="svgwrap"><svg viewBox="0 0 780 660">{edges.map(([a,b], i) => { const A = lookup[a], B = lookup[b]; const active = focus.has(a) && focus.has(b); return <line key={i} x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={active ? "#67e8f9" : "rgba(34,211,238,.14)"} strokeWidth={active ? 2.5 : .8} />; })}{nodes.map((n) => <g key={n.symbol} className="g" onClick={() => setSelected(n.symbol)}><circle cx={n.x} cy={n.y} r={focus.has(n.symbol) ? 13 : 8} fill={focus.has(n.symbol) ? "#67e8f9" : "#94a3b8"} /><text x={n.x} y={n.y + 3} textAnchor="middle" fontSize="7" fill="#020617" fontWeight="700">{n.symbol}</text></g>)}</svg></div></Panel><Panel><h3>Focused Cluster</h3><div className="bigsymbol">{selected}</div><p>{catalog[selected].name}</p>{similar(selected, 4).map((s) => <button key={s.symbol} className="sim" onClick={() => setSelected(s.symbol)}>{s.name}<span>{s.distance.toFixed(2)}</span></button>)}</Panel></div></div>;
}

function Encounters() { return <div className="page"><h2>Encounter Database</h2><div className="grid3">{encounters.map((e) => <Panel key={e.id}><small>{e.id}</small><h3>{e.element} in {e.environment}</h3><p>{e.condition} · {e.duration} · {e.temperature}</p><p>{e.result}</p><b>Data value {e.score}</b></Panel>)}</div></div>; }
function Roper() { return <div className="page"><h2>Roper Master Equation</h2><Panel><div className="equation">Ψ<sub>G</sub>(𝒩,t)=Σ A<sub>i</sub>e<sup>i(Ω<sub>i</sub>t+Φ<sub>i</sub>(𝒢))</sup> · C<sub>i</sub>(⊥,Δ) · G<sub>i</sub></div><p>Reality = oscillating nodes × geometry × perpendicular transitions × emergent gravity.</p></Panel></div>; }
function UpgradeLog() { return <div className="page"><h2>100 Upgrade Polish Pass</h2><Panel><div className="upgradeGrid">{upgradeChecklist.map((item, index) => <div className="upgrade" key={item}><b>{String(index+1).padStart(3,"0")}</b><span>{item.replace(/^Upgrade \\d+: /,"")}</span></div>)}</div></Panel></div>; }

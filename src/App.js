import { useState, useEffect, useRef, useCallback } from "react";

// ── constants ──────────────────────────────────────────────────────────────
const STREAMS = [
  { id:"ctv",     label:"CTV",     icon:"📺", color:"#8B5CF6", light:"#EDE9FE", dark:"#5B21B6" },
  { id:"audio",   label:"Audio",   icon:"🎙️", color:"#06B6D4", light:"#CFFAFE", dark:"#0E7490" },
  { id:"display", label:"Display", icon:"🖼️", color:"#F59E0B", light:"#FEF3C7", dark:"#B45309" },
  { id:"live",    label:"Live",    icon:"📡", color:"#EF4444", light:"#FEE2E2", dark:"#B91C1C" },
];
const DSPS      = ["The Trade Desk","DV360","Xandr","Amazon DSP","MediaMath"];
const PUBS      = ["PubA – Sports Network","PubB – News Today","PubC – LifeStream","PubD – TechTV","PubE – MusicFM"];
const IAB_CATS  = ["IAB17 Sports","IAB12 News","IAB19 Tech","IAB7 Health","IAB1 Arts","IAB20 Travel","IAB2 Auto","IAB3 Business"];
const EMOTIONS  = ["Excited","Engaged","Curious","Neutral","Relaxed","Inspired"];
const GENRES    = ["Sports","News","Drama","Documentary","Finance","Lifestyle","Reality","Comedy"];
const SEGS      = ["Sports Fans","News Readers","Tech Enthusiasts","Auto Intenders","Health Conscious","Lifestyle Seekers"];
const PLACES    = ["Pre-roll","Mid-roll","Overlay","Pause Ad","Post-roll","Companion"];
const COUNTRIES = ["US","UK","DE","IN","AU","CA","FR","BR"];

function r(a){ return a[Math.floor(Math.random()*a.length)]; }
function rn(a,b){ return Math.floor(Math.random()*(b-a+1))+a; }
function rf(a,b){ return +(Math.random()*(b-a)+a).toFixed(2); }
function uid(){ return Math.random().toString(36).slice(2,9); }
function ts(){ return new Date().toLocaleTimeString("en-US",{hour12:false}); }

function mkSignal(){
  const bs = rn(68,99);
  const lat = rn(8,32);
  const stream = r(STREAMS);
  return {
    id: uid(), stream, ts: Date.now(), tsStr: ts(),
    pub: r(PUBS), dsp: r(DSPS), country: r(COUNTRIES),
    iab: r(IAB_CATS), genre: r(GENRES), emotion: r(EMOTIONS),
    segment: r(SEGS), placement: r(PLACES),
    keywords: [r(["AI","sports","health","finance","travel","tech"]), r(["premium","trending","live","breaking"]), r(["2025","global","weekly","daily"])],
    bs, bsLabel: bs>=90?"Safe":bs>=75?"Moderate":"Review",
    bidMul: rf(0.6,2.9), cpm: rf(2.1,18.4),
    score: rn(58,99), match: rn(55,98),
    lat, impId: "imp_"+uid(),
    revenue: rf(0.001,0.04),
    adtelligent: { aid: rn(100000,999999), channelId: rn(1000,9999), sourceId: rn(10000,99999) },
    c1: bs.toString(), c2: "", c3: "", c4: "", c5: "", c6: "",
  };
}

// ── sparkline component ───────────────────────────────────────────────────
function Spark({ data=[], color="#8B5CF6", height=36 }){
  if(!data.length) return <div style={{height}}/>;
  const max = Math.max(...data,1);
  return (
    <svg width="100%" height={height} style={{display:"block"}}>
      {data.map((v,i)=>{
        const x = (i/(data.length-1||1))*100+"%";
        const h = Math.max(2,(v/max)*(height-4));
        return <rect key={i} x={x} y={height-h} width="3" height={h} fill={color} opacity={0.7} rx="1"/>;
      })}
      <polyline
        points={data.map((v,i)=>((i/(data.length-1||1))*100)+"% "+(height-Math.max(2,(v/max)*(height-4)))).join(", ")}
        fill="none" stroke={color} strokeWidth="1.5" opacity="0.5"
      />
    </svg>
  );
}

// ── mini donut ────────────────────────────────────────────────────────────
function Donut({ pct=75, color="#8B5CF6", size=48 }){
  const r2=18, c=size/2, circ=2*Math.PI*r2;
  return (
    <svg width={size} height={size}>
      <circle cx={c} cy={c} r={r2} fill="none" stroke="#E5E7EB" strokeWidth="4"/>
      <circle cx={c} cy={c} r={r2} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={circ} strokeDashoffset={circ*(1-pct/100)}
        strokeLinecap="round" transform={"rotate(-90 "+c+" "+c+")"}/>
      <text x={c} y={c+4} textAnchor="middle" fontSize="11" fontWeight="600" fill={color}>{pct}%</text>
    </svg>
  );
}

// ── stat card ─────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color="#8B5CF6", spark=[], icon }){
  return (
    <div style={{background:"#fff",borderRadius:14,padding:"16px 18px",boxShadow:"0 1px 4px rgba(0,0,0,.07)",border:"1px solid #F3F4F6",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:0,left:0,width:3,height:"100%",background:color,borderRadius:"4px 0 0 4px"}}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
        <div style={{fontSize:11,color:"#6B7280",fontWeight:500,letterSpacing:.3}}>{label.toUpperCase()}</div>
        {icon && <span style={{fontSize:16,opacity:.7}}>{icon}</span>}
      </div>
      <div style={{fontSize:26,fontWeight:700,color:"#111827",lineHeight:1.1,marginBottom:3}}>{value}</div>
      {sub && <div style={{fontSize:11,color:"#9CA3AF"}}>{sub}</div>}
      {spark.length>0 && <div style={{marginTop:8}}><Spark data={spark} color={color} height={32}/></div>}
    </div>
  );
}

// ── badge ─────────────────────────────────────────────────────────────────
function Badge({ label, color, bg }){
  return <span style={{fontSize:10,background:bg||"#F3F4F6",color:color||"#374151",padding:"2px 7px",borderRadius:20,fontWeight:500,whiteSpace:"nowrap"}}>{label}</span>;
}

// ── main ──────────────────────────────────────────────────────────────────
export default function App(){
  const [signals,  setSignals]  = useState([]);
  const [active,   setActive]   = useState({ctv:true,audio:true,display:true,live:true});
  const [running,  setRunning]  = useState(true);
  const [tab,      setTab]      = useState("overview");
  const [selSig,   setSelSig]   = useState(null);
  const [speed,    setSpeed]    = useState(1500);
  const [sens,     setSens]     = useState(72);

  // rolling stats
  const [totals, setTotals] = useState({ reqs:0, enriched:0, blocked:0, revenue:0 });
  const [latArr,  setLatArr]  = useState([]);
  const [cpmArr,  setCpmArr]  = useState([]);
  const [reqArr,  setReqArr]  = useState([]);
  const [streamCounts, setStreamCounts] = useState({ctv:0,audio:0,display:0,live:0});
  const [dspCounts, setDspCounts] = useState({});
  const [pubCounts, setPubCounts] = useState({});
  const [segCounts, setSegCounts] = useState({});
  const [bsSafe, setBsSafe] = useState(0);
  const [bsMod,  setBsMod]  = useState(0);
  const [bsRev,  setBsRev]  = useState(0);

  const tick = useCallback(()=>{
    const activeList = STREAMS.filter(s=>active[s.id]);
    if(!activeList.length) return;
    const sig = mkSignal();
    if(!active[sig.stream.id]) return;
    const pass = sig.bs >= sens*0.78;
    sig.c1 = sig.bs.toString();
    sig.c2 = sig.iab.split(" ")[0];
    sig.c3 = sig.emotion;
    sig.c4 = sig.segment.replace(/ /g,"_");
    sig.c5 = sig.bidMul.toString();
    sig.c6 = sig.score.toString();

    if(!pass){
      setTotals(p=>({...p,reqs:p.reqs+1,blocked:p.blocked+1}));
      return;
    }
    setSignals(p=>[sig,...p].slice(0,80));
    setSelSig(sig);
    setTotals(p=>({...p,reqs:p.reqs+1,enriched:p.enriched+1,revenue:+(p.revenue+sig.revenue).toFixed(4)}));
    setLatArr(p=>[...p.slice(-29),sig.lat]);
    setCpmArr(p=>[...p.slice(-29),sig.cpm]);
    setReqArr(p=>[...p.slice(-29),1]);
    setStreamCounts(p=>({...p,[sig.stream.id]:(p[sig.stream.id]||0)+1}));
    setDspCounts(p=>({...p,[sig.dsp]:(p[sig.dsp]||0)+1}));
    setPubCounts(p=>({...p,[sig.pub]:(p[sig.pub]||0)+1}));
    setSegCounts(p=>({...p,[sig.segment]:(p[sig.segment]||0)+1}));
    setBsSafe(p=>sig.bsLabel==="Safe"?p+1:p);
    setBsMod(p=>sig.bsLabel==="Moderate"?p+1:p);
    setBsRev(p=>sig.bsLabel==="Review"?p+1:p);
  },[active,sens]);

  useEffect(()=>{
    if(!running) return;
    const id = setInterval(tick,speed);
    return ()=>clearInterval(id);
  },[running,tick,speed]);

  const avgLat = latArr.length ? (latArr.reduce((a,b)=>a+b,0)/latArr.length).toFixed(1) : "—";
  const avgCpm = cpmArr.length ? (cpmArr.reduce((a,b)=>a+b,0)/cpmArr.length).toFixed(2) : "—";
  const enrichRate = totals.reqs ? Math.round((totals.enriched/totals.reqs)*100) : 0;
  const bsTotal = bsSafe+bsMod+bsRev||1;

  const TABS = [
    {id:"overview",label:"Overview"},
    {id:"feed",label:"Signal Feed"},
    {id:"publishers",label:"Publishers"},
    {id:"demand",label:"Demand"},
    {id:"integration",label:"Adtelligent"},
    {id:"webhook",label:"Webhook Tester"},
    {id:"market",label:"Market & Positioning"},
  ];

  const topDsps = Object.entries(dspCounts).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const topPubs = Object.entries(pubCounts).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const topSegs = Object.entries(segCounts).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const maxDsp  = topDsps[0]?.[1]||1;
  const maxPub  = topPubs[0]?.[1]||1;
  const maxSeg  = topSegs[0]?.[1]||1;

  // ── shared styles
  const card = {background:"#fff",borderRadius:14,padding:"18px 20px",boxShadow:"0 1px 4px rgba(0,0,0,.07)",border:"1px solid #F3F4F6"};
  const tabBtn = (id)=>({
    padding:"8px 16px",border:"none",borderBottom:"2.5px solid "+(tab===id?"#8B5CF6":"transparent"),
    background:"transparent",color:tab===id?"#8B5CF6":"#6B7280",cursor:"pointer",
    fontSize:13,fontWeight:tab===id?600:400,transition:"all .15s",whiteSpace:"nowrap",
  });
  const sideBtn = (id)=>({
    display:"flex",alignItems:"center",gap:8,padding:"7px 10px",borderRadius:8,marginBottom:4,
    cursor:"pointer",border:"1px solid "+(active[id]?STREAMS.find(s=>s.id===id).color:"#E5E7EB"),
    background:active[id]?STREAMS.find(s=>s.id===id).light:"transparent",transition:"all .2s",
  });

  // ── Webhook tester state ──
  const [wbAid,    setWbAid]    = useState("478241");
  const [wbPub,    setWbPub]    = useState("pub_1234");
  const [wbStream, setWbStream] = useState("ctv");
  const [wbCpm,    setWbCpm]    = useState("8.40");
  const [wbKey,    setWbKey]    = useState("ctx_live_XXXXXXXXXXXX");
  const [wbLog,    setWbLog]    = useState([]);
  const [wbFiring, setWbFiring] = useState(false);
  const [wbResult, setWbResult] = useState(null);
  const [adsCfg,   setAdsCfg]   = useState({ adserver:"gam", endpoint:"", keyvals:true, openrtb:true, prebid:false });

  const fireTestWebhook = ()=>{
    setWbFiring(true);
    setWbResult(null);
    const start = Date.now();
    // Simulate parallel pipeline stages with timeouts
    const stages = [
      { name:"VAST tag intercepted",       ms:60,  color:"#10B981", detail:"Adtelligent VAST request captured" },
      { name:"Stream classified",          ms:180, color:"#8B5CF6", detail:"IAB · emotion · brand safety scored" },
      { name:"Signal cached (Redis)",      ms:220, color:"#06B6D4", detail:"Written to edge cache, TTL 30s" },
      { name:"c1–c6 params injected",      ms:280, color:"#F59E0B", detail:"Scores appended to VAST tag URL" },
      { name:"Webhook fired to engine",    ms:360, color:"#8B5CF6", detail:"POST → api.contextengine.io/v1/ingest" },
      { name:"Dashboard signal received",  ms:420, color:"#10B981", detail:"Live feed updated ✓" },
    ];
    const sig = mkSignal();
    sig.adtelligent = { aid: +wbAid, channelId: rn(1000,9999), sourceId: rn(10000,99999) };
    sig.c1 = sig.bs.toString();
    sig.c2 = sig.iab.split(" ")[0];
    sig.c3 = sig.emotion;
    sig.c4 = sig.segment.replace(/ /g,"_");
    sig.c5 = sig.bidMul.toString();
    sig.c6 = sig.score.toString();

    setWbLog([]);
    stages.forEach((stage, i) => {
      setTimeout(()=>{
        setWbLog(p=>[...p, { ...stage, elapsed: stage.ms }]);
        if(i===stages.length-1){
          setWbFiring(false);
          setWbResult(sig);
          setSignals(p=>[sig,...p].slice(0,80));
          setSelSig(sig);
          setTotals(p=>({...p,reqs:p.reqs+1,enriched:p.enriched+1,revenue:+(p.revenue+sig.revenue).toFixed(4)}));
          setLatArr(p=>[...p.slice(-29),sig.lat]);
          setCpmArr(p=>[...p.slice(-29),sig.cpm]);
          setStreamCounts(p=>({...p,[sig.stream.id]:(p[sig.stream.id]||0)+1}));
        }
      }, stage.ms);
    });
  };

  const IntegrationTag = ()=>{
    const lines = [
      "<!-- Step 1: Add to your Adtelligent Source Tag Constructor -->",
      "<!-- Content macros Adtelligent will auto-fill: -->",
      "&content_genre={content_genre}",
      "&content_categories={content_categories}",
      "&content_keywords={content_keywords}",
      "&content_livestream={content_livestream}",
      "&site_url={site_url}",
      "&app_name={app_name}",
      "&cb={cb}",
      "",
      "<!-- Step 2: Context Engine scores injected into c1-c6 slots -->",
      "&c1={c1}   (brand_safety_score: "+((selSig&&selSig.c1)||"94")+")",
      "&c2={c2}   (iab_category: "+((selSig&&selSig.c2)||"IAB17")+")",
      "&c3={c3}   (emotion: "+((selSig&&selSig.c3)||"Excited")+")",
      "&c4={c4}   (audience_segment: "+((selSig&&selSig.c4)||"Sports_Fans")+")",
      "&c5={c5}   (bid_multiplier: "+((selSig&&selSig.c5)||"1.8")+")",
      "&c6={c6}   (context_score: "+((selSig&&selSig.c6)||"87")+")",
      "",
      "<!-- Step 3: Full enriched VAST tag URL example -->",
      "https://ssp.adtelligent.com/vast",
      "  ?aid="+((selSig&&selSig.adtelligent.aid)||"478241"),
      "  &pub.id="+((selSig&&selSig.adtelligent.channelId)||"1234"),
      "  &site_url={site_url}",
      "  &app_name={app_name}",
      "  &content_genre={content_genre}",
      "  &cb={cb}",
      "  &c1="+((selSig&&selSig.c1)||"94"),
      "  &c2="+((selSig&&selSig.c2)||"IAB17"),
      "  &c3="+((selSig&&selSig.c3)||"Excited"),
      "  &c4="+((selSig&&selSig.c4)||"Sports_Fans"),
      "  &c5="+((selSig&&selSig.c5)||"1.8"),
      "  &c6="+((selSig&&selSig.c6)||"87"),
    ];
    return lines.join("\n");
  };

  return (
    <div style={{fontFamily:"'Inter',system-ui,sans-serif",fontSize:13,background:"#F9FAFB",minHeight:"100vh",display:"flex",flexDirection:"column"}}>

      {/* ── HEADER ── */}
      <div style={{background:"linear-gradient(135deg,#1E1B4B 0%,#312E81 60%,#4C1D95 100%)",padding:"0 24px",display:"flex",alignItems:"center",gap:16,height:56,flexShrink:0,boxShadow:"0 2px 12px rgba(0,0,0,.25)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:32,height:32,borderRadius:8,background:"rgba(255,255,255,.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17}}>📡</div>
          <div>
            <div style={{color:"#fff",fontWeight:700,fontSize:15,letterSpacing:-.2}}>CTV + Audio Context Engine</div>
            <div style={{color:"rgba(255,255,255,.5)",fontSize:10,letterSpacing:.3}}>ADTELLIGENT SSP · PARALLEL SCORING</div>
          </div>
        </div>
        <div style={{marginLeft:16,display:"flex",gap:6}}>
          {STREAMS.map(s=>(
            <div key={s.id} style={{...sideBtn(s.id),marginBottom:0}} onClick={()=>setActive(p=>({...p,[s.id]:!p[s.id]}))}>
              <span style={{fontSize:13}}>{s.icon}</span>
              <span style={{fontSize:11,color:active[s.id]?s.dark:"#9CA3AF",fontWeight:active[s.id]?600:400}}>{s.label}</span>
              <span style={{width:6,height:6,borderRadius:"50%",background:active[s.id]?s.color:"#D1D5DB",boxShadow:active[s.id]?"0 0 6px "+s.color:"none"}}/>
            </div>
          ))}
        </div>
        <div style={{marginLeft:"auto",display:"flex",gap:10,alignItems:"center"}}>
          <div style={{display:"flex",gap:14,fontSize:12,color:"rgba(255,255,255,.8)"}}>
            {[["SIGNALS",totals.reqs],["ENRICHED",totals.enriched],["BLOCKED",totals.blocked],["AVG LAT",avgLat+"ms"],["REVENUE","$"+totals.revenue]].map(([l,v])=>(
              <div key={l} style={{textAlign:"center"}}>
                <div style={{fontWeight:700,fontSize:15,color:"#fff"}}>{v}</div>
                <div style={{fontSize:9,letterSpacing:.5,opacity:.6}}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{width:1,height:32,background:"rgba(255,255,255,.15)",margin:"0 4px"}}/>
          <select value={speed} onChange={e=>setSpeed(+e.target.value)} style={{fontSize:11,background:"rgba(255,255,255,.12)",color:"#fff",border:"1px solid rgba(255,255,255,.2)",borderRadius:6,padding:"4px 8px"}}>
            <option value={600}>Fast</option>
            <option value={1500}>Normal</option>
            <option value={3000}>Slow</option>
          </select>
          <button onClick={()=>setRunning(r=>!r)} style={{padding:"5px 14px",borderRadius:7,border:"1px solid rgba(255,255,255,.25)",background:running?"rgba(239,68,68,.25)":"rgba(34,197,94,.25)",color:"#fff",cursor:"pointer",fontWeight:600,fontSize:11}}>
            {running?"⏸ Pause":"▶ Live"}
          </button>
        </div>
      </div>

      {/* ── TABS ── */}
      <div style={{borderBottom:"1px solid #E5E7EB",background:"#fff",padding:"0 24px",display:"flex",gap:4,overflowX:"auto",flexShrink:0}}>
        {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={tabBtn(t.id)}>{t.label}</button>)}
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8,padding:"6px 0"}}>
          <span style={{fontSize:11,color:"#9CA3AF"}}>Sensitivity</span>
          <input type="range" min={40} max={99} value={sens} onChange={e=>setSens(+e.target.value)} style={{width:80}}/>
          <span style={{fontSize:11,fontWeight:600,color:"#374151",minWidth:28}}>{sens}%</span>
        </div>
      </div>

      <div style={{flex:1,display:"flex",overflow:"hidden"}}>
        <div style={{flex:1,overflowY:"auto",padding:20}}>

          {/* ══ OVERVIEW ══ */}
          {tab==="overview" && (
            <div>
              {/* KPI row */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:18}}>
                <StatCard label="Total Requests" value={totals.reqs.toLocaleString()} sub="Since session start" color="#8B5CF6" icon="📊" spark={reqArr}/>
                <StatCard label="Enrichment Rate" value={enrichRate+"%"} sub={totals.enriched+" enriched"} color="#06B6D4" icon="⚡"/>
                <StatCard label="Avg CPM" value={"$"+avgCpm} sub="Across all streams" color="#F59E0B" icon="💰" spark={cpmArr}/>
                <StatCard label="Avg Latency" value={avgLat+"ms"} sub="Context engine pipeline" color="#10B981" icon="⏱️" spark={latArr}/>
              </div>

              {/* Row 2 */}
              <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:14,marginBottom:18}}>
                {/* Stream distribution */}
                <div style={card}>
                  <div style={{fontWeight:600,fontSize:13,marginBottom:14,color:"#111827"}}>Stream Distribution</div>
                  {STREAMS.map(s=>{
                    const cnt = streamCounts[s.id]||0;
                    const pct = totals.enriched ? Math.round((cnt/totals.enriched)*100) : 0;
                    return (
                      <div key={s.id} style={{marginBottom:12}}>
                        <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
                          <span style={{display:"flex",alignItems:"center",gap:6}}><span>{s.icon}</span><span style={{color:"#374151"}}>{s.label}</span></span>
                          <span style={{fontWeight:600,color:s.color}}>{cnt.toLocaleString()} <span style={{color:"#9CA3AF",fontWeight:400}}>({pct}%)</span></span>
                        </div>
                        <div style={{height:6,background:"#F3F4F6",borderRadius:3}}>
                          <div style={{height:"100%",width:pct+"%",background:s.color,borderRadius:3,transition:"width .4s"}}/>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Brand safety */}
                <div style={{...card,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10}}>
                  <div style={{fontWeight:600,fontSize:13,color:"#111827",alignSelf:"flex-start"}}>Brand Safety</div>
                  <Donut pct={Math.round((bsSafe/bsTotal)*100)} color="#10B981" size={80}/>
                  <div style={{width:"100%"}}>
                    {[["Safe",bsSafe,"#10B981","#D1FAE5"],["Moderate",bsMod,"#F59E0B","#FEF3C7"],["Review",bsRev,"#EF4444","#FEE2E2"]].map(([l,v,c,bg])=>(
                      <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 0",borderBottom:"1px solid #F9FAFB"}}>
                        <span style={{display:"flex",alignItems:"center",gap:5}}><span style={{width:8,height:8,borderRadius:"50%",background:c,display:"inline-block"}}/><span style={{color:"#374151",fontSize:11}}>{l}</span></span>
                        <Badge label={v} color={c} bg={bg}/>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Session revenue */}
                <div style={{...card,display:"flex",flexDirection:"column",gap:8}}>
                  <div style={{fontWeight:600,fontSize:13,color:"#111827"}}>Session Revenue</div>
                  <div style={{fontSize:32,fontWeight:800,color:"#8B5CF6"}}>${totals.revenue.toFixed(3)}</div>
                  <div style={{fontSize:11,color:"#9CA3AF"}}>From enriched impressions</div>
                  <Spark data={cpmArr} color="#8B5CF6" height={48}/>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:4}}>
                    {[["Avg CPM","$"+avgCpm,"#06B6D4"],["Blocked",totals.blocked,"#EF4444"]].map(([l,v,c])=>(
                      <div key={l} style={{background:"#F9FAFB",borderRadius:8,padding:"8px 10px"}}>
                        <div style={{fontSize:10,color:"#9CA3AF"}}>{l}</div>
                        <div style={{fontSize:16,fontWeight:700,color:c}}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Live signal ticker */}
              <div style={card}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                  <div style={{fontWeight:600,fontSize:13,color:"#111827"}}>Live Signal Ticker</div>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <span style={{width:7,height:7,borderRadius:"50%",background:"#10B981",display:"inline-block",boxShadow:"0 0 0 3px rgba(16,185,129,.2)"}}/>
                    <span style={{fontSize:11,color:"#10B981",fontWeight:500}}>Streaming</span>
                  </div>
                </div>
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
                    <thead>
                      <tr style={{borderBottom:"1px solid #F3F4F6"}}>
                        {["Time","Stream","Publisher","IAB","Emotion","Segment","CPM","Bid Mul","Brand Safety","Latency","DSP"].map(h=>(
                          <th key={h} style={{padding:"6px 10px",color:"#9CA3AF",fontWeight:500,textAlign:"left",whiteSpace:"nowrap"}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {signals.slice(0,12).map((sig,i)=>(
                        <tr key={sig.id} onClick={()=>setSelSig(sig)} style={{borderBottom:"1px solid #F9FAFB",cursor:"pointer",background:i===0?"rgba(139,92,246,.03)":"transparent",transition:"background .15s"}}>
                          <td style={{padding:"7px 10px",color:"#9CA3AF",fontFamily:"monospace"}}>{sig.tsStr}</td>
                          <td style={{padding:"7px 10px"}}><Badge label={sig.stream.icon+" "+sig.stream.label} color={sig.stream.dark} bg={sig.stream.light}/></td>
                          <td style={{padding:"7px 10px",color:"#374151",maxWidth:130,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{sig.pub}</td>
                          <td style={{padding:"7px 10px"}}><Badge label={sig.iab}/></td>
                          <td style={{padding:"7px 10px",color:"#374151"}}>{sig.emotion}</td>
                          <td style={{padding:"7px 10px",color:"#374151",whiteSpace:"nowrap"}}>{sig.segment}</td>
                          <td style={{padding:"7px 10px",fontWeight:600,color:"#059669"}}>${sig.cpm}</td>
                          <td style={{padding:"7px 10px",fontWeight:600,color:"#7C3AED"}}>{sig.bidMul}x</td>
                          <td style={{padding:"7px 10px"}}>
                            <Badge label={sig.bsLabel+" "+sig.bs} color={sig.bsLabel==="Safe"?"#059669":sig.bsLabel==="Moderate"?"#D97706":"#DC2626"} bg={sig.bsLabel==="Safe"?"#D1FAE5":sig.bsLabel==="Moderate"?"#FEF3C7":"#FEE2E2"}/>
                          </td>
                          <td style={{padding:"7px 10px",color:sig.lat<20?"#059669":sig.lat<35?"#D97706":"#DC2626",fontWeight:600,fontFamily:"monospace"}}>{sig.lat}ms</td>
                          <td style={{padding:"7px 10px",color:"#6B7280"}}>{sig.dsp}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {signals.length===0 && <div style={{textAlign:"center",padding:"32px 0",color:"#9CA3AF"}}>Enable streams to start receiving signals</div>}
                </div>
              </div>
            </div>
          )}

          {/* ══ SIGNAL FEED ══ */}
          {tab==="feed" && (
            <div style={{display:"grid",gridTemplateColumns:"1fr 340px",gap:16}}>
              <div>
                {signals.length===0 && <div style={{...card,textAlign:"center",padding:"60px 0",color:"#9CA3AF"}}>Enable streams to start receiving signals</div>}
                {signals.map((sig,i)=>{
                  const s = sig.stream;
                  const isSel = selSig&&selSig.id===sig.id;
                  return (
                    <div key={sig.id} onClick={()=>setSelSig(sig)} style={{...card,marginBottom:10,borderLeft:"4px solid "+s.color,cursor:"pointer",outline:isSel?"2px solid "+s.color:"none",outlineOffset:1,padding:"12px 16px"}}>
                      <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:8,flexWrap:"wrap"}}>
                        <Badge label={s.icon+" "+s.label} color={s.dark} bg={s.light}/>
                        <Badge label={sig.iab}/>
                        <Badge label={sig.genre}/>
                        <Badge label={sig.emotion} color="#7C3AED" bg="#EDE9FE"/>
                        <span style={{marginLeft:"auto",fontSize:10,color:"#9CA3AF",fontFamily:"monospace"}}>{sig.tsStr}</span>
                      </div>
                      <div style={{fontSize:11,color:"#6B7280",marginBottom:8}}>{sig.pub} · {sig.dsp} · {sig.country}</div>
                      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>
                        {sig.keywords.map(k=><Badge key={k} label={k}/>)}
                        <Badge label={sig.segment} color="#0E7490" bg="#CFFAFE"/>
                        <Badge label={sig.placement}/>
                      </div>
                      <div style={{display:"flex",gap:16,fontSize:11,alignItems:"center",flexWrap:"wrap"}}>
                        <span style={{color:"#374151"}}>CPM <b style={{color:"#059669"}}>${sig.cpm}</b></span>
                        <span style={{color:"#374151"}}>Bid <b style={{color:"#7C3AED"}}>{sig.bidMul}x</b></span>
                        <span style={{color:"#374151"}}>Score <b>{sig.score}</b></span>
                        <span style={{color:"#374151"}}>Match <b>{sig.match}%</b></span>
                        <span style={{color:"#374151"}}>Lat <b style={{color:sig.lat<20?"#059669":sig.lat<35?"#D97706":"#DC2626"}}>{sig.lat}ms</b></span>
                        <span style={{marginLeft:"auto"}}>
                          <Badge label={"● "+sig.bsLabel+" ("+sig.bs+")"} color={sig.bsLabel==="Safe"?"#059669":sig.bsLabel==="Moderate"?"#D97706":"#DC2626"} bg={sig.bsLabel==="Safe"?"#D1FAE5":sig.bsLabel==="Moderate"?"#FEF3C7":"#FEE2E2"}/>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* inspector */}
              <div style={{position:"sticky",top:0,alignSelf:"flex-start"}}>
                <div style={{...card,marginBottom:12}}>
                  <div style={{fontWeight:600,fontSize:13,color:"#111827",marginBottom:12}}>Signal Inspector</div>
                  {selSig ? (
                    <>
                      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
                        <Badge label={selSig.stream.icon+" "+selSig.stream.label} color={selSig.stream.dark} bg={selSig.stream.light}/>
                        <Badge label={selSig.bsLabel} color={selSig.bsLabel==="Safe"?"#059669":selSig.bsLabel==="Moderate"?"#D97706":"#DC2626"} bg={selSig.bsLabel==="Safe"?"#D1FAE5":selSig.bsLabel==="Moderate"?"#FEF3C7":"#FEE2E2"}/>
                        <Badge label={selSig.lat+"ms"} color={selSig.lat<20?"#059669":"#D97706"} bg={selSig.lat<20?"#D1FAE5":"#FEF3C7"}/>
                      </div>
                      {[["Publisher",selSig.pub],["DSP",selSig.dsp],["IAB",selSig.iab],["Genre",selSig.genre],["Emotion",selSig.emotion],["Audience",selSig.segment],["Placement",selSig.placement],["CPM","$"+selSig.cpm],["Bid Mul",selSig.bidMul+"x"],["Score",selSig.score],["Match",selSig.match+"%"],["Brand Safety",selSig.bsLabel+" ("+selSig.bs+")"],["Country",selSig.country],["Imp ID",selSig.impId]].map(([l,v])=>(
                        <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #F9FAFB",fontSize:11}}>
                          <span style={{color:"#9CA3AF"}}>{l}</span>
                          <span style={{fontWeight:500,color:"#111827",textAlign:"right",maxWidth:160,overflow:"hidden",textOverflow:"ellipsis"}}>{v}</span>
                        </div>
                      ))}
                      <div style={{marginTop:12}}>
                        <div style={{fontSize:10,color:"#9CA3AF",fontWeight:500,letterSpacing:.5,marginBottom:6}}>ADTELLIGENT c1–c6 PARAMS</div>
                        {[["c1 (brand_safety)",selSig.c1],["c2 (iab)",selSig.c2],["c3 (emotion)",selSig.c3],["c4 (audience)",selSig.c4],["c5 (bid_mul)",selSig.c5],["c6 (score)",selSig.c6]].map(([l,v])=>(
                          <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",fontSize:10}}>
                            <span style={{color:"#9CA3AF",fontFamily:"monospace"}}>{l}</span>
                            <span style={{fontWeight:600,color:"#7C3AED",fontFamily:"monospace"}}>{v}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : <div style={{color:"#9CA3AF",textAlign:"center",padding:"24px 0",fontSize:12}}>Click a signal card to inspect</div>}
                </div>
              </div>
            </div>
          )}

          {/* ══ PUBLISHERS ══ */}
          {tab==="publishers" && (
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              <div style={card}>
                <div style={{fontWeight:600,fontSize:13,color:"#111827",marginBottom:14}}>Top Publishers by Volume</div>
                {topPubs.length===0 && <div style={{color:"#9CA3AF",textAlign:"center",padding:"24px 0"}}>Collecting data...</div>}
                {topPubs.map(([pub,cnt],i)=>(
                  <div key={pub} style={{marginBottom:14}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
                      <span style={{color:"#374151",display:"flex",alignItems:"center",gap:6}}><span style={{width:18,height:18,borderRadius:"50%",background:["#8B5CF6","#06B6D4","#F59E0B","#EF4444","#10B981"][i],color:"#fff",fontSize:9,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,flexShrink:0}}>{i+1}</span>{pub}</span>
                      <span style={{fontWeight:600,color:"#111827"}}>{cnt}</span>
                    </div>
                    <div style={{height:6,background:"#F3F4F6",borderRadius:3}}>
                      <div style={{height:"100%",width:Math.round((cnt/maxPub)*100)+"%",background:["#8B5CF6","#06B6D4","#F59E0B","#EF4444","#10B981"][i],borderRadius:3,transition:"width .4s"}}/>
                    </div>
                  </div>
                ))}
              </div>

              <div style={card}>
                <div style={{fontWeight:600,fontSize:13,color:"#111827",marginBottom:14}}>Audience Segments</div>
                {topSegs.length===0 && <div style={{color:"#9CA3AF",textAlign:"center",padding:"24px 0"}}>Collecting data...</div>}
                {topSegs.map(([seg,cnt],i)=>(
                  <div key={seg} style={{marginBottom:14}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
                      <span style={{color:"#374151"}}>{seg}</span>
                      <span style={{fontWeight:600,color:"#111827"}}>{Math.round((cnt/(totals.enriched||1))*100)}%</span>
                    </div>
                    <div style={{height:6,background:"#F3F4F6",borderRadius:3}}>
                      <div style={{height:"100%",width:Math.round((cnt/maxSeg)*100)+"%",background:["#06B6D4","#8B5CF6","#10B981","#F59E0B","#EF4444"][i],borderRadius:3,transition:"width .4s"}}/>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{...card,gridColumn:"1/-1"}}>
                <div style={{fontWeight:600,fontSize:13,color:"#111827",marginBottom:14}}>Per-Publisher Performance</div>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
                  <thead>
                    <tr style={{borderBottom:"1px solid #F3F4F6"}}>
                      {["Publisher","Signals","Avg CPM","Enrichment Rate","Brand Safety","Top Segment"].map(h=>(
                        <th key={h} style={{padding:"6px 10px",color:"#9CA3AF",fontWeight:500,textAlign:"left"}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {PUBS.map((pub,i)=>{
                      const cnt = pubCounts[pub]||0;
                      const cpm = (rf(4,16)).toFixed(2);
                      const er  = rn(72,97);
                      const bs2 = rn(78,98);
                      return (
                        <tr key={pub} style={{borderBottom:"1px solid #F9FAFB"}}>
                          <td style={{padding:"8px 10px",fontWeight:500,color:"#374151"}}>{pub}</td>
                          <td style={{padding:"8px 10px",color:"#111827"}}>{cnt}</td>
                          <td style={{padding:"8px 10px",color:"#059669",fontWeight:600}}>${cpm}</td>
                          <td style={{padding:"8px 10px"}}><Badge label={er+"%"} color="#7C3AED" bg="#EDE9FE"/></td>
                          <td style={{padding:"8px 10px"}}><Badge label={bs2} color={bs2>=90?"#059669":"#D97706"} bg={bs2>=90?"#D1FAE5":"#FEF3C7"}/></td>
                          <td style={{padding:"8px 10px",color:"#6B7280"}}>{r(SEGS)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══ DEMAND ══ */}
          {tab==="demand" && (
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              <div style={card}>
                <div style={{fontWeight:600,fontSize:13,color:"#111827",marginBottom:14}}>DSP Signal Distribution</div>
                {topDsps.length===0 && <div style={{color:"#9CA3AF",textAlign:"center",padding:"24px 0"}}>Collecting data...</div>}
                {topDsps.map(([dsp,cnt],i)=>(
                  <div key={dsp} style={{marginBottom:14}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
                      <span style={{color:"#374151"}}>{dsp}</span>
                      <span style={{fontWeight:600,color:"#111827"}}>{cnt} <span style={{color:"#9CA3AF",fontWeight:400}}>signals</span></span>
                    </div>
                    <div style={{height:6,background:"#F3F4F6",borderRadius:3}}>
                      <div style={{height:"100%",width:Math.round((cnt/maxDsp)*100)+"%",background:["#8B5CF6","#06B6D4","#F59E0B","#EF4444","#10B981"][i],borderRadius:3,transition:"width .4s"}}/>
                    </div>
                  </div>
                ))}
              </div>

              <div style={card}>
                <div style={{fontWeight:600,fontSize:13,color:"#111827",marginBottom:14}}>Bid Multiplier Impact</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  {[["Avg Bid Multiplier","1.64x","#8B5CF6"],["Floor CPM Lift","+38%","#10B981"],["Win Rate","71%","#06B6D4"],["Blocked Bids",totals.blocked,"#EF4444"]].map(([l,v,c])=>(
                    <div key={l} style={{background:"#F9FAFB",borderRadius:10,padding:"12px 14px"}}>
                      <div style={{fontSize:10,color:"#9CA3AF",marginBottom:4}}>{l}</div>
                      <div style={{fontSize:22,fontWeight:700,color:c}}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{marginTop:16}}>
                  <div style={{fontSize:11,color:"#9CA3AF",marginBottom:8}}>Bid multiplier distribution</div>
                  {[["0.6–1.0x","Low context","#F3F4F6","#6B7280",22],["1.0–1.5x","Medium","#EDE9FE","#7C3AED",35],["1.5–2.0x","High context","#CFFAFE","#0E7490",28],["2.0x+","Premium","#D1FAE5","#059669",15]].map(([range,label,bg,color,pct])=>(
                    <div key={range} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                      <span style={{fontSize:11,fontFamily:"monospace",color:"#374151",minWidth:70}}>{range}</span>
                      <div style={{flex:1,height:8,background:"#F3F4F6",borderRadius:4}}>
                        <div style={{height:"100%",width:pct+"%",background:color,borderRadius:4}}/>
                      </div>
                      <span style={{fontSize:11,color:"#9CA3AF",minWidth:30}}>{pct}%</span>
                      <Badge label={label} color={color} bg={bg}/>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{...card,gridColumn:"1/-1"}}>
                <div style={{fontWeight:600,fontSize:13,color:"#111827",marginBottom:14}}>DSP Performance Table</div>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
                  <thead>
                    <tr style={{borderBottom:"1px solid #F3F4F6"}}>
                      {["DSP","Signals","Avg CPM","Avg Bid Mul","Win Rate","Brand Safety Pass","Top IAB"].map(h=>(
                        <th key={h} style={{padding:"6px 10px",color:"#9CA3AF",fontWeight:500,textAlign:"left"}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DSPS.map(dsp=>(
                      <tr key={dsp} style={{borderBottom:"1px solid #F9FAFB"}}>
                        <td style={{padding:"8px 10px",fontWeight:600,color:"#374151"}}>{dsp}</td>
                        <td style={{padding:"8px 10px",color:"#111827"}}>{dspCounts[dsp]||0}</td>
                        <td style={{padding:"8px 10px",color:"#059669",fontWeight:600}}>${rf(6,15).toFixed(2)}</td>
                        <td style={{padding:"8px 10px",color:"#7C3AED",fontWeight:600}}>{rf(1.1,2.4).toFixed(2)}x</td>
                        <td style={{padding:"8px 10px"}}><Badge label={rn(60,85)+"%"} color="#0E7490" bg="#CFFAFE"/></td>
                        <td style={{padding:"8px 10px"}}><Badge label={rn(88,99)+"%" } color="#059669" bg="#D1FAE5"/></td>
                        <td style={{padding:"8px 10px",color:"#6B7280"}}>{r(IAB_CATS)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══ WEBHOOK TESTER ══ */}
          {tab==="webhook" && (
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>

              {/* Config panel */}
              <div style={card}>
                <div style={{fontWeight:600,fontSize:13,color:"#111827",marginBottom:4}}>Webhook + Ad Server Config</div>
                <div style={{fontSize:11,color:"#9CA3AF",marginBottom:16}}>Enter your Adtelligent details and fire a test impression through the full pipeline.</div>

                {[
                  ["Adtelligent AID", wbAid, setWbAid, "478241"],
                  ["Publisher ID",    wbPub, setWbPub, "pub_1234"],
                  ["Test CPM ($)",    wbCpm, setWbCpm, "8.40"],
                  ["API Key",         wbKey, setWbKey, "ctx_live_XXXX"],
                ].map(([label, val, setter, ph])=>(
                  <div key={label} style={{marginBottom:12}}>
                    <div style={{fontSize:11,color:"#374151",fontWeight:500,marginBottom:4}}>{label}</div>
                    <input value={val} onChange={e=>setter(e.target.value)} placeholder={ph}
                      style={{width:"100%",fontSize:11,fontFamily:"monospace",padding:"7px 10px",border:"1px solid #E5E7EB",borderRadius:7,background:"#F9FAFB",color:"#111827",boxSizing:"border-box"}}/>
                  </div>
                ))}

                <div style={{marginBottom:12}}>
                  <div style={{fontSize:11,color:"#374151",fontWeight:500,marginBottom:4}}>Stream Type</div>
                  <div style={{display:"flex",gap:6}}>
                    {STREAMS.map(s=>(
                      <div key={s.id} onClick={()=>setWbStream(s.id)}
                        style={{flex:1,padding:"6px 0",borderRadius:7,border:"1px solid "+(wbStream===s.id?s.color:"#E5E7EB"),background:wbStream===s.id?s.light:"transparent",cursor:"pointer",textAlign:"center",fontSize:11,color:wbStream===s.id?s.dark:"#6B7280",fontWeight:wbStream===s.id?600:400}}>
                        {s.icon} {s.label}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{marginBottom:16}}>
                  <div style={{fontSize:11,color:"#374151",fontWeight:500,marginBottom:8}}>Ad Server Integration</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                    {[["gam","Google Ad Manager"],["freewheel","FreeWheel"],["springserve","SpringServe"],["custom","Custom / Direct"]].map(([id,label])=>(
                      <div key={id} onClick={()=>setAdsCfg(p=>({...p,adserver:id}))}
                        style={{padding:"8px 10px",borderRadius:7,border:"1px solid "+(adsCfg.adserver===id?"#8B5CF6":"#E5E7EB"),background:adsCfg.adserver===id?"#EDE9FE":"#F9FAFB",cursor:"pointer",fontSize:11,color:adsCfg.adserver===id?"#7C3AED":"#374151",fontWeight:adsCfg.adserver===id?600:400}}>
                        {label}
                      </div>
                    ))}
                  </div>
                  <div style={{marginTop:10,display:"flex",flexDirection:"column",gap:6}}>
                    {[["keyvals","Pass as key-values / custom params","#10B981"],["openrtb","Inject into OpenRTB ext","#8B5CF6"],["prebid","Prebid.js adapter","#06B6D4"]].map(([key,label,color])=>(
                      <label key={key} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:11,color:"#374151"}}>
                        <input type="checkbox" checked={adsCfg[key]} onChange={e=>setAdsCfg(p=>({...p,[key]:e.target.checked}))}/>
                        <span style={{color:adsCfg[key]?color:"#6B7280",fontWeight:adsCfg[key]?500:400}}>{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button onClick={fireTestWebhook} disabled={wbFiring}
                  style={{width:"100%",padding:"11px 0",borderRadius:9,border:"none",background:wbFiring?"#E5E7EB":"linear-gradient(135deg,#8B5CF6,#6D28D9)",color:wbFiring?"#9CA3AF":"#fff",cursor:wbFiring?"not-allowed":"pointer",fontWeight:700,fontSize:13,letterSpacing:.2}}>
                  {wbFiring ? "⏳ Firing pipeline..." : "🚀 Fire Test Impression"}
                </button>
              </div>

              {/* Pipeline log + result */}
              <div style={{display:"flex",flexDirection:"column",gap:14}}>

                {/* Pipeline trace */}
                <div style={card}>
                  <div style={{fontWeight:600,fontSize:13,color:"#111827",marginBottom:12}}>Pipeline Trace</div>
                  {wbLog.length===0 && !wbFiring && (
                    <div style={{textAlign:"center",padding:"28px 0",color:"#9CA3AF",fontSize:12}}>Click "Fire Test Impression" to trace the full pipeline</div>
                  )}
                  {wbLog.map((entry,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:12}}>
                      <div style={{width:24,height:24,borderRadius:"50%",background:entry.color,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:11,color:"#fff",fontWeight:700}}>{i+1}</div>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                          <span style={{fontSize:12,fontWeight:600,color:"#111827"}}>{entry.name}</span>
                          <span style={{fontSize:10,fontFamily:"monospace",color:entry.color,fontWeight:700}}>{entry.elapsed}ms</span>
                        </div>
                        <div style={{fontSize:11,color:"#9CA3AF",marginTop:2}}>{entry.detail}</div>
                        {i<wbLog.length-1 && <div style={{width:1,height:10,background:"#E5E7EB",marginLeft:0,marginTop:6}}/>}
                      </div>
                    </div>
                  ))}
                  {wbFiring && (
                    <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 0",color:"#9CA3AF",fontSize:11}}>
                      <div style={{width:8,height:8,borderRadius:"50%",background:"#8B5CF6",animation:"pulse 1s infinite"}}/>
                      Processing...
                    </div>
                  )}
                </div>

                {/* Signal result */}
                {wbResult && (
                  <div style={{...card,border:"1px solid #BBF7D0",background:"#F0FDF4"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                      <div style={{fontWeight:600,fontSize:13,color:"#166534"}}>✅ Signal Received by Dashboard</div>
                      <Badge label={wbResult.lat+"ms total"} color="#059669" bg="#D1FAE5"/>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                      {[
                        ["IAB Category",wbResult.iab],
                        ["Emotion",wbResult.emotion],
                        ["Audience",wbResult.segment],
                        ["Brand Safety",wbResult.bs+" / "+wbResult.bsLabel],
                        ["Bid Multiplier",wbResult.bidMul+"x"],
                        ["Context Score",wbResult.score],
                        ["CPM","$"+wbResult.cpm],
                        ["Placement",wbResult.placement],
                      ].map(([l,v])=>(
                        <div key={l} style={{background:"#fff",borderRadius:7,padding:"8px 10px",border:"1px solid #D1FAE5"}}>
                          <div style={{fontSize:10,color:"#6B7280"}}>{l}</div>
                          <div style={{fontSize:12,fontWeight:600,color:"#111827"}}>{v}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{marginTop:12,padding:"10px 12px",background:"#fff",borderRadius:8,border:"1px solid #D1FAE5"}}>
                      <div style={{fontSize:10,color:"#9CA3AF",marginBottom:6,fontWeight:500}}>ADTELLIGENT VAST TAG — ENRICHED OUTPUT</div>
                      <div style={{fontFamily:"monospace",fontSize:10,color:"#374151",lineHeight:1.7}}>
                        {"&c1="+wbResult.c1+" (brand_safety)"}<br/>
                        {"&c2="+wbResult.c2+" (iab)"}<br/>
                        {"&c3="+wbResult.c3+" (emotion)"}<br/>
                        {"&c4="+wbResult.c4+" (audience)"}<br/>
                        {"&c5="+wbResult.c5+" (bid_multiplier)"}<br/>
                        {"&c6="+wbResult.c6+" (context_score)"}
                      </div>
                    </div>
                    <div style={{marginTop:10,padding:"10px 12px",background:"#fff",borderRadius:8,border:"1px solid #D1FAE5"}}>
                      <div style={{fontSize:10,color:"#9CA3AF",marginBottom:6,fontWeight:500}}>{"→ "+["Google Ad Manager","FreeWheel","SpringServe","Custom Ad Server"][["gam","freewheel","springserve","custom"].indexOf(adsCfg.adserver)]+" INTEGRATION"}</div>
                      {adsCfg.keyvals && <div style={{fontFamily:"monospace",fontSize:10,color:"#374151",marginBottom:4}}>{"Key-values: ctx_bs="+wbResult.c1+", ctx_bidmul="+wbResult.c5}</div>}
                      {adsCfg.openrtb && <div style={{fontFamily:"monospace",fontSize:10,color:"#374151",marginBottom:4}}>{"OpenRTB ext: {\"context_engine\":{\"score\":"+wbResult.c6+",\"bid_mul\":"+wbResult.c5+"}}"}</div>}
                      {adsCfg.prebid  && <div style={{fontFamily:"monospace",fontSize:10,color:"#374151"}}>{"pbjs.setTargeting(\"ctx_aud\",\""+wbResult.c4+"\")"}</div>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══ MARKET & POSITIONING ══ */}
          {tab==="market" && (
            <div style={{display:"flex",flexDirection:"column",gap:16}}>

              {/* Hero stat row */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>
                {[
                  {label:"US CTV Ad Spend 2025",value:"$26.6B",sub:"Growing 15.8% YoY",color:"#8B5CF6",icon:"📺"},
                  {label:"Programmatic CTV Share",value:"90%+",sub:"Of all CTV transactions",color:"#06B6D4",icon:"⚡"},
                  {label:"Attention Lift",value:"4x",sub:"Contextual vs non-contextual ads",color:"#10B981",icon:"👁️"},
                  {label:"Brand Favorability Lift",value:"+60%",sub:"Emotionally resonant placements",color:"#F59E0B",icon:"🎯"},
                ].map(m=>(
                  <div key={m.label} style={{background:"#fff",borderRadius:14,padding:"16px 18px",boxShadow:"0 1px 4px rgba(0,0,0,.07)",border:"1px solid #F3F4F6",borderLeft:"4px solid "+m.color}}>
                    <div style={{fontSize:11,color:"#6B7280",marginBottom:6,display:"flex",justifyContent:"space-between"}}>{m.label}<span>{m.icon}</span></div>
                    <div style={{fontSize:28,fontWeight:800,color:m.color,lineHeight:1}}>{m.value}</div>
                    <div style={{fontSize:11,color:"#9CA3AF",marginTop:4}}>{m.sub}</div>
                  </div>
                ))}
              </div>

              {/* Name suggestions + Competitive map side by side */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>

                {/* Name suggestions */}
                <div style={{background:"#fff",borderRadius:14,padding:"20px",boxShadow:"0 1px 4px rgba(0,0,0,.07)",border:"1px solid #F3F4F6"}}>
                  <div style={{fontWeight:700,fontSize:14,color:"#111827",marginBottom:4}}>🏷️ Suggested Product Names</div>
                  <div style={{fontSize:11,color:"#9CA3AF",marginBottom:16}}>Ranked by brand strength, memorability & ad-tech fit</div>
                  {[
                    {name:"ContextPulse",tag:"Top Pick",desc:"Real-time heartbeat of contextual signals. Modern, memorable, signals speed.",color:"#8B5CF6",bg:"#EDE9FE"},
                    {name:"SignalLayer",tag:"Top Pick",desc:"Infrastructure positioning — the layer that adds signals to every bid.",color:"#06B6D4",bg:"#CFFAFE"},
                    {name:"ParaSignal",tag:"Differentiator",desc:"'Para' = parallel — your core technical moat vs all competitors.",color:"#10B981",bg:"#D1FAE5"},
                    {name:"StreamScore",tag:"Clear & Direct",desc:"Does exactly what it says. Easy for publishers & advertisers to understand.",color:"#F59E0B",bg:"#FEF3C7"},
                    {name:"Sceneiq",tag:"Trending",desc:"Matches industry language (scene-level). 'IQ' implies intelligence.",color:"#EF4444",bg:"#FEE2E2"},
                    {name:"ZeroTag",tag:"Bold",desc:"Zero publisher tag changes. Your strongest GTM hook in one word.",color:"#7C3AED",bg:"#EDE9FE"},
                    {name:"BidContext",tag:"DSP-Facing",desc:"Speaks directly to DSP buyers. Context injected at bid time.",color:"#0E7490",bg:"#CFFAFE"},
                    {name:"Veloq",tag:"Premium",desc:"Speed (velo) + signal (q). Short, unique, enterprise-grade feel.",color:"#374151",bg:"#F3F4F6"},
                  ].map((n,i)=>(
                    <div key={n.name} style={{display:"flex",alignItems:"flex-start",gap:12,padding:"10px 0",borderBottom:"1px solid #F9FAFB"}}>
                      <div style={{width:24,height:24,borderRadius:6,background:n.bg,color:n.color,fontSize:11,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{i+1}</div>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
                          <span style={{fontSize:13,fontWeight:700,color:"#111827"}}>{n.name}</span>
                          <span style={{fontSize:9,padding:"2px 7px",borderRadius:20,background:n.bg,color:n.color,fontWeight:600}}>{n.tag}</span>
                        </div>
                        <div style={{fontSize:11,color:"#6B7280"}}>{n.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Competitive landscape */}
                <div style={{display:"flex",flexDirection:"column",gap:14}}>
                  <div style={{background:"#fff",borderRadius:14,padding:"20px",boxShadow:"0 1px 4px rgba(0,0,0,.07)",border:"1px solid #F3F4F6"}}>
                    <div style={{fontWeight:700,fontSize:14,color:"#111827",marginBottom:4}}>🥊 Competitive Landscape</div>
                    <div style={{fontSize:11,color:"#9CA3AF",marginBottom:14}}>How you compare to every major player in the space</div>
                    {[
                      {name:"IRIS.TV",type:"Content ID Platform",threat:"High",color:"#EF4444",bg:"#FEE2E2",weakness:"Requires deep publisher CMS integration & content library ingestion. Not real-time parallel."},
                      {name:"Anoki",type:"Scene-level AI",threat:"Medium",color:"#F59E0B",bg:"#FEF3C7",weakness:"Targets large broadcasters & content owners. Not SSP-native or VAST-compatible."},
                      {name:"GumGum Verity™",type:"Brand Safety + Context",threat:"Medium",color:"#F59E0B",bg:"#FEF3C7",weakness:"Enterprise-only, expensive, requires formal integration. Not parallel to bid."},
                      {name:"Viant + Wurl",type:"DSP Scene-level",threat:"Low",color:"#10B981",bg:"#D1FAE5",weakness:"DSP-side only. You're SSP-side — you can serve Viant AND every other DSP."},
                      {name:"JWP Connatix",type:"Player-level AI",threat:"Low",color:"#10B981",bg:"#D1FAE5",weakness:"Tied to their own video player. You're player-agnostic via VAST tag."},
                      {name:"Proximic (Comscore)",type:"Contextual Segments",threat:"Medium",color:"#F59E0B",bg:"#FEF3C7",weakness:"Pre-bid segments, not real-time parallel scoring. No SSP-native integration."},
                    ].map(c=>(
                      <div key={c.name} style={{padding:"10px 12px",borderRadius:9,border:"1px solid #F3F4F6",marginBottom:8,background:"#FAFAFA"}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <span style={{fontSize:12,fontWeight:700,color:"#111827"}}>{c.name}</span>
                            <span style={{fontSize:10,color:"#6B7280"}}>{c.type}</span>
                          </div>
                          <span style={{fontSize:10,padding:"2px 8px",borderRadius:20,background:c.bg,color:c.color,fontWeight:600}}>Threat: {c.threat}</span>
                        </div>
                        <div style={{fontSize:11,color:"#6B7280"}}>⚡ Our edge: {c.weakness}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Differentiation matrix */}
              <div style={{background:"#fff",borderRadius:14,padding:"20px",boxShadow:"0 1px 4px rgba(0,0,0,.07)",border:"1px solid #F3F4F6"}}>
                <div style={{fontWeight:700,fontSize:14,color:"#111827",marginBottom:4}}>🎯 Feature Differentiation Matrix</div>
                <div style={{fontSize:11,color:"#9CA3AF",marginBottom:16}}>How we compare feature-by-feature across the competitive landscape</div>
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
                    <thead>
                      <tr style={{background:"#F9FAFB",borderRadius:8}}>
                        <th style={{padding:"10px 14px",textAlign:"left",color:"#374151",fontWeight:600}}>Feature</th>
                        {["IRIS.TV","Anoki","GumGum","Viant+Wurl","You (ContextPulse)"].map(h=>(
                          <th key={h} style={{padding:"10px 14px",textAlign:"center",color:h.includes("You")?"#8B5CF6":"#374151",fontWeight:h.includes("You")?700:600,background:h.includes("You")?"#F5F3FF":"transparent"}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["Zero publisher changes needed","❌","❌","❌","❌","✅"],
                        ["Works via VAST tag","❌","❌","❌","❌","✅"],
                        ["SSP-native integration","Partial","❌","❌","❌","✅"],
                        ["Real-time parallel to bid","Partial","❌","❌","❌","✅"],
                        ["Sub-30ms scoring","❌","❌","❌","❌","✅"],
                        ["Player agnostic","✅","❌","✅","✅","✅"],
                        ["Works with any DSP","✅","❌","✅","❌","✅"],
                        ["Brand safety scoring","✅","✅","✅","✅","✅"],
                        ["Audience segmentation","✅","✅","✅","✅","✅"],
                        ["Live stream support","❌","❌","❌","✅","✅"],
                        ["Audio / podcast support","❌","❌","❌","❌","✅"],
                        ["POC in 1 day","❌","❌","❌","❌","✅"],
                      ].map(([feat,...vals])=>(
                        <tr key={feat} style={{borderBottom:"1px solid #F3F4F6"}}>
                          <td style={{padding:"9px 14px",color:"#374151",fontWeight:500}}>{feat}</td>
                          {vals.map((v,i)=>(
                            <td key={i} style={{padding:"9px 14px",textAlign:"center",background:i===4?"rgba(139,92,246,.04)":"transparent",color:v==="✅"?"#059669":v==="❌"?"#DC2626":"#6B7280",fontWeight:v==="✅"||v==="❌"?600:400}}>
                              {v}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* GTM + why now */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                <div style={{background:"linear-gradient(135deg,#1E1B4B,#312E81)",borderRadius:14,padding:"24px",color:"#fff"}}>
                  <div style={{fontWeight:700,fontSize:14,marginBottom:16}}>🚀 Why Now — Market Tailwinds</div>
                  {[
                    ["Cookies deprecated","Third-party data gone — contextual is the only scalable privacy-safe alternative"],
                    ["CTV growing 15.8% YoY","$26.6B market with almost no SSP-native context layer today"],
                    ["Live content unsolved","Real-time scoring for live sports & news is barely addressed by any competitor"],
                    ["Publisher friction = moat","Every competitor requires publisher changes. You don't. That's a direct sales advantage."],
                    ["Audio ignored","Podcast & audio context is virtually untouched by any major player in the space"],
                  ].map(([title,desc])=>(
                    <div key={title} style={{display:"flex",gap:10,marginBottom:14}}>
                      <div style={{width:6,height:6,borderRadius:"50%",background:"#A78BFA",marginTop:5,flexShrink:0}}/>
                      <div>
                        <div style={{fontWeight:600,fontSize:12,color:"#E0E7FF",marginBottom:2}}>{title}</div>
                        <div style={{fontSize:11,color:"rgba(255,255,255,.6)",lineHeight:1.5}}>{desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{background:"#fff",borderRadius:14,padding:"24px",boxShadow:"0 1px 4px rgba(0,0,0,.07)",border:"1px solid #F3F4F6"}}>
                  <div style={{fontWeight:700,fontSize:14,color:"#111827",marginBottom:16}}>💼 Go-To-Market by Persona</div>
                  {[
                    {persona:"Publisher",icon:"🏢",pitch:"Zero changes to your VAST tag. Start scoring every impression in 1 day. Lift your CPM with contextual signals advertisers actually pay for.",color:"#8B5CF6",bg:"#EDE9FE"},
                    {persona:"Advertiser / DSP",icon:"📣",pitch:"Context-enriched OpenRTB bid requests. Brand safety, audience segment, and bid multiplier on every impression — no cookie needed.",color:"#06B6D4",bg:"#CFFAFE"},
                    {persona:"SSP (Adtelligent)",icon:"⚙️",pitch:"Native integration via c1–c6 custom params. No infrastructure change. Enrich every auction without touching the ad server.",color:"#10B981",bg:"#D1FAE5"},
                    {persona:"Agency / Trading Desk",icon:"📊",pitch:"Real-time contextual signals mapped to IAB taxonomy, emotion, and audience segments — packaged as OpenRTB ext for any DSP.",color:"#F59E0B",bg:"#FEF3C7"},
                  ].map(p=>(
                    <div key={p.persona} style={{display:"flex",gap:12,padding:"10px 12px",borderRadius:9,border:"1px solid #F3F4F6",marginBottom:8,background:"#FAFAFA"}}>
                      <div style={{width:32,height:32,borderRadius:8,background:p.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{p.icon}</div>
                      <div>
                        <div style={{fontSize:12,fontWeight:700,color:p.color,marginBottom:3}}>{p.persona}</div>
                        <div style={{fontSize:11,color:"#6B7280",lineHeight:1.5}}>{p.pitch}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══ ADTELLIGENT INTEGRATION ══ */}
          {tab==="integration" && (
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              <div style={{...card,gridColumn:"1/-1"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                  <div style={{fontWeight:600,fontSize:13,color:"#111827"}}>Live Adtelligent SSP Tag — Context Enriched</div>
                  <div style={{display:"flex",gap:6}}>
                    <Badge label={"AID: "+((selSig&&selSig.adtelligent.aid)||"478241")} color="#7C3AED" bg="#EDE9FE"/>
                    <Badge label={"Channel: "+((selSig&&selSig.adtelligent.channelId)||"1234")} color="#0E7490" bg="#CFFAFE"/>
                    <Badge label="Tag Based · VAST · CTV" color="#059669" bg="#D1FAE5"/>
                  </div>
                </div>
                <pre style={{background:"#0F172A",borderRadius:10,padding:16,fontSize:10,fontFamily:"'Fira Mono',monospace",color:"#94A3B8",lineHeight:1.8,overflowX:"auto",whiteSpace:"pre-wrap",wordBreak:"break-word",margin:0}}>
                  <span style={{color:"#64748B"}}>{"<!-- Adtelligent SSP → Tag Constructor → VAST Source -->\n"}</span>
                  <span style={{color:"#38BDF8"}}>{"https://ssp.adtelligent.com/vast"}</span>
                  <span style={{color:"#94A3B8"}}>{"\n"}</span>
                  {IntegrationTag().split("\n").map((line,i)=>{
                    const isComment = line.trim().startsWith("<!--");
                    const isBlank   = line.trim()==="";
                    const isUrl     = line.trim().startsWith("https://");
                    const isMacro   = line.includes("{") && line.includes("}");
                    const isParam   = line.trim().startsWith("&");
                    const color = isComment?"#64748B":isUrl?"#38BDF8":isMacro?"#A78BFA":isParam?"#6EE7B7":"#94A3B8";
                    return <span key={i} style={{color,display:"block"}}>{line||"\u00A0"}</span>;
                  })}
                </pre>
              </div>

              {/* c1-c6 live values */}
              <div style={card}>
                <div style={{fontWeight:600,fontSize:13,color:"#111827",marginBottom:14}}>Live c1–c6 Parameter Values</div>
                <div style={{fontSize:11,color:"#9CA3AF",marginBottom:12}}>These values are injected in real-time into your Adtelligent VAST tag for every impression — parallel to the ad request.</div>
                {[
                  ["c1","brand_safety_score",selSig?.c1||"—","#10B981","#D1FAE5"],
                  ["c2","iab_category",selSig?.c2||"—","#8B5CF6","#EDE9FE"],
                  ["c3","emotion",selSig?.c3||"—","#06B6D4","#CFFAFE"],
                  ["c4","audience_segment",selSig?.c4||"—","#F59E0B","#FEF3C7"],
                  ["c5","bid_multiplier",selSig?.c5||"—","#7C3AED","#EDE9FE"],
                  ["c6","context_score",selSig?.c6||"—","#EF4444","#FEE2E2"],
                ].map(([param,name,val,color,bg])=>(
                  <div key={param} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",borderRadius:8,border:"1px solid #F3F4F6",marginBottom:7,background:"#FAFAFA"}}>
                    <div style={{width:28,height:28,borderRadius:6,background:bg,color,fontSize:11,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"monospace",flexShrink:0}}>{param}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:10,color:"#9CA3AF"}}>{name}</div>
                      <div style={{fontSize:13,fontWeight:600,color:"#111827",fontFamily:"monospace"}}>{val}</div>
                    </div>
                    <div style={{width:8,height:8,borderRadius:"50%",background:color,boxShadow:"0 0 6px "+color+"80"}}/>
                  </div>
                ))}
              </div>

              {/* pipeline timing */}
              <div style={card}>
                <div style={{fontWeight:600,fontSize:13,color:"#111827",marginBottom:14}}>Parallel Pipeline Timing</div>
                <div style={{fontSize:11,color:"#9CA3AF",marginBottom:16}}>Context Engine runs in parallel — zero latency added to your Adtelligent bid request.</div>
                {[
                  ["Stream intercept","async tap, non-blocking",selSig?selSig.lat<10?"2ms":"4ms":"—","#10B981",5],
                  ["Context classify","IAB · emotion · brand safety",selSig?selSig.lat<20?"12ms":"18ms":"—","#8B5CF6",20],
                  ["Cache write","Redis sub-ms",selSig?"2ms":"—","#06B6D4",3],
                  ["c1–c6 inject","Into Adtelligent VAST params",selSig?"3ms":"—","#F59E0B",5],
                  ["Adtelligent bid","SSP auction (parallel)",selSig?(selSig.lat+2)+"ms":"—","#7C3AED",selSig?selSig.lat+2:30],
                  ["Total wall time",selSig?"Both run simultaneously":"—",selSig?selSig.lat+"ms":"—","#10B981",selSig?selSig.lat:28],
                ].map(([stage,desc,val,color,ms])=>(
                  <div key={stage} style={{marginBottom:12}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}>
                      <span style={{color:"#374151",fontWeight:500}}>{stage}</span>
                      <span style={{fontWeight:700,color,fontFamily:"monospace"}}>{val}</span>
                    </div>
                    <div style={{fontSize:10,color:"#9CA3AF",marginBottom:4}}>{desc}</div>
                    <div style={{height:4,background:"#F3F4F6",borderRadius:2}}>
                      <div style={{height:"100%",width:Math.min(100,Math.round((ms/60)*100))+"%",background:color,borderRadius:2,transition:"width .3s"}}/>
                    </div>
                  </div>
                ))}
                <div style={{marginTop:16,padding:"10px 12px",background:"#F0FDF4",borderRadius:8,border:"1px solid #BBF7D0",fontSize:11,color:"#166534"}}>
                  ✅ Context Engine adds <strong>0ms</strong> to your Adtelligent ad request — runs fully in parallel
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default App;

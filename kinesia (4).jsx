import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `You are Kinesia, an elite AI coach dedicated to curating personalized weight gain journeys. Your personality is warm, motivating, precise, and science-backed.

You help users:
- Build structured bulking meal plans (caloric surplus, macro targets)
- Design progressive overload training programs for muscle hypertrophy
- Track weekly weight/measurement progress and give adaptive feedback
- Recommend recovery strategies: sleep, stress management, supplementation
- Troubleshoot slow gains (plateau-breaking tactics)
- Provide motivation and accountability

Your tone: confident but empathetic. Use concise bullet points for plans, bold key numbers (calories, macros, sets/reps). Always personalize to the user stated goals, body stats, and lifestyle.

When a user first messages, warmly greet them as Kinesia and ask for their: current weight, target weight, height, activity level, and main goal (lean bulk vs fast bulk). Then craft their personalized journey.

Format responses clearly with sections when giving detailed plans. Use emoji sparingly only for warmth, not decoration.`;

function FireCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const SCALE = 4;
    let W = Math.floor(window.innerWidth / SCALE);
    let H = Math.floor(window.innerHeight / SCALE);
    canvas.width = W; canvas.height = H;

    let fire = new Uint8Array(W * H);

    const palette = new Array(256).fill(null).map((_,i) => {
      if (i < 40)  return [0,0,0,0];
      if (i < 90)  { const t=(i-40)/50; return [Math.floor(t*180),0,0,Math.floor(t*220)]; }
      if (i < 150) { const t=(i-90)/60; return [180+Math.floor(t*75),Math.floor(t*80),0,230+Math.floor(t*25)]; }
      if (i < 210) { const t=(i-150)/60; return [255,80+Math.floor(t*150),Math.floor(t*40),255]; }
      const t=(i-210)/45; return [255,230+Math.floor(t*25),40+Math.floor(t*180),255];
    });

    const img = ctx.createImageData(W, H);

    const seedBottom = () => {
      for (let x = 0; x < W; x++) {
        fire[(H-1)*W+x] = 200 + Math.floor(Math.random()*55);
      }
    };

    let frame = 0;
    let rafId;
    const step = () => {
      frame++;
      if (frame % 2 === 0) seedBottom();
      for (let y = 1; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const src = y * W + x;
          const decay = Math.random() < 0.45 ? 1 : 0;
          const wind = Math.floor(Math.random() * 3) - 1;
          const nx = (x + wind + W) % W;
          const dst = (y - 1) * W + nx;
          fire[dst] = Math.max(0, fire[src] - decay);
        }
      }
      for (let i = 0; i < W * H; i++) {
        const [r,g,b,a] = palette[fire[i]];
        const p = i*4;
        img.data[p]=r; img.data[p+1]=g; img.data[p+2]=b; img.data[p+3]=a;
      }
      ctx.putImageData(img, 0, 0);
      rafId = requestAnimationFrame(step);
    };
    seedBottom();
    step();

    const onResize = () => {
      W = Math.floor(window.innerWidth / SCALE);
      H = Math.floor(window.innerHeight / SCALE);
      canvas.width = W; canvas.height = H;
      fire = new Uint8Array(W * H);
      seedBottom();
    };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(rafId); window.removeEventListener("resize", onResize); };
  }, []);

  return (
    <canvas ref={canvasRef} style={{
      position:"fixed",top:0,left:0,
      width:"100vw",height:"100vh",
      zIndex:0,pointerEvents:"none",
      imageRendering:"pixelated",
      background:"#000"
    }}/>
  );
}

const formatMessage = (text) => text.split("\n").map((line,i) => {
  line = line.replace(/\*\*(.*?)\*\*/g,"<strong style='color:#ffcc99;font-weight:700'>$1</strong>").replace(/\*(.*?)\*/g,"<em>$1</em>");
  if (line.startsWith("### ")) return <h3 key={i} style={{fontSize:"15px",fontWeight:700,color:"#fff",margin:"14px 0 6px",textShadow:"0 0 12px rgba(255,150,80,.4)"}}>{line.slice(4)}</h3>;
  if (line.startsWith("## "))  return <h2 key={i} style={{fontSize:"17px",fontWeight:800,color:"#fff",margin:"16px 0 8px",textShadow:"0 0 16px rgba(255,150,80,.4)"}}>{line.slice(3)}</h2>;
  if (line.startsWith("- ")||line.startsWith("• ")) return <div key={i} style={{display:"flex",gap:"8px",margin:"4px 0"}}><span style={{color:"#ff6b2b",flexShrink:0,fontWeight:700}}>›</span><span dangerouslySetInnerHTML={{__html:line.slice(2)}} style={{color:"#fff",lineHeight:"1.65",fontSize:"14px",fontWeight:500}}/></div>;
  if (/^\d+\./.test(line)){const n=line.match(/^(\d+)\./)[1];return <div key={i} style={{display:"flex",gap:"10px",margin:"4px 0"}}><span style={{color:"#ff8c55",fontWeight:700,minWidth:"18px",fontSize:"13px"}}>{n}.</span><span dangerouslySetInnerHTML={{__html:line.replace(/^\d+\.\s*/,"")}} style={{color:"#fff",lineHeight:"1.65",fontSize:"14px",fontWeight:500}}/></div>;}
  if (!line.trim()) return <div key={i} style={{height:"8px"}}/>;
  return <p key={i} dangerouslySetInnerHTML={{__html:line}} style={{color:"#fff",lineHeight:"1.7",fontSize:"14px",fontWeight:500,margin:"2px 0"}}/>;
});

const TypingDots = () => (
  <div style={{display:"flex",gap:"5px",alignItems:"center",padding:"4px 0"}}>
    {[0,1,2].map(i=><div key={i} style={{width:"6px",height:"6px",borderRadius:"50%",background:"#ff6b2b",animation:`kpulse 1.2s ease-in-out ${i*0.2}s infinite`}}/>)}
  </div>
);

const MetricPill = ({label,value}) => (
  <div style={{background:"rgba(255,107,43,.08)",border:"1px solid rgba(255,107,43,.25)",borderRadius:"12px",padding:"8px 14px",textAlign:"center",minWidth:"80px",backdropFilter:"blur(12px)"}}>
    <div style={{fontSize:"16px",fontWeight:700,color:"#ff8c55"}}>{value}</div>
    <div style={{fontSize:"10px",color:"rgba(255,150,80,.6)",marginTop:"2px",letterSpacing:"0.08em",textTransform:"uppercase"}}>{label}</div>
  </div>
);

export default function Kinesia() {
  const [messages,setMessages] = useState([]);
  const [input,setInput]       = useState("");
  const [loading,setLoading]   = useState(false);
  const [started,setStarted]   = useState(false);
  const [metrics,setMetrics]   = useState({current:"—",target:"—"});
  const bottomRef = useRef(null);

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[messages,loading]);

  const extractMetrics = (text) => {
    const cw=text.match(/(\d+\.?\d*)\s*(kg|lbs?)/i);
    const tw=text.match(/target[^.]*?(\d+\.?\d*)\s*(kg|lbs?)/i);
    if(cw&&!tw) setMetrics(m=>({...m,current:`${cw[1]}${cw[2]}`}));
    if(tw)      setMetrics(m=>({...m,target:`${tw[1]}${tw[2]}`}));
  };

  const sendMessage = async (userText) => {
    if(!userText.trim()||loading) return;
    const msgs=[...messages,{role:"user",content:userText}];
    setMessages(msgs); setInput(""); setLoading(true); extractMetrics(userText);
    try {
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:SYSTEM_PROMPT,
          messages:msgs.map(m=>({role:m.role,content:m.content}))})
      });
      const data=await res.json();
      setMessages(prev=>[...prev,{role:"assistant",content:data.content?.[0]?.text||"Try again."}]);
    } catch { setMessages(prev=>[...prev,{role:"assistant",content:"Connection issue. Please try again."}]); }
    setLoading(false);
  };

  const quick=["Design my meal plan for a lean bulk","Create my hypertrophy training split","I'm not gaining weight — help me","What supplements should I take?"];

  return (
    <div style={{fontFamily:"system-ui,sans-serif",minHeight:"100vh",color:"#d4c5ae",display:"flex",flexDirection:"column",maxWidth:"720px",margin:"0 auto",position:"relative"}}>
      <style>{`
        @keyframes kpulse{0%,100%{opacity:.3;transform:scale(.8)}50%{opacity:1;transform:scale(1)}}
        @keyframes kup{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        body,html{margin:0;padding:0;background:#000}
        ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:rgba(255,107,43,.25);border-radius:2px}
        textarea{resize:none} textarea:focus{outline:none}
        .kin{animation:kup .3s ease forwards}
        .glass{background:rgba(2,0,0,.82);backdrop-filter:blur(22px) saturate(180%);-webkit-backdrop-filter:blur(22px) saturate(180%)}
        .g-ai{background:rgba(5,1,0,.82);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(255,107,43,.2)}
        .g-user{background:rgba(180,70,20,.18);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(255,107,43,.35)}
        .g-in{background:rgba(4,1,0,.82);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px)}
        .qbtn:hover{background:rgba(255,107,43,.14)!important;border-color:rgba(255,107,43,.4)!important}
      `}</style>

      <FireCanvas/>

      <div style={{position:"fixed",top:0,left:0,width:"100vw",height:"100vh",zIndex:1,pointerEvents:"none",
        background:"linear-gradient(180deg,rgba(0,0,0,.78) 0%,rgba(0,0,0,.45) 40%,rgba(0,0,0,.45) 65%,rgba(0,0,0,.85) 100%)"}}/>

      {/* Header */}
      <div className="glass" style={{padding:"15px 22px",borderBottom:"1px solid rgba(255,107,43,.12)",position:"sticky",top:0,zIndex:20,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:"11px"}}>
          <div style={{width:"36px",height:"36px",borderRadius:"11px",background:"rgba(255,107,43,.1)",border:"1px solid rgba(255,107,43,.35)",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <svg width="22" height="22" viewBox="0 0 28 28" fill="none"><path d="M4 14 Q7 8 10 14 Q13 20 16 14 Q19 8 22 14 Q25 20 28 14" stroke="#ff6b2b" strokeWidth="2.2" fill="none" strokeLinecap="round"/></svg>
          </div>
          <div>
            <div style={{fontSize:"17px",fontWeight:700,color:"#fde8d8",letterSpacing:"-0.01em"}}>Kinesia</div>
            <div style={{fontSize:"10px",color:"rgba(255,180,100,.8)",letterSpacing:"0.07em",textTransform:"uppercase",fontWeight:600}}>AI Weight Gain Coach</div>
          </div>
        </div>
        <div style={{display:"flex",gap:"7px"}}>
          <MetricPill label="Current" value={metrics.current}/>
          <MetricPill label="Target"  value={metrics.target}/>
        </div>
      </div>

      {/* Messages */}
      <div style={{flex:1,overflowY:"auto",padding:"22px 18px",display:"flex",flexDirection:"column",gap:"18px",position:"relative",zIndex:10}}>
        {!started&&messages.length===0&&(
          <div style={{textAlign:"center",padding:"38px 16px 16px",animation:"kup .6s ease forwards"}}>
            <div style={{width:"68px",height:"68px",borderRadius:"22px",background:"rgba(255,107,43,.08)",border:"1px solid rgba(255,107,43,.3)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 18px",backdropFilter:"blur(12px)"}}>
              <svg width="32" height="32" viewBox="0 0 28 28" fill="none"><path d="M4 14 Q7 8 10 14 Q13 20 16 14 Q19 8 22 14 Q25 20 28 14" stroke="#ff6b2b" strokeWidth="2.2" fill="none" strokeLinecap="round"/></svg>
            </div>
            <h1 style={{fontSize:"26px",fontWeight:800,color:"#fff",margin:"0 0 10px",letterSpacing:"-0.02em",textShadow:"0 0 32px rgba(255,107,43,.5)"}}>Your journey starts here</h1>
            <p style={{fontSize:"13px",color:"rgba(255,220,180,.85)",fontWeight:500,lineHeight:"1.75",maxWidth:"340px",margin:"0 auto 28px"}}>Kinesia builds a precise, science-backed weight gain plan tailored to your body, goals, and lifestyle.</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"7px",maxWidth:"380px",margin:"0 auto"}}>
              {quick.map((p,i)=>(
                <button key={i} className="qbtn" onClick={()=>{setStarted(true);sendMessage(p);}}
                  style={{background:"rgba(255,107,43,.08)",border:"1px solid rgba(255,107,43,.25)",borderRadius:"10px",padding:"11px 13px",color:"#ffb380",fontSize:"12px",fontWeight:600,lineHeight:"1.5",cursor:"pointer",textAlign:"left",transition:"all .2s",fontFamily:"inherit",backdropFilter:"blur(10px)"}}>{p}</button>
              ))}
            </div>
            <button onClick={()=>{setStarted(true);sendMessage("Hi Kinesia, I am ready to start my weight gain journey!");}}
              style={{marginTop:"18px",background:"linear-gradient(135deg,#ff6b2b,#cc4a10)",border:"none",borderRadius:"12px",padding:"13px 32px",color:"#fff",fontSize:"14px",fontWeight:600,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 4px 24px rgba(255,107,43,.4)"}}>
              Begin My Journey →
            </button>
          </div>
        )}

        {messages.map((msg,i)=>(
          <div key={i} className="kin" style={{display:"flex",flexDirection:msg.role==="user"?"row-reverse":"row",gap:"9px",alignItems:"flex-start"}}>
            {msg.role==="assistant"&&(
              <div style={{width:"28px",height:"28px",borderRadius:"9px",background:"rgba(255,107,43,.1)",border:"1px solid rgba(255,107,43,.3)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:"2px",backdropFilter:"blur(8px)"}}>
                <svg width="13" height="13" viewBox="0 0 28 28" fill="none"><path d="M4 14 Q7 8 10 14 Q13 20 16 14 Q19 8 22 14 Q25 20 28 14" stroke="#ff6b2b" strokeWidth="2.5" fill="none" strokeLinecap="round"/></svg>
              </div>
            )}
            <div className={msg.role==="user"?"g-user":"g-ai"} style={{maxWidth:"83%",borderRadius:msg.role==="user"?"16px 4px 16px 16px":"4px 16px 16px 16px",padding:"11px 15px"}}>
              {msg.role==="user"?<p style={{color:"#fff",fontSize:"14px",fontWeight:500,lineHeight:"1.6",margin:0}}>{msg.content}</p>:<div>{formatMessage(msg.content)}</div>}
            </div>
          </div>
        ))}

        {loading&&(
          <div style={{display:"flex",gap:"9px",alignItems:"flex-start"}}>
            <div style={{width:"28px",height:"28px",borderRadius:"9px",background:"rgba(255,107,43,.1)",border:"1px solid rgba(255,107,43,.3)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,backdropFilter:"blur(8px)"}}>
              <svg width="13" height="13" viewBox="0 0 28 28" fill="none"><path d="M4 14 Q7 8 10 14 Q13 20 16 14 Q19 8 22 14 Q25 20 28 14" stroke="#ff6b2b" strokeWidth="2.5" fill="none" strokeLinecap="round"/></svg>
            </div>
            <div className="g-ai" style={{borderRadius:"4px 16px 16px 16px",padding:"13px 17px"}}><TypingDots/></div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <div className="glass" style={{padding:"14px 18px 18px",borderTop:"1px solid rgba(255,107,43,.1)",position:"sticky",bottom:0,zIndex:20}}>
        <div className="g-in" style={{display:"flex",alignItems:"flex-end",gap:"10px",border:"1px solid rgba(255,107,43,.18)",borderRadius:"15px",padding:"11px 13px"}}
          onFocus={e=>e.currentTarget.style.borderColor="rgba(255,107,43,.42)"}
          onBlur={e=>e.currentTarget.style.borderColor="rgba(255,107,43,.18)"}>
          <textarea rows={1} value={input}
            onChange={e=>{setInput(e.target.value);e.target.style.height="auto";e.target.style.height=Math.min(e.target.scrollHeight,120)+"px";}}
            onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();setStarted(true);sendMessage(input);}}}
            placeholder="Ask Kinesia anything about your journey…"
            style={{flex:1,background:"transparent",border:"none",color:"#fff",fontSize:"14px",fontWeight:500,lineHeight:"1.5",fontFamily:"inherit",maxHeight:"120px",overflow:"auto",paddingTop:"2px"}}/>
          <button onClick={()=>{setStarted(true);sendMessage(input);}} disabled={!input.trim()||loading}
            style={{width:"33px",height:"33px",borderRadius:"9px",background:input.trim()&&!loading?"linear-gradient(135deg,#ff6b2b,#cc4a10)":"rgba(255,107,43,.1)",border:"none",cursor:input.trim()&&!loading?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .2s",boxShadow:input.trim()&&!loading?"0 2px 12px rgba(255,107,43,.35)":"none"}}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12l7-7 7 7" stroke={input.trim()&&!loading?"#fff":"rgba(255,107,43,.3)"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
        <p style={{fontSize:"10px",color:"rgba(255,107,43,.2)",textAlign:"center",margin:"8px 0 0",letterSpacing:"0.03em"}}>Kinesia provides guidance only — consult a healthcare professional for medical advice</p>
      </div>
    </div>
  );
}

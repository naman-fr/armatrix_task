// frontend/components/RobotAnimator.jsx
import React, { useEffect, useRef, useState } from "react";

/*
 Advanced robotic mascot
 Features:
 - entrance animation
 - breathing energy core
 - eye scanning
 - idle hover physics
 - mouse tilt interaction
*/

export default function RobotAnimator({ interactive = false, size = 220 }) {

  const [entered,setEntered] = useState(false)
  const robotRef = useRef(null)

  useEffect(()=>{
    const t=setTimeout(()=>setEntered(true),400)
    return ()=>clearTimeout(t)
  },[])

  /* mouse tilt physics */
  useEffect(()=>{

    if(!interactive) return

    const el=robotRef.current
    if(!el) return

    function move(e){

      const rect=el.getBoundingClientRect()

      const cx=rect.left+rect.width/2
      const cy=rect.top+rect.height/2

      const dx=(e.clientX-cx)/rect.width
      const dy=(e.clientY-cy)/rect.height

      const rx=dy*-12
      const ry=dx*12

      el.style.transform=`rotateX(${rx}deg) rotateY(${ry}deg)`
    }

    function leave(){
      el.style.transform="rotateX(0deg) rotateY(0deg)"
    }

    window.addEventListener("mousemove",move)
    window.addEventListener("mouseleave",leave)

    return ()=>{
      window.removeEventListener("mousemove",move)
      window.removeEventListener("mouseleave",leave)
    }

  },[interactive])


  return(

    <div
      className="robot-stage"
      aria-hidden="true"
      style={{
        width:size,
        height:size,
        position:"fixed",
        right:24,
        top:24,
        zIndex:20,
        perspective:"900px"
      }}
    >

      <div
        ref={robotRef}
        className={`robot-wrap ${entered?"in":""} ${interactive?"interactive":""}`}
      >

        <svg
          viewBox="0 0 180 180"
          width="100%"
          height="100%"
          className="robot-svg"
        >

          <defs>

            <linearGradient id="robotGrad">
              <stop offset="0%" stopColor="#00e5ff"/>
              <stop offset="100%" stopColor="#7b5cff"/>
            </linearGradient>

            <radialGradient id="energy">
              <stop offset="0%" stopColor="#00e5ff"/>
              <stop offset="100%" stopColor="transparent"/>
            </radialGradient>

            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="b"/>
              <feMerge>
                <feMergeNode in="b"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>

          </defs>

          {/* BODY */}

          <g className="body">

            <rect
              x="30"
              y="50"
              width="120"
              height="80"
              rx="14"
              fill="#061426"
              stroke="url(#robotGrad)"
              strokeWidth="1.4"
            />

            {/* energy core */}

            <circle
              cx="90"
              cy="90"
              r="10"
              fill="url(#energy)"
              className="core"
            />

          </g>

          {/* HEAD */}

          <g className="head">

            <rect
              x="50"
              y="20"
              width="80"
              height="60"
              rx="12"
              fill="#08192b"
              stroke="url(#robotGrad)"
            />

            {/* eyes */}

            <circle
              cx="75"
              cy="50"
              r="7"
              className="eye eye-left"
            />

            <circle
              cx="105"
              cy="50"
              r="7"
              className="eye eye-right"
            />

          </g>

          {/* ANTENNA */}

          <g className="antenna">

            <rect
              x="88"
              y="8"
              width="4"
              height="12"
              fill="#00e5ff"
            />

            <circle
              cx="90"
              cy="6"
              r="3"
              fill="#7b5cff"
              filter="url(#glow)"
            />

          </g>

          {/* LEGS */}

          <g className="legs">

            <rect x="55" y="130" width="18" height="22" rx="4" fill="#041523"/>
            <rect x="107" y="130" width="18" height="22" rx="4" fill="#041523"/>

          </g>

        </svg>

      </div>


      <style jsx>{`

.robot-wrap{
  width:100%;
  height:100%;
  display:flex;
  align-items:center;
  justify-content:center;
  transform:translateX(80%);
  transition:transform 900ms cubic-bezier(.2,.9,.2,1);
}

.robot-wrap.in{
  transform:translateX(0)
}

/* hover depth */

.robot-wrap.interactive:hover{
  transform:translateX(-6%) scale(1.04);
}


/* idle animations */

.head{
  animation:headBob 4s ease-in-out infinite;
  transform-origin:center;
}

@keyframes headBob{
0%{transform:translateY(0)}
50%{transform:translateY(-3px)}
100%{transform:translateY(0)}
}


/* eyes */

.eye{
  fill:#00e5ff;
  animation:blink 5s infinite;
}

@keyframes blink{
0%{transform:scaleY(1)}
48%{transform:scaleY(1)}
50%{transform:scaleY(0.15)}
52%{transform:scaleY(1)}
100%{transform:scaleY(1)}
}


/* energy core */

.core{
animation:corePulse 2.4s ease-in-out infinite;
}

@keyframes corePulse{
0%{transform:scale(1);opacity:.7}
50%{transform:scale(1.35);opacity:1}
100%{transform:scale(1);opacity:.7}
}


/* legs */

.legs{
animation:walk 3s ease-in-out infinite;
}

@keyframes walk{
0%{transform:translateY(0)}
50%{transform:translateY(-2px)}
100%{transform:translateY(0)}
}

@media (prefers-reduced-motion:reduce){
.robot-wrap,
.head,
.eye,
.core,
.legs{
animation:none!important;
transition:none!important;
}
}

      `}</style>

    </div>

  )

}
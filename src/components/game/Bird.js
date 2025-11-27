// components/Bird.js
import React, { forwardRef } from "react";

const BIRD_SIZE_W = 40;
const BIRD_SIZE_H = 30;

const BIRD_BODY_COLOR = "#FFEB3B";
const BIRD_WING_COLOR = "#FBC02D";
const BIRD_OUTLINE_COLOR = "#4A4A4A";
const BEAK_COLOR = "#F29E4C";
const PAW_COLOR = "#E67E22";

const Bird = forwardRef(function Bird({ birdStatus, leftPosition }, ref) {
  const FlapAnimationStyles = (
    <style>
      {`
        @keyframes flap {
          0% { transform: rotate(10deg); }
          50% { transform: rotate(-30deg); }
          100% { transform: rotate(10deg); }
        }
        .flapping-wing {
          animation: flap 0.25s steps(3, end) infinite; 
          transform-origin: 5px 15px;
        }
      `}
    </style>
  );

  return (
    <div
      ref={ref}
      className="absolute z-20"
      style={{
        width: BIRD_SIZE_W,
        height: BIRD_SIZE_H,
        left: `${leftPosition}px`,
      }}
    >
      {FlapAnimationStyles}

      <svg viewBox="0 0 40 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Хвіст */}
        <path
          d="M7 15 L0 18 L0 12 Z"
          fill={BIRD_WING_COLOR}
          stroke={BIRD_OUTLINE_COLOR}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Тіло */}
        <circle
          cx="20"
          cy="15"
          r="13"
          fill={BIRD_BODY_COLOR}
          stroke={BIRD_OUTLINE_COLOR}
          strokeWidth="2"
        />

        {/* Крило (Рухома частина) */}
        <g className={birdStatus === "playing" ? "flapping-wing" : ""}>
          <path
            d="M10 18 C 14 8, 28 8, 24 18 C 21 22, 17 22, 10 18 Z"
            fill={BIRD_WING_COLOR}
            stroke={BIRD_OUTLINE_COLOR}
            strokeWidth="2"
          />
        </g>

        {/* Дзьоб */}
        <path
          d="M32 12 L37 15 L32 18 Z"
          fill={BEAK_COLOR}
          stroke={BIRD_OUTLINE_COLOR}
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Лапки */}
        {birdStatus === "playing" && (
          <g transform="translate(0, 5)">
            <line
              x1="17"
              y1="28"
              x2="17"
              y2="25"
              stroke={PAW_COLOR}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="22"
              y1="28"
              x2="22"
              y2="25"
              stroke={PAW_COLOR}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
        )}

        {/* Око (Залежить від статусу гри) */}
        {birdStatus === "playing" ? (
          // Око під час гри
          <>
            <circle
              cx="28"
              cy="10"
              r="4"
              fill="white"
              stroke={BIRD_OUTLINE_COLOR}
              strokeWidth="1"
            />
            <circle cx="29" cy="10" r="2" fill="black" />
          </>
        ) : (
          // Око після Game Over (Хрестик)
          <>
            <path
              d="M26 8 L30 12"
              stroke="black"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M30 8 L26 12"
              stroke="black"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </>
        )}
      </svg>
    </div>
  );
});

Bird.displayName = "Bird";
export default Bird;

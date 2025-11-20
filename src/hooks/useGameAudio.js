import { useRef, useEffect, useCallback } from "react";

export const useGameAudio = ({ soundsEnabled, volume = 0.5 }) => {
  const audioContextRef = useRef(null);
  const audioBuffersRef = useRef({});
  const gainNodeRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      try {
        const context = new (window.AudioContext ||
          window.webkitAudioContext)();
        audioContextRef.current = context;

        const gainNode = context.createGain();
        gainNode.connect(context.destination);
        gainNodeRef.current = gainNode;

        const soundUrls = {
          point: "/sounds/point.mp3",
          hit: "/sounds/hit.mp3",
        };

        for (const name in soundUrls) {
          const response = await fetch(soundUrls[name]);
          const arrayBuffer = await response.arrayBuffer();
          const decodedBuffer = await context.decodeAudioData(arrayBuffer);
          audioBuffersRef.current[name] = decodedBuffer;
        }
      } catch (e) {
        console.error("Failed to initialize Web Audio API:", e);
      }
    };
    init();

    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume;
    }
  }, [volume]);

  const playSound = useCallback(
    (soundName) => {
      if (
        !soundsEnabled ||
        !audioContextRef.current ||
        !gainNodeRef.current ||
        !audioBuffersRef.current[soundName]
      ) {
        return;
      }

      const context = audioContextRef.current;

      if (context.state === "suspended") {
        context.resume();
      }

      const source = context.createBufferSource();
      source.buffer = audioBuffersRef.current[soundName];
      source.connect(gainNodeRef.current);
      source.start(0);
    },
    [soundsEnabled]
  );

  return { playSound };
};

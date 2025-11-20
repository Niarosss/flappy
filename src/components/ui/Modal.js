// components/UI/Modal.jsx
import React from "react";
import { motion } from "motion/react";

export default function Modal({ title, children, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="absolute top-0 left-0 w-full h-full flex items-center justify-center z-30 bg-black/10"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className={`bg-neutral-100/10 dark:bg-neutral-600/10 backdrop-blur-xs border border-neutral-50/20 dark:border-neutral-600/20 md:h-auto h-full flex flex-col justify-center md:rounded-3xl shadow-2xl p-3 md:p-6 w-full mx-auto text-neutral-800 dark:text-neutral-200 ${className}`}
      >
        {title && (
          <h2 className="text-2xl font-bold text-center mb-4 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
            {title}
          </h2>
        )}
        {children}
      </motion.div>
    </motion.div>
  );
}

"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

const SESSION_KEY = "body-signature-loaded";

export function PageLoader() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const alreadyLoaded = window.sessionStorage.getItem(SESSION_KEY);
    if (alreadyLoaded) return;

    // Flip to visible after mount so server and first client render stay in
    // sync (both hidden); this loader is intentionally client-only.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(true);

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    // The sessionStorage write is deferred to here (rather than made
    // immediately above) so React Strict Mode's mount->cleanup->mount replay
    // in development can't mark the session "loaded" from a run whose timer
    // gets cancelled before it fires.
    const timeout = window.setTimeout(() => {
      window.sessionStorage.setItem(SESSION_KEY, "true");
      setVisible(false);
    }, reducedMotion ? 200 : 1400);
    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="h-16 w-16"
          >
            <Image
              src="/logo.svg"
              alt=""
              width={64}
              height={64}
              priority
              className="h-full w-full"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

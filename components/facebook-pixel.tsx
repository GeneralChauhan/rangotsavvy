"use client";

import { useEffect } from "react";
import { trackPageView } from "@/lib/facebook-pixel";

const PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;

export function FacebookPixel() {
  useEffect(() => {
    if (!PIXEL_ID || typeof window === "undefined") return;

    const loadPixel = () => {
      const f = window;
      const b = document;
      const e = "script";
      const v = "https://connect.facebook.net/en_US/fbevents.js";
      if (f.fbq) return;
      const n = (f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      }) as typeof window.fbq & { queue: unknown[] };
      if (!(f as { _fbq?: typeof f.fbq })._fbq) (f as { _fbq?: typeof f.fbq })._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = "2.0";
      n.queue = [];
      const t = b.createElement(e);
      t.async = true;
      t.src = v;
      const s = b.getElementsByTagName(e)[0];
      if (s?.parentNode) s.parentNode.insertBefore(t, s);
    };

    loadPixel();
    window.fbq?.("init", PIXEL_ID);
    trackPageView();
  }, []);

  return null;
}

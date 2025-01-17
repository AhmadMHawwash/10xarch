"use client";

import HotjarUtil from "@hotjar/browser";
import { useEffect } from "react";

const siteId = 5271387;
const hotjarVersion = 6;

export const Hotjar = () => {
  useEffect(() => {
    HotjarUtil.init(siteId, hotjarVersion);
  }, []);

  return null;
};

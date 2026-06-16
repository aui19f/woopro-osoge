"use client";

import { useState, useCallback } from "react";

export function useToast(duration = 2000) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");

  const show = useCallback(
    (msg: string) => {
      setMessage(msg);
      setVisible(true);
      setTimeout(() => setVisible(false), duration);
    },
    [duration]
  );

  return { show, visible, message };
}

"use client";

import { AppProgressBar } from "next-nprogress-bar";

export default function NavigationProgress() {
  return (
    <AppProgressBar
      height="3px"
      color="#6366f1"
      options={{ showSpinner: false }}
      shallowRouting
    />
  );
}

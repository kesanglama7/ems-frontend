"use client";

import {
  type ReactNode,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";

interface PortalProps {
  children: ReactNode;
  container?: HTMLElement | null;
}

const emptySubscribe = () => {
  return () => {};
};

export function Portal({
  children,
  container,
}: PortalProps) {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  if (!isClient) {
    return null;
  }

  return createPortal(
    children,
    container ?? document.body,
  );
}
"use client";

import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { useIsMobile } from "@/hooks/use-mobile";
import { ExternalLink, PanelRightClose, X } from "lucide-react";
import Link from "next/link";
import * as React from "react";

export function Header({
  updateGraphAction: updateGraph,
  setSidebarOpenAction: setSidebarOpen,
}: {
  updateGraphAction: () => void;
  setSidebarOpenAction: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col gap-4 p-4 sticky top-0 bg-background border-b z-30">
      <div className="w-full flex flex-row items-center gap-2">
        <div className="font-bold">networkify</div>
        <div className="grow"></div>
        <Button variant="outline" asChild>
          <Link href="https://github.com/Inglan/networkify" target="_blank">
            Source code
            <ExternalLink />
          </Link>
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => {
            setSidebarOpen(false);
          }}
        >
          {isMobile ? <X /> : <PanelRightClose />}
        </Button>
      </div>
      <Button variant="outline" onClick={updateGraph}>
        Update graph<Kbd>⌘ + R</Kbd>
      </Button>
    </div>
  );
}

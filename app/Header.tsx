"use client";

import { Button } from "@/components/ui/button";
import { ExternalLink, Sidebar, X } from "lucide-react";
import Link from "next/link";
import * as React from "react";

export function Header({
  updateGraphAction: updateGraph,
  setSidebarOpenAction: setSidebarOpen,
}: {
  updateGraphAction: () => void;
  setSidebarOpenAction: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <div className="flex flex-col gap-4 p-4 sticky top-0 bg-card border-b z-30">
      <div className="w-full flex flex-row items-center gap-1">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => {
            setSidebarOpen(false);
          }}
        >
          <Sidebar />
        </Button>
        <div className="font-bold">networkify</div>
        <div className="grow"></div>
        <Button variant="outline" asChild>
          <Link href="https://github.com/Inglan/networkify" target="_blank">
            Source code
            <ExternalLink />
          </Link>
        </Button>
      </div>
      <Button onClick={updateGraph}>Update graph</Button>
    </div>
  );
}

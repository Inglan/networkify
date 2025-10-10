"use client";

import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

export function Header({
  updateGraphAction: updateGraph,
}: {
  updateGraphAction: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 p-4 sticky top-0 bg-card border-b z-30">
      <div className="w-full flex flex-row items-center">
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

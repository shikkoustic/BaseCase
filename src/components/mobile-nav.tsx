"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LINKS = [
  { href: "/topics", label: "Topics" },
  { href: "/contests", label: "Contests" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/blog", label: "Blog" },
];

export function MobileNav() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon" aria-label="Open navigation menu" className="sm:hidden" />}
      >
        <Menu className="size-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        {LINKS.map((link) => (
          <DropdownMenuItem key={link.href} render={<Link href={link.href}>{link.label}</Link>} />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

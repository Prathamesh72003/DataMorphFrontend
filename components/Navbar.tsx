"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BarChart3, Database, Home, Settings, User } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-[#0B1A2F] text-white backdrop-blur supports-[backdrop-filter]:bg-[#0B1A2F]/90">
      <div className="container flex h-16 items-center">
        <Link href="/" className="flex items-center gap-2 p-3">
          <div className="rounded-md bg-gradient-to-r from-datamorph-500 to-datamorph-600 p-1">
            <Database className="h-6 w-6 text-white" />
          </div>
          <span className="hidden font-bold text-xl sm:inline-block">
            DataMorph
          </span>
        </Link>

        {/* <nav className="flex items-center gap-1 sm:gap-2 text-sm">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/" className="flex items-center gap-1">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline-block">Home</span>
            </Link>
          </Button>
        </nav>

        <div className="ml-auto flex items-center gap-2 mr-3">
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:flex items-center gap-1 text-black"
          >
            <User className="h-4 w-4" />
            <span>Account</span>
          </Button>
          <Button size="sm" className="hidden sm:flex">
            Get Started
          </Button>
        </div> */}
      </div>
    </header>
  );
}

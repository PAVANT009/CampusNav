"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { PanelLeftIcon, PanelRightIcon, SearchIcon } from "lucide-react";
import { DashboardCommand } from "./dashboard-command";
import { ModeToggleBtn } from "../theme-button";
// import { CurrencySelect } from "@/modules/dashboard/ui/components/currency-select";

export const DashBoardNavbar = () => {
  const { state, toggleSidebar, isMobile } = useSidebar();
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
    <DashboardCommand open={commandOpen} setOpen={setCommandOpen}/>
    <nav className="flex px-4 items-center py-3 border-b bg-background w-full justify-between sticky top-0 z-50">  
      {/* <Button className="size-9" variant="outline" onClick={toggleSidebar}>
        {state === "collapsed" || isMobile ? (
          <PanelLeftIcon className="size-4" />
        ) : (
          <PanelRightIcon className="size-4" />
        )}
      </Button> */}

      <Button
                className="h-9 w-[240px] justify-start font-normal text-muted-foreground hover:text-muted-foreground" 
                variant={"outline"}
                size={"sm"}
                onClick={() => setCommandOpen((open) => !open)}
            >
                <SearchIcon/>
                Search
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                    <span>&#8984;</span>k
                </kbd>
            </Button>

      <div className="flex flex-row justify-end gap-x-2">
        {/* <CurrencySelect /> */}
        <ModeToggleBtn />
      </div>
    </nav>
    </>
  );
};

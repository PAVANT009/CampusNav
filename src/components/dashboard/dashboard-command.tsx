import { useRouter } from "next/navigation";
import { CommandGroup, CommandInput, CommandItem, CommandList, CommandResponsiveDialog } from "@/components/ui/command"

import { Dispatch, SetStateAction, useEffect, useEffectEvent, useMemo, useState } from "react";

import { CommandEmpty } from "cmdk";
// import { Subscription } from "@/types/Subscription";
interface Props {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}


 const pages = [
    {
        label: "Dashboard",
        href: "/",
    },
    {
        label: "AI Agent",
        href: '/agent',
    },
    {
        label: "Categories",
        href: "/categories",
    },
    {
        label: "Analytics",
    },
    {
        label: "Notifications",
        href: "/notifications",
    },
    {
        label: "Upgrade",
        href: "/upgrade",
    },
]


// const pages = [
//   { label: "Meetings", href: "/meetings" },
//   { label: "Agents", href: "/agents" },
//   { label: "Reports", href: "/reports" },
//   { label: "Settings", href: "/settings" },
// ];

function fuzzyMatch(text: string, query: string) {
  const t = text.toLowerCase();
  const q = query.toLowerCase();

  let ti = 0;
  for (let qi = 0; qi < q.length; qi++) {
    ti = t.indexOf(q[qi], ti);
    if (ti === -1) return false;
    ti++;
  }
  return true;
}

export const DashboardCommand = ({ open, setOpen}: Props) => {
    const router = useRouter();
    const [search, setSearch] = useState("");
    // const [subs,setSubs] = useState<Subscription[]>([])

    // useEffect(() => {
    //     // const fetchSubs = async () => {
    //     //     const res = await fetch('/api/subscriptions');
    //     //     const data = await res.json();
    //     //     // setSubs(data);
    //     // }
    //     // fetchSubs();
    // }, []);

const filteredPages = useMemo(() => {
    if (!search.trim()) return pages;
    return pages.filter((page) =>
      fuzzyMatch(page.label, search)
    );
  }, [search]);


    return (
        <CommandResponsiveDialog
            open={open} 
            onOpenChange={setOpen} 
            shouldFilter={false}
        >
            <CommandInput
                placeholder="Find a meeting or agent..."
                value={search}
                onValueChange={(value) => setSearch(value)}
            />
            <CommandList >
                 <CommandGroup heading="Pages">
          {filteredPages.length === 0 && (
            <CommandEmpty>
              <span className="text-muted-foreground text-sm">
                No pages found
              </span>
            </CommandEmpty>
          )}

          {filteredPages.map((page) => (
            <CommandItem
              className="h-12"
              key={page.href}
              onSelect={() => {
                router.push(page.href!);
                setOpen(false);
              }}
            >
              {page.label}
            </CommandItem>
          ))}
        </CommandGroup>
                <CommandGroup heading="agents">
                    <CommandEmpty>
                        <span className="text-muted-foreground text-sm">
                            No agents found
                        </span>
                    </CommandEmpty>
                    {/* {subs.map((sub) => (
                        <CommandItem 
                            onSelect={() => {router.push(`/agent/${sub.name}`)
                            setOpen(false);
                            }}
                            key={sub.id}
                        >
                            {sub.name}
                        </CommandItem>
                    ))} */}
                </CommandGroup>
            </CommandList>
        </CommandResponsiveDialog>
    )
}
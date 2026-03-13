import { CommandGroup, CommandInput, CommandItem, CommandList, CommandResponsiveDialog } from "@/components/ui/command"

import { Dispatch, SetStateAction, useMemo, useState } from "react";

import { CommandEmpty } from "cmdk";
// import { Subscription } from "@/types/Subscription";
interface Props {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    destinations: Destination[];
    selectedId: string | null;
    onSelect: (id: string) => void;
}

type Destination = {
  id: string;
  name: string;
  lat: number;
  lng: number;
};

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

export const MapCommand = ({ open, setOpen, destinations, selectedId, onSelect}: Props) => {
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

const filteredDestinations = useMemo(() => {
    if (!search.trim()) return destinations;
    return destinations.filter((place) =>
      fuzzyMatch(place.name, search)
    );
  }, [destinations, search]);


    return (
        <CommandResponsiveDialog
            open={open} 
            onOpenChange={setOpen} 
            shouldFilter={false}
        >
            <CommandInput
                placeholder="Search locations..."
                value={search}
                onValueChange={(value) => setSearch(value)}
            />
            <CommandList >
                 <CommandGroup heading="Locations">
          {filteredDestinations.length === 0 && (
            <CommandEmpty>
              <span className="text-muted-foreground text-sm">
                No locations found
              </span>
            </CommandEmpty>
          )}

          {filteredDestinations.map((place) => (
            <CommandItem
              className="h-12"
              key={place.id}
              onSelect={() => {
                onSelect(place.id);
                setOpen(false);
              }}
            >
              <span className="flex-1">{place.name}</span>
              {selectedId === place.id && (
                <span className="text-xs text-muted-foreground">Selected</span>
              )}
            </CommandItem>
          ))}
        </CommandGroup>
            </CommandList>
        </CommandResponsiveDialog>
    )
}

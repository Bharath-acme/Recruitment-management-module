import { useState } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "./ui/popover";
import { Button } from "./ui/button";

import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandGroup,
  CommandEmpty,
} from "./ui/command";

import { Badge } from "./ui/badge";
import { Check, ChevronsUpDown, Plus } from "lucide-react";

interface MultiSelectSkillsProps {
  skillsList: { id: number; name: string }[];
  selectedSkills: { id: number; name: string }[]; // upgraded!
  onChange: (skills: { id: number; name: string }[]) => void;
  allowCreate?: boolean;
}

export function MultiSelectSkills({
  skillsList,
  selectedSkills,
  onChange,
  allowCreate = true,
}: MultiSelectSkillsProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const toggleSkill = (skill: { id: number; name: string }) => {
    const exists = selectedSkills.find((s) => s.id === skill.id);

    if (exists) {
      onChange(selectedSkills.filter((s) => s.id !== skill.id));
    } else {
      onChange([...selectedSkills, skill]);
    }
  };

  const handleCreateSkill = () => {
    const newSkill = { id: Date.now(), name: search };
    onChange([...selectedSkills, newSkill]);
    setOpen(false);
  };

  return (
    <div className="space-y-2">
      {/* Selected Chips */}
      <div className="flex flex-wrap gap-2">
        {selectedSkills.map((skill) => (
          <Badge
            key={skill.id}
            className="px-2 py-1 cursor-pointer"
            variant="secondary"
            onClick={() => toggleSkill(skill)}
          >
            {skill.name} ✕
          </Badge>
        ))}

        {selectedSkills.length === 0 && (
          <p className="text-sm text-gray-500">No skills selected</p>
        )}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between"
          >
            Select skills
            <ChevronsUpDown className="w-4 h-4 opacity-70 ml-2" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-full p-0">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search skills…"
              value={search}
              onValueChange={setSearch}
            />

            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>

              <CommandGroup>
                {skillsList
                  .filter((s) =>
                    s.name.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((skill) => {
                    const isSelected = selectedSkills.some(
                      (s) => s.id === skill.id
                    );

                    return (
                      <CommandItem
                        key={skill.id}
                        value={skill.name}
                        onSelect={() => toggleSkill(skill)}
                      >
                        <Check
                          className={`mr-2 h-4 w-4 ${
                            isSelected ? "opacity-100" : "opacity-0"
                          }`}
                        />
                        {skill.name}
                      </CommandItem>
                    );
                  })}

                {/* Create Skill Option */}
                {allowCreate && search.length > 1 && (
                  <CommandItem
                    className="text-purple-600"
                    onSelect={handleCreateSkill}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create "{search}"
                  </CommandItem>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

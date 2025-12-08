import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Check, X } from 'lucide-react';
import { cn } from '../utils/cn'; // Assuming you have a utility for class concatenation

interface SkillsInputProps {
  initialSkills?: string[];
  onSkillsChange: (skills: string[]) => void;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const SkillsInput: React.FC<SkillsInputProps> = ({ initialSkills = [], onSkillsChange }) => {
  const [inputValue, setInputValue] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(initialSkills);
  const [suggestions, setSuggestions] = useState<{ id: number; name: string }[]>([]);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Effect to load initial skills
  useEffect(() => {
    setSelectedSkills(initialSkills);
  }, [initialSkills]);

  // Debounced API call for skill suggestions
  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/skills/?q=${query}`);
      if (!response.ok) {
        throw new Error('Failed to fetch skills');
      }
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error('Error fetching skill suggestions:', error);
      setSuggestions([]);
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchSuggestions(inputValue);
    }, 300); // Debounce time

    return () => {
      clearTimeout(handler);
    };
  }, [inputValue, fetchSuggestions]);

  // Handle adding a skill
  const addSkill = (skillName: string) => {
    const normalizedSkill = skillName.trim().toLowerCase();
    if (normalizedSkill && !selectedSkills.some(s => s.toLowerCase() === normalizedSkill)) {
      const newSkills = [...selectedSkills, skillName];
      setSelectedSkills(newSkills);
      onSkillsChange(newSkills);
      setInputValue('');
      setSuggestions([]);
    }
    setOpen(false); // Close suggestions after adding
  };

  // Handle removing a skill
  const removeSkill = (skillToRemove: string) => {
    const newSkills = selectedSkills.filter(skill => skill !== skillToRemove);
    setSelectedSkills(newSkills);
    onSkillsChange(newSkills);
  };

  // Input change handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setOpen(true); // Open suggestions when typing
  };

  // Key down handler for input
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission
      if (inputValue) {
        addSkill(inputValue);
      }
    } else if (e.key === 'Backspace' && inputValue === '' && selectedSkills.length > 0) {
      e.preventDefault();
      removeSkill(selectedSkills[selectedSkills.length - 1]);
    }
  };

  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            placeholder="Add skills..."
            className="w-full"
          />
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]">
          <Command>
            <CommandInput value={inputValue} onValueChange={setInputValue} placeholder="Search skills..." />
            <CommandList>
              <CommandEmpty>No skills found.</CommandEmpty>
              <CommandGroup>
                {suggestions.map((skill) => (
                  <CommandItem
                    key={skill.id}
                    onSelect={() => addSkill(skill.name)}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        selectedSkills.some(s => s.toLowerCase() === skill.name.toLowerCase()) ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {skill.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <div className="mt-2 flex flex-wrap gap-2">
        {selectedSkills.map((skill) => (
          <Badge key={skill} variant="secondary" className="pr-1 flex items-center gap-1">
            {skill}
            <button
              type="button"
              onClick={() => removeSkill(skill)}
              className="ml-1 focus:outline-none"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
};

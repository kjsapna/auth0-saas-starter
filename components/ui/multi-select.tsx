// components/ui/multi-select.tsx
import * as React from "react"
import { Check, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface MultiSelectProps {
  options?: { value: string; label: string }[]
  defaultValue?: string[]
  onValueChange: (value: string[]) => void
  placeholder?: string
  className?: string
}

export function MultiSelect({
  options = [],
  defaultValue = [],
  onValueChange,
  placeholder = "Select options",
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [selected, setSelected] = React.useState<string[]>(defaultValue || [])
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  // Update selected state when defaultValue changes
  React.useEffect(() => {
    setSelected(defaultValue)
  }, [defaultValue])

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSelect = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value]
    setSelected(newSelected)
    onValueChange(newSelected)
  }

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      {/* Toggle Button */}
      <Button
        variant="outline"
        className="w-full justify-between"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span>
          {selected.length > 0
            ? selected
                .map(
                  (value) =>
                    options.find((opt) => opt.value === value)?.label || value
                )
                .join(", ")
            : placeholder}
        </span>
        {open ? (
          <ChevronUp className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        ) : (
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        )}
      </Button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-1 shadow-md">
          {options.length === 0 ? (
            <div className="p-2 text-sm text-muted-foreground">
              No options available
            </div>
          ) : (
            <ul className="max-h-60 overflow-auto">
              {options.map((option) => (
                <li
                  key={option.value}
                  className="flex items-center p-2 hover:bg-accent hover:text-accent-foreground cursor-pointer rounded-md"
                  onClick={() => handleSelect(option.value)}
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(option.value)}
                    onChange={() => handleSelect(option.value)}
                    className="mr-2 h-4 w-4"
                  />
                  <span>{option.label}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
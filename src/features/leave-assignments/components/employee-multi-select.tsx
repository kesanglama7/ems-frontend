"use client";
import { useState } from "react";
import { ChevronsUpDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { AssignedEmployee } from "../types/leave-assignment.types";
interface Props {
  value: string[];
  onChange: (ids: string[]) => void;
  options: AssignedEmployee[];
  search: string;
  onSearch: (value: string) => void;
  disabled?: boolean;
  loading: boolean;
  error: boolean;
  retry: () => unknown;
  hasMore?: boolean;
  loadingMore?: boolean;
  loadMore: () => unknown;
}
export function EmployeeMultiSelect({
  value,
  onChange,
  options,
  search,
  onSearch,
  disabled,
  loading,
  error,
  retry,
  hasMore,
  loadingMore,
  loadMore,
}: Props) {
  const [names, setNames] = useState<Record<string, string>>({});
  function toggle(employee: AssignedEmployee, checked: boolean) {
    if (checked) {
      setNames((previous) => ({
        ...previous,
        [employee.id]: `${employee.firstName} ${employee.lastName}`,
      }));
      onChange([...value, employee.id]);
    } else onChange(value.filter((id) => id !== employee.id));
  }
  return (
    <div className="space-y-2">
      <Popover>
        <PopoverTrigger
          render={
            <Button
              id="leave-assignment-employees"
              type="button"
              variant="outline"
              className="w-full justify-between"
              disabled={disabled}
            />
          }
        >
          {value.length
            ? `${value.length} employees selected`
            : "Choose employees"}
          <ChevronsUpDown className="size-4" />
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[min(26rem,calc(100vw-3rem))] gap-2 p-3"
        >
          <Input
            aria-label="Search employees"
            placeholder="Search name, email or employee code…"
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            disabled={disabled}
          />
          <div className="max-h-64 space-y-1 overflow-y-auto">
            {loading ? (
              <p role="status" className="p-3 text-sm">
                Loading employees…
              </p>
            ) : error ? (
              <div role="alert" className="p-3 text-sm">
                Could not load employees.
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => void retry()}
                >
                  Retry
                </Button>
              </div>
            ) : (
              <>
                {options.map((employee) => (
                  <label
                    key={employee.id}
                    className="flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-muted"
                  >
                    <Checkbox
                      checked={value.includes(employee.id)}
                      onCheckedChange={(checked) => toggle(employee, checked)}
                      disabled={
                        disabled ||
                        (!value.includes(employee.id) && value.length >= 100)
                      }
                    />
                    <span>
                      <span className="block text-sm font-medium">
                        {employee.firstName} {employee.lastName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {employee.employeeCode}
                      </span>
                    </span>
                  </label>
                ))}
                {!options.length && (
                  <p className="p-3 text-sm text-muted-foreground">
                    No matching employees on the loaded pages.
                  </p>
                )}
              </>
            )}
          </div>
          {hasMore && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={loadingMore || disabled}
              onClick={() => void loadMore()}
            >
              {loadingMore ? "Loading…" : "Load more employees"}
            </Button>
          )}
          <p className="text-xs text-muted-foreground">
            Choose up to 100 employees. Selection stays when you search.
          </p>
        </PopoverContent>
      </Popover>
      {!!value.length && (
        <div className="flex flex-wrap gap-2">
          {value.map((id) => (
            <span
              key={id}
              className="flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs"
            >
              {names[id] ??
                options.find((employee) => employee.id === id)?.firstName ??
                id}
              <button
                type="button"
                disabled={disabled}
                aria-label={`Deselect ${names[id] ?? id}`}
                onClick={() => onChange(value.filter((item) => item !== id))}
              >
                <X className="size-3.5" />
              </button>
            </span>
          ))}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={disabled}
            onClick={() => onChange([])}
          >
            Clear
          </Button>
        </div>
      )}
    </div>
  );
}

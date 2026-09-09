'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Portal } from "@/components/ui/portal";
import { useEmployeesInfinite } from "@/features/employees/hooks/use-employees-infinite";
import { getInitials } from "@/lib/name-shorten";
import { Search } from "lucide-react";
import { useMemo, useRef, useState } from "react";

interface EmployeeSearchSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function EmployeeSearchSelect({
  value,
  onChange,
  disabled,
}: EmployeeSearchSelectProps) {
  const [search, setSearch] =
    useState("");

  const [isOpen, setIsOpen] =
    useState(false);

  const [dropdownRect, setDropdownRect] =
    useState<DOMRect | null>(null);

  const triggerRef =
    useRef<HTMLButtonElement>(null);

  const scrollRef =
    useRef<HTMLDivElement>(null);

  const {
    data: pages,
    isPending,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useEmployeesInfinite({
    search: search || undefined,
    limit: 20,
  });

  const allEmployees = useMemo(
    () =>
      pages?.pages.flatMap(
        (page) => page.data,
      ) ?? [],
    [pages],
  );

  const selectedEmployee = useMemo(
    () =>
      allEmployees.find(
        (employee) =>
          employee.id === value,
      ),
    [allEmployees, value],
  );

  function handleTriggerClick() {
    if (disabled) {
      return;
    }

    if (isOpen) {
      setIsOpen(false);
      setSearch("");
      return;
    }

    if (triggerRef.current) {
      setDropdownRect(
        triggerRef.current.getBoundingClientRect(),
      );
    }

    setIsOpen(true);
  }

  const handleScroll = useMemo(
    () => () => {
      if (!scrollRef.current) {
        return;
      }

      const {
        scrollTop,
        scrollHeight,
        clientHeight,
      } = scrollRef.current;

      const isNearBottom =
        scrollHeight - scrollTop <=
        clientHeight + 50;

      if (
        isNearBottom &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        void fetchNextPage();
      }
    },
    [
      hasNextPage,
      isFetchingNextPage,
      fetchNextPage,
    ],
  );

  function handleSelectEmployee(
    employeeId: string,
  ) {
    onChange(employeeId);
    setIsOpen(false);
    setSearch("");
  }

  function handleClear() {
    onChange("");
    setSearch("");
    setIsOpen(false);
  }

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={handleTriggerClick}
        disabled={disabled}
        className="flex h-9 w-full items-center justify-between gap-1.5 rounded-md border border-input bg-transparent px-2.5 py-2 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {selectedEmployee ? (
          <div className="flex items-center gap-2 truncate">
            <Avatar className="size-5">
              <AvatarImage src={selectedEmployee.profileImageUrl} />
              <AvatarFallback className="text-xs">
                {getInitials(
                  selectedEmployee.firstName,
                  selectedEmployee.lastName,
                )}
              </AvatarFallback> 
            </Avatar>

            <span className="truncate">
              {selectedEmployee.firstName}{" "}
              {selectedEmployee.lastName}
            </span>
          </div>
        ) : (
          <span className="text-muted-foreground">
            Select employee
          </span>
        )}

        <svg
          className="size-4 shrink-0 text-muted-foreground"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {isOpen && dropdownRect && (
        <Portal>
          <div
            className="fixed z-50 mt-1 w-72 rounded-md border bg-popover text-popover-foreground shadow-md"
            style={{
              left: dropdownRect.left,
              top:
                dropdownRect.bottom + 4,
              width:
                dropdownRect.width,
            }}
          >
            <div className="flex items-center gap-2 border-b px-3 py-2">
              <Search className="size-4 shrink-0 text-muted-foreground" />

              <input
                type="text"
                placeholder="Search by name or code..."
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                className="flex h-8 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                autoFocus
              />

              {value && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="shrink-0 text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </div>

            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="max-h-60 overflow-y-auto p-1"
            >
              <button
                type="button"
                onClick={() =>
                  handleSelectEmployee("")
                }
                className={`flex w-full items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${
                  !value
                    ? "bg-accent text-accent-foreground"
                    : ""
                }`}
              >
                All employees
              </button>

              {isPending ? (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  Loading...
                </div>
              ) : allEmployees.length ===
                0 ? (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  No employees found
                </div>
              ) : (
                allEmployees.map(
                  (employee) => (
                    <button
                      key={
                        employee.id
                      }
                      type="button"
                      onClick={() =>
                        handleSelectEmployee(
                          employee.id,
                        )
                      }
                      className={`flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${
                        value ===
                        employee.id
                          ? "bg-accent text-accent-foreground"
                          : ""
                      }`}
                    >
                      <Avatar className="size-6">
                        <AvatarImage src={employee.profileImageUrl} />
                        <AvatarFallback className="text-xs">
                          {getInitials(
                            employee.firstName,
                            employee.lastName,
                          )}
                        </AvatarFallback>
                      </Avatar>

                      <span className="truncate">
                        {
                          employee.firstName
                        }{" "}
                        {
                          employee.lastName
                        }
                      </span>
                    </button>
                  ),
                )
              )}

              {isFetchingNextPage && (
                <div className="px-2 py-1.5 text-center text-sm text-muted-foreground">
                  Loading more...
                </div>
              )}
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
import { Transition } from "@headlessui/react";
import { Search, X } from "lucide-react";
import { useState, useRef } from "react";
import { Input } from "./ui/input";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const SearchInput = () => {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="relative">
      <button
        className={` ${
          open ? "border-l-0 rounded-l-none" : ""
        } border border-blue-500 text-blue-500 rounded-sm p-1 h-10 transition-all duration-75 ease-in-out z-10`}
        onClick={() => {
          wait(200).then(() => {
            inputRef.current?.focus();
          });
          setOpen((prev) => !prev);
        }}
      >
        <Search size={24} />
      </button>
      <Transition
        enter="transition-opacity duration-75"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        show={open}
      >
        <div className="absolute top-0 left-0  -translate-x-[85%]">
          <Input
            ref={inputRef}
            className="z-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-blue-200 outline-none w-56 border border-blue-500"
            type="text"
            placeholder="Find a Sign"
          />
          <button
            onClick={() => {
              setOpen(false);
            }}
          >
            <X className="absolute right-2 top-2" />
          </button>
        </div>
      </Transition>
    </div>
  );
};

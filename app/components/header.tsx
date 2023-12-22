import { Cross2Icon, HamburgerMenuIcon } from "@radix-ui/react-icons";
import * as Dialog from "@radix-ui/react-dialog";
import { Input } from "./ui/input";
import { Form, NavLink } from "@remix-run/react";
import { useRef, useState } from "react";
import { User } from "@prisma/client";
import { Button } from "./ui/button";
import { HistoryIcon, LayoutDashboard, UserIcon } from "lucide-react";

// const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function Header({ user }: { user: Pick<User, "email" | "id"> | null }) {
  const [open, setOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const isLoggedIn = Boolean(user);
  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
  return (
    <header className="flex justify-between items-center px-2 bg-gray-200 p-6">
      <div className="flex justify-between w-full items-center">
        <NavLink to="/">
          <h1 className="text-6xl">
            <span className="font-bold text-blue-400">dact</span>ylo
          </h1>
        </NavLink>
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger className="w-12 h-12 text-gray-900">
            <HamburgerMenuIcon className="w-12 h-12 text-gray-900" />
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="bg-gray-800 opacity-70 data-[state=open]:animate-overlayShow fixed inset-0" />
            <Dialog.Content
              onOpenAutoFocus={() => {
                // wait for the dialog to be in the DOM
                // then focus the input, super weird but it works
                wait(1).then(() => {
                  searchInputRef.current?.focus();
                });
              }}
              className="data-[state=open]:animate-contentShow fixed w-screen h-[100svh] top-0 bg-white p-4 focus:outline-none"
            >
              <div className="h-full relative ">
                <div className="flex justify-between items-center pb-2">
                  <h2 className="text-2xl font-bold">Menu</h2>
                  <Dialog.Close className="border-2 m-2 border-gray-900 rounded-full">
                    <Cross2Icon className="w-8 h-8" />
                  </Dialog.Close>
                </div>
                <div>
                  <Input
                    ref={searchInputRef}
                    placeholder="Search"
                    className="order-1"
                  />
                </div>
                <div className="py-2">
                  <ul className="flex flex-col space-y-3">
                    {isLoggedIn && (
                      <li className="w-full p-2">
                        <NavLink
                          className={({ isActive }) =>
                            `${
                              isActive
                                ? "text-blue-500 font-bold"
                                : "text-grey-200"
                            }`
                          }
                          onClick={() => setOpen(false)}
                          to="/dashboard"
                        >
                          <div className="flex gap-x-2 items-center">
                            <UserIcon size={24} />
                            <span>Dashboard</span>
                          </div>
                        </NavLink>
                      </li>
                    )}
                    <li className="w-full p-2">
                      <NavLink
                        className={({ isActive }) =>
                          `${
                            isActive
                              ? "text-blue-500 font-bold"
                              : "text-grey-200"
                          } `
                        }
                        onClick={() => setOpen(false)}
                        to="/categories"
                      >
                        <div className="flex gap-x-2 items-center">
                          <LayoutDashboard size={24} />
                          <span>Categories</span>
                        </div>
                      </NavLink>
                    </li>
                    <li className="w-full p-2">
                      <NavLink
                        className={({ isActive }) =>
                          `${
                            isActive
                              ? "text-blue-500 font-bold"
                              : "text-grey-200"
                          }`
                        }
                        onClick={() => setOpen(false)}
                        to="/recent"
                      >
                        <div className="flex gap-x-2 items-center">
                          <HistoryIcon size={24} />
                          <span>Recently Added</span>
                        </div>
                      </NavLink>
                    </li>
                  </ul>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  {isLoggedIn ? (
                    <div className="flex justify-between items-center">
                      <p>{user?.email}</p>
                      <Form
                        className="float-right"
                        method="POST"
                        action="/auth/logout"
                        onSubmit={() => {
                          setOpen(false);
                        }}
                      >
                        <Button>Logout</Button>
                      </Form>
                    </div>
                  ) : (
                    <div className="flex justify-center">
                      <p>
                        <NavLink
                          className="bg-primary px-3 py-2 rounded-sm text-primary-foreground hover:underline"
                          onClick={() => {
                            setOpen(false);
                          }}
                          to="/auth/login"
                        >
                          Login
                        </NavLink>{" "}
                        or{" "}
                        <NavLink
                          className="text-blue-400"
                          onClick={() => {
                            setOpen(false);
                          }}
                          to="/auth/signup"
                        >
                          Sign-up
                        </NavLink>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </header>
  );
}

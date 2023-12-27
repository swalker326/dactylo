import * as Dialog from "@radix-ui/react-dialog";
import { Form, Link, NavLink, useFetcher, useLocation } from "@remix-run/react";
import { useState } from "react";
import { User } from "@prisma/client";
import { Button } from "./ui/button";
import {
  Home,
  LayoutDashboard,
  TrendingUp,
  UserIcon,
  X,
  Menu
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuTrigger
} from "./ui/dropdown-menu";

// const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const NAV_LINKS: Record<
  string,
  {
    title: string;
    icon: React.ReactNode;
    condition?: (user: Pick<User, "email" | "id"> | null) => boolean;
  }
> = {
  "/": {
    title: "Home",
    icon: <Home size={24} />
  },
  "/categories": {
    title: "Categories",
    icon: <LayoutDashboard size={24} />
  },
  "/trending": {
    title: "Trending",
    icon: <TrendingUp size={24} />
  },
  "/dashboard": {
    condition: (user: Pick<User, "email" | "id"> | null | null) =>
      Boolean(user),
    title: "Dashboard",
    icon: <UserIcon size={24} />
  }
};

export function Header({ user }: { user: Pick<User, "email" | "id"> | null }) {
  const [open, setOpen] = useState(false);
  const isLoggedIn = Boolean(user);
  const loc = useLocation();
  return (
    <header className="flex justify-between items-center p-2 bg-white">
      <div className="flex justify-between w-full items-center">
        <NavLink to="/">
          <h1 className="text-6xl">
            <span className="font-bold text-blue-600">dact</span>ylo
          </h1>
        </NavLink>
        <div className="hidden sm:flex">
          <div>
            <ul className="flex gap-6">
              {Object.entries(NAV_LINKS).map(([path, values]) => {
                const { icon } = values;
                if (values.condition && values.condition(user) === false) {
                  return null;
                }
                return (
                  <li key={path}>
                    <NavLink
                      to={path}
                      className={({ isActive }) =>
                        `${
                          isActive
                            ? "text-blue-500 font-bold "
                            : "text-grey-200"
                        }`
                      }
                    >
                      {icon}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
        <div className="hidden sm:flex">
          <UserDropdown user={user} />
        </div>
        <div className="flex sm:hidden">
          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger className="w-12 h-12 text-gray-900">
              <Menu size={32} className="text-gray-900" />
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="bg-gray-800 opacity-70 data-[state=open]:animate-overlayShow fixed inset-0" />
              <Dialog.Content className="data-[state=open]:animate-contentShow fixed w-screen h-[100svh] top-0 bg-white p-4 focus:outline-none">
                <div className="h-full relative ">
                  <div className="flex justify-between items-center pb-2">
                    <h2 className="text-2xl font-bold">Menu</h2>
                    <Dialog.Close className="border-2 m-2 border-gray-900 rounded-full">
                      <X size={22} />
                    </Dialog.Close>
                  </div>
                  <div className="py-2">
                    <ul className="flex flex-col space-y-3">
                      {Object.entries(NAV_LINKS).map(([path, values]) => {
                        const { icon, title } = values;
                        if (
                          values.condition &&
                          values.condition(user) === false
                        ) {
                          return null;
                        }
                        return (
                          <li key={path}>
                            <NavLink
                              className={({ isActive }) =>
                                `${
                                  isActive
                                    ? "text-blue-500 font-bold "
                                    : "text-grey-200"
                                }`
                              }
                              onClick={() => setOpen(false)}
                              to={path}
                            >
                              <div className="flex gap-x-2 items-center">
                                {icon}
                                <span>{title}</span>
                              </div>
                            </NavLink>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  <div
                    className={`absolute bottom-0 left-0 right-0 p-3 ${
                      loc.pathname.startsWith("/dashboard") ? "pb-14" : ""
                    }`}
                  >
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
      </div>
    </header>
  );
}

const UserDropdown = ({
  user
}: {
  user: Pick<User, "email" | "id"> | null;
}) => {
  const fetcher = useFetcher();
  if (!user) {
    return (
      <Link
        to="/auth/login"
        className="text-white p-2 rounded-md flex items-center gap-x-1 bg-blue-500 hover:bg-blue-600"
      >
        Login
      </Link>
    );
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex gap-x-1">
          <Button className="flex items-center gap-x-1 bg-blue-500 hover:bg-blue-600">
            {user.email}
          </Button>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent className="w-40 bg-gray-100 shadow-lg rounded-b-lg">
          <fetcher.Form method="POST" action="/auth/logout">
            <button className="outline-blue-500 w-full text-left p-2">
              Logout
            </button>
          </fetcher.Form>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  );
};

import { MetaFunction } from "@remix-run/node";
import { NavLink, Outlet } from "@remix-run/react";
import { CameraIcon, Home, Settings, Upload } from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    {
      title: "Dactylo | Dashboard",
      keywords: "asl, american sign language, learn, teach, dactylo"
    },
    { name: "description", content: "Learning ASL with others" }
  ];
};

export default function DashboardRoute() {
  return (
    <div className="flex flex-col">
      <div className="fixed bottom-0 flex border justify-evenly right-0 left-0 z-10 bg-white max-w-[100svw] h-[60px] ">
        <NavLink
          unstable_viewTransition
          end
          className={({ isActive }) => {
            return `px-2 py-2 w-full flex justify-center items-center flex-1 ${
              isActive ? "bg-gray-200 text-blue-400" : ""
            }`;
          }}
          to="/dashboard"
        >
          <Home size={28} />
        </NavLink>
        <NavLink
          unstable_viewTransition
          end
          className={({ isActive }) => {
            return `px-2 py-2 w-full flex justify-center items-center flex-1 ${
              isActive ? "bg-gray-200 text-blue-400" : ""
            }`;
          }}
          to="create"
        >
          <CameraIcon size={28} />
        </NavLink>
        <NavLink
          unstable_viewTransition
          end
          className={({ isActive }) => {
            return `px-2 py-2 flex justify-center items-center flex-1 ${
              isActive ? "bg-gray-200 text-blue-400" : ""
            }`;
          }}
          to="settings"
        >
          <Settings size={28} />
        </NavLink>
        <NavLink
          unstable_viewTransition
          end
          className={({ isActive }) => {
            return `px-2 py-2 flex justify-center items-center flex-1  ${
              isActive ? "bg-gray-200 text-blue-400" : ""
            }`;
          }}
          to="upload"
        >
          <Upload size={28} />
        </NavLink>
      </div>
      <div className="pt-3 pb-8">
        <Outlet />
      </div>
    </div>
  );
}

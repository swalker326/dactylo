import { NavLink, Outlet } from "@remix-run/react";
import { CameraIcon, Home, Settings, Upload } from "lucide-react";

export default function DashboardRoute() {
  return (
    <div className="flex flex-col">
      <div className="fixed bottom-0 flex border justify-evenly right-0 left-0 z-10 bg-white max-w-[100svw]">
        <NavLink
          unstable_viewTransition
          end
          className={({ isActive }) => {
            return `px-2 py-2 w-full flex justify-center flex-1 ${
              isActive ? "bg-gray-200 text-blue-400" : ""
            }`;
          }}
          to="/dashboard"
        >
          <Home size={24} />
        </NavLink>
        <NavLink
          unstable_viewTransition
          end
          className={({ isActive }) => {
            return `px-2 py-2 w-full flex justify-center flex-1 ${
              isActive ? "bg-gray-200 text-blue-400" : ""
            }`;
          }}
          to="create"
        >
          <CameraIcon size={24} />
        </NavLink>
        <NavLink
          unstable_viewTransition
          end
          className={({ isActive }) => {
            return `px-2 py-2 flex justify-center flex-1 ${
              isActive ? "bg-gray-200 text-blue-400" : ""
            }`;
          }}
          to="settings"
        >
          <Settings size={24} />
        </NavLink>
        <NavLink
          unstable_viewTransition
          end
          className={({ isActive }) => {
            return `px-2 py-2 flex justify-center flex-1  ${
              isActive ? "bg-gray-200 text-blue-400" : ""
            }`;
          }}
          to="upload"
        >
          <Upload size={24} />
        </NavLink>
      </div>
      <div className="pt-3 pb-8">
        <Outlet />
      </div>
    </div>
  );
}

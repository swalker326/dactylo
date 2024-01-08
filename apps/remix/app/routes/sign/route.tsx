import { Outlet } from "@remix-run/react";

export async function loader() {
  return { message: "Sign" };
}

export async function action() {}

export default function SignRoute() {
  return <Outlet />;
}

import { useFetcher } from "@remix-run/react";
import CameraComponent from "~/components/camera";

export async function action() {
  return { title: "Create" };
}

export default function CreateRoute() {
  const fetcher = useFetcher();

  return (
    <div className="flex flex-col">
      <h2 className="text-4xl">Create</h2>
      <CameraComponent />
      <fetcher.Form></fetcher.Form>
    </div>
  );
}

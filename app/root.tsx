import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData
} from "@remix-run/react";
import "~/tailwind.css";
import { Button } from "./components/ui/button";
import { csrf } from "./utils/csrf.server";
import { json } from "@remix-run/node";
import { combineHeaders } from "./utils/misc";
import { AuthenticityTokenProvider } from "remix-utils/csrf/react";

export async function loader() {
  const [csrfToken, csrfCookieHeader] = await csrf.commitToken();
  console.log("Commited token", csrfToken, csrfCookieHeader);
  return json(
    { csrfToken },
    {
      headers: combineHeaders(
        csrfCookieHeader ? { "set-cookie": csrfCookieHeader } : null
      )
    }
  );
}

export default function App() {
  const data = useLoaderData<typeof loader>();
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="">
        <AuthenticityTokenProvider token={data.csrfToken}>
          <div className="min-h-screen flex flex-col">
            <header className="flex justify-between items-center px-2 mb-2 bg-gray-200 p-6">
              <h1 className="text-6xl">
                <span className="font-bold text-blue-400">dact</span>ylo
              </h1>
            </header>
            <div className="container flex-1">
              <Outlet />
            </div>
            <footer className="flex justify-between items-center px-2 mt-2">
              <p>© 2024 Dactylo</p>
            </footer>
          </div>
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </AuthenticityTokenProvider>
      </body>
    </html>
  );
}

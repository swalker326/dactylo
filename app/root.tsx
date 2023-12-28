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
import { csrf } from "./utils/csrf.server";
import { HeadersFunction, LoaderFunctionArgs, json } from "@remix-run/node";
import { AuthenticityTokenProvider } from "remix-utils/csrf/react";
import { Header } from "./components/header";
import { getUserId } from "./services/auth.server";
import { prisma } from "./db.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const [csrfToken, csrfCookieHeader] = await csrf.commitToken();
  const userId = await getUserId(request);
  if (!userId)
    return json(
      { csrfToken, user: null },
      {
        headers: { "set-cookie": csrfCookieHeader || "" }
      }
    );
  const user = await prisma.user.findUnique({
    select: {
      id: true,
      email: true,
      image: { select: { id: true } },
      roles: {
        select: {
          name: true,
          permissions: {
            select: { entity: true, action: true, access: true }
          }
        }
      }
    },
    where: { id: userId }
  });
  const response = json(
    { csrfToken, user },
    {
      headers: { "set-cookie": csrfCookieHeader || "" }
    }
  );
  return response;
}

export const headers: HeadersFunction = ({ loaderHeaders }) => {
  const headers = {
    "set-cookie": loaderHeaders.get("set-cookie") ?? "",
    "Server-Timing": loaderHeaders.get("Server-Timing") ?? ""
  };
  return headers;
};

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
          <div className="min-h-[100svh] flex flex-col">
            <Header user={data.user || null} />
            <div className="flex flex-col container p-2 sm:p-4 mt-16 max-w-full md:max-w-5xl flex-grow ">
              <Outlet />
            </div>
            <footer className=" hidden md:flex  justify-between items-center px-2 mt-2">
              <p>© 2024 Dactylo</p>
            </footer>
          </div>
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </AuthenticityTokenProvider>
        <div id="camera-root"></div>
      </body>
    </html>
  );
}

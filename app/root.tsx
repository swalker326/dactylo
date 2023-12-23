import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData
} from "@remix-run/react";
import rdtStylesheet from "remix-development-tools/index.css";
import styles from "~/tailwind.css";
import { csrf } from "./utils/csrf.server";
import {
  HeadersFunction,
  LinksFunction,
  LoaderFunctionArgs,
  json
} from "@remix-run/node";
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
    where: { id: userId },
    select: { id: true, email: true }
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

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
  ...(process.env.NODE_ENV === "development"
    ? [{ rel: "stylesheet", href: rdtStylesheet }]
    : [])
];

function App() {
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
            <div className="container p-2 flex-1">
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

let AppExport = App;
if (process.env.NODE_ENV === "development") {
  const { withDevTools } = await import("remix-development-tools");
  AppExport = withDevTools(AppExport);
}

export default AppExport;

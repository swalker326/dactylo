import { useActionData, useLoaderData } from "@remix-run/react";
import * as _superjson from "superjson";

export type SuperJsonFunction = <Data>(
  data: Data,
  init?: number | ResponseInit
) => SuperTypedResponse<Data>;

export declare type SuperTypedResponse<T> = Response & {
  superjson(): Promise<T>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AppData = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DataFunction = (...args: any[]) => unknown; // matches any function
type DataOrFunction = AppData | DataFunction;

export type UseDataFunctionReturn<T extends DataOrFunction> = T extends (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...args: any[]
) => infer Output
  ? Awaited<Output> extends SuperTypedResponse<infer U>
    ? U
    : Awaited<ReturnType<T>>
  : Awaited<T>;

export const superjson: SuperJsonFunction = (data, init = {}) => {
  const responseInit = typeof init === "number" ? { status: init } : init;
  const headers = new Headers(responseInit.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json; charset=utf-8");
  }
  return new Response(_superjson.stringify(data), {
    ...responseInit,
    headers
  }) as SuperTypedResponse<typeof data>;
};

export function useSuperLoaderData<T = AppData>(): UseDataFunctionReturn<T> {
  const data = useLoaderData<T>();
  //@ts-expect-error superjson types are wrong
  return _superjson.deserialize(data);
}
export function useSuperActionData<
  T = AppData
>(): UseDataFunctionReturn<T> | null {
  const data = useActionData();
  //@ts-expect-error superjson types are wrong
  return data ? _superjson.deserialize(data) : null;
}

export type RedirectFunction = (
  url: string,
  init?: number | ResponseInit
) => SuperTypedResponse<never>;

/**
 * A redirect response. Sets the status code and the `Location` header.
 * Defaults to "302 Found".
 *
 * @see https://remix.run/api/remix#redirect
 */
export const redirect: RedirectFunction = (url, init = 302) => {
  let responseInit = init;
  if (typeof responseInit === "number") {
    responseInit = { status: responseInit };
  } else if (typeof responseInit.status === "undefined") {
    responseInit.status = 302;
  }

  const headers = new Headers(responseInit.headers);
  headers.set("Location", url);

  return new Response(null, {
    ...responseInit,
    headers
  }) as SuperTypedResponse<never>;
};

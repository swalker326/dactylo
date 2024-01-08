import * as React from "react";
import { useSpinDelay } from "spin-delay";
import { Button, type ButtonProps } from "./button";
import Spinner from "~/icons/spinner.svg?react";
import { cn } from "~/lib/utils";

type FetcherStates = "idle" | "loading" | "submitting";

export const StatusButton = React.forwardRef<
  HTMLButtonElement,
  ButtonProps & {
    status: FetcherStates;
    message?: string | null;
    spinDelay?: Parameters<typeof useSpinDelay>[1];
  }
>(({ status, children, className, spinDelay, ...props }, ref) => {
  const delayedPending = useSpinDelay(status !== "idle", {
    delay: 400,
    minDuration: 300,
    ...spinDelay
  });
  const companion = {
    submitting: delayedPending ? (
      <Spinner className=" animate-spin  -ml-1 mr-3 h-6 w-6 text-white" />
    ) : null,
    loading: (
      <Spinner className=" animate-spin  -ml-1 mr-3 h-6 w-6 text-white" />
    ),
    error: <Spinner className=" animate-spin  -ml-1 mr-3 h-6 w-6 text-white" />,
    idle: null
  }[status];

  return (
    <div className="w-full relative">
      <Button
        ref={ref}
        className={cn("flex gap-1 w-full", className)}
        {...props}
      >
        <div>{children}</div>
      </Button>
      {!!companion && (
        <div className="top-0 w-full h-full absolute bg-gray-500 opacity-50 rounded-lg">
          <div className="h-full flex justify-center items-center border">
            <div>{companion}</div>
          </div>
        </div>
      )}
    </div>
  );
});
StatusButton.displayName = "Button";

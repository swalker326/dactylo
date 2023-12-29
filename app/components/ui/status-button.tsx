import * as React from "react";
import { useSpinDelay } from "spin-delay";
import { cn } from "~/utils/misc";
import { Button, type ButtonProps } from "./button";
import Spinner from "~/icons/spinner.svg?react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "./tooltip";

type FetcherStates = "idle" | "loading" | "submitting";

export const StatusButton = React.forwardRef<
  HTMLButtonElement,
  ButtonProps & {
    status: FetcherStates;
    message?: string | null;
    spinDelay?: Parameters<typeof useSpinDelay>[1];
  }
>(({ message, status, className, children, spinDelay, ...props }, ref) => {
  const delayedPending = useSpinDelay(status !== "idle", {
    delay: 400,
    minDuration: 300,
    ...spinDelay
  });
  const companion = {
    submitting: delayedPending ? (
      <div className="inline-flex h-6 w-6 items-center justify-center">
        <Spinner className=" animate-spin  -ml-1 mr-3 h-6 w-6 text-white" />
      </div>
    ) : null,
    loading: (
      <div className="inline-flex h-6 w-6 items-center justify-center">
        <Spinner className=" animate-spin  -ml-1 mr-3 h-6 w-6 text-white" />
      </div>
    ),
    error: (
      <div className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-destructive">
        <Spinner className=" animate-spin  -ml-1 mr-3 h-6 w-6 text-white" />
      </div>
    ),
    idle: null
  }[status];

  return (
    <Button
      ref={ref}
      className={cn("flex justify-center gap-4", className)}
      {...props}
    >
      <div>{children}</div>
      {message ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>{companion}</TooltipTrigger>
            <TooltipContent>{message}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        companion
      )}
    </Button>
  );
});
StatusButton.displayName = "Button";

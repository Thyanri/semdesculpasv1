import { HTMLAttributes, forwardRef } from "react";
import { cn } from "../utils/cn";

export interface LoadingSkeletonProps extends HTMLAttributes<HTMLDivElement> {}

export const LoadingSkeleton = forwardRef<HTMLDivElement, LoadingSkeletonProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("animate-pulse rounded-brand bg-brand-card", className)}
        {...props}
      />
    );
  }
);

LoadingSkeleton.displayName = "LoadingSkeleton";

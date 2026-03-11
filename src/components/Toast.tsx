import { HTMLAttributes, forwardRef } from "react";
import { cn } from "../utils/cn";

export interface ToastProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "error";
  message: string;
}

export const Toast = forwardRef<HTMLDivElement, ToastProps>(
  ({ variant = "default", message, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-3 rounded-brand bg-brand-card p-4 shadow-lg border border-white/5",
          variant === "error" && "border-l-4 border-l-brand-accent",
          className
        )}
        {...props}
      >
        {variant === "error" && (
          <svg
            className="h-5 w-5 text-brand-accent shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        <p className="text-sm font-medium text-brand-text">{message}</p>
      </div>
    );
  }
);

Toast.displayName = "Toast";

"use client";

import type { ComponentProps } from "react";

type PrintButtonProps = Omit<ComponentProps<"button">, "onClick" | "type">;

const base =
  "rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 print:hidden";

export default function PrintButton({ className, ...rest }: PrintButtonProps) {
  return (
    <button
      {...rest}
      type="button"
      className={className ? `${base} ${className}` : base}
      onClick={() => {
        window.print();
      }}
    />
  );
}

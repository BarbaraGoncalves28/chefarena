type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ variant = "primary", className = "", children, ...props }: ButtonProps) {
  const baseStyles =
    "inline-flex w-full items-center justify-center rounded-3xl px-5 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60";

  const variants: Record<string, string> = {
    primary: "bg-amber-500 text-slate-950 hover:bg-amber-400",
    secondary: "border border-slate-700 bg-slate-900 text-white hover:bg-slate-800",
    ghost: "text-slate-200 hover:text-white",
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

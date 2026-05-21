import { useId } from "react";

type TextFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
};

export function TextField({ label, hint, error, className = "", ...props }: TextFieldProps) {
  const id = useId();
  return (
    <div className={`space-y-2 ${className}`}>
      <label htmlFor={id} className="block text-sm font-medium text-slate-200">
        {label}
      </label>
      <input
        id={id}
        className={`w-full rounded-3xl border px-4 py-3 text-sm text-white shadow-sm outline-none transition duration-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400 focus:ring-offset-0 bg-slate-950 border-slate-800 ${error ? "border-rose-400" : "border-slate-700"}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        {...props}
      />
      {hint ? <p id={`${id}-hint`} className="text-xs text-slate-500">{hint}</p> : null}
      {error ? <p id={`${id}-error`} className="text-xs text-rose-400">{error}</p> : null}
    </div>
  );
}

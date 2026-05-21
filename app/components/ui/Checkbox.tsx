import { useId } from "react";

type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function Checkbox({ label, className = "", ...props }: CheckboxProps) {
  const id = useId();
  return (
    <label htmlFor={id} className={`inline-flex cursor-pointer items-center gap-3 text-sm text-slate-200 ${className}`}>
      <input
        id={id}
        type="checkbox"
        className="h-5 w-5 rounded-xl border border-slate-700 bg-slate-950 text-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
        {...props}
      />
      <span>{label}</span>
    </label>
  );
}

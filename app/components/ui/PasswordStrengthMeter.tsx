type StrengthState = {
  label: string;
  score: number;
  colorClass: string;
  feedback: string;
};

function evaluatePassword(password: string): StrengthState {
  if (!password) {
    return {
      label: "No password",
      score: 0,
      colorClass: "bg-slate-600",
      feedback: "Enter a strong password with letters, numbers, and symbols.",
    };
  }

  const lengthScore = Math.min(password.length / 12, 1);
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  const criteria = [hasLower, hasUpper, hasNumber, hasSymbol].filter(Boolean).length;
  const score = Math.round((lengthScore * 0.5 + (criteria / 4) * 0.5) * 100);

  if (score < 40) {
    return {
      label: "Weak",
      score: Math.max(score, 10),
      colorClass: "bg-rose-500",
      feedback: "Try a longer password with varied characters.",
    };
  }

  if (score < 70) {
    return {
      label: "Moderate",
      score,
      colorClass: "bg-amber-400",
      feedback: "Add uppercase letters, numbers, and symbols for better strength.",
    };
  }

  return {
    label: "Strong",
    score,
    colorClass: "bg-emerald-400",
    feedback: "Excellent. This password is strong and secure.",
  };
}

export function PasswordStrengthMeter({ password }: { password: string }) {
  const strength = evaluatePassword(password);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm font-medium text-slate-200">
        <span>Password strength</span>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] ${strength.colorClass} text-slate-950`}>
          {strength.label}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
        <div className={`${strength.colorClass} h-full transition-all duration-300`} style={{ width: `${strength.score}%` }} />
      </div>
      <p className="text-xs leading-5 text-slate-400">{strength.feedback}</p>
    </div>
  );
}

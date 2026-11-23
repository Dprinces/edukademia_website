export type Scale = 5 | 4;

export interface CgpaInputs {
  current: string;
  completed: string;
  target: string;
  remaining: string;
}

export type FieldErrors = Partial<Record<keyof CgpaInputs, string>>;

export type Status = 'on-track' | 'achievable' | 'stretch' | 'out-of-reach';

export interface CgpaResult {
  status: Status;
  current: number;
  target: number;
  completed: number;
  remaining: number;
  totalUnits: number;
  /** Average grade point needed on the remaining units (0 or more). */
  required: number;
  /** Highest CGPA reachable with a perfect score on every remaining unit. */
  best: number;
}

/** Accepts "3.5" or "3,5"; returns NaN for anything that isn't a plain number. */
const toNumber = (raw: string) => {
  const text = raw.trim().replace(',', '.');
  return /^\d*\.?\d+$|^\d+\.$/.test(text) ? Number(text) : NaN;
};

const isWhole = (n: number) => Number.isInteger(n);

/**
 * Checks each field and, when all are valid, works out the average needed on the remaining
 * units to finish at the target CGPA:
 *   required = (target × total units − current × units completed) ÷ units remaining
 */
export function evaluate(inputs: CgpaInputs, scale: Scale): { errors: FieldErrors; result: CgpaResult | null } {
  const errors: FieldErrors = {};
  const completed = toNumber(inputs.completed);
  const remaining = toNumber(inputs.remaining);
  const current = toNumber(inputs.current);
  const target = toNumber(inputs.target);
  const scaleText = `${scale}.00`;

  if (inputs.completed.trim() && (Number.isNaN(completed) || !isWhole(completed))) {
    errors.completed = 'Enter a whole number of units, e.g. 60.';
  }
  if (inputs.remaining.trim() && (Number.isNaN(remaining) || !isWhole(remaining))) {
    errors.remaining = 'Enter a whole number of units, e.g. 90.';
  } else if (inputs.remaining.trim() && remaining < 1) {
    errors.remaining = 'Enter at least 1 unit.';
  }
  // A new student with no units completed doesn't need a current CGPA.
  const needsCurrent = !(completed === 0);
  if (needsCurrent && inputs.current.trim()) {
    if (Number.isNaN(current)) errors.current = 'Enter a number, e.g. 2.80.';
    else if (current > scale) errors.current = `Must be ${scaleText} or less on a ${scale}.0 scale.`;
  }
  if (inputs.target.trim()) {
    if (Number.isNaN(target)) errors.target = 'Enter a number, e.g. 3.50.';
    else if (target > scale) errors.target = `Must be ${scaleText} or less on a ${scale}.0 scale.`;
    else if (target <= 0) errors.target = 'Enter a target above 0.';
  }

  const filled =
    inputs.completed.trim() && inputs.remaining.trim() && inputs.target.trim() &&
    (!needsCurrent || inputs.current.trim());
  if (!filled || Object.keys(errors).length > 0) return { errors, result: null };

  const cur = needsCurrent ? current : 0;
  const totalUnits = completed + remaining;
  const rawRequired = (target * totalUnits - cur * completed) / remaining;
  const best = (cur * completed + scale * remaining) / totalUnits;
  const required = Math.max(rawRequired, 0);

  let status: Status;
  if (rawRequired > scale + 1e-9) status = 'out-of-reach';
  else if (completed > 0 && rawRequired <= cur) status = 'on-track';
  else if (rawRequired > scale * 0.85) status = 'stretch';
  else status = 'achievable';

  return {
    errors,
    result: { status, current: cur, target, completed, remaining, totalUnits, required, best },
  };
}

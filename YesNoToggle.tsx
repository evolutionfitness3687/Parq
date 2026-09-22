"use client";

import styles from "./ParQForm.module.css";

interface YesNoToggleProps {
  value: boolean | null;
  onChange: (value: boolean) => void;
  name: string;
  error?: boolean;
}

export default function YesNoToggle({
  value,
  onChange,
  name,
  error,
}: YesNoToggleProps) {
  return (
    <div
      className={`${styles.yesNoGroup} ${error ? styles.yesNoGroupError : ""}`}
      role="radiogroup"
      aria-label={name}
    >
      <button
        type="button"
        role="radio"
        aria-checked={value === true}
        className={`${styles.yesNoButton} ${
          value === true ? styles.yesNoButtonActiveYes : ""
        }`}
        onClick={() => onChange(true)}
      >
        SIM
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={value === false}
        className={`${styles.yesNoButton} ${
          value === false ? styles.yesNoButtonActiveNo : ""
        }`}
        onClick={() => onChange(false)}
      >
        NÃO
      </button>
    </div>
  );
}

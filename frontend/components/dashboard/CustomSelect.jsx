"use client";

import {
  memo,
  useState,
  useRef,
  useEffect,
  useCallback,
  Children,
  isValidElement,
} from "react";
import { ChevronDown, Check } from "lucide-react";

function parseOptions(children) {
  const options = [];
  Children.forEach(children, (child) => {
    if (!isValidElement(child) || child.type !== "option") return;
    options.push({
      value: child.props.value ?? "",
      label: child.props.children,
      disabled: Boolean(child.props.disabled),
    });
  });
  return options;
}

export const CustomSelect = memo(function CustomSelect({
  value,
  onChange,
  disabled,
  name,
  children,
  className = "",
  "aria-label": ariaLabel,
  id,
}) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const rootRef = useRef(null);
  const listRef = useRef(null);

  const options = parseOptions(children);
  const enabledOptions = options.filter((o) => !o.disabled);
  const selected = options.find((o) => String(o.value) === String(value ?? ""));
  const display = selected?.label ?? enabledOptions[0]?.label ?? "Select…";

  const close = useCallback(() => {
    setOpen(false);
    setHighlight(-1);
  }, []);

  const select = useCallback(
    (nextValue) => {
      if (disabled) return;
      onChange?.({ target: { value: nextValue, name: name ?? "" } });
      close();
    },
    [close, disabled, name, onChange]
  );

  const openMenu = useCallback(() => {
    if (disabled) return;
    setOpen(true);
    const selIdx = enabledOptions.findIndex(
      (o) => String(o.value) === String(value ?? "")
    );
    setHighlight(selIdx >= 0 ? selIdx : 0);
  }, [disabled, enabledOptions, value]);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        close();
      }
    };

    const handleEscape = (e) => {
      if (e.key === "Escape") close();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [close, open]);

  useEffect(() => {
    if (!open || highlight < 0 || !listRef.current) return;
    listRef.current.children[highlight]?.scrollIntoView({ block: "nearest" });
  }, [highlight, open]);

  const onKeyDown = (e) => {
    if (disabled) return;

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (open && highlight >= 0) {
        select(enabledOptions[highlight]?.value);
      } else {
        openMenu();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) openMenu();
      else setHighlight((i) => Math.min(i + 1, enabledOptions.length - 1));
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) openMenu();
      else setHighlight((i) => Math.max(i - 1, 0));
      return;
    }

    if (e.key === "Home") {
      e.preventDefault();
      if (!open) openMenu();
      else setHighlight(0);
      return;
    }

    if (e.key === "End") {
      e.preventDefault();
      if (!open) openMenu();
      else setHighlight(enabledOptions.length - 1);
    }
  };

  const wrapClass = [
    "study-page__select",
    "study-page__custom-select",
    open ? "study-page__custom-select--open" : "",
    disabled ? "study-page__custom-select--disabled" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  let enabledIndex = -1;

  return (
    <div className={wrapClass} ref={rootRef}>
      <button
        type="button"
        id={id}
        className="study-page__select-trigger"
        onClick={() => (open ? close() : openMenu())}
        onKeyDown={onKeyDown}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="study-page__select-value">{display}</span>
        <ChevronDown size={16} className="study-page__select-chevron" aria-hidden="true" />
      </button>

      {open && (
        <ul
          className="study-page__select-menu"
          role="listbox"
          ref={listRef}
          aria-label={ariaLabel}
        >
          {options.map((opt) => {
            const isSelected = String(opt.value) === String(value ?? "");
            if (!opt.disabled) enabledIndex += 1;
            const rowHighlight = !opt.disabled && highlight === enabledIndex;

            return (
              <li key={`${String(opt.value)}-${opt.label}`}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={opt.disabled}
                  className={[
                    "study-page__select-option",
                    isSelected ? "study-page__select-option--selected" : "",
                    rowHighlight ? "study-page__select-option--highlight" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onMouseEnter={() => !opt.disabled && setHighlight(enabledIndex)}
                  onClick={() => !opt.disabled && select(opt.value)}
                >
                  <span className="study-page__select-option-label">{opt.label}</span>
                  {isSelected && (
                    <Check
                      size={15}
                      strokeWidth={2.5}
                      className="study-page__select-option-check"
                      aria-hidden="true"
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
});

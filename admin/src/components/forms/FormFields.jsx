"use client";

/**
 * Labeled text/number/email input
 */
export function FormInput({ label, name, value, onChange, type = "text", placeholder, required, disabled, error }) {
  return (
    <div>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-text-secondary mb-1">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="input-base"
      />
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  );
}

/**
 * Labeled textarea
 */
export function FormTextarea({ label, name, value, onChange, placeholder, required, rows = 3, disabled }) {
  return (
    <div>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-text-secondary mb-1">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        rows={rows}
        disabled={disabled}
        className="input-base resize-y"
      />
    </div>
  );
}

/**
 * Labeled select
 */
export function FormSelect({ label, name, value, onChange, options = [], placeholder, required, disabled }) {
  return (
    <div>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-text-secondary mb-1">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value ?? ""}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="input-base"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) =>
          typeof opt === "string" ? (
            <option key={opt} value={opt}>{opt}</option>
          ) : (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          )
        )}
      </select>
    </div>
  );
}

/**
 * Labeled checkbox
 */
export function FormCheckbox({ label, name, checked, onChange, disabled }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        name={name}
        checked={checked ?? false}
        onChange={onChange}
        disabled={disabled}
        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
      />
      <span className="text-sm text-text-secondary">{label}</span>
    </label>
  );
}

/**
 * File input
 */
export function FormFile({ label, name, onChange, accept, required, disabled }) {
  return (
    <div>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-text-secondary mb-1">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type="file"
        onChange={onChange}
        accept={accept}
        required={required}
        disabled={disabled}
        className="block w-full text-sm text-text-secondary file:mr-3 file:py-2 file:px-4
          file:rounded-lg file:border-0 file:text-sm file:font-medium
          file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
      />
    </div>
  );
}

"use client";

import { useState, useCallback } from "react";

/**
 * Simple form state hook.
 *
 * @param {object} initialValues
 * @returns {{ values, handleChange, setValues, reset, setField }}
 */
export default function useForm(initialValues = {}) {
  const [values, setValues] = useState(initialValues);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked, files } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "file" ? files[0] : value,
    }));
  }, []);

  const setField = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const reset = useCallback((newValues) => {
    setValues(newValues ?? initialValues);
  }, [initialValues]);

  return { values, handleChange, setValues, reset, setField };
}

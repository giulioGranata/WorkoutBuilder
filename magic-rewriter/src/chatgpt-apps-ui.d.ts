declare module "chatgpt-apps-ui" {
  import type { ComponentType, ReactNode } from "react";

  export type StatusState = "idle" | "processing" | "error" | string;

  export interface FormValues {
    [key: string]: unknown;
  }

  export interface FormContext {
    setError(field: string, message: string): void;
    setFormError(message: string): void;
    setStatus(status: StatusState): void;
    setValue(field: string, value: unknown): void;
    getValue(field: string): unknown;
    copyToClipboard(value: string): void;
  }

  export interface FormProps {
    children?: ReactNode;
    "aria-label"?: string;
    onSubmit?: (values: FormValues, ctx: FormContext) => void | Promise<void>;
  }

  export const Form: ComponentType<FormProps>;

  export interface FieldProps {
    name: string;
    label?: string;
    children?: ReactNode;
    "aria-label"?: string;
    initialValue?: unknown;
    placeholder?: string;
    required?: boolean;
    readOnly?: boolean;
  }

  export const Field: ComponentType<FieldProps>;

  export interface TextAreaProps {
    readOnly?: boolean;
    maxLength?: number;
    showCount?: boolean;
    placeholder?: string;
  }

  export const TextArea: ComponentType<TextAreaProps>;

  export interface SelectOption {
    label: string;
    value: string;
  }

  export interface SelectProps {
    options: SelectOption[];
  }

  export const Select: ComponentType<SelectProps>;

  export interface ButtonProps {
    type?: "button" | "submit" | "reset";
    children?: ReactNode;
    "aria-label"?: string;
    onClick?: (event: unknown, ctx: FormContext) => void | Promise<void>;
  }

  export const Button: ComponentType<ButtonProps>;

  export interface CardProps {
    children?: ReactNode;
  }

  export const Card: ComponentType<CardProps>;

  export interface TextProps {
    children?: ReactNode;
    role?: string;
    "aria-level"?: number;
    size?: "xs" | "sm" | "md" | "lg" | string;
    "aria-live"?: "off" | "polite" | "assertive";
  }

  export const Text: ComponentType<TextProps>;
}

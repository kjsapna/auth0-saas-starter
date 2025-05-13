import { ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Result type for structured error handling
export type Result<T = void> = {
  data?: T;
  error?: string;
};

// Common error handling utility
export const handleError = <T = void>(operation: string, error: unknown): Result<T> => {
  console.error(`Error ${operation}:`, error)
  return { error: `Failed to ${operation}.` }
}

// Success result helper
export const success = <T>(data: T): Result<T> => ({ data })

// Error result helper
export const error = <T = void>(message: string): Result<T> => ({ error: message })

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Type guard for string validation
export const validateString = (value: unknown): value is string => {
  return typeof value === "string" && value.length > 0
}

// Type guard for email validation
export const validateEmail = (value: unknown): value is string => {
  return typeof value === "string" && value.length > 0 && value.includes("@")
}

// Type guard for role validation
export const validateRole = (role: unknown): role is "member" | "admin" | "NGEAdmin" => {
  return typeof role === "string" && ["member", "admin", "NGEAdmin"].includes(role)
}

// Constants
export const USERS_PER_PAGE = 10
export const SEARCH_ENGINE = "v3"
export const BATCH_SIZE = 10

"use client"

import { createContext, useContext, useState } from "react"

interface LoadingContextType {
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  isPageTransitioning: boolean
  setIsPageTransitioning: (loading: boolean) => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const [isPageTransitioning, setIsPageTransitioning] = useState(false)

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading, isPageTransitioning, setIsPageTransitioning }}>
      {children}
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  const context = useContext(LoadingContext)
  if (context === undefined) {
    throw new Error("useLoading must be used within a LoadingProvider")
  }
  return context
} 
"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect } from "react"

import { useLoading } from "@/lib/loading-context"

export function PageTransitionHandler() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { setIsPageTransitioning } = useLoading()

  useEffect(() => {
    const handleStart = () => {
      setIsPageTransitioning(true)
    }

    const handleEnd = () => {
      // Add a small delay to ensure the loading screen is visible
      setTimeout(() => {
        setIsPageTransitioning(false)
      }, 300)
    }

    // Show loading when route starts changing
    handleStart()

    // Hide loading when route change is complete
    handleEnd()

    return () => {
      handleEnd()
    }
  }, [pathname, searchParams, setIsPageTransitioning])

  return null
} 
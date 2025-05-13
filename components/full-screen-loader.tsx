"use client"

import { Spinner } from "@/components/spinner"
import { cn } from "@/lib/utils"
import { useLoading } from "@/lib/loading-context"

interface FullScreenLoaderProps {
  className?: string
}

export function FullScreenLoader({ className }: FullScreenLoaderProps) {
  const { isLoading, isPageTransitioning } = useLoading()

  if (!isLoading && !isPageTransitioning) return null

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity duration-300",
        (isLoading || isPageTransitioning) ? "opacity-100" : "opacity-0",
        className
      )}
    >
      <Spinner className="h-8 w-8 animate-spin" />
    </div>
  )
} 
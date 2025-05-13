import type { Metadata } from "next"

import "./globals.css"

import { Inter } from "next/font/google"
import Script from "next/script"

import { FullScreenLoader } from "@/components/full-screen-loader"
import { PageTransitionHandler } from "@/components/page-transition-handler"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { LoadingProvider } from "@/lib/loading-context"
import { Suspense } from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Delegated Admin Console",
  description:
    "Delegated Admin Console is a client user management app",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LoadingProvider>
          <Suspense fallback={<div>Loading transitions...</div>}>
            <PageTransitionHandler />
            </Suspense>
            <Suspense fallback={<div>Loading...</div>}>
            {children}
            </Suspense>
            <FullScreenLoader />
          </LoadingProvider>
        </ThemeProvider>

        <Toaster position="bottom-right" />
        <Script id="heap">
          {`window.heap=window.heap||[],heap.load=function(e,t){window.heap.appid=e,window.heap.config=t=t||{};var r=document.createElement("script");r.type="text/javascript",r.async=!0,r.src="https://cdn.heapanalytics.com/js/heap-"+e+".js";var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(r,a);for(var n=function(e){return function(){heap.push([e].concat(Array.prototype.slice.call(arguments,0)))}},p=["addEventProperties","addUserProperties","clearEventProperties","identify","resetIdentity","removeEventProperty","setEventProperties","track","unsetEventProperty"],o=0;o<p.length;o++)heap[p[o]]=n(p[o])};
        heap.load("1279799279");`}
        </Script>
      </body>
    </html>
  )
}

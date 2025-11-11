"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

interface AuthErrorHandlerProps {
  error: Error | null
  onAuthError?: () => void
}

export function useAuthErrorHandler() {
  const router = useRouter()

  const handleAuthError = (error: Error | string) => {
    const errorMessage = typeof error === "string" ? error : error.message
    
    // Check for authentication-related errors
    const authErrors = [
      "unauthorized",
      "not authenticated",
      "authentication required",
      "invalid token",
      "token expired",
      "session expired",
      "please log in"
    ]

    const isAuthError = authErrors.some(authErr => 
      errorMessage.toLowerCase().includes(authErr)
    )

    if (isAuthError) {
      console.error("Authentication error detected:", errorMessage)
      // Redirect to login page
      router.push("/login")
      return true
    }

    return false
  }

  return { handleAuthError }
}

export function AuthErrorHandler({ error, onAuthError }: AuthErrorHandlerProps) {
  const { handleAuthError } = useAuthErrorHandler()

  useEffect(() => {
    if (error) {
      const isAuthError = handleAuthError(error)
      if (isAuthError && onAuthError) {
        onAuthError()
      }
    }
  }, [error, handleAuthError, onAuthError])

  return null
}

"use client"

import { useEffect, useRef } from "react"
import { SignInButton, UserButton, useAuth, useUser } from "@clerk/nextjs"
import posthog from "posthog-js"
import { Button } from "@/components/ui/button"

export function AuthControls() {
  const { isLoaded, isSignedIn } = useAuth()
  const { user } = useUser()
  const identifiedUserId = useRef<string | null>(null)

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) {
      if (identifiedUserId.current) {
        posthog.reset()
        identifiedUserId.current = null
      }
      return
    }

    if (identifiedUserId.current === user.id) return
    if (identifiedUserId.current) posthog.reset()

    const personProperties: Record<string, string> = {}
    if (user.primaryEmailAddress?.emailAddress)
      personProperties.email = user.primaryEmailAddress.emailAddress
    if (user.fullName) personProperties.name = user.fullName

    posthog.identify(user.id, personProperties)
    identifiedUserId.current = user.id
  }, [isLoaded, isSignedIn, user])
  if (!isLoaded)
    return (
      <div
        className="flex items-center *:flex [&_button]:flex [&_button]:items-center"
        aria-hidden="true"
      >
        <span className="h-9.5 w-15.5 rounded-[10px] bg-hover" />
      </div>
    )
  return (
    <div className="flex items-center *:flex [&_button]:flex [&_button]:items-center">
      {isSignedIn ? (
        <UserButton
          appearance={{
            elements: {
              avatarBox: "size-9.5 rounded-[10px]",
              avatarImage: "rounded-[10px]",
              userButtonTrigger: "rounded-[10px]",
            },
          }}
        />
      ) : (
        <SignInButton mode="modal">
          <Button
            variant="outline"
            size="sm"
            className="h-9.5 rounded-[10px] border-line bg-paper px-3.5 text-[13px] font-[650] whitespace-nowrap text-ink hover:bg-hover hover:text-ink max-[600px]:h-8.5 max-[600px]:px-2 max-[600px]:text-xs"
          >
            Sign in
          </Button>
        </SignInButton>
      )}
    </div>
  )
}

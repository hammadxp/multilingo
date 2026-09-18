"use client"

import { SignInButton, UserButton, useAuth } from "@clerk/nextjs"

export function AuthControls() {
  const { isLoaded, isSignedIn } = useAuth()
  if (!isLoaded)
    return (
      <div
        className="ml-0.75 flex items-center *:flex [&_button]:flex [&_button]:items-center"
        aria-hidden="true"
      >
        <span className="h-9 w-15.5 rounded-[10px] bg-hover" />
      </div>
    )
  return (
    <div className="ml-1 flex items-center *:flex [&_button]:flex [&_button]:items-center">
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
          <button className="inline-flex h-9.5 items-center justify-center gap-1.75 rounded-[10px] border border-line bg-paper px-3.5 text-[13px] font-[650] whitespace-nowrap text-ink hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary max-[600px]:h-8.5 max-[600px]:px-2 max-[600px]:text-xs">
            Sign in
          </button>
        </SignInButton>
      )}
    </div>
  )
}

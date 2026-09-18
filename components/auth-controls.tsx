"use client"

import { SignInButton, UserButton, useAuth } from "@clerk/nextjs"

export function AuthControls() {
  const { isLoaded, isSignedIn } = useAuth()
  if (!isLoaded)
    return (
      <div
        className="ml-[3px] flex items-center [&_button]:flex [&_button]:items-center [&>*]:flex"
        aria-hidden="true"
      >
        <span className="h-9 w-[62px] rounded-[10px] bg-hover" />
      </div>
    )
  return (
    <div className="ml-1 flex items-center [&_button]:flex [&_button]:items-center [&>*]:flex">
      {isSignedIn ? (
        <UserButton
          appearance={{
            elements: {
              avatarBox: "size-[38px] rounded-[10px]",
              avatarImage: "rounded-[10px]",
              userButtonTrigger: "rounded-[10px]",
            },
          }}
        />
      ) : (
        <SignInButton mode="modal">
          <button className="inline-flex h-[38px] items-center justify-center gap-[7px] rounded-[10px] border border-line bg-paper px-[14px] text-[13px] font-[650] whitespace-nowrap text-ink hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary max-[600px]:h-[34px] max-[600px]:px-2 max-[600px]:text-xs">
            Sign in
          </button>
        </SignInButton>
      )}
    </div>
  )
}

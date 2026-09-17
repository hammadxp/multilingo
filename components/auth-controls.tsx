"use client"

import { SignInButton, UserButton, useAuth } from "@clerk/nextjs"

export function AuthControls() {
  const { isLoaded, isSignedIn } = useAuth()
  if (!isLoaded) return <div className="auth-controls" aria-hidden="true"><span className="auth-skeleton" /></div>
  return <div className="auth-controls">{isSignedIn ? <UserButton appearance={{ elements: { avatarBox: "clerk-avatar-box" } }} /> : <SignInButton mode="modal"><button className="auth-button">Sign in</button></SignInButton>}</div>
}

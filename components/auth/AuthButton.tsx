'use client'

import { Button } from '@/components/ui/button'
import { useAuth } from './AuthProvider'
import { Github, LogOut, User } from 'lucide-react'

export function AuthButton() {
  const { user, loading, signInWithGitHub, signOut } = useAuth()

  if (loading) {
    return (
      <Button disabled variant="outline">
        Loading...
      </Button>
    )
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 text-sm">
          <User className="w-4 h-4" />
          <span className="hidden sm:inline">
            Welcome, {user.user_metadata?.full_name || user.email}
          </span>
        </div>
        <Button onClick={signOut} variant="outline" size="sm">
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline ml-2">Logout</span>
        </Button>
      </div>
    )
  }

  return (
    <Button onClick={signInWithGitHub} className="bg-gray-900 hover:bg-gray-800">
      <Github className="w-4 h-4 mr-2" />
      Login with GitHub
    </Button>
  )
}
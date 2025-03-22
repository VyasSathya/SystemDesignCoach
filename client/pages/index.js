import React from 'react'
import { useRouter } from 'next/router'
import Dashboard from './dashboard'

export default function Home() {
  const router = useRouter()
  
  // Redirect to dashboard
  React.useEffect(() => {
    router.push('/dashboard')
  }, [router])

  // Return null or loading state while redirecting
  return null
}

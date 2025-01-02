'use client'

import { PropsWithChildren } from 'react'
import { UseInkathonProvider } from '@scio-labs/use-inkathon'

import { env } from '@/config/environment'

export default function ClientProviders({ children }: PropsWithChildren) {
  return (
    <UseInkathonProvider
      appName="ink!athon" 
      connectOnInit={true}
      defaultChain={env.defaultChain}
    >
      {children}
    </UseInkathonProvider>
  )
}

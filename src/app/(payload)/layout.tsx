import config from '@payload-config'
import '@payloadcms/next/css'
import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts'
import type { ServerFunctionClient } from 'payload'
import React from 'react'

import { importMap } from './admin/importMap.js'

import './custom.scss'

/**
 * The admin is authenticated, request-bound and never prefetched, so it has no
 * useful static shell. Set at the root of the (payload) group, this opts the
 * whole admin/API subtree out of instant-navigation and static-shell validation
 * without touching the public site.
 */
export const instant = false

const serverFunction: ServerFunctionClient = async function (args) {
  'use server'
  return handleServerFunctions({ ...args, config, importMap })
}

export default function PayloadLayout({ children }: { children: React.ReactNode }) {
  return (
    <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
      {children}
    </RootLayout>
  )
}

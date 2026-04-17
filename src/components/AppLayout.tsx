import type { JSX } from 'react'

import { Outlet } from 'react-router-dom'

import { useBgMusic } from '../hooks/useBgMusic'
import { MusicToggle } from './MusicToggle'

export const AppLayout = (): JSX.Element => {
  useBgMusic()

  return (
    <>
      <Outlet />
      <MusicToggle />
    </>
  )
}

import React from 'react'
import { Outlet } from 'react-router-dom'

const priveteRoute = ({allowedRoles}) => {
  return <Outlet/>
}

export default priveteRoute
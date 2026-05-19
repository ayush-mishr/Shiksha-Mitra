import { useState } from "react"
import { useSelector } from "react-redux"
import { Outlet } from "react-router-dom"
import { FiMenu } from "react-icons/fi"

import Sidebar from "../components/core/Dashboard/Sidebar"

function Dashboard() {
  const { loading: profileLoading } = useSelector((state) => state.profile)
  const { loading: authLoading } = useSelector((state) => state.auth)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (profileLoading || authLoading) {
    return (
      <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-[calc(100vh-3.5rem)] bg-gradient-to-br from-[#0f2027] via-[#2c5364] to-[#232526]">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="h-[calc(100vh-3.5rem)] flex-1 overflow-auto">
        {/* Mobile Header for Dashboard Sidebar toggle */}
        <div className="flex items-center justify-between bg-richblack-800 px-6 py-3 border-b border-richblack-700 md:hidden text-white">
          <span className="font-semibold text-lg">Dashboard</span>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1 border border-richblack-600 rounded bg-richblack-700 hover:bg-richblack-600"
          >
            <FiMenu className="text-xl" />
          </button>
        </div>

        <div className="mx-auto w-11/12 max-w-[1000px] py-10">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default Dashboard

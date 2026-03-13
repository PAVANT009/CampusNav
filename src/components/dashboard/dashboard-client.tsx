import React from 'react'
import { PageNavbar } from './dashboard-navbar'

// export default function DashboardClient() {
//   return (
//     <div>
//       <PageNavbar/>
//       <div>

//       </div>
//       <div>

//       </div>
//     </div>
//   )
// }

  export default function DashboardClient() {
    return (
      <div className="flex-1">
        <PageNavbar />
        <div className="flex-1 min-w-0">
          {/* dashboard content */}
        </div>
      </div>
    )
  }

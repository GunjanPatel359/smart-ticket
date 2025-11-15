import { Suspense } from "react"
import TicketDetail from "@/components/ticket/ticket-details"
import { getUserToken, getTechnicianToken, getAdminToken } from "@/lib/authmiddleware"
import { getTicketById } from "@/actions/ticket"
import { getAllTechniciansWithoutPagination } from "@/actions/technician"
import { redirect } from "next/navigation"

export default async function TicketPage({ params }: { params: { id: string } }) {
  const idNum = Number(params.id)

  if (!idNum || isNaN(idNum) || idNum <= 0) {
    redirect("/tickets")
  }

  // 🔹 Fetch all three tokens in parallel
  const [userToken, technicianToken, adminToken] = await Promise.all([
    getUserToken(),
    getTechnicianToken(),
    getAdminToken(),
  ])

  // 🧩 Redirect if no role found (not logged in)
  if (!userToken && !technicianToken && !adminToken) {
    redirect("/unauthorized")
  }

  // ✅ Fetch ticket
  const { success, message, ticket } = await getTicketById(idNum)
  if (!success || !ticket) {
    console.error("Ticket fetch error:", message)
    redirect("/unauthorized")
  }

  // 🔒 Initialize role variables
  let user: boolean = false
  let technician: boolean = false
  let admin: boolean = false

  let authorized = false

  // ✅ Admin always allowed
  if (adminToken) {
    admin = true
    authorized = true
  }

  // ✅ Technician can view assigned tickets
  if (technicianToken && ticket.assignedTechnicianId === technicianToken.id) {
    technician =true
    authorized = true
  }

  // ✅ User can view their own tickets
  if (userToken && ticket.requesterId === userToken.id) {
    user = true
    authorized = true
  }

  console.log(ticket,user,admin,technician)
  // ❌ If no valid role matched ticket permissions
  if (!authorized) {
    redirect("/unauthorized")
  }

  // 🔹 Fetch all technicians if admin (for assignment dropdown)
  let technicians: any[] = []
  if (admin) {
    const techResult = await getAllTechniciansWithoutPagination()
    if (techResult.success && techResult.technicians) {
      technicians = techResult.technicians
    }
  }

  // ✅ Render the page
  return (
    <main className="container mx-auto max-w-6xl p-4 md:p-6">
      <Suspense fallback={<div className="text-sm text-muted-foreground">Loading ticket...</div>}>
        <TicketDetail
          technicians={technicians}
          initialTicket={ticket}
          user={user}
          technician={technician}
          admin={admin}
        />
      </Suspense>
    </main>
  )
}

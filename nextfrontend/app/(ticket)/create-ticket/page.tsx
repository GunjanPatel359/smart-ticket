"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import CreateTicketForm from "@/components/ticket/create-ticket-form"

export default function CreateTicketPage() {
  return (
    <main className="max-w-3xl mx-auto w-full h-dvh flex">
      <Card className="my-auto justify-center">
        <CardHeader>
          <CardTitle className="text-balance">Create a New Ticket</CardTitle>
          <CardDescription className="text-pretty">
            Provide details about your issue. Our team will review and get back to you promptly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateTicketForm />
        </CardContent>
      </Card>
    </main>
  )
}

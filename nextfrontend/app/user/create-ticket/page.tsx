"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import CreateTicketForm from "@/components/ticket/create-ticket-form"

export default function CreateTicketPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Create a New Ticket</CardTitle>
            <CardDescription>
              Provide details about your issue. Our AI-powered system will analyze and assign it to the best technician.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateTicketForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

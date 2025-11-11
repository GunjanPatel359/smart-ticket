"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { getAllTickets } from "@/actions/ticket";

interface Skill {
  id: number;
  name: string;
}

interface Ticket {
  id: number;
  subject: string;
  description: string;
  status: string;
  priority: string;
  impact: string;
  urgency: string;
  satisfactionRating: number | null;
  assignedTechnician?: { name: string | null };
  requiredSkills?: Skill[];
}

// Priority colors
const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "critical":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    case "high":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    case "normal":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "low":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
};

// Status colors
const getStatusColor = (status: string) => {
  switch (status) {
    case "new":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "assigned":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    case "in_progress":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "on_hold":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    case "resolved":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "closed":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
};

// Impact colors
const getImpactColor = (impact: string) => {
  switch (impact) {
    case "critical":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    case "high":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    case "medium":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "low":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
};

// Urgency colors
const getUrgencyColor = (urgency: string) => {
  switch (urgency) {
    case "critical":
      return "bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-200";
    case "high":
      return "bg-orange-200 text-orange-900 dark:bg-orange-900 dark:text-orange-200";
    case "normal":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "low":
      return "bg-green-200 text-green-900 dark:bg-green-900 dark:text-green-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
};

// Satisfaction visual
const SatisfactionBadge = ({ rating }: { rating: number | null }) => {
  if (rating === null) return <span>-</span>;

  let color =
    rating >= 80
      ? "bg-green-100 text-green-800"
      : rating >= 50
        ? "bg-yellow-100 text-yellow-800"
        : "bg-red-100 text-red-800";

  return (
    <span className={`px-2 py-1 text-xs rounded-full font-medium ${color}`}>
      {rating}%
    </span>
  );
};

export default function ITSupportDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Ticket; direction: "asc" | "desc" } | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10); // tickets per page
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      const res = await getAllTickets({
        page,
        limit,
        sortKey: sortConfig?.key || "createdAt",
        sortOrder: sortConfig?.direction || "desc",
      });
      if (res.success && res.tickets) setTickets(res.tickets);
      setLoading(false);
    };
    fetchTickets();
  }, [page, sortConfig]);

  const sortedTickets = [...tickets].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    const aVal = a[key] ?? "";
    const bVal = b[key] ?? "";

    if (aVal < bVal) return direction === "asc" ? -1 : 1;
    if (aVal > bVal) return direction === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (key: keyof Ticket) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig?.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ column }: { column: keyof Ticket }) => {
    if (sortConfig?.key !== column) return null;
    return sortConfig.direction === "asc" ? (
      <ChevronUpIcon className="h-4 w-4 inline ml-1" />
    ) : (
      <ChevronDownIcon className="h-4 w-4 inline ml-1" />
    );
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Tickets</CardTitle>
          <CardDescription>Manage IT tickets with sorting</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <div className="space-y-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                  <div key={i} className="flex items-center gap-4 py-3 border-b">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead onClick={() => handleSort("subject")} className="cursor-pointer">
                      Subject <SortIcon column="subject" />
                    </TableHead>
                    <TableHead onClick={() => handleSort("description")} className="cursor-pointer">
                      Description <SortIcon column="description" />
                    </TableHead>
                    <TableHead onClick={() => handleSort("status")} className="cursor-pointer">
                      Status <SortIcon column="status" />
                    </TableHead>
                    <TableHead onClick={() => handleSort("priority")} className="cursor-pointer">
                      Priority <SortIcon column="priority" />
                    </TableHead>
                    <TableHead onClick={() => handleSort("impact")} className="cursor-pointer">
                      Impact <SortIcon column="impact" />
                    </TableHead>
                    <TableHead onClick={() => handleSort("urgency")} className="cursor-pointer">
                      Urgency <SortIcon column="urgency" />
                    </TableHead>
                    <TableHead onClick={() => handleSort("satisfactionRating")} className="cursor-pointer">
                      Satisfaction <SortIcon column="satisfactionRating" />
                    </TableHead>
                    <TableHead>Required Skills</TableHead>
                    <TableHead>Assigned Technician</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedTickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>{ticket.subject}</TableCell>
                  <TableCell>{ticket.description}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getImpactColor(ticket.impact)}>{ticket.impact}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getUrgencyColor(ticket.urgency)}>{ticket.urgency}</Badge>
                  </TableCell>
                  <TableCell>
                    <SatisfactionBadge rating={ticket.satisfactionRating} />
                  </TableCell>
                  <TableCell>
                    {ticket.requiredSkills && ticket.requiredSkills.length > 0 ? (
                      <>
                        {ticket.requiredSkills.slice(0, 2).map((skill) => (
                          <Badge key={skill.id} variant="secondary" className="mr-1">
                            {skill.name}
                          </Badge>
                        ))}
                        {ticket.requiredSkills.length > 2 && (
                          <span className="text-xs text-muted-foreground">
                            +{ticket.requiredSkills.length - 2} more
                          </span>
                        )}
                      </>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>{ticket.assignedTechnician?.name ?? "Unassigned"}</TableCell>
                </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-end mt-4">
                <button
                  className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </button>
                <span className="my-auto mx-2">Page {page}</span>
                <button
                  className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={tickets.length < limit} // disable if no more data
                >
                  Next
                </button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

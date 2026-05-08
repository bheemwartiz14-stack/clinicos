import { Badge } from "@mediclinicpro/ui/components/badge";
import { Button } from "@mediclinicpro/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@mediclinicpro/ui/components/card";
import { Table, TableCell, TableHead, TableRow } from "@mediclinicpro/ui/components/table";
import { Plus } from "lucide-react";

const patients = [
  ["Priya Raman", "+91 98765 43210", "B+", "Follow-up today"],
  ["Arjun Sinha", "+91 98765 11122", "O+", "Lab review"],
  ["Meera Iyer", "+91 98765 33344", "A-", "New patient"],
];

export function PatientTable() {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle>Recent patients</CardTitle>
          <p className="mt-1 text-sm text-slate-500">
            Offline-ready patient registry and EMR entry point.
          </p>
        </div>
        <Button size="sm">
          <Plus size={16} />
          Add patient
        </Button>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <thead>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Blood group</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <TableRow key={patient[1]}>
                <TableCell className="font-medium">{patient[0]}</TableCell>
                <TableCell>{patient[1]}</TableCell>
                <TableCell>{patient[2]}</TableCell>
                <TableCell>
                  <Badge>{patient[3]}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </CardContent>
    </Card>
  );
}

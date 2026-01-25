"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ExpandableJson } from "@/components/expandable-json";
import { Rule } from "@/types/db";
import { Badge } from "@/components/ui/badge";

export default function RulesTable({ rules }: { rules: Rule[] }) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Rule type</TableHead>
            <TableHead>Hard rule</TableHead>
            <TableHead>Parameters</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rules.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                No rules found.
              </TableCell>
            </TableRow>
          ) : (
            rules.map((rule) => (
              <TableRow key={rule.id}>
                <TableCell className="font-medium">{rule.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-[12px]">
                    {rule.rule_type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Checkbox
                    checked={rule.is_hard}
                    disabled
                    tabIndex={-1}
                    aria-label="Hard rule"
                    className="ml-6"
                  />
                </TableCell>
                <TableCell className="max-w-xs">
                  <ExpandableJson value={rule.parameters} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

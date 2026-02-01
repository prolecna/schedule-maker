import { FolderPlus } from "lucide-react";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "./empty";

type EmptyStateProps = {
  title: string;
  description?: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <Empty className="gap-2">
      <EmptyHeader>
        <EmptyMedia variant="icon" className="size-8">
          <FolderPlus className="size-4" />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
      </EmptyHeader>
      <EmptyDescription>{description}</EmptyDescription>
    </Empty>
  );
}

export default EmptyState;

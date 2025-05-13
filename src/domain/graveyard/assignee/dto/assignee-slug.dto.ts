export class AssigneeSlugDto {
  slugName: string;
  slugHex: string;
  assigneeId: number;
}

export class AssigneeSlugAndTagDto {
  page: number;
  pageSize: number;
  tag: string;
  slug: string;
}

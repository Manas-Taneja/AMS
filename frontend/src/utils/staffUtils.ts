export type StaffMember = {
  id: number;
  name: string;
  designation: string;
  reportsTo: number | null;
  children?: StaffMember[];
};

export function buildTree(data: StaffMember[], parentId: number | null = null): StaffMember[] {
  return data
    .filter((person: StaffMember) => person.reportsTo === parentId)
    .map((person: StaffMember) => ({
      ...person,
      children: buildTree(data, person.id)
    }));
} 
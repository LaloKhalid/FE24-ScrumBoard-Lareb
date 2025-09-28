export class Member {
  id: string;
  name: string;
  role: string;

  constructor(id: string, name: string, role: string) {
    this.id = id;
    this.name = name;
    this.role = role;
  }

  updateRole(newRole: string) {
    this.role = newRole;
  }

  display(): string {
    return `${this.name} (${this.role})`;
  }
}

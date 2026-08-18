export enum Role {
    ADMIN = 'ADMIN',
    USER = 'USER',
}

export interface RoleOption {
    value: Role;
    label: string;
}
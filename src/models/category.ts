export interface Category {
    id: string;
    name: string;
    description: string | null;
    created_at: Date;
    updated_at: Date;
    is_active: boolean;
}
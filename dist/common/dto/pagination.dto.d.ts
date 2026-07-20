export declare class PaginationDto {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder: 'asc' | 'desc';
    get skip(): number;
}
export declare function paginated<T>(data: T[], total: number, { page, limit }: PaginationDto): {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
};

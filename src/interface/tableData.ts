export interface RowData {
    [key: string]: string | number;
}

export interface TableData {
    columns: string[];
    rows: RowData[];
}

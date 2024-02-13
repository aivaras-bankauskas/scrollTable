import { TableData, RowData } from './tableData';

export interface AppInstance {
	readFile: (file: File) => Promise<unknown>;
	loadFile: (event: { target: { files: File[] } }) => Promise<unknown>;
	checkScroll: (event: { target: { scrollHeight: number, clientHeight: number, scrollTop: number } }) => void;
	addMoreRows: () => Promise<unknown>;
	tableData: TableData;
	currentIndex: number;
	visibleRows: RowData[];
	loading: boolean;
	isError: boolean;
  	errorMessage: string;
}

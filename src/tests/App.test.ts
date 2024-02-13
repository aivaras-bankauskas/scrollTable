import { describe, test, expect, beforeEach, vi } from 'vitest';
import { ComponentPublicInstance } from 'vue';
import { mount, VueWrapper } from '@vue/test-utils';
import { AppInstance } from '../interface/appInstance';
import App from '../App.vue';

type AppWrapper = VueWrapper<ComponentPublicInstance> & { vm: AppInstance };

const createFile = (content: string, fileName: string, mimeType: string): File => {
	const blob = new Blob([content], { type: mimeType });
	const file = new File([blob], fileName, { type: mimeType });

	return file;
};

describe('App', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
		if (typeof File.prototype.text !== 'function') {
			File.prototype.text = function(): Promise<string> {
				return new Promise((resolve, reject) => {
					const reader = new FileReader();

					reader.onload = function(): void {
						resolve(this.result as string);
					};

					reader.onerror = function(): void {
						reject(this.error);
					};

					reader.readAsText(this);
				});
			};
		}
	});

	test('readFile correctly parses JSON files', async () => {
		const wrapper = mount(App) as unknown as AppWrapper;
		const jsonContent = JSON.stringify({ columns: ['column1', 'column2'], rows: [{ column1: 'value1', column2: 'value2' }] });
		const jsonFile = createFile(jsonContent, 'test.json', 'application/json');

		const result = await wrapper.vm.readFile(jsonFile);

		expect(result).toEqual({ columns: ['column1', 'column2'], rows: [{ column1: 'value1', column2: 'value2' }] });
	});

	test('readFile correctly parses CSV files', async () => {
		const wrapper = mount(App) as unknown as AppWrapper;
		const csvContent = 'column1,column2\nvalue1,value2';
		const csvFile = createFile(csvContent, 'test.csv', 'text/csv');

		const result = await wrapper.vm.readFile(csvFile);

		expect(result).toEqual({ columns: ['column1', 'column2'], rows: [{ column1: 'value1', column2: 'value2' }] });
	});

	test('readFile throws an error for unsupported file types', async () => {
		const wrapper = mount(App) as unknown as AppWrapper;
		const txtFile = createFile('unsupported content', 'test.txt', 'text/plain');

		await expect(wrapper.vm.readFile(txtFile)).rejects.toThrow('Unsupported file type: txt');
	});

	test('loadFile exits early if no files are selected', async () => {
		const wrapper = mount(App) as unknown as AppWrapper;
		await wrapper.vm.loadFile({ target: { files: [] } });
		expect(wrapper.vm.loading).toBe(false);
	});

	test('throws an error when file content cannot be parsed', async () => {
		const wrapper = mount(App) as unknown as AppWrapper;
		const jsonFile = createFile('invalid content', 'test.json', 'application/json');
		wrapper.vm.readFile = vi.fn().mockResolvedValue('invalid content');

		try {
			await wrapper.vm.loadFile({ target: { files: [jsonFile] } });
		} catch (error) {
			const err = error as Error;
			expect(err.message, 'Error: jsonData is undefined');
		}
	});

	test('displays error message for unsupported file types', async () => {
		const wrapper = mount(App) as unknown as AppWrapper;
		const txtFile = createFile('unsupported content', 'test.txt', 'text/plain');

		await wrapper.vm.loadFile({ target: { files: [txtFile] } });

		expect(wrapper.vm.isError).toBe(true);
		expect(wrapper.vm.errorMessage).toBe('Invalid file type. Please upload a CSV or JSON file.');
	});

	test('loads file correctly', async ({ expect }) => {
		const wrapper = mount(App) as unknown as AppWrapper;

		wrapper.vm.readFile = async (): Promise<unknown> => ({
		  columns: ['column_1', 'column_2'],
		  rows: Array.from({ length: 200 }, (_, i) => ({ column1: `value_1_${i}`, column2: `value_2_${i}` }))
		});

		const fileContent = JSON.stringify({
		  columns: ['column_1', 'column_2'],
		  rows: Array.from({ length: 200 }, (_, i) => ({ column1: `value_1_${i}`, column2: `value_2_${i}` }))
		});
		const mockFile = createFile(fileContent, 'mockfile.json', 'application/json');

		const event = {
		  target: {
				files: [mockFile]
		  }
		};

		await wrapper.vm.loadFile(event);

		expect(wrapper.vm.tableData.columns).toEqual(['column_1', 'column_2']);
		expect(wrapper.vm.tableData.rows.length).toBe(200);
		expect(wrapper.vm.currentIndex).toBe(100);
		expect(wrapper.vm.visibleRows.length).toBe(100);
	});

	test('adds more rows correctly', async ({ expect }) => {
		const wrapper = mount(App) as unknown as AppWrapper;
		wrapper.vm.tableData.rows = Array.from({ length: 200 }, (_, i) => ({ column1: `value_1_${i}`, column2: `value_2_${i}` }));
		wrapper.vm.currentIndex = 0;

		await wrapper.vm.addMoreRows();
		expect(wrapper.vm.visibleRows.length).toBe(100);
		expect(wrapper.vm.currentIndex).toBe(100);

		await wrapper.vm.addMoreRows();
		expect(wrapper.vm.visibleRows.length).toBe(200);
		expect(wrapper.vm.currentIndex).toBe(200);
	});

	test('adds more rows when scrolled to the bottom', async () => {
		const wrapper = mount(App) as unknown as AppWrapper;
		wrapper.vm.tableData = {
		  columns: ['column_1', 'column_2'],
		  rows: Array.from({ length: 200 }, (_, i) => ({ column_1: `value_1_${i}`, column_2: `value_2_${i}` }))
		};
		wrapper.vm.visibleRows = Array.from({ length: 100 }, (_, i) => ({ column_1: `value_1_${i}`, column_2: `value_2_${i}` }));

		const eventMock = {
		  target: {
				scrollHeight: 1500,
				clientHeight: 500,
				scrollTop: 1001
		  }
		};

		wrapper.vm.checkScroll(eventMock);

		expect(wrapper.vm.visibleRows.length).toEqual(100);
	});

	test('adds scroll event listener on mount', async () => {
		document.body.innerHTML = '<div class="table-container"></div>';

		const element = document.querySelector('.table-container') as HTMLElement;
		const addEventListenerSpy = vi.spyOn(element, 'addEventListener');

		mount(App);

		expect(addEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
	});

	test('removes scroll event listener on unmount', async () => {
		const wrapper = mount(App) as unknown as AppWrapper;
		const removeEventListenerSpy = vi.spyOn(window.HTMLElement.prototype, 'removeEventListener');
		wrapper.unmount();
		expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
	});
});

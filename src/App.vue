<script setup lang="ts">
    import { reactive, ref, onMounted, onUnmounted } from 'vue';
    import { TableData, RowData } from './interface/tableData';
    import { config } from './config/config';

    const tableData = reactive<TableData>({ columns: [], rows: [] });
    const visibleRows = ref<RowData[]>([]);
    const loading = ref(false);
    const isError = ref(false);
    const errorMessage = ref('');
    let currentIndex = 0;
    let scrollableContainer: HTMLElement | null = null;

    const readFile = async (file: File): Promise<TableData> => {
        const fileType = file.name.split('.').pop()?.toLowerCase();
        const content = await file.text();
        switch (fileType) {
            case 'json':
                return JSON.parse(content);
            case 'csv':
                return csvToJson(content);
            default:
                throw new Error('Unsupported file type: ' + fileType);
        }
    };

    const csvToJson = (csvText: string): TableData => {
        const lines = csvText.split('\n');
        const headers = lines[0].split(',');
        const jsonData: TableData = { columns: headers, rows: [] };

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            const row: Record<string, string> = {};
            for (let j = 0; j < headers.length; j++) {
                row[headers[j]] = values[j];
            }
            jsonData.rows.push(row);
        }

        return jsonData;
    };

    const loadFile = async (event: Event): Promise<void> => {
        loading.value = true;
        isError.value = false;
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];

        if (!file) {
            errorMessage.value = 'No file selected';
            isError.value = true;
            loading.value = false;

            return;
        }

        try {
            const data = await readFile(file);
            tableData.columns = data.columns;
            tableData.rows = data.rows;
            currentIndex = 0;
            visibleRows.value = [];
            addMoreRows();
        } catch (error) {
            isError.value = true;
            errorMessage.value = 'Invalid file type. Please upload a CSV or JSON file.';
        } finally {
            loading.value = false;
        }
    };

    const addMoreRows = (): void => {
        if (currentIndex >= tableData.rows.length) {
            return;
        }
        const remainingRows = tableData.rows.slice(currentIndex, currentIndex + config.increment);
        visibleRows.value.push(...remainingRows);
        currentIndex += config.increment;
    };

    const checkScroll = (event: Event): void => {
        const target = event.target as HTMLElement;
        const distanceFromBottom = target.scrollHeight - (target.scrollTop + target.clientHeight);

        if (distanceFromBottom <= config.preloadThreshold) {
            addMoreRows();
        }
    };

    const addScrollEvent = (): void => {
        scrollableContainer = document.querySelector('.table-container');
        if (scrollableContainer) {
            scrollableContainer.addEventListener('scroll', checkScroll);
        }
    };

    const removeScrollEvent = (): void => {
        if (scrollableContainer) {
            scrollableContainer.removeEventListener('scroll', checkScroll);
        }
    };

    onMounted(() => {
        addScrollEvent();
    });

    onUnmounted(() => {
        removeScrollEvent();
    });
</script>

<template>
    <div class="m-3">
        <div class="input-group w-25 my-3">
            <input type="file" class="form-control" :class="{ 'is-invalid': isError }" @change="loadFile">
            <div v-if="isError" class="invalid-feedback"> {{ errorMessage }} </div>
        </div>
        <div v-if="loading">Loading...</div>
        <div v-else class="table-container" @scroll="checkScroll">
            <table v-if="tableData.columns.length > 0" class="table">
                <thead>
                    <tr>
                        <th scope="col">#</th>
                        <th v-for="(column, index) in tableData.columns" :key="index" scope="col">{{ column }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(row, rowIndex) in visibleRows" :key="rowIndex">
                        <th scope="row">{{ rowIndex + 1 }}</th>
                        <td v-for="(column, columnIndex) in tableData.columns" :key="columnIndex">{{ row[column] }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<style scoped>
.table-container {
  height: 100vh;
  width: 100%;
  overflow: auto;
  margin-right: 1rem;
}
</style>

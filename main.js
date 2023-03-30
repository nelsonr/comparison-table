import ComparisonTable from './src/components/ComparisonTable';
import './src/style.scss';

function setupSelection (widgetId) {
    const isSelectedClassName = 'comparison-table--is-selected';
    const rootEl = document.getElementById(widgetId);

    const columns = rootEl.querySelectorAll('.comparison-table__columns .comparison-table__column');

    columns.forEach((column) => {
        column.addEventListener('click', () => {
            columns.forEach(column => column.classList.remove(isSelectedClassName));
            column.classList.add(isSelectedClassName);

            const radioButton = column.querySelector('input[type="radio"]');
            radioButton.checked = true;
        });
    });
}

const tables = document.querySelectorAll('.comparison-table');

tables.forEach((tableEl) => {
    const id = tableEl.id;
    ComparisonTable().init(id);
    setupSelection(id);
});

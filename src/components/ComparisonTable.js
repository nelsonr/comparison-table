function ComparisonTable () {
    const scrollStartClassName = 'anb-comparison-table--has-scroll-start';
    const scrollEndClassName = 'anb-comparison-table--has-scroll-end';

    let resizeObserver = null;
    let mutationObserver = null;

    /**
     * Create a new function by composing multiple functions together,
     * passing the result of one function as argument of another.
     * 
     * Call execution is done from right to left.
     * 
     * Example: `compose(fnA, fnB)(args) === fnA(fnB(args))`
     * 
     * @param  {...function} fns
     * @returns a new function
     */
    const compose = (...fns) => (val) => fns.reduceRight((acc, fn) => fn(acc), val);

    const getLegendContainer = (rootEl) => rootEl.querySelector('.anb-comparison-table__legend');
    const getContentContainer = (rootEl) => rootEl.querySelector('.anb-comparison-table__content');
    const getColumnsContainer = (rootEl) => rootEl.querySelector('.anb-comparison-table__columns');
    const getLegendColumn = (parentEl) => parentEl && parentEl.querySelector('.anb-comparison-table--is-legend');
    const getColumn = (parentEl) => parentEl && parentEl.querySelector('.anb-comparison-table__column');
    const getRows = (parentEl) => parentEl && parentEl.querySelectorAll('.anb-comparison-table__row');
    const getRow = (parentEl) => parentEl && parentEl.querySelector('.anb-comparison-table__row');


    function updateScroll (rootEl) {
        const contentEl = getContentContainer(rootEl);
        const { scrollWidth, scrollLeft, clientWidth } = contentEl;

        // When direction is set to RTL `scrollLeft` can be a negative value.
        // In devices with display scaling (e.g.: Windows with 125% scaling), 
        // `scrollLeft` can have decimal values.
        const scrollLeftNormalized = parseInt(Math.abs((scrollLeft)));

        const isScrollStart = scrollLeftNormalized === 0;
        const isScrollEnd = (scrollWidth - scrollLeftNormalized - clientWidth <= 1);

        if (isScrollStart) {
            rootEl.classList.add(scrollStartClassName);
        } else {
            rootEl.classList.remove(scrollStartClassName);
        }

        if (isScrollEnd) {
            rootEl.classList.add(scrollEndClassName);
        } else {
            rootEl.classList.remove(scrollEndClassName);
        }

        // console.log("Element", contentEl);
        console.log({ scrollWidth, scrollLeft: scrollLeftNormalized, clientWidth, isScrollStart, isScrollEnd });

        const legendRowEl = compose(getRow, getLegendColumn, getLegendContainer)(rootEl);

        if (legendRowEl) {
            rootEl.style.setProperty('--scroll-edge-start', legendRowEl.clientWidth + 'px');
        }

        rootEl.style.setProperty('--scrollbar-height', contentEl.offsetHeight - contentEl.clientHeight + 'px');
    }

    function handleScrollableContent (rootEl) {
        const contentEl = getContentContainer(rootEl);

        mutationObserver = new MutationObserver((_entries) => updateScroll(rootEl));
        mutationObserver.observe(contentEl, { childList: true, subtree: true });

        contentEl.addEventListener('scroll', () => updateScroll(rootEl));
        updateScroll(rootEl);
    }

    function setRowsCount (rootEl) {
        const rowsCount = compose(getRows, getColumn)(rootEl).length;
        rootEl.style.setProperty('--rows-count', rowsCount);
    }

    function resizeColumnsHeight (rootEl) {
        const legendColumn = compose(getLegendColumn, getLegendContainer)(rootEl);
        const legendColumnClone = compose(getLegendColumn, getColumnsContainer)(rootEl);

        if (legendColumn && legendColumnClone) {
            const legendRows = getRows(legendColumn);
            const legendCloneRows = getRows(legendColumnClone);

            legendCloneRows.forEach((legendRow, index) => {
                const rowHeight = legendRow.getBoundingClientRect().height;
                legendRows[index].style.height = rowHeight + 'px';
            });
        }
    }

    function handleColumnsHeight (rootEl) {
        const legendColumnEl = compose(getLegendColumn, getLegendContainer)(rootEl);
        const columnsContainerEl = getColumnsContainer(rootEl);

        // Clone legend column from the legend column into the columns container
        // The legend column will be hidden in the columns container but will maintain
        // the height for each row as other columns.
        // We use this to sync the height of the legend column with the rest of the content.
        columnsContainerEl.prepend(legendColumnEl.cloneNode(true));

        resizeObserver = new ResizeObserver((_entries) => resizeColumnsHeight(rootEl));
        resizeObserver.observe(columnsContainerEl);
    }

    function setup (rootEl) {
        const legendColumnEl = compose(getLegendColumn, getLegendContainer)(rootEl);

        // Set the rows count for the CSS grid
        setRowsCount(rootEl);

        // Set rows height to match the main content columns
        if (legendColumnEl) {
            handleColumnsHeight(rootEl);
        }

        // Handle display of scrollable content
        handleScrollableContent(rootEl);
    }

    function init (widgetId) {
        const rootEl = document.getElementById(widgetId);
        const hasContent = compose(getColumn, getContentContainer)(rootEl) !== null;

        if (hasContent) {
            setup(rootEl);
        } else {
            const hasContentObserver = new MutationObserver((_entries) => {
                const hasContent = compose(getColumn, getContentContainer)(rootEl) !== null;

                if (hasContent) {
                    setup(rootEl);
                    hasContentObserver.disconnect();
                }
            });

            hasContentObserver.observe(rootEl, { childList: true, subtree: true });
        }
    }

    function destroy () {
        if (resizeObserver) {
            resizeObserver.disconnect();
        }

        if (mutationObserver) {
            mutationObserver.disconnect();
        }
    }

    return {
        init: init,
        destroy: destroy
    }
}

export default ComparisonTable;

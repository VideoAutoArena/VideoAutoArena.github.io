//Formatter to generate charts
var chartFormatter = function (cell, formatterParams, onRendered) {
    var content = document.createElement("span");
    var values = cell.getValue();

    //invert values if needed
    if (formatterParams.invert) {
        values = values.map(val => val * -1);
    }

    //add values to chart and style
    content.classList.add(formatterParams.type);
    content.innerHTML = values.join(",");

    //setup chart options
    var options = {
        width: 50,
        // min: 0.0,
        // max: 100.0,
    }

    if (formatterParams.fill) {
        options.fill = formatterParams.fill
    }

    //instantiate piety chart after the cell element has been aded to the DOM
    onRendered(function () {
        peity(content, formatterParams.type, options);
    });

    return content;
};

// 基础格式化函数
function createColorFormatter(startColor, endColor) {
    return function(cell, formatterParams) {
        const value = cell.getValue();
        
        // 处理空值或特殊值
        if (value === null || value === undefined || value === "-") {
            return "-";
        }

        // 格式化数值为一位小数
        const formattedValue = typeof value === 'number' ? value.toFixed(1) : value;
        
        // 如果没有提供参数，直接返回格式化的值
        if (!formatterParams || !formatterParams.min || !formatterParams.max) {
            return formattedValue;
        }

        const min = formatterParams.min;
        const max = formatterParams.max;
        const normalizedValue = Math.max(0, Math.min(1, (value - min) / (max - min)));

        // 计算颜色渐变
        const red = Math.floor(startColor.r + (endColor.r - startColor.r) * normalizedValue);
        const green = Math.floor(startColor.g + (endColor.g - startColor.g) * normalizedValue);
        const blue = Math.floor(startColor.b + (endColor.b - startColor.b) * normalizedValue);

        return `<div style="
            background-color: rgb(${red}, ${green}, ${blue});
            padding: 4px;
            text-align: center;
            width: 100%;
            height: 100%;
        ">${formattedValue}</div>`;
    };
}

// 为每种类型定义不同的颜色
const colorFormatterAvg = createColorFormatter(
    { r: 255, g: 255, b: 255 },  // 开始颜色（白色）
    { r: 206, g: 212, b: 218 }   // 结束颜色（灰色）
);

const colorFormatterGoalInt = createColorFormatter(
    { r: 255, g: 255, b: 255 },  // 开始颜色（白色）
    { r: 238, g: 211, b: 217 }   // 结束颜色（粉色）
);

const colorFormatterActionSeq = createColorFormatter(
    { r: 255, g: 255, b: 255 },  // 开始颜色（白色）
    { r: 204, g: 211, b: 202 }   // 结束颜色（浅绿色）
);

const colorFormatterSubgoal = createColorFormatter(
    { r: 255, g: 255, b: 255 },  // 开始颜色（白色）
    { r: 245, g: 232, b: 221 }   // 结束颜色（浅橙色）
);

const colorFormatterTrans = createColorFormatter(
    { r: 255, g: 255, b: 255 },  // 开始颜色（白色）
    { r: 181, g: 192, b: 208 }   // 结束颜色（浅蓝色）
);

const colorFormatterObject = createColorFormatter(
    { r: 255, g: 255, b: 255 },  // 开始颜色（白色）
    { r: 179, g: 170, b: 210 }   // 结束颜色（浅紫色）
);

document.addEventListener('DOMContentLoaded', function () {
    console.log('Loading benchmark tables...');
    
    // Load both sets of data
    Promise.all([
        fetch('website/data/videoautoarena.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .catch(error => {
                console.error('Error loading VideoAutoArena data:', error);
                return [];
            }),
        fetch('website/data/videoautobench.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .catch(error => {
                console.error('Error loading VideoAutoBench data:', error);
                return [];
            })
    ])
    .then(([behavior_total_benchmark_data, virtualhome_total_benchmark_data]) => {
        console.log('Data loaded:', {
            videoautoarena: behavior_total_benchmark_data,
            videoautobench: virtualhome_total_benchmark_data
        });

        try {
            // Set up function to get min and max for columns
            var getColumnMinMax = (data, field) => {
                let values = data.map(item => item[field]).filter(val => val !== "-").map(Number);
                return { min: Math.min(...values), max: Math.max(...values) };
            };

            // Columns for VideoAutoArena (behavior_total_benchmark_data)
            var behavior_columns = [
                {
                    title: "Models",
                    field: "Models",
                    widthGrow: 1.5,
                    minWidth: 160
                },
                {
                    title: "Size",
                    field: "Size",
                    widthGrow: 1
                },
                {
                    title: "Frames",
                    field: "frames",
                    widthGrow: 1
                },
                {
                    title: "ELO",
                    field: "ELO",
                    widthGrow: 1.8,
                    hozAlign: "center", formatter: colorFormatterGoalInt
                },{
                    title: "Win Rates",
                    field: "Win Rates",
                    widthGrow: 1.8,
                    hozAlign: "center", formatter: colorFormatterAvg
                },{
                    title: "(8s, 15s]",
                    field: "(8s, 15s]",
                    widthGrow: 1.8,
                    hozAlign: "center", formatter: colorFormatterActionSeq
                },{
                    title: "(15s, 60s]",
                    field: "(15s, 60s]",
                    widthGrow: 1.5,
                    hozAlign: "center", formatter: colorFormatterSubgoal
                },{
                    title: "(180s, 600s]",
                    field: "(180s, 600s]",
                    widthGrow: 1.8,
                    hozAlign: "center", formatter: colorFormatterTrans
                },{
                    title: "(900s, 3600s]",
                    field: "(900s, 3600s]",
                    widthGrow: 1.8,
                    hozAlign: "center", formatter: colorFormatterObject
                },
                
                // Add other relevant columns for VideoAutoArena here
            ];

            // Columns for VideoAutoBench (virtualhome_total_benchmark_data)
            var virtualhome_columns = [
                {
                    title: "Models",
                    field: "Models",
                    widthGrow: 1.5,
                    minWidth: 160
                },
                {
                    title: "Size",
                    field: "Size",
                    widthGrow: 1
                },
                {
                    title: "vs. Selected",
                    field: "vs_Selected",
                    widthGrow: 1.5,
                    formatter: "number",
                    formatterParams: {
                        precision: 2
                    },
                    widthGrow: 1.5,
                    hozAlign: "center", formatter: colorFormatterGoalInt
                },
                {
                    title: "vs. Rejected",
                    field: "vs_Rejected",
                    widthGrow: 1.5,
                    formatter: "number",
                    formatterParams: {
                        precision: 2
                    },
                    widthGrow: 1.5,
                    hozAlign: "center", formatter: colorFormatterObject
                },
                {
                    title: "Avg.",
                    field: "Avg",
                    widthGrow: 1.5,
                    formatter: "number",
                    formatterParams: {
                        precision: 2
                    },
                    widthGrow: 1.5,
                    hozAlign: "center", formatter: colorFormatterTrans
                },
                
                // Add other relevant columns for VideoAutoBench here
            ];

            // Process columns for VideoAutoArena
            behavior_columns.forEach(column => {
                if (column.columns) {
                    column.columns.forEach(subColumn => {
                        let { min, max } = getColumnMinMax(behavior_total_benchmark_data, subColumn.field);
                        subColumn.formatterParams = { min, max };
                    });
                } else if (column.field !== "model" && column.field !== "frames" && column.field !== "tpf") {
                    let { min, max } = getColumnMinMax(behavior_total_benchmark_data, column.field);
                    column.formatterParams = { min, max };
                }
            });

            // Process columns for VideoAutoBench
            virtualhome_columns.forEach(column => {
                if (column.columns) {
                    column.columns.forEach(subColumn => {
                        let { min, max } = getColumnMinMax(virtualhome_total_benchmark_data, subColumn.field);
                        subColumn.formatterParams = { min, max };
                    });
                } else if (column.field !== "model" && column.field !== "frames_processed" && column.field !== "tokens_per_frame") {
                    let { min, max } = getColumnMinMax(virtualhome_total_benchmark_data, column.field);
                    column.formatterParams = { min, max };
                }
            });

            // Initialize the VideoAutoArena table (for behavior data)
            const behaviorTable = new Tabulator("#behavior-benchmark-main-table", {
                data: behavior_total_benchmark_data,
                layout: "fitColumns",
                responsiveLayout: "collapse",
                responsiveLayoutCollapseStartOpen: false,
                movableColumns: false,
                initialSort: [{ column: "avg_acc", dir: "desc" }],
                columnDefaults: {
                    tooltip: true,
                    headerWordWrap: true,
                },
                columns: behavior_columns,
                rowFormatter: function(row) {
                    if (row.getData().Models === "GPT-4o") {
                        row.getElement().style.fontWeight = "bold";
                    }
                    if (row.getData().Models === "Aria") {
                        row.getElement().style.fontWeight = "bold";
                    }
                },
            });

            // Initialize the VideoAutoBench table (for virtualhome data)
            const virtualhomeTable = new Tabulator("#virtualhome-benchmark-main-table", {
                data: virtualhome_total_benchmark_data,
                layout: "fitColumns",
                responsiveLayout: "collapse",
                responsiveLayoutCollapseStartOpen: false,
                movableColumns: false,
                initialSort: [{ column: "score", dir: "desc" }],
                columnDefaults: {
                    tooltip: true,
                    headerWordWrap: true,
                },
                columns: virtualhome_columns,
                rowFormatter: function(row) {
                    if (row.getData().Models === "GPT-4o") {
                        row.getElement().style.fontWeight = "bold";
                    }
                    if (row.getData().Models === "Aria") {
                        row.getElement().style.fontWeight = "bold";
                    }
                },
            });

            console.log('Tables initialized successfully');
        } catch (error) {
            console.error('Error initializing tables:', error);
        }
    })
    .catch(error => {
        console.error('Error in data loading:', error);
    });
});

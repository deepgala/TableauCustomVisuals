/* global tableau Chart */

tableau.extensions.initializeAsync({ configure: configure }).then(() => {
  getData();
});

async function configure() {
  try {
    const url = `${window.location.origin}/config.html`;
    await tableau.extensions.ui.displayDialogAsync(url, "", {
      width: 500,
      height: 600
    });
    getData();
  } catch (error) {
    switch (error.errorCode) {
      case tableau.ErrorCodes.DialogClosedByUser:
        console.log("Dialog was closed by user.");
        break;
      default:
        console.error(error.message);
    }
  }
}

async function getData() {
  const settings = tableau.extensions.settings.getAll();
  const worksheets = tableau.extensions.dashboardContent.dashboard.worksheets;
  const worksheet = worksheets.find(ws => ws.name === settings.sourceWorksheet);
  const dataTable = await worksheet.getSummaryDataAsync();
  const dimensionFieldIndex = dataTable.columns.find(
    column => column.fieldName === settings.dimensionField
  ).index;
  const measureFieldIndex = dataTable.columns.find(
    column => column.fieldName === settings.measureField
  ).index;

  let data = [];

  for (let row of dataTable.data) {
    data.push({
      label: row[dimensionFieldIndex].value,
      value: row[measureFieldIndex].value
    });
  }

  data.sort((a, b) => (a.label > b.label ? 1 : -1));

  drawChart(data);
}

function drawChart(vizData) {
  let values = vizData.map(row => row.value);
  let labels = vizData.map(row => row.label);

  let ctx = document.getElementById("canvas").getContext("2d");

  let data = {
    datasets: [
      {
        data: values,
        backgroundColor: "#4E79A7"
      }
    ],
    labels: labels
  };

  let options = {
    onClick: filter,
    maintainAspectRatio: false
  };

  let polarChart = new Chart(ctx, {
    data: data,
    type: "polarArea",
    options: options
  });
}

function filter(event, item) {
  const settings = tableau.extensions.settings.getAll();
  const worksheets = tableau.extensions.dashboardContent.dashboard.worksheets;
  const worksheet = worksheets.find(ws => ws.name === settings.filterWorksheet);

  if (item[0]) {
    let index = item[0].index;
    let label = event.chart.data.labels[index];
    worksheet.applyFilterAsync(settings.dimensionField, [label], "replace");
  } else {
    worksheet.clearFilterAsync(settings.dimensionField);
  }
}

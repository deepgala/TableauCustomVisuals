/* global tableau Vue */

let app = new Vue({
  el: "#app",
  data: {
    sourceWorksheet: null,
    filterWorksheet: null,
    dimensionField: null,
    measureField: null,
    worksheets: [],
    fields: []
  },
  methods: {
    save: async function() {
      tableau.extensions.settings.set("sourceWorksheet", this.sourceWorksheet);
      tableau.extensions.settings.set("filterWorksheet", this.filterWorksheet);
      tableau.extensions.settings.set("dimensionField", this.dimensionField);
      tableau.extensions.settings.set("measureField", this.measureField);
      await tableau.extensions.settings.saveAsync();
      tableau.extensions.ui.closeDialog("");
    },
    getWorksheets: function() {
      const worksheets =
        tableau.extensions.dashboardContent.dashboard.worksheets;
      this.worksheets = [...worksheets.map(w => w.name)];

      const settings = tableau.extensions.settings.getAll();
      this.sourceWorksheet = worksheets.find(
        w => w.name === settings.sourceWorksheet
      )
        ? settings.sourceWorksheet
        : "";
      this.filterWorksheet = worksheets.find(
        w => w.name === settings.filterWorksheet
      )
        ? settings.filterWorksheet
        : "";
    },
    getFields: async function(worksheetName) {
      const worksheets =
        tableau.extensions.dashboardContent.dashboard.worksheets;
      const worksheet = worksheets.find(w => w.name === worksheetName);
      const data = await worksheet.getSummaryDataAsync();
      this.fields = [...data.columns.map(column => column.fieldName)];

      const settings = tableau.extensions.settings.getAll();
      this.dimensionField = data.columns.find(
        c => c.fieldName === settings.dimensionField
      )
        ? settings.dimensionField
        : "";
      this.measureField = data.columns.find(
        c => c.fieldName === settings.measureField
      )
        ? settings.measureField
        : "";
    }
  },
  watch: {
    sourceWorksheet: function(worksheetName) {
      this.getFields(worksheetName);
    }
  },
  created: async function() {
    await tableau.extensions.initializeDialogAsync();
    this.getWorksheets();
  }
});

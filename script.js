/* global tableau Chart */
tableau.extensions.initializeAsync({ configure: configure }).then(() => {
  // ...
});

async function configure() {
  try {
    const url = `${window.location.origin}/config.html`;
    await tableau.extensions.ui.displayDialogAsync(url, "", {
      width: 500,
      height: 600
    });
    // ... more to come here ...
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

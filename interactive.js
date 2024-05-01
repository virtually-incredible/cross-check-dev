function onOpen() {
  var submenu = [
    {name : "Get changes", functionName : "get_changes"},
    {name : "Apply changes", functionName : "apply_changes"},

  ];
  SpreadsheetApp.getActiveSpreadsheet().addMenu('More actions', submenu);
}

function get_changes() {
  checkConsistency();
  displayChanges();
}

function apply_changes() {
  applyChanges();
}
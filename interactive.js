function onOpen() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const dev = scriptProperties.getProperty('dev');
  var submenu = [
    {name : "Get changes", functionName : "get_changes"},
    {name : "Apply changes", functionName : "apply_changes"},

  ];
  if (dev) {
    submenu.push({name : "-- Restore backup", functionName : "restoreBackup"});
    submenu.push({name : "-- Place dev sources", functionName : "replaceSourcesWithDev"});
    submenu.push({name : "-- Place prod sources", functionName : "replaceSourcesWithProd"});
  }

  SpreadsheetApp.getActiveSpreadsheet().addMenu('More actions', submenu);
}

function get_changes() {
  if (checkConsistency()) {
    displayChanges();
  }
}

function apply_changes() {
  applyChanges();
}
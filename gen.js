const gen = {};

gen.vaPlacementDates = function (vaMap, companyName, tz) {
  const data = vaMap[companyName];
  if (data) {
    return data
      .map(
        (x, i) =>
          `${ordinalSuffixOf(i + 1)}: ${Utilities.formatDate(x.date, tz, 'M/d/yyyy')}`
      )
      .join('\n');
  } else return [];
};

//::CodeToVAMap->CodeToNameMap->Either Error NameToVaMap
gen.nameToVaMap = function (codeToVaMap, codeToNameMap, aliases) {
  const vaMap = {};
  const absent = [];
  for (const code in codeToVaMap) {
    let companyName = codeToNameMap[code];
    if (companyName) {
      companyName = aliases[companyName] ? aliases[companyName] : companyName;
      vaMap[companyName] = codeToVaMap[code];
    } else {
      absent.push(code);
    }
  }
  return absent.length
    ? { left: { message: 'some codes absent in clients list', data: absent } }
    : { right: vaMap };
};

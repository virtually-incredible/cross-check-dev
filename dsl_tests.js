function dsl_module_tests() {
  return (
    test_check_consistency() &&
    test_collect_data() &&
    test_apply_billing_changes()
  );
}

function test_apply_billing_changes() {
  return jUnit.test_case('', {
    'test applying billing changes': function () {
      var source_sheet = tt.ds('0.10');
      var dest_sheet = tt.tb('0.1');
      var m = source_sheet.getDataRange().getValues();
      dest_sheet.clear();
      dest_sheet.getRange(1, 1, m.length, m[0].length).setValues(m);
      var cell1 = dest_sheet.getRange('D245');
      var cell2 = dest_sheet.getRange('D248');
      jUnit.assert_eq('PT', cell1.getValue());
      jUnit.assert_eq('Still in OnB', cell2.getValue());
      var subscriptionMap = {
        'Haven Property Management by Ginger and Co': { subscriptions: '' },
        'Florida Agri Management': { subscriptions: 'VAS' },
        'Pioneer Management OR': { subscriptions: 'XXX' },
      };
      applyBillingChanges(subscriptionMap, ['INACTIVE'], dest_sheet);
      jUnit.assert_eq('', cell1.getValue());
      jUnit.assert_eq('VAS', cell2.getValue());
    },
  });
}

function test_check_consistency() {
  return jUnit.test_case('', {
    'test checking consistency': function () {
      var source_sheet = tt.ds('0.1');
      jUnit.assert_false(checkConsistency(source_sheet, 2024, true));
    },
  });
}

function test_collect_data() {
  return jUnit.test_case('', {
    'test collecting overall data': function () {
      var res;
      const source_sheet = tt.ds('0.6');
      const status_sheet = tt.ds('0.2');
      const adapter_sheet = tt.ds('0.5');
      const today = '2024-05-30';

      res = collectData({
        today,
        status_sheet,
        adapter_sheet,
        source_sheet,
        pivotNumber: 2,
      }).right;
      jUnit.assert_eq(
        'PT+VSS+VAS',
        res['Home Property Management'].subscriptions
      );

      res = collectData({
        today,
        status_sheet,
        adapter_sheet,
        source_sheet,
      }).right;

      jUnit.assert_eq_num(3, res['Home Property Management'].agents);
      jUnit.assert_eq(
        'PT+VSS+VAS',
        res['Home Property Management'].subscriptions
      );
      jUnit.assert_eq('Active', res['Home Property Management'].va_status);

      jUnit.assert_eq_num(0, res['Verterra Property Management'].agents);
      jUnit.assert_eq(
        'PT+VAS',
        res['Verterra Property Management'].subscriptions
      );
      jUnit.assert_eq(
        'Laggard Resumed',
        res['Verterra Property Management'].va_status
      );

      jUnit.assert_eq_num(4, res['Suncoast Cooperative'].agents);
      jUnit.assert_eq('PT+VAS', res['Suncoast Cooperative'].subscriptions);
      jUnit.assert_eq('Laggard Resumed', res['Suncoast Cooperative'].va_status);
    },
  });
}

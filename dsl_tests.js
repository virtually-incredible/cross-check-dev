function dsl_module_tests() {
  return test_check_consistency() && test_collect_data();
}

function test_check_consistency() {
  return jUnit.test_case('', {
    'test checking consistency': function () {
      jUnit.assert_false(checkConsistency(2024, true));
    },
  });
}

function test_collect_data() {
  return jUnit.test_case('', {
    'test collecting overall data': function () {
      const source_sheet = tt.ds('0.6');
      const status_sheet = tt.ds('0.2');
      const adapter_sheet = tt.ds('0.5');
      const today = '2024-05-30';
      const res = collectData({
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
      jUnit.assert_eq('Active', res['Home Property Management'].status);

      jUnit.assert_eq_num(0, res['Verterra Property Management'].agents);
      jUnit.assert_eq(
        'PT+VAS',
        res['Verterra Property Management'].subscriptions
      );
      jUnit.assert_eq(
        'Laggard Resumed',
        res['Verterra Property Management'].status
      );

      jUnit.assert_eq_num(4, res['Suncoast Cooperative'].agents);
      jUnit.assert_eq('PT+VAS', res['Suncoast Cooperative'].subscriptions);
      jUnit.assert_eq('Laggard Resumed', res['Suncoast Cooperative'].status);
    },
  });
}

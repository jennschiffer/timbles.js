/* testing initialization of timbles tables */

QUnit.test('Correct Number of Table Rows', function(assert) {
  var numRows = $('table').find('tr').length;
  assert.equal(numRows, 9);
});

QUnit.test('Detect single Header Row', function(assert) {
  var numRows = $('table').find('tr.header-row').length;
  assert.equal(numRows, 1);
});

QUnit.test('Correct Number of Non-header Record Rows', function(assert) {
  var numRows = $('table').find('tr').not('.header-row').length;
  assert.equal(numRows, 8);
});

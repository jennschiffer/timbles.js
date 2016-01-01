/* testing initialization of timbles tables */

var target = $('#target');

QUnit.test('Correct number of table rows', function(assert) {
  var numRows = target.find('tr').length;
  assert.equal(numRows, 6);
});

QUnit.test('Detect single header row', function(assert) {
  var numRows = target.find('tr.header-row').length;
  assert.equal(numRows, 1);
});

QUnit.test('Correct number of non-header record rows', function(assert) {
  var numRows = target.find('tr').not('.header-row').length;
  assert.equal(numRows, 5);
});

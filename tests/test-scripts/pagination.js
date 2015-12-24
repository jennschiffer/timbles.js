/* testing pagination of timbles tables */

QUnit.test('Correct number of table rows showing on page', function(assert) {
  var numRows = $('table').find('tr').length;
  assert.equal(numRows, 4);
});

QUnit.test( 'Detect single header row', function( assert ) {
  var numRows = $('table').find('tr.header-row').length;
  assert.equal(numRows, 1);
});

QUnit.test('Correct number of non-header record rows', function( assert ) {
  var numRows = $('table').find('tr').not('.header-row').length;
  assert.ok(numRows, 3);
});

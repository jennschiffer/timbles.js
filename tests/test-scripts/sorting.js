/* testing sorting of timbles tables */

var target = $('#target');

QUnit.test('Clicking a column header sorts table by that column', function( assert) {
  var $firstColumnHeader = target.find('thead tr th').eq(0);
  assert.ok(!$firstColumnHeader.hasClass('sorted-asc'), 'Not pre-sorted');
  $firstColumnHeader.click();
  assert.ok($firstColumnHeader.hasClass('sorted-asc'), 'Ascending');
  assert.equal(target.find('.sorted-asc').length, 1, 'One ascending sorted col');
  assert.equal(target.find('.sorted-desc').length, 0, 'No descdending sorted cols');
  $firstColumnHeader.click();
  assert.ok($firstColumnHeader.hasClass('sorted-desc'), 'Descending');
  assert.equal(target.find('.sorted-desc').length, 1, 'One descdending sorted col');
  assert.equal(target.find('.sorted-asc').length, 0, 'No ascdending sorted cols');
});

QUnit.test('Applying sortColumn on a header sorted table by that column', function(assert) {
  var $firstColumnHeader = target.find('thead tr th').eq(0);
  assert.ok(!$firstColumnHeader.hasClass('sorted-asc'), 'Not pre-sorted');
  target.timbles('sortColumn', 0)
  assert.ok($firstColumnHeader.hasClass('sorted-asc'), 'Ascending');
  assert.equal(target.find('.sorted-asc').length, 1, 'One ascending sorted col');
  assert.equal(target.find('.sorted-desc').length, 0, 'No descdending sorted cols');
  target.timbles('sortColumn', 0)
  assert.ok($firstColumnHeader.hasClass('sorted-desc'), 'Descending');
  assert.equal(target.find('.sorted-desc').length, 1, 'One descdending sorted col');
  assert.equal(target.find('.sorted-asc').length, 0, 'No ascdending sorted cols');
});

QUnit.test('There is one unsortable header and sorting by it does nothing', function(assert) {
  var $noSortColumns = $('.no-sort');
  assert.equal($noSortColumns.length, 1, 'There is one unsortable column');
  $noSortColumns.click();
  assert.ok(!$noSortColumns.hasClass('sorted-asc'), 'Not sorted ascending');
  assert.ok(!$noSortColumns.hasClass('sorted-desc'), 'Not sorted descending');
});

/* testing sorting of timbles tables */

QUnit.test( 'Clicking a column header sorts table by that column', function( assert) {
  var $aColumnHeader = $('thead tr').eq(0).find('th').eq(2);
  $aColumnHeader.click();
  assert.equal($('tbody tr').eq(0).find('td').eq(2).text(), 'Adobe PDF document');
});

QUnit.test('There is one unsortable header and sorting by it does nothing', function(assert) {
  var $noSortColumns = $('.no-sort');
  assert.equal($noSortColumns.length, 1, 'There is one unsortable column');
  $noSortColumns.click();
  assert.ok(!$noSortColumns.hasClass('sorted-asc'), 'Not sorted ascending');
  assert.ok(!$noSortColumns.hasClass('sorted-desc'), 'Not sorted descending');
});

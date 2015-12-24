/* testing sorting of timbles tables */

var target = $('#target');

function sortedColumnContent(columnIndex, order) {
  // Sorts by the given column and returns an array with the column contents
  target.timbles('sortColumn', columnIndex, order || 'asc');
  return target.find('tbody tr').map(function () {
    return $(this).children().eq(columnIndex).text()
  }).get();
}

function sliceForPagination(elements) {
  // Returns the correct number of elements to compare when pagination is defined
  if (target.data('timbles').pagination !== undefined) {
    var recordCount = target.data('timbles').pagination.recordsPerPage;
    return elements.slice(0, recordCount);
  }
  return elements;
}

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

QUnit.test('Sorting names with case as written', function(assert) {
  var expected = [
      'Arthur Rimbaud',
      'Arthur fforde',
      'Ezra Pound',
      'Robert Frost',
      'e e cummings',
  ];
  assert.deepEqual(
      sortedColumnContent(0),
      sliceForPagination(expected),
      'Ascending order');
  expected.reverse();
  assert.deepEqual(
      sortedColumnContent(0, 'desc'),
      sliceForPagination(expected),
      'Descending order');
});

QUnit.test('Sorting names as lowercase data-values', function(assert) {
  var expected = [
      'Arthur fforde',
      'Arthur Rimbaud',
      'e e cummings',
      'Ezra Pound',
      'Robert Frost',
  ];
  assert.deepEqual(
      sortedColumnContent(1),
      sliceForPagination(expected),
      'Ascending order');
  expected.reverse();
  assert.deepEqual(
      sortedColumnContent(1, 'desc'),
      sliceForPagination(expected),
      'Descending order');
});

QUnit.test('Sorting numbers lexicographically', function(assert) {
  var expected = ['11', '120', '19', '5', '500'];
  assert.deepEqual(
      sortedColumnContent(2),
      sliceForPagination(expected),
      'Ascending order');
  expected.reverse();
  assert.deepEqual(
      sortedColumnContent(2, 'desc'),
      sliceForPagination(expected),
      'Descending order');
});

QUnit.test('Sorting numbers naturally', function(assert) {
  var expected = ['5', '11', '19', '120', '500'];
  assert.deepEqual(
      sortedColumnContent(3),
      sliceForPagination(expected),
      'Ascending order');
  expected.reverse();
  assert.deepEqual(
      sortedColumnContent(3, 'desc'),
      sliceForPagination(expected),
      'Descending order');
});

/**
* timbles.js
* definitely the most lightweight jquery table plugin ever
* like, all you can do is generate a table and allow sorting lol that's it
* @author jenn schiffer http://jennmoney.biz
*/

(function($) {

  'use strict';

  var pluginName = 'timbles';

  var defaults = {
    sortKey : null,
    sortOrder : null,
  };

  var classes = {
    headerRow : 'header-row',
    label : 'label',
    sortASC : 'sorted-asc',
    sortDESC : 'sorted-desc',
    noSort : 'no-sort',
    paginationTools : 'pagination',
  };

  var copy = {
    firstPage : ' [&laquo;] ',
    prevPage : ' < ',
    nextPage : ' > ',
    lastPage : ' [&raquo;] '
  };

  var methods = {

    /** initialize timble, er, i mean table **/
    init : function(opts) {
      return this.each(function() {
        var $this = $(this).addClass(pluginName);
        var options = $.extend({}, defaults, opts);
        var data = {
          $this : $this,
          dataConfig: options.dataConfig,
          sorting: options.sorting,
          pagination: options.pagination,
        };
        $this.data(pluginName, data);

        if ( data.dataConfig ) {
          // generate table from JSON
          methods.generateTableFromJson.call($this);
        }
        else {
          // set up existing html table
          data.$allRows = $this.find('tr');
          data.$headerRow = $this.find('thead tr').eq(0).addClass(classes.headerRow);
          data.$records = data.$allRows.not('.' + classes.headerRow);

          // save all this great new data wowowow
          $this.data(pluginName, data);

          methods.setupExistingTable.call($this);
        }
      });
    },

    setupExistingTable : function() {
      var $this = $(this);
      var data = $this.data(pluginName);
      if (!data) { return; }

      // for each header cell, get ID and set the records cells to have it as a class for sorting
      data.$headerRow.find('th').each(function(i){
        var headerId = $(this).attr('id');
        data.$records.find('td:nth-child(' + (i + 1) + ')').addClass(headerId);
      });

      // start enabling any given features
      methods.enableFeaturesSetup.call($this);
    },

    generateTableFromJson : function() {
      var $this = $(this);
      var data = $this.data(pluginName);
      if (!data) { return; }

      $this.append('<thead><tr class="' + classes.headerRow + '"></tr></thead>');

      // generate and add cell headers to header row
      $.each(data.dataConfig.columns, function(index, value){

        // if noSorting is set for this column, add the no-sort class to it
        var noSortClassString = '';
        if ( value.noSorting ) {
          noSortClassString = ' class="' + classes.noSort + '"';
        }

        var $cell = $('<th id="' + value.id + '"' + noSortClassString +'>' + value.label + '</th>');
        $this.find('tr.' + classes.headerRow).append($cell);
      });

      // generate each row of data from json
      var rows;

      if ( data.dataConfig.dataType === 'array' ) {
        // no need for ajax call if data is local array
        methods.generateRowsFromData.call($this, data.dataConfig.data, data.dataConfig.columns, $this);
      }
      else {
        // get external json file given
        $.getJSON( data.dataConfig.data, function(json) {
          methods.generateRowsFromData.call($this, json, data.dataConfig.columns, $this);
        }).then(function(){
          // set up existing html table
          data.$allRows = $this.find('tr');
          data.$headerRow = $this.find('thead tr').eq(0).addClass(classes.headerRow);
          data.$records = data.$allRows.not('.' + classes.headerRow);

          // save all this great new data wowowow
          $this.data(pluginName, data);

          // start enabling any given features
          methods.enableFeaturesSetup.call($this);
        });
      }
    },

    generateRowsFromData : function(rowData, columnConfig, thisTable) {
      var $this = $(this);
      var data = $this.data(pluginName);
      if (!data) { return; }

      $.each(rowData, function(index, row){
        var $currentRow = $('<tr>');
        $.each(columnConfig, function(property, value){

          // if there is a dataFilter function given, apply it to the value to display
          var displayValue = ( value.dataFilter ) ? value.dataFilter(row[value.id]) : row[value.id];

          // append new cell to the row
          $currentRow.append('<td class="' + value.id + '" data-value="' + row[value.id] + '">' + displayValue + '</td>');
        });
        thisTable.append($currentRow);
      });

      data.$allRows = $this.find('tr');
      data.$headerRow = $this.find('thead tr').eq(0).addClass(classes.headerRow);
      data.$records = data.$allRows.not('.' + classes.headerRow);

      $this.data(pluginName, data);
    },

    enableFeaturesSetup : function() {
      var $this = $(this);
      var data = $this.data(pluginName);
      if (!data) { return; }

     // if sorting set to true, allow sorting
      if ( data.sorting ) {
        methods.enableSorting.call($this);

        // if sorting is given, sort table by it and order
        if ( data.sorting.keyId ) {
          methods.sortColumn.call($this, data.sorting.keyId, data.sorting.order);
        }
      }

      // if pagination set to true, set pagination
      if ( data.pagination && data.$records ) {
        methods.enablePagination.call($this);
      }

    },

    enableSorting : function() {
      var $this = $(this);
      var data = $this.data(pluginName);
      if (!data) { return; }

      // bind sorting to header cells
      $this.find('th').not('.no-sort').bind({
        click: function(e) {
          methods.sortColumn.call($this, $(this).attr('id'), false);
        }
      });
    },

    sortColumn : function(key, order) {
      var $this = $(this);
      var data = $this.data(pluginName);
      if (!data) { return; }

      var $headers = $this.find('th');
      var $sortHeader = $this.find('#' + key);

      // determine order and clear header sort classes
      if ( !order ) {
        order = $sortHeader.hasClass(classes.sortASC) ? 'desc' : 'asc';
      }
      $headers.removeClass(classes.sortASC).removeClass(classes.sortDESC);

      // literally sort non-header-row records
      var $recordsToSort = data.$records;
      var $sortedRecords;

      if (order === 'asc') {
        $sortHeader.addClass(classes.sortASC);

        var alpha, beta;
        $sortedRecords = $recordsToSort.sort( function(a, b) {
          alpha = $(a).find('td.' + key).data('value');
          beta = $(b).find('td.' + key).data('value');

          alpha = (alpha) ? alpha : $(a).find('td.' + key).text();
          beta = (beta) ? beta : $(b).find('td.' + key).text();

          if ( alpha < beta ) {
            return -1;
          }
          else {
            if ( alpha > beta ) {
              return 1;
            }
            else {
              return 0;
            }
          }
        });
      }
      else {
        $sortHeader.addClass(classes.sortDESC);
        $sortedRecords = $recordsToSort.sort( function(a, b) {
          alpha = $(a).find('td.' + key).data('value');
          beta = $(b).find('td.' + key).data('value');

          alpha = (alpha) ? alpha : $(a).find('td.' + key).text();
          beta = (beta) ? beta : $(b).find('td.' + key).text();

          if ( beta < alpha ) {
            return -1;
          }
          else {
            if ( beta > alpha ) {
              return 1;
            }
            else {
              return 0;
            }
          }
        });
      }

      // remove current unsorted records
      if ( $recordsToSort ) {
        $recordsToSort.remove();
      }

      // append sorted records
      $this.append($sortedRecords);

      // if table was paginated, reenable
      if ( data.pagination ) {
        data.pagination.currentPage = 1;
        $this.data(pluginName, data);

        methods.enablePagination.call($this);
      }
    },

    enablePagination : function() {
      var $this = $(this);
			var data = $this.data(pluginName);
			// don't paginate if there are no records
			if (!data || !data.$records || data.$records.length === 0 ) { return; }

			var $recordsToPaginate = data.$records;
			var paginatedRecordsArray = [];

			for ( var i = 0; i < data.pagination.recordsPerPage; i++ ) {
				if ( data.$records[i] ) {
					paginatedRecordsArray.push(data.$records[i]);
				}
			}

			// remove records if they exist
			if ( $recordsToPaginate ) {
				$recordsToPaginate.remove();
			}

			// show first page
			$this.append(paginatedRecordsArray);

			// create footer to hold tools
			data.$footerRow = $this.find('tfoot');

			if ( data.$footerRow.length === 0 ) {
        var $footer = $('<tfoot>');
        data.$footerRow = $footer;
      }

			// create tools if they don't exist already
			if ( !data.$paginationToolsContainer ) {
        methods.generatePaginationTools.call($this);
			}

			// save it all
      $this.data(pluginName, data);
    },

    generatePaginationTools : function() {
      var $this = $(this);
      var data = $this.data(pluginName);
      if (!data) { return; }

      data.$paginationToolsContainer = $('<div class="' + classes.paginationTools + '">');
      data.$linkFirstPage = $('<a href="#">' + copy.firstPage + '</a>');
      data.$linkPrevPage = $('<a href="#">' + copy.prevPage + '</a>');
      data.$linkNextPage = $('<a href="#">' + copy.nextPage + '</a>');
      data.$linkLastPage = $('<a href="#">' + copy.lastPage + '</a>');

      data.$paginationToolsContainer
        .append(data.$linkFirstPage)
        .append(data.$linkPrevPage)
        .append(data.$linkNextPage)
        .append(data.$linkLastPage);

      // event listeners
      data.$linkFirstPage.click(function(){
        methods.goToPage.call($this, 1);
      });

      data.$linkPrevPage.click(function(){
        methods.goToPage.call($this, data.pagination.currentPage - 1);
      });

      data.$linkNextPage.click(function(){
        methods.goToPage.call($this, data.pagination.currentPage + 1);
      });

      data.$linkLastPage.click(function(){
        methods.goToPage.call($this, Math.ceil(data.$records.length / data.pagination.recordsPerPage));
      });

      $this.after(data.$paginationToolsContainer);

      // save it all
      $this.data(pluginName, data);
    },

    goToPage : function(page) {
      var $this = $(this);
      var data = $this.data(pluginName);
      if (!data) { return; }

			// check for valid page number
			var pageCount = Math.ceil(data.$records.length / data.pagination.recordsPerPage);
			if ( page < 1 || page > pageCount ) {
				return;
			}

      // move to next page
			data.pagination.currentPage = page;

			$this.find('tr').not('.'+classes.headerRow).remove();

			var paginatedRecordsArray = [];
      var newFirstRowNum = (page - 1) * (data.pagination.recordsPerPage) + 1,
          newLastRowNum = page * data.pagination.recordsPerPage;

			if ( newLastRowNum > data.$records.length ) {
				newLastRowNum = data.$records.length;
			}

			// get new page's records
			for ( var i = newFirstRowNum - 1; i < newLastRowNum; i++ ) {
				if ( data.$records[i] ) {
					paginatedRecordsArray.push(data.$records[i]);
				}
			}

			// add rows to table
			data.$headerRow.after(paginatedRecordsArray);

			// update data
			$this.data(pluginName, data);
    },

  };

  /** module definition */
  $.fn[pluginName] = function (method) {
    if ( methods[method] ) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    }
    else {
      if ( typeof method === 'object' || !method ) {
        return methods.init.apply(this, arguments);
      }
      else {
        $.error('The method ' + method + ' literally does not exist. Good job.');
      }
    }
  };

})( jQuery );
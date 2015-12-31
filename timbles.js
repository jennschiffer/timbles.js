/**
* timbles.js
* definitely the most lightweight jquery table plugin ever
* except probably not
*
* @version 1.1.0
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
    disabled : 'disabled',
    active : 'active',
    headerRow : 'header-row',
    label : 'label',
    sortASC : 'sorted-asc',
    sortDESC : 'sorted-desc',
    noSort : 'no-sort',
    paginationToolsContainer : 'pagination',
    paginationNavArrows : 'nav-arrows',
    paginationNavRowCountChoice : 'row-count-choice'
  };

  var copy = {
    firstPageArrow : ' << ',
    prevPageArrow : ' < ',
    nextPageArrow : ' > ',
    lastPageArrow : ' >> ',
    page : 'page',
    of : 'of'
  };

  var methods = {

    /** initialize timble, er, i mean table **/
    init : function(opts) {
      return this.each(function() {
        var $this = $(this).addClass(pluginName);
        var options = $.extend({}, defaults, opts);
        var data = {
          dataConfig: methods.parseDataConfig(options.dataConfig),
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
          methods.setupExistingTable.call($this);
        }
      });
    },

    parseDataConfig : function(dataConfig) {
      if (!(dataConfig instanceof Object)) {
        return dataConfig;
      }
      else if (dataConfig.hasOwnProperty('columns')) {
        $.each(dataConfig.columns, function(index, columnConfig) {
          if (columnConfig.hasOwnProperty('dataFilter') &&
              !columnConfig.hasOwnProperty('textTransform')) {
            // If a dataFilter is defined (old-style) and no textTransform,
            // use the dataFilter as textTransform
            columnConfig.textTransform = columnConfig.dataFilter;
          }
          else if (!columnConfig.hasOwnProperty('textTransform')) {
            // Add a do-nothing textTransform if none is provided
            columnConfig.textTransform = function (obj) {return obj;};
          }
          if (!columnConfig.hasOwnProperty('valueTransform')) {
            // Add a do-nothing valueTransform if none is provided
            columnConfig.valueTransform = function (obj) {return obj;};
          }
        });
      }
      return dataConfig;
    },

    setupExistingTable : function() {
      var data = this.data(pluginName);

      // for each header cell, store its column number
      var $headerRow = data.$headerRow = this.find('thead tr').eq(0)
        .addClass(classes.headerRow);
      $headerRow.find('th').each(function(index) {
        $(this).data('timbles-column-index', index);
      });

      // start enabling any given features
      methods.enableFeaturesSetup.call(this);
    },

    generateTableFromJson : function() {
      var data = this.data(pluginName);
      var $headerRow = data.$headerRow = $('<tr>')
        .addClass(classes.headerRow)
        .appendTo($('<thead>').appendTo(this));

      // generate and add cell headers to header row
      $.each(data.dataConfig.columns, function(index, value) {
        $('<th>')
          .attr('id', value.id)
          .addClass(value.noSorting ? classes.noSort : null)
          .data('timbles-column-index', index)
          .text(value.label)
          .appendTo($headerRow);
      });

      if ($.isArray(data.dataConfig.data)) {
        // no need for ajax call if data is local array
        methods.generateRowsFromData.call(this, data.dataConfig.data, data.dataConfig.columns);

        // start enabling any given features
        methods.enableFeaturesSetup.call(this);
      }
      else {
        // get external json file given
        $.getJSON( data.dataConfig.data, function(json) {
          methods.generateRowsFromData.call(this, json, data.dataConfig.columns);
        }.bind(this)).then(function(){
          // start enabling any given features
          methods.enableFeaturesSetup.call(this);
        }.bind(this));
      }
    },

    generateRowsFromData : function(rowData, columnConfig) {
      $.each(rowData, function(index, row) {
        // Add rows to the current table
        var $newRow = $('<tr>').appendTo(this);
        $.each(columnConfig, function(index, column) {
          // Add cells to the current row
          var cellValue = row[column.id];
          $('<td>')
            .attr('data-value', column.valueTransform(cellValue))
            .text(column.textTransform(cellValue))
            .appendTo(this);
        }.bind($newRow));
      }.bind(this));
    },

    enableFeaturesSetup : function() {
      var data = this.data(pluginName);
      data.$records = this.find('tbody tr');

      if ( data.sorting ) {
        methods.enableSorting.call(this);

        if ( data.sorting.keyId ) {
          methods.sortColumn.call(this, data.sorting.keyId, data.sorting.order);
        }
      }

      if ( data.pagination ) {
        methods.enablePagination.call(this, data.pagination.recordsPerPage);
      }
    },

    enableSorting : function() {
      this.find('th').not('.no-sort').on(
        'click', methods.sortColumnEvent.bind(this));
    },

    sortColumn : function(key, order) {
      // Sort a column identified by its key in a given order
      // If `key` is numeric, it is treated as the column index to sort
      // If `order` is not given, this will do the same as clicking the header
      if (typeof key === "number") {
        var data = this.data(pluginName);
        data.$headerRow.find('th').eq(key).trigger('click', order);
      }
      else {
        this.find('#' + key).trigger('click', order);
      }
    },

    sortColumnEvent : function(event, order) {
      var data = this.data(pluginName);

      // determine order and update header sort classes
      var $sortHeader = $(event.target);
      var sortColumn = $sortHeader.data('timbles-column-index');

      if ( !order ) {
        order = $sortHeader.hasClass(classes.sortASC) ? 'desc' : 'asc';
      }
      data.$headerRow.find('th')
        .removeClass(classes.sortASC)
        .removeClass(classes.sortDESC);
      $sortHeader.addClass((order === 'asc') ? classes.sortASC : classes.sortDESC);

      // determine column values to actually sort by
      var sortMap = data.$records.map(function() {
        var cell = this.children[sortColumn];
        var dataValue = cell.getAttribute('data-value');
        if (dataValue === null) {
          dataValue = cell.textContent || cell.innerText;
        }
        else if (parseFloat(dataValue).toString() === dataValue) {
          dataValue = parseFloat(dataValue);
        }
        return {
          node: this,
          value: dataValue
        };
      });

      // sort the mapping by the extract column values
      sortMap.sort(function(a, b) {
        if (a.value > b.value) {
          return (order === 'asc') ? 1 : -1;
        }
        if (a.value < b.value) {
          return (order === 'asc') ? -1 : 1;
        }
        return 0;
      });

      // use sortMap to shuffle table rows to the correct order
      // work on detached DOM for improved performance on large tables
      var tableBody = this.find('tbody').detach().get(0);
      sortMap.each(function() {
        tableBody.appendChild(this.node);
      });

      $(tableBody).appendTo(this);

      // if table was paginated, reenable
      if ( data.pagination ) {
        data.$records = this.find('tbody tr');
        methods.goToPage.call(this, 1);
      }
    },

    enablePagination : function(count) {
      var data = this.data(pluginName);
      // don't paginate if there are no records
      if (!data.$records || data.$records.length === 0 ) { return; }

      data.pagination.recordsPerPage = count;
      var paginatedRecordsArray = [];

      for ( var i = 0; i < count; i++ ) {
        if ( data.$records[i] ) {
          paginatedRecordsArray.push(data.$records[i]);
        }
      }

      // show the first page and set page counter
      data.$records.remove();
      data.pagination.currentPage = 1;
      this.append(paginatedRecordsArray);

      // create footer to hold tools
      data.$footerRow = this.find('tfoot');

      if ( data.$footerRow.length === 0 ) {
        var $footer = $('<tfoot>');
        data.$footerRow = $footer;
      }

      // create tools if they don't exist already
      if ( !data.$paginationToolsContainer ) {
        methods.generatePaginationTools.call(this);
      }
      else {
        // update existing pagination tools
        methods.updatePaginationTools.call(this);
      }
    },

    generatePaginationTools : function() {
      var data = this.data(pluginName);

      // create pagination container and place after table
      data.$paginationToolsContainer = $('<div class="' + classes.paginationToolsContainer + '">');
      this.after(data.$paginationToolsContainer);

      if ( !data.pagination.nav ) {
        // by default, just show arrow nav
        methods.generatePaginationNavArrows.call(this);
      }
      else {
        // iterate through nav object and add tools to footer
        for ( var navObject in data.pagination.nav ) {
          switch (navObject) {
            // arrows
            case "arrows":
              methods.generatePaginationNavArrows.call(this);
              break;
            // row count choice
            case "rowCountChoice":
              methods.generatePaginationNavRowCountChoice.call(this);
              break;
          }
        }
      }

      // update tools
      methods.updatePaginationTools.call(this);
    },

    generatePaginationNavArrows : function() {
      var data = this.data(pluginName);
      var thisPage = 1;
      var lastPage = Math.ceil(data.$records.length / data.pagination.recordsPerPage);

      data.$linkFirstPage = $('<button role="button">').text(copy.firstPageArrow);
      data.$linkPrevPage = $('<button role="button">').text(copy.prevPageArrow);
      data.$linkNextPage = $('<button role="button">').text(copy.nextPageArrow);
      data.$linkLastPage = $('<button role="button">').text(copy.lastPageArrow);
      data.$pageNumberTracker = $('<span>')
        .addClass('page-number-tracker')
        .text(copy.page + ' ')
        .append($('<span>').addClass('pointer-this-page').text(thisPage))
        .append(' ' + copy.of + ' ')
        .append($('<span>').addClass('pointer-last-page').text(lastPage));

      data.$paginationNavArrows = $('<div>')
        .addClass(classes.paginationNavArrows)
        .append(data.$linkFirstPage)
        .append(data.$linkPrevPage)
        .append(data.$pageNumberTracker)
        .append(data.$linkNextPage)
        .append(data.$linkLastPage);

      // event listeners
      data.$linkFirstPage.click(function(){
        methods.goToPage.call(this, 1);
      }.bind(this));

      data.$linkPrevPage.click(function(){
        var newPage = data.pagination.currentPage - 1;

        if ( newPage >= 1 ) {
          methods.goToPage.call(this, newPage);
        }
      }.bind(this));

      data.$linkNextPage.click(function(){
        var newPage = data.pagination.currentPage + 1;

        if ( newPage <= Math.ceil(data.$records.length / data.pagination.recordsPerPage) ) {
          methods.goToPage.call(this, newPage);
        }
      }.bind(this));

      data.$linkLastPage.click(function(){
        methods.goToPage.call(this, Math.ceil(data.$records.length / data.pagination.recordsPerPage));
      }.bind(this));

      data.$paginationToolsContainer.append(data.$paginationNavArrows);
      data.$pointerThisPage = data.$paginationToolsContainer.find('.pointer-this-page');
      data.$pointerLastPage = data.$paginationToolsContainer.find('.pointer-last-page');
    },

    generatePaginationNavRowCountChoice : function() {
      var data = this.data(pluginName);
      var optionCount = data.pagination.nav.rowCountChoice.length;
      var arrayOfChoices = [];

      for ( var i = 0; i < optionCount; i++ ) {
        arrayOfChoices.push('<button role="button">' + data.pagination.nav.rowCountChoice[i] + '</button>');
      }

      data.$paginationNavRowCountChoice = $('<div>').attr('class', classes.paginationNavRowCountChoice).append(arrayOfChoices);

      // event listeners
      data.$paginationNavRowCountChoice.find('button').click(function(event){
        var $target = $(event.target);
        var newRowCount = $target.text();
        // make clicked button only active one
        data.$paginationNavRowCountChoice.find('button').removeClass(classes.active);
        $target.addClass(classes.active);

        if ( newRowCount.toLowerCase() === 'all' ) {
          newRowCount = data.$records.length;
        }
        methods.enablePagination.call(this, newRowCount);
      }.bind(this));

      data.$paginationToolsContainer.append(data.$paginationNavRowCountChoice);
    },

    updatePaginationTools : function() {
      var data = this.data(pluginName);
      var min = 1;
      var max = Math.ceil(data.$records.length / data.pagination.recordsPerPage);

      // set buttons inactive if appropriate
      if ( data.pagination.currentPage === min ) {
        data.$linkFirstPage.attr('disabled', true).addClass(classes.disabled);
        data.$linkPrevPage.attr('disabled', true).addClass(classes.disabled);
      }
      else {
        data.$linkFirstPage.attr('disabled', false).removeClass(classes.disabled);
        data.$linkPrevPage.attr('disabled', false).removeClass(classes.disabled);
      }

      if ( data.pagination.currentPage === max ) {
        data.$linkLastPage.attr('disabled', true).addClass(classes.disabled);
        data.$linkNextPage.attr('disabled', true).addClass(classes.disabled);
      }
      else {
        data.$linkLastPage.attr('disabled', false).removeClass(classes.disabled);
        data.$linkNextPage.attr('disabled', false).removeClass(classes.disabled);
      }

      // update page number tracker
      data.$pointerThisPage.text(data.pagination.currentPage);
      data.$pointerLastPage.text(max);
    },

    goToPage : function(page) {
      var data = this.data(pluginName);

      // check for valid page number
      var pageCount = Math.ceil(data.$records.length / data.pagination.recordsPerPage);
      if ( page < 1 || page > pageCount ) {
        return;
      }

      // move to next page
      data.pagination.currentPage = page;

      this.find('tr').not('.'+classes.headerRow).remove();

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
      this.find('tbody').append(paginatedRecordsArray);

      // update pagination tools
      methods.updatePaginationTools.call(this);
    },
  };

  // Install timbles jQuery plugin
  $.fn[pluginName] = function (method) {
    if ( methods.hasOwnProperty(method) ) {
      var methodArgs = Array.prototype.slice.call(arguments, 1);
      return methods[method].apply(this, methodArgs);
    }
    if ( typeof method === 'object' || !method ) {
      return methods.init.apply(this, arguments);
    }
    $.error('The method ' + method + ' literally does not exist. Good job.');
  };

})( jQuery );

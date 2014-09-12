timbles.js
==========

*timbles* is a very lightweight jQuery plugin (lol is that an oxymoron) that allows you to add sorting to an existing `<table>`. That's it. Actually, it can create the table for you with some JSON data and minimal configuration. It's p easy.

## Install

You need to enqueue jQuery (duh) and the *timbles* file.

<pre><code>&lt;script src="jquery.js">&lt;/script>
&lt;script src="timbles.js">&lt;/script></code></pre>

## Configure *timbles*

### Existing Table of data

Let's say you have a table on your page already, all populated with data:

<table border="1">
  <tr>
    <th id="name">Name</th>
    <th id="size">Size</th>
    <th id="kind">Kind</th>
    <th id="date-added">Date Added</th>
    <th id="notes">Notes</th>
  </tr>
  <tr>
    <td class="name">dhtmlconf.png</td>
    <td class="size">77 KB</td>
    <td class="kind">PNG Image</td>
    <td class="date-added">August 31, 2014, 11:16 PM</td>
    <td class="notes">dhtmlconf logo</td>
  </tr>      
  <tr>
    <td class="name">icla.pdf</td>
    <td class="size">26 KB</td>
    <td class="kind">Adobe PDF document</td>
    <td class="date-added">August 27, 2014, 12:51 PM</td>
    <td class="notes">Individual Contributor License Agreement</td>
  </tr>
  <tr>
    <td class="name">Slime Girls - Vacation Wasteland EP.zip</td>
    <td class="size">72.9 MB</td>
    <td class="kind">ZIP archive</td>
    <td class="date-added">August 25, 2014, 9:40 PM</td>
    <td class="notes">cool chiptunes from lwlvl</td>
  </tr>
</table>


And here is the source code:


<pre><code>&lt;table border="1">
  &lt;tr>
    &lt;th id="name">Name&lt;/th>
    &lt;th id="size">Size&lt;/th>
    &lt;th id="kind">Kind&lt;/th>
    &lt;th id="date-added">Date Added&lt;/th>
    &lt;th id="notes">Notes&lt;/th>
  &lt;/tr>
  &lt;tr>
    &lt;td class="name">dhtmlconf.png&lt;/td>
    &lt;td class="size">77 KB&lt;/td>
    &lt;td class="kind">PNG Image&lt;/td>
    &lt;td class="date-added">August 31, 2014, 11:16 PM&lt;/td>
    &lt;td class="notes">dhtmlconf logo&lt;/td>
  &lt;/tr>      
  &lt;tr>
    &lt;td class="name">icla.pdf&lt;/td>
    &lt;td class="size">26 KB&lt;/td>
    &lt;td class="kind">Adobe PDF document&lt;/td>
    &lt;td class="date-added">August 27, 2014, 12:51 PM&lt;/td>
    &lt;td class="notes">Individual Contributor License Agreement&lt;/td>
  &lt;/tr>
  &lt;tr>
    &lt;td class="name">Slime Girls - Vacation Wasteland EP.zip&lt;/td>
    &lt;td class="size">72.9 MB&lt;/td>
    &lt;td class="kind">ZIP archive&lt;/td>
    &lt;td class="date-added">August 25, 2014, 9:40 PM&lt;/td>
    &lt;td class="notes">cool chiptunes from lwlvl&lt;/td>
  &lt;/tr>
&lt;/table></code></pre>

You don't need to generate a new table with JSON because your table is there already. And you just want to be able to make it sortable. Then just call this after you enqueued *timbles.js* as per the above install directions:

<pre><code>// get your table
var $table = $('table');

// call timbles
$table.timbles({ sorting: true });</code></pre>

In order for sorting to work, the `<th>` cells need to have an `id` attribute, and the cells in that column need to have a `class` attribute that is identical to its column's header `id`. Notice how the date cells in the example have a class "date-added" and the header of that column as an id of the same value.

If you want to initially sort your table on load, there are `sorting` properties you can set:

<pre><code>// get your table
var $table = $('table');

// call timbles with sorting property
$table.timbles(
  sorting: {
    order: 'asc', // 'asc' for ascending sort, 'desc' for descending
    keyId: 'name', // the id of the column you want to initially sort by
  }
});</code></pre>

### Generating a table from a JSON file

If your data is in a JSON file, add a `<table>` element to your page and then call `timbles` on it.

<pre><code>&lt;table id="example">&lt;/table></code></pre>

<pre><code>// get your table
var $table = $('#example');

// call timbles with dataConfig property
$table.timbles({

  dataConfig: {
    json: 'data.json', // the json file
    columns: [
      { label: 'Name', id: 'name' },  // you have to set the column headers
      { label: 'Size', id: 'size' },  // where "label" is the text betweent &lt;th> and &lt;/th>
      { label: 'Kind', id: 'kind' },  // and "id" is the json object's property attributed to the column
      { label: 'Date Added', id: 'dateAdded' },
      { label: 'Notes', id: 'notes' }
    ]
  },

  // if you want sorting:
  sorting: true
});</code></pre>

## C.S.S.

When you sort ascending, the `sort-asc` class is added to the `<th>` header. If you sort descending, the `sort-desc` class is added to the `<th>` header. So you can, like, use CSS to add arrows whenever those classes are set and that's p cool I think.

## Note

This was made within a few days for jqCon Chicago on 9/12/2014 and therefore is incomplete and not well documented. This is what I get for having to launch something whenever I give a talk. I'll refine this and add more features while retaining the philosophy of staying simple. 

**MOST IMPORTANTLY: HAVE FUN.**
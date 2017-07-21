<!-- REQUIRED JS SCRIPTS -->

<!-- JQuery and bootstrap are required by Laravel 5.3 in resources/assets/js/bootstrap.js-->
<!-- Laravel App -->
<script src="{{ url (mix('/js/app.js')) }}" type="text/javascript"></script>
<script src="https://d3js.org/d3.v4.min.js"></script>

<script src="{{ url ('/js/overview-brush.js') }}" type="text/javascript"></script>
<script src="{{ url ('/js/heatmap.js') }}" type="text/javascript"></script>
<script src="{{ url ('/js/scatter.js') }}" type="text/javascript"></script>
<script src="{{ url ('/js/googlemaps.js') }}" type="text/javascript"></script>
<script src="https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/markerclusterer.js">
    </script>
<script async defer
    src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCeltywxFHg7y0adXIu0X9fqjjbmkmVEck&libraries=visualization&callback=initMap">
</script>
<!-- Optionally, you can add Slimscroll and FastClick plugins.
      Both of these plugins are recommended to enhance the
      user experience. Slimscroll is required when using the
      fixed layout. -->

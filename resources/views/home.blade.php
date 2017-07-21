@extends('adminlte::layouts.app')

@section('htmlheader_title')
{{ trans('adminlte_lang::message.home') }}
@endsection


@section('main-content')
check
<div id="map"></div>
point
<br/>
<button class="btn btn-primary" id="reloaderBtn">Reload Data</button>
<div class="text-center overview"></div>
<div class="heatmap"></div>
<button class="btn btn-primary" id="reloaderBtn2">Reload Data Scatter Plot</button>
<svg id="scatter" width="600" height="300"></svg>
@endsection

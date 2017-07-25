@extends('adminlte::layouts.app')

@section('htmlheader_title')
{{ trans('adminlte_lang::message.home') }}
@endsection


@section('main-content')
<div class="row">
    <div class="col-lg-12">
        <div class="text-center overview"></div>
    </div>
</div>
<div class="row">
    <div class="col-lg-6 col-md-6">
        Parallel Sets
        <div class="row">
            <div class="col-lg-12" style="height: 250px;border-style: solid;">
                Parallel Sets
            </div>
            <div class="col-lg-12" style="border-style: solid;">
                <div class="heatmap"></div>
                <button class="btn btn-primary" id="reloaderBtn">Reload Data</button>
            </div>
        </div>
    </div>
    <div class="col-lg-6 col-md-6">
        <div class="row">
            <div class="col-lg-12 scatterContainer no-padding" style="border-style: solid;">
                <button class="btn btn-primary" id="reloaderBtn2">Reload Data Scatter Plot</button>
                <div class="scatter col-lg-12" style="height: 300px;padding-bottom: 20px"></div>
            </div>
            <div class="col-lg-12" style="border-style: solid;">
                <div class="floating-panel btn-group text-center">
                    <button id="pointsButton" type="button" class="btn btn-sm btn-default" style="background-color: white; font-size: 11px;" onclick="showPoints()">Points</button>
                    <button id="heatMapButton" type="button" class="btn btn-sm btn-default" style="background-color: white; font-size: 11px;" onclick="showHeatMap()">Heatmap</button>
                </div>
                <div id="map"></div>
            </div>
        </div>
    </div>
</div>
<div class="row">

</div>
@endsection

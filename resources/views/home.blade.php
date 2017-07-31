@extends('adminlte::layouts.app')

@section('htmlheader_title')
{{ trans('adminlte_lang::message.home') }}
@endsection


@section('main-content')
<div class="row">
    <div class="col-lg-12 overviewContainer">
        <div class="text-center overview"></div>
    </div>
</div>
<div class="row">
    <div class="col-lg-6 col-md-6">
        <div class="row">
            <div class="col-lg-12 heatmapContainer">
                <div class="box box-danger box-solid">
                    <div class="box-header">
                        <h3 class="box-title">Daily Heatmap</h3>
                    </div>
                    <div class="box-body no-padding">
                        <div class="heatmap col-lg-12"></div>
                    </div>
                    <div class="overlay hidden" id="overlay-heatmap">
                        <i class="fa fa-refresh fa-spin"></i>
                    </div>
                </div>

            </div>
            <div class="col-lg-12 scatterContainer">
                <div class="box box-primary box-solid">
                    <div class="box-header">
                        <h3 class="box-title">Vehicle Distribution</h3>
                        <div class="box-tools pull-right">
                            <button type="button" class="btn btn-box-tool" id="clearFilterScatter"><i class="fa fa-close"></i> Clear Filters
                            </button>
                        </div>
                    </div>
                    <div class="box-body no-padding">
                        <div class="scatter col-lg-12"></div>
                    </div>
                    <div class="overlay hidden" id="overlay-scatter">
                        <i class="fa fa-refresh fa-spin"></i>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="col-lg-6 col-md-6">
        <div class="box box-success box-solid">
            <div class="box-header">
                <h3 class="box-title">Geographic Distribution</h3>
            </div>
            <div class="box-body no-padding">
                <div class="floating-panel btn-group text-center">
                    <button id="pointsButton" type="button" class="btn btn-sm btn-default" style="background-color: white; font-size: 11px;">Points</button>
                    <button id="heatMapButton" type="button" class="btn btn-sm btn-default" style="background-color: white; font-size: 11px;">Heatmap</button>
                </div>
                <div id="map"></div>
            </div>
            <div class="overlay hidden" id="overlay-maps">
                <i class="fa fa-refresh fa-spin"></i>
            </div>
        </div>

    </div>
</div>
<div class="row">

</div>
@endsection

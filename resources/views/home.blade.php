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
            <div class="col-lg-12" style="border-style: solid;">
                <button class="btn btn-primary" id="reloaderBtn2">Reload Data Scatter Plot</button>
                <div class="scatter"></div>
            </div>
            <div class="col-lg-12" style="border-style: solid;">
                <div id="map"></div>
                <div class="form-group">
                    <div class="radio">
                        <label>
                            <input type="radio" name="mapInfoRadios" id="heatmapRadio" value="heatmap">
                            Heatmap
                        </label>
                    </div>
                    <div class="radio">
                        <label>
                            <input type="radio" name="mapInfoRadios" id="pointsRadio" value="points">
                            Accident Points
                        </label>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<div class="row">

</div>
@endsection

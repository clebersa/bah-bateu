@extends('adminlte::layouts.app')

@section('htmlheader_title')
{{ trans('adminlte_lang::message.home') }}
@endsection


@section('main-content')
<div class="row">
    <div class="col-lg-12 overviewContainer">
        <div class="box box-success box-solid">
            <div class="box-header">
                <h3 class="box-title"><i class="fa fa-calendar"></i> Time and People Distribution</h3>
                <div class="box-tools pull-right">
                </div>
            </div>
            <div class="box-body no-padding">
                <div class="text-center overview"></div>
            </div>
            <div class="overlay hidden" id="overlay-overview">
                <i class="fa fa-refresh fa-spin"></i>
            </div>
        </div>
    </div>
</div>
<div class="row">
    <div class="col-lg-6 col-md-6">
        <div class="row">
            <div class="col-lg-12 heatmapContainer">
                <div class="box box-danger box-solid">
                    <div class="box-header">
                        <h3 class="box-title"><i class="fa fa-thermometer"></i> Daily Heatmap</h3>
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
                        <h3 class="box-title"><i class="fa fa-car"></i> Vehicle Distribution</h3>
                        <div class="box-tools pull-right">
                            <span class="label bg-red hidden" id="errorLabelScatter">
                                <i class="fa fa-warning"></i> Unable to load data.
                            </span>
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
                <h3 class="box-title"><i class="fa fa-map"></i> Geographic Distribution</h3>
                <div class="box-tools pull-right">
                    <span class="label bg-red hidden" id="errorLabelMaps">
                        <i class="fa fa-warning"></i> Unable to load data.
                    </span>
                </div>
            </div>
            <div class="box-body no-padding">
                <div class="floating-panel btn-group text-center" style="margin-right: -5px;">
                    <button id="pointsButton" type="button" class="btn btn-success btn-lg" data-toggle="tooltip" title="Points"><i class="fa fa-map-marker"></i></button>
                    <button id="heatMapButton" type="button" class="btn btn-success btn-lg" data-toggle="tooltip" title="Heatmap"><i class="fa fa-thermometer"></i></button>
                </div>
                <div id="map"></div>
            </div>
            <div class="overlay hidden" id="overlay-maps">
                <i class="fa fa-refresh fa-spin"></i>
            </div>
        </div>

    </div>
</div>

<div class="modal fade" id="aboutModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
        <div class="modal-header bg-green">
            <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
            <h4 class="modal-title" id="myModalLabel">About</h4>
        </div>
        <div class="modal-body">
            <center width="128px">
                <img src="img/logo-b-256px.png" class="img-responsive">
                <h1><b>bah-bateu</b></h1>
                <h4>v{{config('app.version')}}</h4>
            </center>
            <p class="text-justify">
                <b>bah-bateu</b> is an information visualization tool for traffic accidents in Porto Alegre (RS, Brazil). The traffic data was downloaded from the <a href="http://www.datapoa.com.br/dataset/acidentes-de-transito" target="_blank">datapoa</a> portal and cleaned in order to be correctly processed. The source code is available on <a href="https://github.com/clebersa/bah-bateu" target="_blank"></i>GitHub</a> and is maintained by <a target="_blank" href="https://github.com/clebersa">Cleber de Souza Alcântara</a>.
            </p>
            <center>
                <a class="btn btn-warning" href="https://github.com/clebersa/bah-bateu/issues/new" target="_blank"><i class="fa fa-exclamation-triangle"></i> Report a Problem</a>
            </center>
        </div>
        <!--<div class="modal-footer">
        </div>-->
    </div>
  </div>
</div>
@endsection

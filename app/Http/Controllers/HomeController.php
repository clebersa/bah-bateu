<?php

/*
 * Taken from
 * https://github.com/laravel/framework/blob/5.3/src/Illuminate/Auth/Console/stubs/make/controllers/HomeController.stub
 */

namespace App\Http\Controllers;

use App\Http\Requests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Database\GeneralDAO;

/**
 * Class HomeController
 * @package App\Http\Controllers
 */
class HomeController extends Controller {

    /**
     * Show the application dashboard.
     *
     * @return Response
     */
    public function index() {
        return view('home');
    }

    public function getData(Request $request) {
        $chart = $request->input('chart');
        Log::info("Processing request for chart: " . $chart);
        $filters = $request->input('filters');
        $generalDAO = new GeneralDAO();
        if ($chart == 'overview') {
            $result = $generalDAO->getOverviewData();
        } else if ($chart == 'heatmap') {
            $result = $generalDAO->getDataHeatmap($filters);
        } else if ($chart == 'scatter') {
            $result = $generalDAO->getScatterPlotData($filters);
        } else if ($chart == 'googlemaps') {
            $result = $generalDAO->getGeographicHeatmap($filters);
        } else if ($chart == 'infowindow') {
            $result = $generalDAO->getAccidentsByPosition($filters);
        }

        return json_encode($result);
    }

}

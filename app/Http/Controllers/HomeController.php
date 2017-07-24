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
class HomeController extends Controller
{
    /**
     * Show the application dashboard.
     *
     * @return Response
     */
    public function index()
    {
        return view('home');
    }
    
    public function getData(Request $request){
        Log::info("loading data");
        $chart = $request->input('chart');
        $generalDAO = new GeneralDAO();
        if($chart == 'heatmap'){
            $result = $generalDAO->getDataHeatmap();
        } else if($chart == 'scatter'){
            $result = $generalDAO->getScatterPlotData();
        } else if($chart == 'googlemaps'){
            $result = $generalDAO->getGeographicHeatmap();
        } else if($chart == 'infowindow'){
            $result = $generalDAO->getAccidentsByPosition($request->input('latitude'), $request->input('longitude'));
        }
        
        return json_encode($result);
    }
}
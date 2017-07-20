<?php

namespace App\Http\Database;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class GeneralDAO {
    
    public function getDataHeatmap(){
        $data = DB::select(
                'SELECT DAYOFWEEK(MOMENTO) AS `dow`, '
                . 'HOUR(MOMENTO) AS `hour`, '
                . 'count(*) AS `total` '
                . 'FROM `accidents` '
                . 'GROUP BY `dow`, `hour` '
                . 'ORDER BY `dow`, `hour`');
        Log::info(count($data) . " records retrieved for the heatmap.");
        return $data;
    }
}
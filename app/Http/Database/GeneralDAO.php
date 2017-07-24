<?php

namespace App\Http\Database;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class GeneralDAO {

    public function getDataHeatmap() {
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

    public function getScatterPlotData() {
        $map = [
            'AUTO' => 'Automobile',
            'TAXI' => 'Taxi',
            'LOTACAO' => 'Lotação',
            'ONIBUS_URB' => 'Urban Bus',
            'ONIBUS_INT' => 'Intercity Bus',
            'ONIBUS_MET' => 'Metropolitan Bus',
            'CAMINHAO' => 'Truck',
            'MOTO' => 'Motorcycle',
            'CARROCA' => 'Cart',
            'BICICLETA' => 'Bicycle',
            'OUTRO' => 'Other'
        ];
        foreach ($map as $column => $title) {
            $queries[] = "SELECT '$title' AS 'type', `$column` AS 'amount', count(*) AS 'accidents' FROM `accidents` WHERE `$column` > 0 GROUP BY `$column`";
        }
        $query = implode("\nUNION\n", $queries) . "\nORDER BY `type` DESC, `amount` ASC";
        Log::debug($query);

        $data = DB::select($query);
        Log::info(count($data) . " records retrieved for the scatter plot.");
        return $data;
    }
    
    public function getGeographicHeatmap(){
        return DB::select("SELECT LATITUDE AS 'latitude', LONGITUDE AS 'longitude', COUNT(*) AS 'total' FROM `accidents` WHERE YEAR(MOMENTO) = '2010' GROUP BY LATITUDE, LONGITUDE");
    }

}

<?php

namespace App\Http\Database;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class GeneralDAO {

    public function getOverviewData() {
        $data = DB::select(
                        "SELECT "
                        . "  weekly_periods.*, "
                        . "  count(*) AS totalAccidents, "
                        . "  SUM(`a`.`FERIDOS`) AS `injuried`, "
                        . "  (IF(SUM(`a`.`FERIDOS_GR`) IS NULL, 0, SUM(`a`.`FERIDOS_GR`))) AS `seriouslyInjuried`, " //TODO: handle null
                        . "  SUM(`a`.`MORTES`) AS `deaths`, "
                        . "  SUM(`a`.`MORTE_POST`) AS `subsequentDeaths` "
                        . "FROM ( "
                        . "  SELECT "
                        . "    YEAR(MOMENTO) AS `year`, "
                        . "		WEEK(MOMENTO) AS `week`, "
                        . "    MIN(DATE(MOMENTO)) AS min_moment, "
                        . "    DATE_ADD(MAX(DATE(MOMENTO)), INTERVAL 1 DAY) AS max_moment "
                        . "  FROM `accidents` WHERE YEAR(MOMENTO) < 2001 " //TODO: remove filter
                        . "  GROUP BY "
                        . "    `year`, "
                        . "    `week` "
                        . ") weekly_periods, `accidents` AS `a` "
                        . "WHERE "
                        . "  YEAR(`a`.`MOMENTO`) = `year` AND WEEK(`a`.`MOMENTO`) = `week` "
                        . "GROUP BY "
                        . "  `year`, "
                        . "  `week` "
                        . "ORDER BY "
                        . "  `year` ASC, "
                        . "  `week` ASC"
        );
        Log::info(count($data) . " records retrieved for the overview.");
        return $data;
    }

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

    public function getGeographicHeatmap() {
        return DB::select("SELECT LATITUDE AS 'latitude', LONGITUDE AS 'longitude', COUNT(*) AS 'total' FROM `accidents` WHERE YEAR(MOMENTO) = '2010' GROUP BY LATITUDE, LONGITUDE");
    }

    public function getAccidentsByPosition($latitude, $longitude) {
        return DB::select("SELECT ID AS 'id', LOCAL_VIA AS 'location', MOMENTO AS 'moment', BOLETIM AS 'report_id', CONSORCIO as `consortium` FROM `accidents` WHERE LATITUDE = '$latitude' AND LONGITUDE = '$longitude' ORDER BY MOMENTO");
    }

}

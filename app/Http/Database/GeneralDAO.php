<?php

namespace App\Http\Database;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class GeneralDAO {

    public function getOverviewData() {
        $query = "SELECT "
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
//                . "  FROM `accidents` "
                . "  FROM `accidents` WHERE YEAR(MOMENTO) > 2008 " //TODO: remove filter
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
        ;

        Log::debug($query);

        $data = DB::select($query);
        Log::info(count($data) . " records retrieved for the overview.");
        return $data;
    }

    public function getDataHeatmap($filters) {
        Log::info(gettype($filters));
        $query = 'SELECT DAYOFWEEK(MOMENTO) AS `dow`, '
                . 'HOUR(MOMENTO) AS `hour`, '
                . 'count(*) AS `total` '
                . 'FROM `accidents` ' . $this->parseFilters($filters)
                . 'GROUP BY `dow`, `hour` '
                . 'ORDER BY `dow`, `hour`';
        Log::debug($query);
        $data = DB::select($query);
        Log::info(count($data) . " records retrieved for the heatmap.");
        return $data;
    }

    public function getScatterPlotData($filters) {
        $map = [
            'AUTO' => 'Automobile',
            'TAXI' => 'Taxi',
            'LOTACAO' => 'Lotação',
            'ONIBUS_URB' => 'Urban Bus',
            'ONIBUS_INT' => 'Other Bus',
            'ONIBUS_MET' => 'Metropolitan Bus',
            'CAMINHAO' => 'Truck',
            'MOTO' => 'Motorcycle',
            'CARROCA' => 'Cart',
            'BICICLETA' => 'Bicycle',
            'OUTRO' => 'Other'
        ];

        $sqlFilter = $this->parseFilters($filters);
        foreach ($map as $column => $title) {
            $queries[] = "SELECT '$title' AS 'type', `$column` AS 'amount', count(*) AS 'accidents' FROM `accidents` " . (($sqlFilter == "") ? "WHERE " : $sqlFilter . "AND ") . "`$column` > 0 GROUP BY `$column`";
        }
        $query = implode("\nUNION\n", $queries) . "\nORDER BY `type` DESC, `amount` ASC";
        Log::debug($query);

        $data = DB::select($query);
        Log::info(count($data) . " records retrieved for the scatter plot.");
        return $data;
    }

    public function getGeographicHeatmap($filters) {
        $query = "SELECT LATITUDE AS 'latitude', "
                . "  LONGITUDE AS 'longitude', "
                . "  COUNT(*) AS 'total' "
                . "FROM `accidents` " . $this->parseFilters($filters)
                . "GROUP BY LATITUDE, LONGITUDE"
        ;
        Log::debug($query);

        $data = DB::select($query);
        Log::info(count($data) . " records retrieved for google maps.");
        return $data;
    }

    public function getAccidentsByPosition($filters) {
        $query = "SELECT ID AS 'id', "
                . "  LOCAL_VIA AS 'location', "
                . "  MOMENTO AS 'moment', "
                . "  BOLETIM AS 'report_id', "
                . "  CONSORCIO as `consortium` "
                . "FROM `accidents` " . $this->parseFilters($filters)
                . "ORDER BY MOMENTO";
        Log::debug($query);

        $data = DB::select($query);
        Log::info(count($data) . " records retrieved for infowindow.");
        return $data;
    }

    public function parseFilters($filters, $keysToIgnore = []) {
        $filters = json_decode($filters);
        $sqlFilters = [];
        foreach ($keysToIgnore as $key) {
            unset($filters[$key]);
        }
        foreach ($filters as $key => $value) {
            if ($value != NULL) {
                if ($key == 'startDate') {
                    $sqlFilters[] = "`accidents`.`MOMENTO` >= '" . $value . "'";
                }
                if ($key == 'endDate') {
                    $sqlFilters[] = "`accidents`.`MOMENTO` <= '" . $value . "'";
                }
                if ($key == 'latitude') {
                    $sqlFilters[] = "`accidents`.`LATITUDE` = '" . $value . "'";
                }
                if ($key == 'longitude') {
                    $sqlFilters[] = "`accidents`.`LONGITUDE` = '" . $value . "'";
                }
            }
        }
        if (count($sqlFilters) > 0) {
            return "WHERE " . implode(" AND ", $sqlFilters) . " ";
        } else {
            return "";
        }
    }

}

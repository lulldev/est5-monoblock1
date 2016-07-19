<?php

error_reporting(E_ALL);

$endpointMethod = $_GET['method'];

function curl_get_request($url)
{
       $c = curl_init();
       curl_setopt($c, CURLOPT_RETURNTRANSFER, 1);
       curl_setopt($c, CURLOPT_URL, $url);
       $contents = curl_exec($c);
       curl_close($c);

       if ($contents) return $contents;
           else return FALSE;
}

function curl_post_request($url, $data) {

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);

    $output = curl_exec($ch);
    curl_close($ch);

    if ($output) return $output;
       else return FALSE;
}


switch($endpointMethod) {

    // получение информации о мастере
    case 'get_master_info':
        $endpointUrl = 'http://online.est5.ru/index.php/ajax/get_master_info/';
        $masterId = $_GET['master_id'];

        if (!$masterId) {
            die('Set master id');
        }
        // todo testing result
        echo curl_get_request($endpointUrl . $masterId);
    break;

    // уведомление устройство мастера
    case 'notificate_master_device':
        $endpointUrl = 'http://cabinet.est5.ru/index.php/ajax/notificate_master_device/';
        $masterId = $_POST['master_id'];
        $message = $_POST['message'];

        if (!$masterId || !$message) {
            die("500");
        }

        // todo testing result
        echo curl_post_request($endpointUrl, array('master_id' => $masterId, 'message' => $message));
    break;

    // получение не уведомленных заявок мастеров
    case 'get_notinformed_records':
        header('Content-Type: application/json');

        $endpointUrl = 'http://test.cabinet.est5.ru/index.php/ajax/get_notinformed_records';

        // todo testing result
        echo curl_get_request($endpointUrl . $masterId);
    break;

    // отметка уведомления мастера по record_od
    case 'master_informed':
        $endpointUrl = 'http://test.cabinet.est5.ru/index.php/ajax/master_informed/';
        $recordId = $_GET['record_id'];

        if (!$masterId) {
            die('Set record id');
        }
        // todo testing result
        echo curl_get_request($endpointUrl . $recordId);
    break;

    default:
        die('Set method');
    break;
}


?>
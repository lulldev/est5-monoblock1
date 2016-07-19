<?php
error_reporting(E_ALL);

$endpointMethod = $_GET['method'];

function curl_get_file_contents($URL)
{
       $c = curl_init();
       curl_setopt($c, CURLOPT_RETURNTRANSFER, 1);
       curl_setopt($c, CURLOPT_URL, $URL);
       $contents = curl_exec($c);
       curl_close($c);

       if ($contents) return $contents;
           else return FALSE;
}

?>
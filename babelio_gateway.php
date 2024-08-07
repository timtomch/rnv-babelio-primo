<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

// Only requests appearing to come from the following URLs will be approved
$allowed_referrers =   [
                        'http://localhost:8003/',
                        'https://renouvaud2-psb.primo.exlibrisgroup.com/'
                        ];

// Set this to true to disable referrer checking (eg for debug)
$disable_referrer_check = false;

// Add your credentials here
$token ="YOUR_BABELIO_TOKEN";
$id="YOUR_BABELIO_CUSTOMER_ID";

$date = new DateTime();
$timestamp = $date->getTimestamp();
$type=$_GET['type'];
$action="tout";
$isbn=$_GET['isbn'];
$page=$_GET['page'];
$referrer=$_SERVER['HTTP_REFERER'];

if (in_array($referrer, $allowed_referrers) || $disable_referrer_check) {
    
    $hash = base64_encode(hash_hmac("sha256", $id.$timestamp.$action.$isbn, $token, True));
    $post_fields = array("id"=> $id, "action" => "tout", "isbn" => $isbn, "timestamp" => $timestamp,"hash" => $hash,"json"=>1);
    
    switch($type) {
        case 'all':
            $api_url = "https://www.babelio.com/blws4.php";
            break;
        case 'reviews':
            $api_url = "https://www.babelio.com/blwscri_v2.php";
            $post_fields["page"] = $page;
            break;
        case 'citations':
            $api_url = "https://www.babelio.com/blwscit_v2.php";
            $post_fields["page"] = $page;
            break;
    }

    $server_output = call($post_fields, $api_url);
    echo json_encode($server_output);
}
else {
    http_response_code(403);
    echo "Forbidden for referrer: " . $referrer;
}

function call($post_fields, $url)
{
  
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL,$url);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS,http_build_query($post_fields));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $server_output = curl_exec ($ch);
    curl_close ($ch);

    return json_decode($server_output, true) ;
}

?> 
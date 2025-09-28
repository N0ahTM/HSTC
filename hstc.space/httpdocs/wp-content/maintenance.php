<?php

//  ATTENTION!
//
//  DO NOT MODIFY THIS FILE BECAUSE IT WAS GENERATED AUTOMATICALLY,
//  SO ALL YOUR CHANGES WILL BE LOST THE NEXT TIME THE FILE IS GENERATED.
//  IF YOU REQUIRE TO APPLY CUSTOM MODIFICATIONS, PERFORM THEM IN THE FOLLOWING FILE:
//  /var/www/vhosts/hosting190447.a2e8b.netcup.net/hstc.space/httpdocs/wp-content/maintenance/template.phtml


$protocol = $_SERVER['SERVER_PROTOCOL'];
if ('HTTP/1.1' != $protocol && 'HTTP/1.0' != $protocol) {
    $protocol = 'HTTP/1.0';
}

header("{$protocol} 503 Service Unavailable", true, 503);
header('Content-Type: text/html; charset=utf-8');
header('Retry-After: 600');
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" href="https://hstc.space/wp-content/uploads/2025/03/cropped-HSTC-Logo-32x32.webp">
    <link rel="stylesheet" href="https://hstc.space/wp-content/maintenance/assets/styles.css">
    <script src="https://hstc.space/wp-content/maintenance/assets/timer.js"></script>
    <title>Geplante Wartungsaufgaben</title>
</head>

<body>

    <div class="container">
        <header class="header">
            <!-- Logo wird jetzt per CSS als Hintergrund geladen -->
            <div class="logo-container"></div>
            <h1>Auf der Website werden geplante Wartungsaufgaben durchgeführt.</h1>
            <h2>Bitte entschuldigen Sie die Unannehmlichkeiten. Kommen Sie später wieder vorbei. Wir sind bald wieder online.</h2>
        </header>

        <!-- Timer -->
            </div>

    <!-- Footer -->
    <footer class="footer">
        Wenn Sie noch Fragen haben, kontaktieren Sie bitte 
        <a href="mailto:info@hstc.space">info@hstc.space</a>.
    </footer>

</body>
</html>

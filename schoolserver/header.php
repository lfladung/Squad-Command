<?php
    /** Start a session */
    session_start();
    require_once ('db_connect.inc.php'); /** include the database connection */
    require_once ("functions.inc.php"); /** include all the functions */
    $seed="0dAfghRqSTgx"; /** the seed for the passwords */
    $domain =  "Sqaud Command"; /** the domain name */
 
?>
<!DOCTYPE HTML>
<html>
<head>
    <title><?php echo $domain; ?></title>
    <meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1">
    <style>
        body {
            background: #777;
        }

        button {
            border: none;
            cursor: pointer;
            outline: none;
        }

        input {
            outline: none;
        }
    </style>
    <script src="links.js"></script>
</head>
<body>
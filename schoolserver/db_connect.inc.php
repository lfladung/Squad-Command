<?php
    /**Database host */
    $servername = "mysql.cs.iastate.edu";
    /** Database user */
    $dbusername = "dbu309gkb7";
    /** Database password */
    $dbpassword = "QcvCVTfZ";
    /** Database name */
    $dbname = "db309gkb7";

    
    /**Create Connection to the database */
    $conn = new mysqli($servername,$dbusername,$dbpassword,$dbname);
    
    /** Check connection */
    if ($conn->connect_error){die("Connection failed: " . $conn->connect_error);} 
?>
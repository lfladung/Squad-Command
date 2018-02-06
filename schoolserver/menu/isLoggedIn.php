<?php
    session_start();
    if($_SESSION['username'] != NULL && $_SESSION['loginid'] != NULL){
        echo true;
    } else {
        echo false;
    }
?> 
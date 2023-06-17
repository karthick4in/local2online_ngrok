<?php 
session_start();
header("Access-Control-Allow-Origin: *"); 
$_SESSION["mobileip"]=$_GET["mobileip"];
include("lcsms_quick_bill.php");
 
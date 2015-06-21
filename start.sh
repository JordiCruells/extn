#!bin/sh
$isStarted="$(netstat -ln | grep ':3000' | grep 'LISTEN')"
echo "$isStarted"
exit

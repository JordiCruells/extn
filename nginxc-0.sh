#!bin/sh
sudo vim /etc/nginx/sites-enabled/expressApp
echo -n "Vols rearrencar nginx ? (s/n) "
read resposta
if [ "$resposta" = "s"  -o  "$resposta" = "S" ] 
then
    sudo service nginx restart
fi
exit 0

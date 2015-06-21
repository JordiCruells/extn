#!bin/sh
sudo su -c "pm2 restart /home/node/expressApp/bin/www" -s /bin/sh node
sudo service nginx restart
exit 0

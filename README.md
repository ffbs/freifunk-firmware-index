# freifunk-firmware-index
A landing page for Freifunk firmware download sites.

All folders except those in EXCLUDE (*freifunk-firmware.js*) will be listed in
a seperate dropdown button.
This requires a */raw* directory to be serverd by nginx, our configuration
looks like this:

    location / {
      alias /var/www/firmware/;
      index index.html;
      autoindex on;
    }

    location /raw {
      alias /var/www/firmware;
      index none;
      autoindex on;
    }

    location /.git {
      deny all;
      return 404;
    }

    location /raw/.git {
      deny all;
      return 404;
    }

Note that this page works with nginx directory listings, it may work with other
Webservers (untested).

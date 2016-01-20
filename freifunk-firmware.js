$(function () {
    'use strict';
    var EXCLUDE = ['..', 'doc', 'stable', 'beta', 'experimental']
    var showChannel = function (channel) {
        $('#models').hide();
        var path = '/'+channel+'/factory/';
        $.get(path, function (data) {
            var routers = {},
                links = $(data).find('a[href$=".bin"]');
            links.each(function () {
                var link = path+$(this).attr('href'),//.split('/').slice(-1)[0],
                    router = link.split('-').slice(4).join('-').split('.')[0],
                    split = router.split('-'),
                    model,
                    hwversion;
                if (split.slice(-1)[0][0] === 'v') {
                    model = split.slice(0, -1).join('-');
                    hwversion = split.slice(-1)[0];
                } else if (split.slice(-2, -1)[0] === 'rev') {
                    model = split.slice(0, -2).join('-');
                    hwversion = split.slice(-1)[0];
                } else {
                    model = router;
                    hwversion = 'alle';
                }
                if (!routers[model]) {
                    routers[model] = [];
                }
                routers[model].push([hwversion, link]);
            });
            links.first().each(function () {
                var link = $(this).attr('href').split('/').slice(-1)[0],
                match = link.match(/gluon-[a-zA-Z]+-([0-9.]+~[a-zA-Z]+)-?([0-9]+)-/);
                $('#version').html(match[1].replace('%7E', '~'));
                $('#versiondate').html(renderDate(match[2]));
            });
            $('tbody').html(renderRouters(routers));
            $('#models').fadeIn(500);
        }, 'html');
    }
    $('.hero-unit [data-channel]').click(function () {
        showChannel($(this).attr('data-channel'));
    });
    $.get('/raw/', function (data) {
      var links = $(data).find('a[href$="/"]');
      links.each(function () {
        var target = $(this).attr('href');
        target = target.substring(0, target.length - 1);
        if (EXCLUDE.indexOf(target) == -1) {
          $('#allversions').append('<li><a href="'+target+'/">'+target+'</a></li>');
        }
      });
    }, 'html');
    if (document.location.hash !== '') {
        var channel = document.location.hash.substr(1);
        showChannel(channel);
    }
});

var renderRouters = function (routers) {
    'use strict';
    var model, i, versions, out = '';
    for (model in routers) {
        versions = routers[model];
        out += '<tr><td rowspan="' + versions.length + '">' + model + '</td>';
        for (i in versions) {
            out += '<td><a href="' + versions[i][1] + '">' + versions[i][0] + '</a></td></tr><tr>';
        }
        out += '</tr>';
    }
    return out;
};

var renderDate = function (date) {
    'use strict';
    return date.substr(6) + '.' + date.substr(4, 2) + '.' + date.substr(0, 4);
};

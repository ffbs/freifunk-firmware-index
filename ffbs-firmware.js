$(function () {
    'use strict';
    $('.hero-unit [data-channel]').click(function () {
        $('#models').hide();
        var path = '/'+$(this).attr('data-channel')+'/factory/';
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
                    split = link.split('-', 4).slice(2);
                $('#version').html(split[0].replace('%7E', '~'));
                $('#versiondate').html(renderDate(split[1]));
            });
            $('tbody').html(renderRouters(routers));
            $('#models').fadeIn(500);
            document.location.hash = 'models';
        }, 'html');
    });
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

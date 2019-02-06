$(function () {
    'use strict';
    var EXCLUDE = ['..', 'doc', 'stable', 'beta']
    var REGEXES = [
        /^(.+)-(v[.0-9]+)$/,
        /^(.+)(v[.0-9]+)$/,
        /^(.+)-rev-(.+)$/,
        /^(x86[-64]*)-([a-z]+)$/,
        /^(raspberry-pi)-([0-9])$/
    ];
    var showChannel = function (channel) {
        $('#models').hide();
        var path = '/'+channel+'/factory/';
        $.get(path, function (data) {
			var routers = extractRouters(path, data);
            path = '/'+channel+'/sysupgrade/';
        	$.get(path, function (udata) {
				var upgrades = extractRouters(path, udata, true);

				for (var model in upgrades) {
					if (routers[model]) {
						for (var version in upgrades[model]) {
							if (routers[model][version]) {
								routers[model][version][2] = upgrades[model][version][2];
							} else {
								routers[model][version] = upgrades[model][version];
							}
						}
					} else {
						routers[model] = upgrades[model];
					}
				}

				for (var model in routers) {
					routers[model].sort(rCompare);
					if (routers[model].length > 1 && routers[model][0][0] === 'alle') {
						routers[model][0][0] = 'v1';
					}
				}

				$('tbody').html(renderRouters(routers));
				$('#models').fadeIn(500);
			});
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

	var rCompare = function (x,y) {
		var a = x[0], b = y[0];
		if (a[0] === 'v' && b[0] === 'v') {
			try {
				return parseInt(a.substr(1)) - parseInt(b.substr(1))
			} catch (e) {}
		}
		return a.localeCompare(b);
	};

	var extractRouters = function (path, data, isUpgrade) {
		var routers = {},
			links = $(data).find('a[href^="g"],a[href^="v"]');
		links.each(function () {
			var file = $(this).attr('href'),
				link = path+file,
				str = file.match(/(?:gluon-ffbs-)?v[^-]+(?:-ffbs)?-[^-]+-[a-z]+-(.+?)(?:-sysupgrade)?(\.[a-z]+)+$/)[1],
				model, hwversion, i, m;
			for (i = 0; i < REGEXES.length; i++) {
				if (m = str.match(REGEXES[i])) {
					model = m[1], hwversion = m[2];
					break;
				}
			}
			if (!model) {
				model = str, hwversion = 'alle';
			}

			model = unescape(model);
			if (!routers[model]) routers[model] = [];
			routers[model].push(isUpgrade ? [hwversion, undefined, link] : [hwversion, link]);
		});
		links.first().each(function () {
			var link = $(this).attr('href').split('/').slice(-1)[0],
				match = link.match(/(?:gluon-ffbs-)?(v[0-9.]+)(?:-ffbs)?-([0-9]+)[0-9]{4}-/);
			$('#version').html(match[1]);
			$('#versiondate').html(renderDate(match[2]));
		});
		return routers;
	};
});

var renderRouters = function (routers) {
    'use strict';
    var keys = Object.keys(routers),
        out = '',
        model, j, i, versions;
    keys.sort();
    for (j in keys) {
        model = keys[j];
        versions = routers[model];
        out += '<tr><td rowspan="' + versions.length + '">' + model + '</td>';
        for (i in versions) {
            out += '<td>';
			if (versions[i][1]) {
				out += '<a href="' + versions[i][1] + '">' + versions[i][0] + '</a> ';
			} else {
				out += '<a href="' + versions[i][2] + '">' + versions[i][0] + '<sup>1</sup></a>';
			}

			out += '</td></tr><tr>';
        }
        out += '</tr>';
    }
    return out;
};

var renderDate = function (date) {
    'use strict';
    return date.substr(6) + '.' + date.substr(4, 2) + '.' + date.substr(0, 4);
};

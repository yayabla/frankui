/*
 * jQuery PHP Plugin
 * version: 0.8.3 (21/11/2008)
 * author:  Anton Shevchuk (http://anton.shevchuk.name)
 * @requires jQuery v1.2.1 or later
 *
 * Examples and documentation at: http://jquery.hohli.com/
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 * Revision: $Id$
 */
php = {
	beforeSend: function ()
	{
		return true
	},
	success: function (c, d)
	{
		for (var i = 0; i < c['q'].length; i++)
		{
			var e = jQuery(c['q'][i]['s']);
			var f = c['q'][i]['m'];
			var g = c['q'][i]['a'];
			for (var j = 0; j < f.length; j++)
			{
				try
				{
					var h = f[j];
					var k = g[j];
					if (h && h != '' && h != 'undefined')
					{
						switch (true)
						{
						case (h == 'ready' || h == 'map' || h == 'queue'):
							e = e[h](window[k[0]]);
							break;
						case ((h == 'bind' || h == 'one') && k.length == 3):
							e = e[h](k[0], k[1], window[k[2]]);
							break;
						case ((h == 'toggle' || h == 'hover') && k.length == 2):
							e = e[h](window[k[0]], window[k[1]]);
							break;
						case (h == 'filter' && k.length == 1):
							if (window[k[0]] && window[k[0]] != '' && window[k[0]] != 'undefined')
							{
								e = e[h](window[k[0]])
							}
							else
							{
								e = e[h](k[0])
							}
							break;
						case ((h == 'show' || h == 'hide' || h == 'slideDown' || h == 'slideUp' || h == 'slideToggle' || h == 'fadeIn' || h == 'fadeOut') && k.length == 2):
							e = e[h](k[0], window[k[1]]);
							break;
						case ((h == 'blur' || h == 'change' || h == 'click' || h == 'dblclick' || h == 'error' || h == 'focus' || h == 'keydown' || h == 'keypress' || h == 'keyup' || h == 'load' || h == 'unload' || h == 'mousedown' || h == 'mousemove' || h == 'mouseout' || h == 'mouseover' || h == 'mouseup' || h == 'resize' || h == 'scroll' || h == 'select' || h == 'submit') && k.length == 1):
							e = e[h](window[k[0]]);
							break;
						case (h == 'fadeTo' && k.length == 3):
							e = e[h](k[0], k[1], window[k[2]]);
							break;
						case (h == 'animate' && k.length == 4):
							e = e[h](k[0], k[1], k[2], window[k[3]]);
							break;
						case (k.length == 0):
							e = e[h]();
							break;
						case (k.length == 1):
							e = e[h](k[0]);
							break;
						case (k.length == 2):
							e = e[h](k[0], k[1]);
							break;
						case (k.length == 3):
							e = e[h](k[0], k[1], k[2]);
							break;
						case (k.length == 4):
							e = e[h](k[0], k[1], k[2], k[3]);
							break;
						default:
							e = e[h](k);
							break
						}
					}
				}
				catch (error)
				{
					alert('onAction: jQuery("' + c['q'][i]['s'] + '").' + h + '("' + k + '")\n' + ' in file: ' + error.fileName + '\n' + ' on line: ' + error.lineNumber + '\n' + ' error:   ' + error.message)
				}
			}
		}
		jQuery.each(c['a'], function (a, b)
		{
			for (var i = 0; i < b.length; i++)
			{
				try
				{
					php[a](b[i])
				}
				catch (error)
				{
					alert('onAction: ' + a + '(' + b[i] + ')\n' + ' in file: ' + error.fileName + '\n' + ' on line: ' + error.lineNumber + '\n' + ' error:   ' + error.message)
				}
			}
		})
	},
	error: function (a, b, c)
	{
		var d = c ? c : false;
		jQuery('#php-error').remove();
		var e = "<style type='text/css'>" + "#php-error{ width:640px; position:absolute; top:4px; right:4px; border:1px solid #f00;z-index: 10000; }" + "#php-error .php-title{ width:636px; height:26px; position:relative; line-height:26px; background-color:#f66; color:#fff; font-weight:bold; font-size:12px;padding-left:4px; }" + "#php-error .php-more { width:20px;  height:20px; position:absolute; top:2px; right:24px; line-height:20px; text-align:center; cursor:pointer; border:1px solid #f00; background-color:#fee; color:#333; }" + "#php-error .php-close{ width:20px;  height:20px; position:absolute; top:2px; right:2px;  line-height:20px; text-align:center; cursor:pointer; border:1px solid #f00; background-color:#fee; color:#333; }" + "#php-error .php-desc { width:636px; position:relative; background-color:#fee; border-bottom:1px solid #f00;padding-left:4px;}" + "#php-error .php-content{ display:none;}" + "#php-error textarea{ width:634px;height:400px;overflow:auto;padding:2px;}" + "</style>";
		var f = "<div id='php-error'>" + "<div class='php-title'>Error in AJAX request" + "<div class='php-more'>&raquo;</div>" + "<div class='php-close'>X</div>" + "</div>" + "<div class='php-desc'>";
		f += "<b>XMLHttpRequest exchange</b>: ";
		switch (a.readyState)
		{
		case 0:
			readyStDesc = "not initialize";
			break;
		case 1:
			readyStDesc = "open";
			break;
		case 2:
			readyStDesc = "data transfer";
			break;
		case 3:
			readyStDesc = "loading";
			break;
		case 4:
			readyStDesc = "finish";
			break;
		default:
			return "uncknown state"
		}
		f += readyStDesc + " (" + a.readyState + ")";
		f += "<br/>\n";
		if (d != false)
		{
			f += "exception was catch: " + c.toString();
			f += "<br/>\n"
		}
		f += "<b>HTTP status</b>: " + a.status + " - " + a.statusText;
		f += "<br/>\n";
		f += "<b>Response text</b> (<small><a href='#' class='php-more2'>show more information &raquo;</a></small>):";
		f += "</div>\n";
		f += "<div class='php-content'><textarea>" + a.responseText + "</textarea></div>";
		f += "</div>";
		jQuery(document.body).append(e);
		jQuery(document.body).append(f);
		jQuery('#php-error .php-more').hover(function ()
		{
			jQuery(this).css('background-color', '#fff')
		}, function ()
		{
			jQuery(this).css('background-color', '#fee')
		});
		jQuery('#php-error .php-more').click(function ()
		{
			jQuery('#php-error .php-content').slideToggle()
		});
		jQuery('#php-error .php-more2').click(function ()
		{
			jQuery('#php-error .php-content').slideToggle();
			return false
		});
		jQuery('#php-error .php-close').click(function ()
		{
			jQuery('#php-error').fadeOut('fast', function ()
			{
				jQuery('#php-error').remove()
			})
		});
		jQuery('#php-error .php-close').hover(function ()
		{
			jQuery(this).css('background-color', '#fff')
		}, function ()
		{
			jQuery(this).css('background-color', '#fee')
		})
	},
	complete: function (a, b)
	{
		return true
	},
	addMessage: function (a)
	{
		var b = a.msg || "";
		var c = a.callback || "defaultCallBack";
		var d = a.params ||
		{};
		php.messages[c](b, d)
	},
	addError: function (a)
	{
		var b = a.msg || "";
		var c = a.callback || "defaultCallBack";
		var d = a.params ||
		{};
		php.errors[c](b, d)
	},
	evalScript: function (a)
	{
		var b = a.foo || '';
		eval(b)
	},
	messages:
	{
		defaultCallBack: function (a, b)
		{
			alert("Server response message: " + a)
		}
	},
	errors:
	{
		defaultCallBack: function (a, b)
		{
			alert("Server response error: " + a)
		}
	}
};
jQuery.extend(
{
	php: function (d, e)
	{
		jQuery.ajax(
		{
			url: d,
			type: "POST",
			data: e,
			dataType: "json",
			beforeSend: function ()
			{
				return php.beforeSend()
			},
			success: function (a, b)
			{
				return php.success(a, b)
			},
			error: function (a, b, c)
			{
				return php.error(a, b, c)
			},
			complete: function (a, b)
			{
				return php.complete(a, b)
			}
		})
	}
});
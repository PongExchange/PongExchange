(function ()
{
	var po = document.createElement('script');
	po.type = 'text/javascript';
	po.async = true;
	po.src = 'https://plus.google.com/js/client:plusone.js?onload=start';
	var s = document.getElementsByTagName('script')[0];
	s.parentNode.insertBefore(po, s);
})();

function signInCallback (authResult)
{
	console.log(authResult);
	if (authResult.code)
	{
		$.post('/auth/google/callback', { code: authResult.code })
			.done(function (data)
			{
				if (data && data.url)
				{
					window.location.href = data.url;
				}
			});
	}
	else if (authResult.error)
	{
		console.log('There was an error: ' + authResult.error);
	}
}

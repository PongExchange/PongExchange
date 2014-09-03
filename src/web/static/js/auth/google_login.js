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
//	console.log(authResult);
	if (authResult.code)
	{
		$.post('/auth/google/callback', { code: authResult.code })
			.done(function (data)
			{
				window.location.reload();
			});
	}
	else if (authResult.error && authResult.error !== 'immediate_failed')
	{
		switch (authResult.error)
		{
			case 'immediate_failed':
			case 'user_signed_out':
				break;
			default:
				console.log('There a Google Sign in error: ' + authResult.error);
		}
	}
}

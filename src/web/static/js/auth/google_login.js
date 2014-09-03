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
		console.log('code');
		if (window.loggingOut && authResult.status.method === 'AUTO')
		{
			console.log('signing out');
			gapi.auth.signOut();
			return;
		}
		
		$.post('/auth/google/callback', { code: authResult.code })
			.done(function (data)
			{
				window.location.reload();
			});
	}
	else if (authResult.error && authResult.error !== 'immediate_failed')
	{
		console.log('There a Google Sign in error: ' + authResult.error);
	}
}

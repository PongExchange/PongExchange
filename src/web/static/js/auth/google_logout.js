function onGoogleLoad ()
{
	"use strict";
//	gapi.auth.signIn({
//		clientid: window.pongLogout.clientId,
//		scope: window.pongLogout.scopes,
//		cookiepolicy: 'single_host_origin',
//		callback: 'signInCallback'
//	});
	gapi.auth.authorize({
		client_id: window.pongLogout.clientId,
		scope: window.pongLogout.scopes,
		immediate: true
	}, signInCallback);
}

function signInCallback (authResult)
{
	"use strict";
	console.log(authResult);
	if (authResult.status.signed_in)
	{
		console.log('signed in');
		gapi.auth.signOut();
		return;
	}
	
//	window.location.href = '/';
}

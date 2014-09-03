
function signInCallback (authResult)
{
	"use strict";
	console.log(authResult);
	if (authResult.status.signed_in)
	{
		console.log('Signing out from Google...');
		gapi.auth.signOut();
		return;
	}
	
	window.location.href = '/';
}

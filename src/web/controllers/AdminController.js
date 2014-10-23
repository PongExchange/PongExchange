"use strict";

var Affiliation = require('models/Affiliation');

var AdminController = module.exports;

/*
    /admin
    /admin/affiliations - list, add, edit, delete affiliations
*/

AdminController.indexGET = function*()
{
	yield this.render('admin/index');
}

AdminController.affiliationsIndexGET = function*()
{
    var affiliations = yield Affiliation.getAll();


    // sort by name asc
    affiliations.sort(function (p1, p2) { return p1.name.localeCompare(p2.name); });
    
    yield this.render('admin/affiliations/index', { affiliations: affiliations });
};

AdminController.affiliationsNewPOST = function*()
{
    var response = this.request.body.fields;
    
    var a = new Affiliation();
    a.name = response.new_affiliation;
		
		var dup = yield Affiliation.checkDup(a.name);
		
		if (dup === false)
	  {
	    try
	    {
	      yield a.save();
	    }
	    catch (e)
	    {
	      // TODO: need to return the error message
	    }
	    
	    this.redirect('/admin/affiliations');
		}
		else {
			console.log('dup!'); 
			// not sure how to notify user of duplicate (currently displays no message)
			this.redirect('/admin/affiliations');
		}
};

AdminController.affiliationsEditPOST = function*()
{
  var response = this.request.body.fields;

  var affiliation = yield Affiliation.getById(parseInt(response.pk));
  
  console.log(response.pk, response.value, affiliation);
  
  affiliation.name = response.value || affiliation.name;

	var dup = yield Affiliation.checkDup(affiliation.name);
	
	if (dup === false)
	{
	  if (yield affiliation.save()){
	  	this.status = 200; // notify x-editable library change took place 
	    // this.redirect(affiliation.affiliationUrl);
	  } else {
	    console.log('This cannot be saved.');
	  }
	}
	else
	{
		this.status = 400; // notify x-editable library of duplicate
		this.response.body = "Duplicate!";
	}
};

AdminController.affiliationsDELETE = function*()
{
  var url = this.request.url;
	var affiliationId = parseInt(url.match(/\d+/)[0]);
	// console.log("affiliation id:", affiliationId);

  var affiliation = yield Affiliation.getById(affiliationId);
  
  if (yield affiliation.delete()){
  	// console.log("Deleted: ", affiliation.name, affiliation.id);
    this.redirect("/admin/affiliations");
  } else {
    console.log('This cannot be deleted.');
  }
};

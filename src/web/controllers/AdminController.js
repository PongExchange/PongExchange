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
    
    try
    {
      yield a.save();
    }
    catch (e)
    {
      // TODO: need to return the error message
    }
    
    this.redirect('/admin/affiliations');
    
};

AdminController.affiliationsEditGET = function*()
{
  var affiliation = yield Affiliation.getById(this.affiliation.id);
  
  yield this.render('admin/affiliations/edit', { affiliation: affiliation });

};

AdminController.affiliationsEditPOST = function*()
{
  var response = this.request.body.fields;

  var affiliation = yield Affiliation.getById(this.affiliation.id);
  
  affiliation.name = response.affiliation.name || affiliation.name;

  if (yield affiliation.save()){
    this.redirect(affiliation.affiliationUrl);
  } else {
    console.log('This cannot be saved.');
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

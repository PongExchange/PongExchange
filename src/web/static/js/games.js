$(function(){

 
 $(".chosen-select").chosen({no_results_text: "Nobody found!", max_selected_options: 2}); 


///////////// Adding score inputs for multiple games in a match.

  var incrementer = function(){
    var i = 1;
    return function(){
      return i+=1;
    }
   }
  var inc = incrementer();

 $("#add-game").click(function(event){
   event.preventDefault();
   var gameNum = inc();

   $('#recordscores').append("<tr><th>game " + gameNum + "</th><td><input type=\'text\' name=\'team1[score][]\' placeholder=\'score\' class=\'form-control score\'></td><td><input type=\'text\' name=\'team2[score][]\' placeholder=\'score\' class=\'form-control score\'></td></tr>")
 })

});
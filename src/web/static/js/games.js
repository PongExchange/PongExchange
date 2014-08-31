$(function(){

  $("#singles").change(function () {
    console.log("Singles selected.");
    $('.input-form').empty();
    $('.input-form').append("<br><input type='text' name='player1[name]' placeholder='player 1'><br><input type='text', name='player1[score]' placeholder='player 1 score'><br><br><input type='text', name='player2[name]' placeholder='player 2'><br><input type='text', name='player2[score]' placeholder='player 2 score'><br><br><input type='submit' class='btn'>");
  });

  $("#doubles").change(function () {
    console.log("Doubles selected.");
    $('.input-form').empty();
    $('.input-form').append("<br><h2>team 1</h2><input type='text' name='team1[player1]' placeholder='player 1'><input type='text', name='team1[player2]' placeholder='player 2'><br><br><input type='text', name='team1[score]' placeholder='team 1 score'><br><h2>team 2</h2><input type='text' name='team2[player3]' placeholder='player 3'><input type='text', name='team2[player4]' placeholder='player 4'><br><br><input type='text', name='team2[score]' placeholder='team 2 score'><br><br><input type='submit' class='btn'>");
  });

});
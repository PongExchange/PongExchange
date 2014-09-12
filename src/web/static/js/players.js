$(function(){

  $('.default-image').click(function(event){
    event.preventDefault();

    var googleImage = $(this).closest("td").find("input[type='hidden']").val().replace("?sz=50","");
    
    $(this).closest("td").find("input[type='text']").val(googleImage);

    console.log(googleImage);
  });
})
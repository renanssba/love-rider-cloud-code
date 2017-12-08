Date.hoursBetween = function(date1, date2) {
  // How many milliseconds there are in 1 hour
  var miliseconds_per_hour = 1000*60*60;

  // Convert both dates to milliseconds
  var date1_ms = date1.getTime();
  var date2_ms = date2.getTime();

  // Calculate the difference in milliseconds
  var difference_in_ms = date2_ms - date1_ms;

  return difference_in_ms/miliseconds_per_hour;
}

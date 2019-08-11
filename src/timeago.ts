export var ago = (time: Date) => {
  var secAgo = (new Date().getTime() - time.getTime()) / 1000;
  if(secAgo < 5) {
    return "just now";
  } else if (secAgo < 50) {
    return f(secAgo, "second");
  } else if(secAgo < 80) {
    return "about a minute ago";
  } else if (secAgo < 3300) {
    return f(secAgo / 60, "minute");
  } else if (secAgo < 3900) { 
    return "about an hour ago";
  } else if (secAgo < 82800) {
    return f(secAgo / 60 / 60, "hour");
  } else if (secAgo < 90000) {
    return "about a day ago";
  } else if (secAgo < 561600) {
    return f(secAgo / 60 / 60 / 24, "day");
  } else if (secAgo < 691200) {
    return "about a week ago";
  } else {
    return f(secAgo / 60 / 60 / 24, "day");
  }
}

var f = (val: number, unit: string) => {
  return p(Math.ceil(val), unit) + " ago";
}

var p = (val: number, unit: string) => {
  if (val === 1) {
    return unit;
  }
  return unit + "s";
}
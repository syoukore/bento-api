module.exports = {
  getIp: function (req) {
    if (req.ip.includes('.')) {
      var _slice = req.ip.split(":");
      return _slice[_slice.length-1];
    } else {
      return req.ip;
    }
  }
}

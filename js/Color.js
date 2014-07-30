function Color(red, green, blue, alpha)
{
  var r, g, b, a;

  this.setRed       = function(red)
  {
    r = red;
    return this;
  }

  this.getRed       = function()
  {
    return r;
  }

  this.setGreen     = function(green)
  {
    g = green;
    return this;
  }

  this.getGreen     = function()
  {
    return g;
  }

  this.setBlue      = function(blue)
  {
    b = blue;
    return this;
  }

  this.getBlue      = function()
  {
    return b;
  }

  this.setAlpha     = function(alpha)
  {
    a = alpha;
    return this;
  }

  this.getAlpha     = function()
  {
     return a;
  }

  this.setRed(red)
      .setGreen(green)
      .setBlue(blue)
      .setAlpha(alpha);
}

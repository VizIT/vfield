/**
 * Reusable container for a field line and associated quantities.
 */
function FieldLine(maxPoints)
{
  /** A Float32Array containing two lines (four points) for each arrow. */
  var arrows;
  var maxPoints;
  /** The number of arrows drawn along the field line. There are twice this number of lines. */
  var narrows;
  /** The number of points in the field line so far. */
  var npoints;
  /** The Float32Array containg the points along the line.*/
  var points;
  /** The index where the next point coordinate will be written. */
  var pointsIndex;

  this.setMaxPoints = function(maxPoints_)
  {
    if (maxPoints_ != maxPoints)
    {
      maxPoints = maxPoints_;
      points    = new Float32Array(3*maxPoints);
      arrows    = new Float32Array(maxPoints);
    }
    return this;
  }

  this.getMaxPoints = function()
  {
    return maxPoints;
  }

  this.pushPoint    = function(x, y, z)
  {
    points[pointsIndex++] = x;
    points[pointsIndex++] = y;
    points[pointsIndex++] = z;
    npoints++;
  }

  this.getPoints    = function()
  {
    return points;
  }

  this.getNpoints   = function()
  {
    return npoints;
  }

  this.pushArrow    = function(x1, y1, z1, x0, y0, z0, x2, y2, z2)
  {
    arrows[arrowIndex++] = x1;
    arrows[arrowIndex++] = y1;
    arrows[arrowIndex++] = z1;
    arrows[arrowIndex++] = x0;
    arrows[arrowIndex++] = y0;
    arrows[arrowIndex++] = z0;
    arrows[arrowIndex++] = x0;
    arrows[arrowIndex++] = y0;
    arrows[arrowIndex++] = z0;
    arrows[arrowIndex++] = x2;
    arrows[arrowIndex++] = y2;
    arrows[arrowIndex++] = z2;
    narrows++;
  }

  this.getArrows    = function()
  {
    return arrows;
  }

  this.getNarrows   = function()
  {
    return narrows;
  }

  /**
   * Reset counters and pointer to the beginning of the arrays.
   */
  this.reset        = function()
  {
    arrowIndex  = 0;
    narrows     = 0;
    npoints     = 0;
    pointsIndex = 0;
  }

  points      = new Float32Array(3*maxPoints);
  arrows      = new Float32Array(maxPoints);

  this.reset();
}
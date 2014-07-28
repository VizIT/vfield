/**
 * Compute a field line from a given starting point for a configuration
 * of point charges and charge distributions. The expectation is that
 * the object will be reused to compute field lines for multiple start
 * points, which will be immediatly loaded as VBOs onto the GPU.
 *
 * @param {Charges} charges      A collection of point charges and charge
 *                               distributions.
 *
 * @param {double}  maxPoints    The maximum number of steps, of lendth ds, taken
 *                               along a field line.
 *
 * @param {double}  ds           Step size for tracing field lines.
 *
 * @parma {double}  arrowSize    Lines for the directional arrows are
 *                               drawn with this length.
 *
 * @param {double}  arrowSpacing ds increments by this much between
 *                               directional arrows.
 *
 */
function FieldLineGenerator(charges_, maxPoints_, ds_, arrowSize_, arrowSpacing_)
{
    // Lines that make up the arrow are drawn with this length.
    var arrowSize;
    // The sum of ds along the path increments by this much between arrows.
    var arrowSpacing;
    // Each point represents a distance ds along the field line.
    var ds;
    // The charge configuration we are drawing the field lines for.
    var charges;
    // Container for generated field line and direction indicators.
    var fieldLine;
    // The maximum number of points along the line to trace.
    var maxPoints;

    this.getArrows    = function()
    {
        return arrows;
    }

    this.setMaxPoints = function(maxPoints_)
    {
      maxPoints = maxPoints_;
      return this;
    }

    this.getMaxPoints = function()
    {
      return maxPoints;
    }

    this.setArrowSize    = function(size)
    {
      arrowSize = size;
      return this;
    }

    this.getArrowSize    = function()
    {
      return arrowSize;
    }

    this.setArrowSpacing = function(spacing)
    {
      arrowSpacing = spacing;
      return this;
    }

    this.getArrowSpacing = function()
    {
      return arrowSpacing;
    }

    this.setDs           = function(ds_)
    {
      ds = ds_;
      return this;
    }

    this.getDs           = function()
    {
      return ds;
    }

    /**
     * Generate two lines as an arrow head along the field line indicating the
     * direction of the electric field.
     */
    this.drawArrow          = function(x0, y0, z0, field, f, arrowSize, fieldLine)
    {
      var asx;
      var asy;
      var asz;
      var exnorm;
      var eynorm;
      var eznorm;
      // A vector normal to the Electric field.
      var nx;
      var ny;
      var nz;
      var resize;
      var x1;
      var y1;
      var z1;
      var x2;
      var y2;
      var z2;

      exnorm = field[0]/f;
      eynorm = field[1]/f;
      eznorm = field[2]/f;

      if (eznorm != 0)
      {
        // Start with nx, ny = 1, then E dot n = 0 gives
        nx     = 1;
        ny     = 1;
        nz     = -(field[0]+field[1])/field[2];
      }
      else if (eynorm != 0)
      {
        // Start with nx, nz = 1, then E dot n = 0 gives
        nx     = 1;
        ny     = -(field[0]+field[2])/field[1];
        nz     = 1;
      }
      else
      {
        // Start with ny, nz = 1, then E dot n = 0 gives
        nx     = -(field[1]+field[2])/field[0];
        ny     = 1;
        nz     = 1;
      }

      // Normalize and multipley by the arrow size
      resize = arrowSize/Math.sqrt(nx*nx + ny*ny + nz*nz);

      nx     = nx*resize;
      ny     = ny*resize;
      nz     = nz*resize;

      asx    = arrowSize*exnorm;
      asy    = arrowSize*eynorm;
      asz    = arrowSize*eznorm;

      x1     = x0 - asx + nx;
      y1     = y0 - asy + ny;
      z1     = z0 - asz + nz;

      x2     = x0 - asx - nx;
      y2     = y0 - asy - ny;
      z2     = z0 - asz - nz;

      fieldLine.pushArrow(x1, y1, z1, x0, y0, z0, x2, y2, z2);
    }

    /**
     * Add the fields from charge distributions into an existing field array.
     * TODO Move this into Charges.
     */
    this.addDistributionFields = function(f, distributions, x, y, z)
    {
      var ndistributions;
      var newfield;

      ndistributions = distributions.length;

      for(var i=0; i<ndistributions; i++)
      {
        newfield = distributions[i].getField(x, y, z)
        f[0]    += newfield[0];
        f[1]    += newfield[1];
        f[2]    += newfield[2];
      }
      return f;
    }

  /**
   * Trace a field line starting at the given x, y, z coordinates.
   * Each step of length ds has components (Ex/E*ds, Ey/E*ds, Ez/E*ds).
   * points is usually a Float32Array of size 3*maxPoints. Trace along
   * or against the field according to sgn.
   *
   * @parma {double} sgn  Whether to trace the line along (+1.0) or
   *                      in opposition to (-1.0) the electric field.
   */
  this.generate = function(x0, y0, z0, sgn)
  {
    // The distance traversed along the field line since the last arrow was drawn.
    var deltaS;
    var f;
    var field;
    var i;
    var x;
    var y;
    var z;

    deltaS  = 0;
    x       = x0;
    y       = y0;
    z       = z0;
    fieldLine.reset();

    for(i=0; i<maxPoints; i++)
    {
      fieldLine.pushPoint(x, y, z);
      field            = charges.getField(x, y, z);
      //field            = this.addDistributionFields(field, distributions, x, y, z)
      f                = Math.sqrt(field[0] * field[0] + field[1] * field[1] + field[2] * field[2]);

      if (f == 0)
      {
        // No field here - no possible field line
        break;
      }

      x      += sgn * field[0]/f * ds;
      y      += sgn * field[1]/f * ds;
      z      += sgn * field[2]/f * ds;

      deltaS += ds;

      if (deltaS > arrowSpacing)
      {
        deltaS = 0;
        this.drawArrow(x, y, z, field, f, arrowSize, fieldLine);
      }
    }
    return fieldLine;
  }

  arrowSize     = arrowSize_;
  arrowSpacing  = arrowSpacing_;
  charges       = charges_;
  ds            = ds_;
  maxPoints     = maxPoints_;
  fieldLine     = new FieldLine(maxPoints);
}


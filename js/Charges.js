"use strict";
/**
 * Represents a single charge in a set of charges
 * A charge has position and a charge in stat-Columbs.
 */
function Charge(Q_, x_, y_, z_, rho_)
{
    var Q;
    var position;
    var rho;

    Q        = Q_;
    position = new Array(x_, y_, z_);
    rho      = typeof rho_ == 'undefined' ? 0 : rho_;

    this.setCharge = function(Q_)
    {
      Q = Q_;
    }

    this.getCharge = function()
    {
      return Q;
    }

    this.setPosition = function(position)
    {
      this.position = position;
    }

    this.getPosition = function()
    {
      return position;
    }

    this.getField           = function(x, y, z)
    {
      var deltaX;
      var deltaY;
      var deltaZ;

      // Magnitude of the field vector
      var f;
      // The field vector
      var field   = new Array(0, 0, 0);
      var r;
      var r2;

      deltaX      = x - position[0];
      deltaY      = y - position[1];
      deltaZ      = z - position[2];

      r2          = deltaX*deltaX + deltaY*deltaY + deltaZ*deltaZ;
      if (r2 <= 0)
      {
        return field;
      }
      r           = Math.sqrt(r2);
      f           = Q/r2;
      // Similar triangles allows easy distribution of the field into vector components.
      field[0]    = f * deltaX / r;
      field[1]    = f * deltaY / r;
      field[2]    = f * deltaZ / r;

      return field;
    }

    /**
     * Compute the start points for field lines due to the presence of this charge.
     * 
     * @param {Integer} pho The densiy of field lines per unit charge.
     */
    this.getFieldSeedPointsI = function(rho)
    {
      var increment;
      var nlines;
      var offset;
      var phi;
      var r;
      var seedPoints;
      var sgn;
      var y;

      increment  = 2.39996323 //Math.PI * (3- Math.sqrt(5))
      seedPoints = new Array();
      sgn        = Q > 0 ? 1 : Q < 0 ? -1 : 0;
      nlines     = Math.round(rho * Q * sgn);
      offset     = 2/nlines;


      for (var i = 0; i< nlines; i++)
      {
        y   = i * offset - 1 + (offset / 2);
        r   = Math.sqrt(1 - y*y);
        phi = i * increment;
        seedPoints.push(new Array(Math.cos(phi)*r + position[0],
                                  y               + position[1],
                                  Math.sin(phi)*r + position[2],
                                  sgn));
      }
      return seedPoints;
    }

    /**
     * Compute the start points for field lines due to the presence of this charge.
     * 
     * @param {Double} phi0   The angle about the z axis for the first start point.
     * @param {Double} radius The distance from the center for the start points.
     */
    this.getStartPoints = function(phi0, radius)
    {
      var nlines;
      var phi;
      var r;
      var s;
      var seedPoints;
      var sgn;
      var y;

      sgn        = Q > 0 ? 1 : Q < 0 ? -1 : 0;
      nlines     = Math.round(rho * Q * sgn) - 1;
      s          = 3.6 / Math.sqrt(nlines);
      phi        = typeof phi0   == 'undefined' ? Math.PI / 2 : phi0;
      radius     = typeof radius == 'undefined' ? 1           : radius;
      seedPoints = new Array();

      if (rho > 0)
      {
        // seedPoints.push(new Array(0, -radius, 0, sgn));
        for (var i=1; i<nlines; i++)
        {
          y   = -1.0 + 2.0 * i / (nlines);
          r   = Math.sqrt(1 - y*y);
          phi = phi + s / r;
          seedPoints.push(new Array(Math.cos(phi)*r*radius + position[0],
                                    y*radius               + position[1],
                                    Math.sin(phi)*r*radius + position[2],
                                    sgn));
        }
        //seedPoints.push(new Array(0, radius, 0, sgn));
      }

      return seedPoints;
    }

    this.shouldStop      = function(sgn, x, y, z)
    {
      var minR2;
      var r2;
      var should;
      var tmp;

      minR2  = 4;
      should = false;

      // If we are tracing a field line forward to a positive charge
      // or backwards to a negative charge, skip the computation.
      // This corresponds to tracing a field line from a negative charge
      // to a negative charge, or from a positive charge to a positive
      // charge - where the field line should not terminate.
      if (sgn * Q < 0.0)
      {
          tmp = position[0]-x;
          r2  = tmp*tmp;

          tmp = position[1]-y;
          r2 += tmp*tmp;

          tmp = position[2]-z;
          r2 += tmp*tmp;

          should = r2 < minR2;
      }

      return should;
    }

}

/**
 * A collection of point charges. TODO Is this still useful?
 */
function Charges()
{
    // Add a charge to the configuration of charges represented by
    // this object. Defined here so we can use it in the constructor.
    this.addCharge = function(charge)
    {
        n = charges.push(charge);
        return n;
    }

    var n       = 0;
    var charges = new Array();

    // If any charges are passed into the constructor, add them immediatly
    // to the set.
    for (var i=0; i<arguments.length; i++)
    {
        n = this.addCharge(arguments[i]);
    }

    this.getCount = function()
    {
        return n;
    }

    this.getCharges = function()
    {
        return charges;
    }

    /**
     * Get start points using, for now, preset values of phi0 and r
     */
    this.getStartPoints = function()
    {
      var r0     = 6.0;
      var phi    = 0.0;
      var dphi   = 0.0;
      var points = new Array();
      var charge;

      for(var i=0; i<n; i++)
      {
        charge = charges[i];
        points = points.concat(charge.getStartPoints(phi, r0));
        phi   += dphi;
      }

      return points;
    }

    /**
     * Comnpute the field at x, y, z resulting from our charge
     * configuration.
     */
    this.getField = function(x, y, z)
    {
      var charge;
      // Field from the current charge
      var currentField;
      // The field vector
      var field          = new Array(0, 0, 0);

      for(var i=0; i<n; i++)
      {
        charge         = charges[i];

        currentField   = charge.getField(x, y, z);
        field[0]      += currentField[0];
        field[1]      += currentField[1];
        field[2]      += currentField[2];
      }
      return field;
    }

    /**
     * Determine if tracing a field line should stop.
     *
     * @param {double} x0 The initial x start point of the traced field line.
     *
     * @param {double} y0 The initial y start point of the traced field line.
     *
     * @param {double} z0 The initial z start point of the traced field line.
     *
     * @param {double} sgn
     *
     * @param {double} x
     *
     * @param {double} y
     *
     * @param {double} z
     *
     */
    this.shouldStop    = function(sgn, x, y, z)
    {
      var charge;
      var should;

      should = false;

      for(var i=0; i<n & !should; i++)
      {
        charge = charges[i];
        should = charge.shouldStop(sgn, x, y, z);
      }
      return should;
    }
}




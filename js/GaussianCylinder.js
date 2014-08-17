/**
 * Represent a Gaussian cylinder. This is a Gaussian surface, it will be drawn but will
 * have no effect on the field. The cylinder of radius r and height h centered at
 * (x, y, z) and rotated by phi about the y axis, then by theta about the z axis.
 *
 * @param {Double} x     The x position of the center of the cylinder.
 * @param {Double} y     The y position of the center of the cylinder.
 * @param {Double} z     The z position of the center of the cylinder.
 * @param {Double} height The height of the cylinder.
 * @param {Double} r      The radius of the cylinder.
 * @param {Double} phi    The angle of rotation about the y axis.
 * @param {Double} theta  The angle of rotation about the z axis.
 *
 * @constructor
 */
function GaussianCylinder(x_, y_, z_, h_, r_, phi_, theta_)
{
  var color;
  var height;
  var modelViewMatrix;
  var phi;
  var radius;
  var theta;
  var x0;
  var y0;
  var z0;

  this.setX               = function(x_)
  {
    x0                  = x_;
    modelViewMatrix[12] = x0;
    return this;
  }
  this.getX               = function()
  {
    return x0;
  }

  this.setY               = function(y_)
  {
    y0                  = y_;
    modelViewMatrix[13] = y0;
    return this;
  }

  this.getY               = function()
  {
    return y0;
  }

  this.setZ               = function(z_)
  {
    z0                  = z_;
    modelViewMatrix[14] = z0;
    return this;
  }

  this.getZ               = function()
  {
    return z0;
  }

  /**
   * Shorthand invocation to set each of x0, y0, z0 from array elements
   */
  this.setOrigin          = function(origin)
  {
    this.setX(origin[0]);
    this.setY(origin[1]);
    return this.setZ(origin[2]);
  }

  this.getOrigin          = function()
  {
    return [x0, y0, z0];
  }

  this.setRadius          = function(r_)
  {
    radius = r_;
    return this;
  }
  this.getRadius          = function()
  {
    return radius;
  }

  this.setHeight          = function(h_)
  {
    height = h_;
    return this;
  }

  this.getHeight          = function()
  {
    return height;
  }

  this.setTheta           = function(t_)
  {
    theta = t_;
    return this;
  }

  this.getTheta           = function()
  {
    return theta;
  }

  this.setPhi             = function(p_)
  {
    phi = p_;
    return this;
  }

  this.getPhi             = function()
  {
    return phi;
  }

  this.render                 = function(glUtility, surfaceProgram)
  {
    this.fullRender(glUtility, surfaceProgram, modelViewMatrix, height, radius, radius, true);
  }

  // Gaussian (neutral) surfaces are grey
  color  = new Color(0.5, 0.5, 0.5, 0.50);
  height = h_;
  phi    = phi_;
  radius = r_;
  theta  = theta_;
  x0     = x_;
  y0     = y_;
  z0     = z_;

  this.setColor(color);

  modelViewMatrix = this.getCylinderModelView(x0, y0, z0, this.getBaseHeight(), this.getBaseRadius(), phi, theta);
}

/**
 * gaussianCylinderextends cylinder.
 */
GaussianCylinder.prototype = new Cylinder();
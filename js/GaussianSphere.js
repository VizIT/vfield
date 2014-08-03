/*
 * Represent a Gaussian sphere. This is a Gaussian surface, it will be drawn but will
 * have no effect on the field. The sphere of radius r is centered at (x, y, z).
 */
function GaussianSphere(x_, y_, z_, r_)
{
  var color;
  var modelViewMatrix;
  var radius;
  var x0;
  var y0;
  var z0;

  this.setColor            = function(color_)
  {
    color = color_;
  }

  this.getColor            = function()
  {
    return color;
  }

  this.setX               = function(x_)
  {
    x0 = x_;
    return this;
  }

  this.getX               = function()
  {
    return x0;
  }

  this.setY               = function(y_)
  {
    y0 = y_;
    return this;
  }

  this.getY               = function()
  {
    return y0;
  }

  this.setZ               = function(z_)
  {
    z0 = z_;
    return this;
  }

  this.getZ               = function()
  {
    return z0;
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

  this.getModelView       = function(scale)
  {
    if (typeof scale === "undefined")
    {
      scale = 1.0;
    }
    if (modelViewMatrix == null)
    {
      modelViewMatrix     = new Float32Array(16);
      modelViewMatrix[0]  = scale;
      modelViewMatrix[1]  = 0.0;
      modelViewMatrix[2]  = 0.0;
      modelViewMatrix[3]  = 0.0;
      modelViewMatrix[4]  = 0.0;
      modelViewMatrix[5]  = scale;
      modelViewMatrix[6]  = 0.0;
      modelViewMatrix[7]  = 0.0;
      modelViewMatrix[8]  = 0.0;
      modelViewMatrix[9]  = 0.0;
      modelViewMatrix[10] = scale;
      modelViewMatrix[11] = 0.0;
      modelViewMatrix[12] = x0;
      modelViewMatrix[13] = y0;
      modelViewMatrix[14] = z0;
      modelViewMatrix[15] = 1.0;
    }
    else
    {
      modelViewMatrix[0]  = scale;
      modelViewMatrix[5]  = scale;
      modelViewMatrix[10] = scale;
    }
    return modelViewMatrix;
  }

  this.drawFullSurface      = function(glUtility,           program,              surfaceGeometryBuffer,
                                       surfaceNormalBuffer, surfaceIndicesBuffer, nindices)
  {
    var gl;

    gl       = glUtility.getGLContext();
    glUtility.bindBuffer(surfaceGeometryBuffer, program.getPositionHandle(), 3, gl.FLOAT, 0, 0);
    glUtility.bindBuffer(surfaceNormalBuffer,   program.getNormalHandle(),   3, gl.FLOAT, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, surfaceIndicesBuffer);

    gl.drawElements(gl.TRIANGLES, nindices, gl.UNSIGNED_SHORT, 0);
  }

  this.render      = function(glUtility, program)
  {
    var gl;
    var intrinsicRadius;
    var vertices;

    gl              = glUtility.getGLContext();
    intrinsicRadius = this.getIntrinsicRadius();
    vertices        = this.getVertexBuffers(glUtility);

    gl.uniformMatrix4fv(program.getModelViewMatrixHandle(), false, this.getModelView(radius/intrinsicRadius));

    gl.uniform4f(program.getSurfaceColorHandle(), color.getRed(),
                 color.getGreen(),                       color.getBlue(), color.getAlpha());

    gl.cullFace(gl.FRONT);
    this.drawFullSurface(glUtility,        program,            vertices.vertices, vertices.normals,
                         vertices.indices, this.getNindices());

    gl.cullFace(gl.BACK);
    this.drawFullSurface(glUtility,        program,            vertices.vertices, vertices.normals,
                         vertices.indices, this.getNindices());
  }

  // Gaussian (neutral) surfaces are grey
  color  = new Color(0.5, 0.5, 0.5, 0.50);
  radius = r_;
  x0     = x_;
  y0     = y_;
  z0     = z_;
}

/**
 * gaussianSphere extends the GeometryEngine.sphere class.
 */
GaussianSphere.prototype = new GeometryEngine.Sphere();


